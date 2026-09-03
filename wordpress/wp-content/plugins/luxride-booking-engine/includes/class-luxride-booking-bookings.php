<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Bookings
{
    public const STATUSES = ['new', 'pending', 'confirmed', 'assigned', 'completed', 'cancelled'];
    public const AVAILABILITY_STATUSES = ['new', 'pending', 'confirmed', 'assigned'];

    public static function create(array $input)
    {
        global $wpdb;

        $idempotency_key = self::idempotency_key((string) ($input['idempotency_key'] ?? ''));
        if ($idempotency_key) {
            $existing = self::find_by_idempotency_key($idempotency_key);
            if ($existing) {
                return self::public_booking_payload($existing, true);
            }
        }

        $quote_input = self::quote_input($input);
        $quote = LuxRide_Booking_Pricing_Engine::quote($quote_input);
        if (is_wp_error($quote)) {
            if ('luxride_last_minute' === $quote->get_error_code()) {
                $data = (array) $quote->get_error_data();
                return new WP_Error('last_minute_required', $quote->get_error_message(), array_merge($data, ['status' => 409]));
            }
            return $quote;
        }

        $field_error = self::validate_required_customer_fields($input, $quote);
        if (is_wp_error($field_error)) {
            return $field_error;
        }

        if (array_key_exists('review_total', $input)) {
            $review_total = round((float) $input['review_total'], 2);
            $server_total = round((float) $quote['pricing']['total'], 2);
            if ($review_total !== $server_total) {
                return new WP_Error('price_changed', 'The fare changed before submission. Please review the updated price.', [
                    'status' => 409,
                    'message_ar' => 'تغير السعر قبل الإرسال. يرجى مراجعة السعر المحدث.',
                    'previous_total' => $review_total,
                    'new_total' => $server_total,
                    'quote' => $quote,
                ]);
            }
        }

        $now = current_time('mysql');
        $reference = self::generate_reference();
        $language = self::language((string) ($input['language'] ?? 'EN'));
        $customer = self::customer_snapshot($input, $language);
        $details = self::conditional_details($input, $quote);
        $outbound = self::mysql_datetime((string) $quote_input['outbound_datetime']);
        $returning = '' !== (string) $quote_input['return_datetime'] ? self::mysql_datetime((string) $quote_input['return_datetime']) : null;
        $availability = self::availability_error($quote, $outbound, $returning);
        if (is_wp_error($availability)) {
            return $availability;
        }

        $inserted = $wpdb->insert(
            LuxRide_Booking_Schema::table('bookings'),
            [
                'booking_reference' => $reference,
                'idempotency_key' => $idempotency_key ?: null,
                'status' => 'new',
                'language' => $language,
                'route_id' => (int) $quote['route']['id'],
                'route_snapshot' => wp_json_encode($quote['route'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'vehicle_key' => (string) $quote['vehicle']['key'],
                'trip_type' => (string) $quote['trip_type'],
                'system_classification' => (string) $quote['classification'],
                'passengers' => (int) $quote_input['passengers'],
                'bags' => (int) $quote_input['bags'],
                'outbound_datetime' => $outbound,
                'return_datetime' => $returning,
                'customer_snapshot' => wp_json_encode($customer, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'conditional_details' => wp_json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'price_snapshot' => wp_json_encode([
                    'source' => 'server_quote',
                    'plugin_version' => LUXRIDE_BOOKING_ENGINE_VERSION,
                    'quote' => $quote,
                ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'final_total_eur' => (float) $quote['pricing']['total'],
                'currency' => (string) $quote['pricing']['currency'],
                'notification_status' => 'pending',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            ['%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s', '%s', '%s']
        );

        if (!$inserted) {
            if ($idempotency_key) {
                $existing = self::find_by_idempotency_key($idempotency_key);
                if ($existing) {
                    return self::public_booking_payload($existing, true);
                }
            }
            return new WP_Error('luxride_booking_store_failed', 'Booking could not be stored.', ['status' => 500, 'message_ar' => 'تعذر حفظ طلب الحجز.']);
        }

        $booking = self::get((int) $wpdb->insert_id);
        do_action('luxride_booking_created', (int) $wpdb->insert_id, $booking);

        return self::public_booking_payload($booking, false);
    }

    public static function get(int $booking_id): ?array
    {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare('SELECT * FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE id = %d', $booking_id),
            ARRAY_A
        );

        return $row ?: null;
    }

    public static function update_status(int $booking_id, string $status): bool
    {
        if (!in_array($status, self::STATUSES, true)) {
            return false;
        }

        global $wpdb;
        $data = ['status' => $status, 'updated_at' => current_time('mysql')];
        $formats = ['%s', '%s'];

        if ('confirmed' === $status) {
            $existing = self::get($booking_id);
            if ($existing && empty($existing['confirmed_at'])) {
                $data['confirmed_at'] = current_time('mysql');
                $formats[] = '%s';
            }
        }

        return false !== $wpdb->update(
            LuxRide_Booking_Schema::table('bookings'),
            $data,
            ['id' => $booking_id],
            $formats,
            ['%d']
        );
    }

    public static function update_status_with_confirmation(int $booking_id, string $status): array
    {
        if (!in_array($status, self::STATUSES, true)) {
            return ['updated' => false, 'confirmation_email' => null];
        }

        $before = self::get($booking_id);
        if ('confirmed' === $status && $before && 'confirmed' !== (string) ($before['status'] ?? '')) {
            $daily_limit = self::check_daily_booking_limit((string) ($before['outbound_datetime'] ?? ''));
            if (is_wp_error($daily_limit)) {
                return ['updated' => false, 'confirmation_email' => null, 'error' => $daily_limit];
            }
        }
        $updated = self::update_status($booking_id, $status);
        $email_result = null;

        if ($updated && $before && 'confirmed' === $status && 'confirmed' !== (string) ($before['status'] ?? '')) {
            $email_result = self::send_confirmation_email($booking_id, false);
        }

        return ['updated' => $updated, 'confirmation_email' => $email_result];
    }

    public static function send_confirmation_email(int $booking_id, bool $force = true): array
    {
        $booking = self::get($booking_id);
        if (!$booking) {
            return ['sent' => false, 'status' => 'failed', 'message' => 'Booking not found.'];
        }

        if ('confirmed' !== (string) ($booking['status'] ?? '')) {
            self::update_confirmation_email_status($booking_id, 'unavailable', 'Booking is not confirmed yet.');
            return ['sent' => false, 'status' => 'unavailable', 'message' => 'Booking is not confirmed yet.'];
        }

        if (!$force && ('sent' === (string) ($booking['confirmation_email_status'] ?? '') || !empty($booking['confirmation_email_sent_at']))) {
            return ['sent' => false, 'skipped' => true, 'status' => 'already_sent', 'message' => 'Confirmation email was already sent.'];
        }

        $customer = self::json_field($booking, 'customer_snapshot');
        $to = sanitize_email((string) ($customer['email'] ?? ''));
        if (!$to || !is_email($to)) {
            self::update_confirmation_email_status($booking_id, 'unavailable', 'Customer email is missing or invalid.');
            return ['sent' => false, 'status' => 'unavailable', 'message' => 'Customer email is missing or invalid.'];
        }

        $is_ar = 'AR' === strtoupper((string) ($booking['language'] ?? $customer['preferred_language'] ?? 'EN'));
        $subject = $is_ar
            ? sprintf('تأكيد حجز LuxRide %s', (string) $booking['booking_reference'])
            : sprintf('LuxRide booking confirmed %s', (string) $booking['booking_reference']);
        $headers = ['Content-Type: text/html; charset=UTF-8'];
        $errors = [];
        $handler = static function ($error) use (&$errors): void {
            if ($error instanceof WP_Error) {
                $errors[] = $error->get_error_message();
            }
        };

        add_action('wp_mail_failed', $handler);
        $sent = wp_mail($to, $subject, self::confirmation_email_html($booking, $is_ar), $headers);
        remove_action('wp_mail_failed', $handler);

        if ($sent) {
            self::update_confirmation_email_status($booking_id, 'sent', '');
            return ['sent' => true, 'status' => 'sent', 'message' => 'Confirmation email sent.'];
        }

        $message = $errors ? implode('; ', array_filter($errors)) : 'wp_mail returned false.';
        self::update_confirmation_email_status($booking_id, 'failed', $message);
        return ['sent' => false, 'status' => 'failed', 'message' => $message];
    }

    public static function confirmation_whatsapp_url(array $booking): string
    {
        $customer = self::json_field($booking, 'customer_snapshot');
        $phone = self::whatsapp_phone((string) ($customer['whatsapp'] ?? $customer['phone'] ?? ''));
        if ('' === $phone) {
            return '';
        }

        $is_ar = 'AR' === strtoupper((string) ($booking['language'] ?? $customer['preferred_language'] ?? 'EN'));
        return 'https://wa.me/' . rawurlencode($phone) . '?text=' . rawurlencode(self::confirmation_message_text($booking, $is_ar));
    }

    public static function update_operations(int $booking_id, array $input, int $user_id): bool
    {
        global $wpdb;

        $booking = self::get($booking_id);
        if (!$booking) {
            return false;
        }

        $group = sanitize_key((string) ($input['operations_group'] ?? 'all'));
        $data = [
            'operations_updated_by' => $user_id,
            'operations_updated_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ];
        $formats = ['%d', '%s', '%s'];

        if ('payment_discount' === $group || 'all' === $group) {
            $price_snapshot = self::json_field($booking, 'price_snapshot');
            $quote = is_array($price_snapshot['quote'] ?? null) ? $price_snapshot['quote'] : [];
            $pricing = is_array($quote['pricing'] ?? null) ? $quote['pricing'] : [];
            $promotional_total = isset($pricing['promotional_total'])
                ? (float) $pricing['promotional_total']
                : (float) ($pricing['total'] ?? $booking['final_total_eur'] ?? 0);
            $remove_discount = 'remove' === sanitize_key((string) ($input['booking_discount_action'] ?? ''));
            $discount_type = $remove_discount ? '' : (string) ($input['booking_discount_type'] ?? '');
            $discount_value = $remove_discount ? 0 : ($input['booking_discount_value'] ?? 0);
            $booking_discount = LuxRide_Booking_Promotions::booking_discount($promotional_total, $discount_type, $discount_value);
            $discount_reason = $remove_discount ? '' : sanitize_text_field((string) ($input['booking_discount_reason'] ?? ''));
            $price_snapshot['booking_discount'] = [
                'type' => $booking_discount['type'],
                'value' => $booking_discount['value'],
                'amount' => $booking_discount['amount'],
                'percent' => $booking_discount['percent'],
                'reason_present' => '' !== $discount_reason,
                'updated_at' => current_time('mysql'),
                'updated_by' => $user_id,
            ];
            $data += [
                'price_snapshot' => wp_json_encode($price_snapshot, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'final_total_eur' => (float) $booking_discount['final_total'],
                'booking_discount_type' => (string) $booking_discount['type'],
                'booking_discount_value' => (float) $booking_discount['value'],
                'booking_discount_amount_eur' => (float) $booking_discount['amount'],
                'booking_discount_reason' => $discount_reason,
                'payment_status' => self::payment_status((string) ($input['payment_status'] ?? $booking['payment_status'] ?? 'unpaid')),
                'payment_method' => sanitize_text_field((string) ($input['payment_method'] ?? $booking['payment_method'] ?? '')),
                'payment_note' => sanitize_text_field((string) ($input['payment_note'] ?? $booking['payment_note'] ?? '')),
            ];
            $formats = array_merge($formats, ['%s', '%f', '%s', '%f', '%f', '%s', '%s', '%s', '%s']);
        }

        if ('assignment_notes' === $group || 'all' === $group) {
            $rating = isset($input['customer_rating']) ? (int) $input['customer_rating'] : (int) ($booking['customer_rating'] ?? 0);
            $data += [
                'cancel_reason' => sanitize_textarea_field((string) ($input['cancel_reason'] ?? $booking['cancel_reason'] ?? '')),
                'driver_name' => sanitize_text_field((string) ($input['driver_name'] ?? $booking['driver_name'] ?? '')),
                'vehicle_plate' => sanitize_text_field((string) ($input['vehicle_plate'] ?? $booking['vehicle_plate'] ?? '')),
                'admin_notes' => sanitize_textarea_field((string) ($input['admin_notes'] ?? $booking['admin_notes'] ?? '')),
                'customer_rating' => max(0, min(5, $rating)),
                'rating_feedback' => sanitize_textarea_field((string) ($input['rating_feedback'] ?? $booking['rating_feedback'] ?? '')),
            ];
            $formats = array_merge($formats, ['%s', '%s', '%s', '%s', '%d', '%s']);
        }

        return false !== $wpdb->update(LuxRide_Booking_Schema::table('bookings'), $data, ['id' => $booking_id], $formats, ['%d']);
    }

    public static function update_operations_legacy(int $booking_id, array $input, int $user_id): bool
    {
        global $wpdb;

        $booking = self::get($booking_id);
        if (!$booking) {
            return false;
        }

        $rating = isset($input['customer_rating']) ? (int) $input['customer_rating'] : 0;
        $rating = max(0, min(5, $rating));
        $price_snapshot = self::json_field($booking, 'price_snapshot');
        $quote = is_array($price_snapshot['quote'] ?? null) ? $price_snapshot['quote'] : [];
        $pricing = is_array($quote['pricing'] ?? null) ? $quote['pricing'] : [];
        $promotional_total = isset($pricing['promotional_total'])
            ? (float) $pricing['promotional_total']
            : (float) ($pricing['total'] ?? $booking['final_total_eur'] ?? 0);
        $booking_discount = LuxRide_Booking_Promotions::booking_discount(
            $promotional_total,
            (string) ($input['booking_discount_type'] ?? ''),
            $input['booking_discount_value'] ?? 0
        );
        $discount_reason = sanitize_text_field((string) ($input['booking_discount_reason'] ?? ''));

        $price_snapshot['booking_discount'] = [
            'type' => $booking_discount['type'],
            'value' => $booking_discount['value'],
            'amount' => $booking_discount['amount'],
            'percent' => $booking_discount['percent'],
            'reason_present' => '' !== $discount_reason,
            'updated_at' => current_time('mysql'),
            'updated_by' => $user_id,
        ];

        return false !== $wpdb->update(
            LuxRide_Booking_Schema::table('bookings'),
            [
                'price_snapshot' => wp_json_encode($price_snapshot, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'final_total_eur' => (float) $booking_discount['final_total'],
                'booking_discount_type' => (string) $booking_discount['type'],
                'booking_discount_value' => (float) $booking_discount['value'],
                'booking_discount_amount_eur' => (float) $booking_discount['amount'],
                'booking_discount_reason' => $discount_reason,
                'payment_status' => self::payment_status((string) ($input['payment_status'] ?? 'unpaid')),
                'payment_method' => sanitize_text_field((string) ($input['payment_method'] ?? '')),
                'payment_note' => sanitize_text_field((string) ($input['payment_note'] ?? '')),
                'cancel_reason' => sanitize_textarea_field((string) ($input['cancel_reason'] ?? '')),
                'driver_name' => sanitize_text_field((string) ($input['driver_name'] ?? '')),
                'vehicle_plate' => sanitize_text_field((string) ($input['vehicle_plate'] ?? '')),
                'admin_notes' => sanitize_textarea_field((string) ($input['admin_notes'] ?? '')),
                'customer_rating' => $rating,
                'rating_feedback' => sanitize_textarea_field((string) ($input['rating_feedback'] ?? '')),
                'operations_updated_by' => $user_id,
                'operations_updated_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ],
            ['id' => $booking_id],
            ['%s', '%f', '%s', '%f', '%f', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s', '%s'],
            ['%d']
        );
    }

    public static function delete(int $booking_id): bool
    {
        global $wpdb;

        $deleted = $wpdb->delete(
            LuxRide_Booking_Schema::table('bookings'),
            ['id' => $booking_id],
            ['%d']
        );

        if (false === $deleted) {
            error_log('LuxRide booking deletion failed for booking ID ' . $booking_id . ': ' . (string) $wpdb->last_error);
            return false;
        }

        return $deleted > 0;
    }

    public static function notify_admin(int $booking_id, ?array $booking = null): void
    {
        $booking = $booking ?: self::get($booking_id);
        if (!$booking || 'sent' === (string) ($booking['notification_status'] ?? '')) {
            return;
        }

        $settings = LuxRide_Booking_Settings::all();
        $to = sanitize_email((string) ($settings['admin_notification_email'] ?? get_option('admin_email')));
        if (!$to || !is_email($to)) {
            return;
        }

        $route = self::json_field($booking, 'route_snapshot');
        $customer = self::json_field($booking, 'customer_snapshot');
        $trip_name = 'round_trip' === (string) ($booking['trip_type'] ?? '') ? ($route['trip_name_return'] ?? '') : ($route['trip_name_one_way'] ?? '');
        $subject = sprintf('LuxRide new booking %s', (string) $booking['booking_reference']);
        $lines = [
            'New LuxRide booking received.',
            'Reference: ' . (string) $booking['booking_reference'],
            'Route: ' . self::route_label($route),
            'Trip: ' . self::trip_type_label((string) ($booking['trip_type'] ?? ''), false) . ($trip_name ? ' / ' . (string) $trip_name : ''),
            'Vehicle: ' . (string) $booking['vehicle_key'],
            'Pickup time: ' . self::booking_datetime_label((string) $booking['outbound_datetime']),
            'Return time: ' . self::booking_datetime_label((string) ($booking['return_datetime'] ?? '')),
            'Customer: ' . (string) ($customer['full_name'] ?? ''),
            'Phone: ' . (string) ($customer['phone'] ?? ''),
            'Total: ' . number_format((float) $booking['final_total_eur'], 2) . ' ' . (string) $booking['currency'],
            'Admin: ' . admin_url('admin.php?page=luxride-bookings&booking_id=' . (int) $booking_id),
        ];

        $sent = wp_mail($to, $subject, implode("\n", $lines));

        global $wpdb;
        $wpdb->update(
            LuxRide_Booking_Schema::table('bookings'),
            [
                'notification_status' => $sent ? 'sent' : 'failed',
                'admin_notified_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ],
            ['id' => $booking_id],
            ['%s', '%s', '%s'],
            ['%d']
        );
    }

    public static function create_block(array $input, int $user_id): bool
    {
        global $wpdb;

        $block_id = isset($input['block_id']) ? absint($input['block_id']) : 0;
        $start = self::mysql_datetime((string) ($input['start_datetime'] ?? ''));
        $end = self::mysql_datetime((string) ($input['end_datetime'] ?? ''));
        if ($end <= $start) {
            return false;
        }

        $data = [
            'vehicle_key' => self::block_vehicle_key((string) ($input['vehicle_key'] ?? 'all')),
            'start_datetime' => $start,
            'end_datetime' => $end,
            'reason' => sanitize_text_field((string) ($input['reason'] ?? '')),
            'notes' => sanitize_textarea_field((string) ($input['notes'] ?? '')),
            'active' => !empty($input['active']) ? 1 : 0,
            'updated_at' => current_time('mysql'),
        ];

        if ($block_id) {
            return false !== $wpdb->update(
                LuxRide_Booking_Schema::table('vehicle_blocks'),
                $data,
                ['id' => $block_id],
                ['%s', '%s', '%s', '%s', '%s', '%d', '%s'],
                ['%d']
            );
        }

        $data['created_by'] = $user_id;
        $data['created_at'] = current_time('mysql');

        return false !== $wpdb->insert(
            LuxRide_Booking_Schema::table('vehicle_blocks'),
            $data,
            ['%s', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s']
        );
    }

    public static function delete_block(int $block_id): bool
    {
        global $wpdb;

        return false !== $wpdb->delete(
            LuxRide_Booking_Schema::table('vehicle_blocks'),
            ['id' => $block_id],
            ['%d']
        );
    }

    public static function check_vehicle_availability(string $vehicle_key, string $outbound, ?string $returning = null)
    {
        global $wpdb;

        $vehicle_key = sanitize_key($vehicle_key);
        if (!in_array($vehicle_key, ['sedan', 'mpv', 'minivan'], true)) {
            return new WP_Error('luxride_invalid_vehicle', 'Selected vehicle is not available.', ['status' => 400, 'message_ar' => 'السيارة المحددة غير متاحة.']);
        }

        $window = self::booking_window($outbound, $returning);
        if (!$window) {
            return new WP_Error('luxride_invalid_availability_datetime', 'A valid pickup date and time are required.', ['status' => 400, 'message_ar' => 'تاريخ ووقت الانطلاق صالحان مطلوبان.']);
        }

        $blocks = (int) $wpdb->get_var($wpdb->prepare(
            'SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('vehicle_blocks') . ' WHERE active = 1 AND start_datetime < %s AND end_datetime > %s AND (vehicle_key = %s OR vehicle_key = %s)',
            $window['end'],
            $window['start'],
            $vehicle_key,
            'all'
        ));
        if ($blocks > 0) {
            return new WP_Error('luxride_vehicle_blocked', 'Selected vehicle is blocked for this time. Please choose another time or contact us on WhatsApp.', [
                'status' => 409,
                'message_ar' => 'السيارة المحددة غير متاحة في هذا الوقت. يرجى اختيار وقت آخر أو التواصل معنا عبر واتساب.',
            ]);
        }

        $settings = LuxRide_Booking_Settings::all();
        $daily_limit = self::check_daily_booking_limit($window['start']);
        if (is_wp_error($daily_limit)) {
            return $daily_limit;
        }

        $limit = max(1, (int) ($settings['fleet_' . $vehicle_key . '_count'] ?? 1));
        $booked = (int) $wpdb->get_var($wpdb->prepare(
            'SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('bookings') . " WHERE vehicle_key = %s AND status IN ('new', 'pending', 'confirmed', 'assigned') AND outbound_datetime < %s AND COALESCE(return_datetime, DATE_ADD(outbound_datetime, INTERVAL %d HOUR)) > %s",
            $vehicle_key,
            $window['end'],
            max(1, (int) ($settings['availability_window_hours'] ?? 3)),
            $window['start']
        ));

        if ($booked >= $limit) {
            return new WP_Error('luxride_vehicle_unavailable', 'Selected vehicle is already booked for this time. Please choose another time or contact us on WhatsApp.', [
                'status' => 409,
                'message_ar' => 'السيارة المحددة محجوزة في هذا الوقت. يرجى اختيار وقت آخر أو التواصل معنا عبر واتساب.',
            ]);
        }

        return true;
    }

    private static function check_daily_booking_limit(string $outbound)
    {
        global $wpdb;

        $date = substr($outbound, 0, 10);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return true;
        }

        $settings = LuxRide_Booking_Settings::all();
        $limit = max(1, (int) ($settings['daily_booking_limit'] ?? 20));
        $timezone = new DateTimeZone('Africa/Cairo');
        $next_date = (new DateTimeImmutable($date . ' 00:00:00', $timezone))->modify('+1 day')->format('Y-m-d');
        $confirmed = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM " . LuxRide_Booking_Schema::table('bookings') . " WHERE status = 'confirmed' AND outbound_datetime >= %s AND outbound_datetime < %s",
            $date . ' 00:00:00',
            $next_date . ' 00:00:00'
        ));

        if ($confirmed >= $limit) {
            return new WP_Error('luxride_daily_limit_reached', 'This date has reached the maximum number of confirmed bookings. Please choose another date or contact us on WhatsApp.', [
                'status' => 409,
                'message_ar' => 'تم الوصول إلى الحد الأقصى للحجوزات المؤكدة لهذا اليوم. يرجى اختيار تاريخ آخر أو التواصل معنا عبر واتساب.',
                'date' => $date,
                'limit' => $limit,
            ]);
        }

        return true;
    }

    public static function public_booking_payload(?array $booking, bool $idempotent_replay = false): array
    {
        $booking = $booking ?: [];
        $route = self::json_field($booking, 'route_snapshot');
        $customer = self::json_field($booking, 'customer_snapshot');
        $details = self::json_field($booking, 'conditional_details');
        $price_snapshot = self::json_field($booking, 'price_snapshot');
        $quote = is_array($price_snapshot['quote'] ?? null) ? $price_snapshot['quote'] : [];

        return [
            'success' => true,
            'idempotent_replay' => $idempotent_replay,
            'booking' => [
                'reference' => (string) ($booking['booking_reference'] ?? ''),
                'status' => (string) ($booking['status'] ?? 'new'),
                'language' => (string) ($booking['language'] ?? 'EN'),
                'route' => $route,
                'vehicle' => (array) ($quote['vehicle'] ?? ['key' => $booking['vehicle_key'] ?? '']),
                'trip_type' => (string) ($booking['trip_type'] ?? ''),
                'classification' => (string) ($booking['system_classification'] ?? ''),
                'passengers' => (int) ($booking['passengers'] ?? 0),
                'bags' => (int) ($booking['bags'] ?? 0),
                'outbound_datetime' => (string) ($booking['outbound_datetime'] ?? ''),
                'return_datetime' => (string) ($booking['return_datetime'] ?? ''),
                'customer' => $customer,
                'details' => $details,
                'pricing' => (array) ($quote['pricing'] ?? []),
                'final_total_eur' => (float) ($booking['final_total_eur'] ?? 0),
                'currency' => (string) ($booking['currency'] ?? 'EUR'),
            ],
        ];
    }

    private static function quote_input(array $input): array
    {
        $customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
        $details = is_array($input['details'] ?? null) ? $input['details'] : [];

        return [
            'pickup' => sanitize_text_field((string) ($input['pickup'] ?? $input['from'] ?? '')),
            'destination' => sanitize_text_field((string) ($input['destination'] ?? $input['to'] ?? '')),
            'trip_type' => sanitize_key((string) ($input['trip_type'] ?? $input['trip'] ?? '')),
            'vehicle' => sanitize_key((string) ($input['vehicle'] ?? $input['vehicle_key'] ?? '')),
            'passengers' => (int) ($input['passengers'] ?? $input['pax'] ?? 0),
            'bags' => (int) ($input['bags'] ?? $input['luggage'] ?? 0),
            'outbound_datetime' => sanitize_text_field((string) ($input['outbound_datetime'] ?? '')),
            'return_datetime' => sanitize_text_field((string) ($input['return_datetime'] ?? '')),
            'child_seat' => self::truthy($input['child_seat'] ?? $details['child_seat'] ?? $customer['child_seat'] ?? false),
        ];
    }

    private static function validate_required_customer_fields(array $input, array $quote)
    {
        $customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
        $details = is_array($input['details'] ?? null) ? $input['details'] : [];
        $full_name = trim(sanitize_text_field((string) ($customer['full_name'] ?? $customer['name'] ?? $input['full_name'] ?? $input['name'] ?? '')));
        $phone = trim(sanitize_text_field((string) ($customer['phone'] ?? $customer['whatsapp'] ?? $input['phone'] ?? '')));
        $email = sanitize_email((string) ($customer['email'] ?? $input['email'] ?? ''));
        $missing = [];

        if (mb_strlen($full_name) < 2) {
            $missing[] = 'full_name';
        }
        if (!preg_match('/^[0-9+()\\-\\s]{6,32}$/', $phone)) {
            $missing[] = 'phone';
        }
        if ('' !== $email && !is_email($email)) {
            $missing[] = 'email';
        }

        foreach ((array) ($quote['required_fields'] ?? []) as $field) {
            if ('exact_location' === $field && '' === trim((string) ($details['exact_location'] ?? $details['hotel'] ?? $input['exact_location'] ?? $input['hotel'] ?? ''))) {
                $missing[] = 'exact_location';
            }
            if ('flight_number' === $field && '' === trim((string) ($details['flight_number'] ?? $input['flight_number'] ?? ''))) {
                $missing[] = 'flight_number';
            }
            if ('passport_or_id' === $field && '' === trim((string) ($details['passport_or_id'] ?? $input['passport_or_id'] ?? $input['passport'] ?? ''))) {
                $missing[] = 'passport_or_id';
            }
        }

        if ($missing) {
            return new WP_Error('luxride_booking_missing_fields', 'Required booking fields are missing or invalid.', [
                'status' => 400,
                'message_ar' => 'بعض بيانات الحجز المطلوبة ناقصة أو غير صحيحة.',
                'fields' => array_values(array_unique($missing)),
            ]);
        }

        return true;
    }

    private static function customer_snapshot(array $input, string $language): array
    {
        $customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
        $phone = sanitize_text_field((string) ($customer['phone'] ?? $customer['whatsapp'] ?? $input['phone'] ?? ''));

        return [
            'full_name' => sanitize_text_field((string) ($customer['full_name'] ?? $customer['name'] ?? $input['full_name'] ?? $input['name'] ?? '')),
            'phone' => $phone,
            'whatsapp' => sanitize_text_field((string) ($customer['whatsapp'] ?? $phone)),
            'email' => sanitize_email((string) ($customer['email'] ?? $input['email'] ?? '')),
            'preferred_language' => $language,
        ];
    }

    private static function conditional_details(array $input, array $quote): array
    {
        $details = is_array($input['details'] ?? null) ? $input['details'] : [];

        return [
            'exact_location' => sanitize_text_field((string) ($details['exact_location'] ?? $details['hotel'] ?? $input['exact_location'] ?? $input['hotel'] ?? '')),
            'room_number' => sanitize_text_field((string) ($details['room_number'] ?? $details['room'] ?? $input['room_number'] ?? $input['room'] ?? '')),
            'flight_number' => sanitize_text_field((string) ($details['flight_number'] ?? $input['flight_number'] ?? '')),
            'passport_or_id' => sanitize_text_field((string) ($details['passport_or_id'] ?? $input['passport_or_id'] ?? $input['passport'] ?? '')),
            'notes' => sanitize_textarea_field((string) ($details['notes'] ?? $input['notes'] ?? '')),
            'child_seat_requested' => !empty($quote['pricing']['child_seat']['requested']),
            'required_fields' => (array) ($quote['required_fields'] ?? []),
        ];
    }

    private static function generate_reference(): string
    {
        global $wpdb;

        $date = wp_date('Ymd', time(), wp_timezone());
        for ($i = 0; $i < 20; $i++) {
            $suffix = strtoupper(wp_generate_password(4, false, false));
            $reference = 'LRT-' . $date . '-' . $suffix;
            $exists = (int) $wpdb->get_var($wpdb->prepare(
                'SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE booking_reference = %s',
                $reference
            ));
            if (!$exists) {
                return $reference;
            }
        }

        return 'LRT-' . $date . '-' . strtoupper(substr(md5((string) microtime(true)), 0, 4));
    }

    private static function mysql_datetime(string $value): string
    {
        $timezone = wp_timezone();
        $date = date_create_immutable_from_format('Y-m-d H:i', $value, $timezone)
            ?: date_create_immutable($value, $timezone);

        return $date ? $date->format('Y-m-d H:i:s') : current_time('mysql');
    }

    private static function language(string $language): string
    {
        return 'AR' === strtoupper($language) ? 'AR' : 'EN';
    }

    private static function truthy($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    private static function idempotency_key(string $value): string
    {
        $value = preg_replace('/[^A-Za-z0-9._:-]/', '', $value);
        return substr((string) $value, 0, 80);
    }

    private static function find_by_idempotency_key(string $key): ?array
    {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare('SELECT * FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE idempotency_key = %s LIMIT 1', $key),
            ARRAY_A
        );

        return $row ?: null;
    }

    private static function json_field(array $booking, string $key): array
    {
        $decoded = json_decode((string) ($booking[$key] ?? '{}'), true);
        return is_array($decoded) ? $decoded : [];
    }

    private static function availability_error(array $quote, string $outbound, ?string $returning)
    {
        $vehicle_key = (string) ($quote['vehicle']['key'] ?? '');
        return $vehicle_key ? self::check_vehicle_availability($vehicle_key, $outbound, $returning) : true;
    }

    private static function booking_window(string $outbound, ?string $returning): ?array
    {
        $timezone = self::availability_timezone();
        $start = date_create_immutable($outbound, $timezone);
        if (!$start) {
            return null;
        }

        $end = $returning ? date_create_immutable($returning, $timezone) : false;
        if (!$end || $end <= $start) {
            $settings = LuxRide_Booking_Settings::all();
            $end = $start->modify('+' . max(1, (int) ($settings['availability_window_hours'] ?? 3)) . ' hours');
        }

        return [
            'start' => $start->format('Y-m-d H:i:s'),
            'end' => $end->format('Y-m-d H:i:s'),
        ];
    }

    private static function payment_status(string $status): string
    {
        $status = sanitize_key($status);
        return in_array($status, ['unpaid', 'deposit_paid', 'paid', 'refunded'], true) ? $status : 'unpaid';
    }

    private static function update_confirmation_email_status(int $booking_id, string $status, string $error): void
    {
        global $wpdb;

        $data = [
            'confirmation_email_status' => $status,
            'confirmation_email_last_error' => substr(sanitize_textarea_field($error), 0, 1000),
            'updated_at' => current_time('mysql'),
        ];
        $formats = ['%s', '%s', '%s'];

        if ('sent' === $status) {
            $data['confirmation_email_sent_at'] = current_time('mysql');
            $formats[] = '%s';
        }

        $wpdb->update(
            LuxRide_Booking_Schema::table('bookings'),
            $data,
            ['id' => $booking_id],
            $formats,
            ['%d']
        );
    }

    private static function confirmation_email_html(array $booking, bool $is_ar): string
    {
        $rows = self::confirmation_rows($booking, $is_ar);
        $title = $is_ar ? 'تم تأكيد حجزك' : 'Your booking is confirmed';
        $intro = $is_ar
            ? 'شكراً لاختيار LuxRide Taxi. هذه هي تفاصيل حجزك المؤكد.'
            : 'Thank you for choosing LuxRide Taxi. Here are your confirmed booking details.';
        $dir = $is_ar ? 'rtl' : 'ltr';
        $align = $is_ar ? 'right' : 'left';
        $html_rows = '';

        foreach ($rows as $label => $value) {
            if ('' === trim((string) $value)) {
                continue;
            }
            $html_rows .= '<tr><th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:' . esc_attr($align) . ';color:#374151;">' . esc_html($label) . '</th><td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:' . esc_attr($align) . ';">' . esc_html((string) $value) . '</td></tr>';
        }

        $footer = $is_ar
            ? 'إذا احتجت إلى تعديل الحجز، يرجى التواصل معنا عبر واتساب أو البريد الإلكتروني.'
            : 'If you need to adjust your booking, please contact us by WhatsApp or email.';

        return '<div dir="' . esc_attr($dir) . '" style="font-family:Arial,sans-serif;color:#111827;line-height:1.6;max-width:680px;margin:0 auto;">'
            . '<h1 style="color:#009f3f;font-size:28px;margin:0 0 12px;">' . esc_html($title) . '</h1>'
            . '<p style="font-size:16px;margin:0 0 20px;">' . esc_html($intro) . '</p>'
            . '<table role="presentation" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;">' . $html_rows . '</table>'
            . '<p style="font-size:15px;color:#4b5563;margin:20px 0 0;">' . esc_html($footer) . '</p>'
            . '</div>';
    }

    private static function confirmation_message_text(array $booking, bool $is_ar): string
    {
        $rows = self::confirmation_rows($booking, $is_ar);
        $lines = [$is_ar ? 'تم تأكيد حجزك مع LuxRide Taxi' : 'Your LuxRide Taxi booking is confirmed'];
        foreach ($rows as $label => $value) {
            if ('' !== trim((string) $value)) {
                $lines[] = $label . ': ' . (string) $value;
            }
        }

        return implode("\n", $lines);
    }

    private static function confirmation_rows(array $booking, bool $is_ar): array
    {
        $route = self::json_field($booking, 'route_snapshot');
        $customer = self::json_field($booking, 'customer_snapshot');
        $details = self::json_field($booking, 'conditional_details');
        $price_summary = self::price_summary($booking);
        $trip_name = 'round_trip' === (string) ($booking['trip_type'] ?? '') ? ($route['trip_name_return'] ?? '') : ($route['trip_name_one_way'] ?? '');
        $trip_name_ar = 'round_trip' === (string) ($booking['trip_type'] ?? '') ? ($route['trip_name_return_ar'] ?? '') : ($route['trip_name_one_way_ar'] ?? '');

        $rows = [
            $is_ar ? 'رقم الحجز' : 'Booking reference' => (string) ($booking['booking_reference'] ?? ''),
            $is_ar ? 'الاسم' : 'Name' => (string) ($customer['full_name'] ?? ''),
            $is_ar ? 'المسار' : 'Route' => self::localized_route_label($route, $is_ar),
            $is_ar ? 'نوع الرحلة' : 'Trip type' => self::trip_type_label((string) ($booking['trip_type'] ?? ''), $is_ar),
            $is_ar ? 'تصنيف الرحلة' : 'Trip classification' => $is_ar ? (string) $trip_name_ar : (string) $trip_name,
            $is_ar ? 'السيارة' : 'Vehicle' => self::vehicle_label((string) ($booking['vehicle_key'] ?? ''), $is_ar),
            $is_ar ? 'الركاب / الحقائب' : 'Passengers / bags' => (string) ($booking['passengers'] ?? '0') . ' / ' . (string) ($booking['bags'] ?? '0'),
            $is_ar ? 'موعد الذهاب' : 'Pickup time' => self::booking_datetime_label((string) ($booking['outbound_datetime'] ?? '')),
            $is_ar ? 'موعد العودة' : 'Return time' => self::booking_datetime_label((string) ($booking['return_datetime'] ?? '')),
            $is_ar ? 'الموقع / الفندق' : 'Location / hotel' => (string) ($details['exact_location'] ?? ''),
            $is_ar ? 'رقم الغرفة' : 'Room number' => (string) ($details['room_number'] ?? ''),
            $is_ar ? 'رقم الرحلة' : 'Flight number' => (string) ($details['flight_number'] ?? ''),
            $is_ar ? 'مقعد طفل' : 'Child seat' => !empty($details['child_seat_requested']) ? ($is_ar ? 'مطلوب' : 'Requested') : ($is_ar ? 'غير مطلوب' : 'Not requested'),
            $is_ar ? 'ملاحظات العميل' : 'Customer notes' => (string) ($details['notes'] ?? ''),
            $is_ar ? 'الإجمالي الأصلي' : 'Original Total' => self::money_line($price_summary['original_total'], $booking),
            $is_ar ? 'خصم العرض' : 'Promotional Discount' => $price_summary['promotion_discount'] > 0 ? '-' . self::money_line($price_summary['promotion_discount'], $booking) : '',
            $is_ar ? 'خصم خاص للحجز' : 'Special Booking Discount' => $price_summary['booking_discount'] > 0 ? '-' . self::money_line($price_summary['booking_discount'], $booking) : '',
            $is_ar ? 'الإجمالي النهائي' : 'Final Total' => self::money_line((float) ($booking['final_total_eur'] ?? 0), $booking),
            $is_ar ? 'طريقة الدفع' : 'Payment method' => self::payment_method_label((string) ($booking['payment_method'] ?? ''), $is_ar),
            $is_ar ? 'حالة الدفع' : 'Payment status' => self::payment_status_label((string) ($booking['payment_status'] ?? 'unpaid'), $is_ar),
            $is_ar ? 'السائق' : 'Driver' => (string) ($booking['driver_name'] ?? ''),
            $is_ar ? 'رقم السيارة' : 'Vehicle plate' => (string) ($booking['vehicle_plate'] ?? ''),
        ];

        if ('' === trim((string) ($booking['return_datetime'] ?? ''))) {
            unset($rows[$is_ar ? 'موعد العودة' : 'Return time']);
        }

        return $rows;
    }

    private static function price_summary(array $booking): array
    {
        $snapshot = self::json_field($booking, 'price_snapshot');
        $pricing = is_array($snapshot['quote']['pricing'] ?? null) ? $snapshot['quote']['pricing'] : [];
        $promotion = is_array($pricing['promotion'] ?? null) ? $pricing['promotion'] : [];
        $booking_discount = is_array($snapshot['booking_discount'] ?? null) ? $snapshot['booking_discount'] : [];
        $final = (float) ($booking['final_total_eur'] ?? 0);
        $promotion_discount = (float) ($promotion['promotion_discount_amount'] ?? $pricing['discount'] ?? 0);
        $booking_discount_amount = (float) ($booking['booking_discount_amount_eur'] ?? $booking_discount['amount'] ?? 0);
        $original_total = isset($pricing['original_total'])
            ? (float) $pricing['original_total']
            : $final + $promotion_discount + $booking_discount_amount;

        return [
            'original_total' => max(0, $original_total),
            'promotion_discount' => max(0, $promotion_discount),
            'promotional_total' => isset($pricing['promotional_total']) ? (float) $pricing['promotional_total'] : max(0, $original_total - $promotion_discount),
            'booking_discount' => max(0, $booking_discount_amount),
            'final_total' => $final,
            'promotion_name' => (string) ($promotion['promotion_name'] ?? ''),
            'promotion_percent' => (float) ($promotion['promotion_discount_percent'] ?? 0),
        ];
    }

    private static function money_line(float $value, array $booking): string
    {
        return number_format($value, 2) . ' ' . (string) ($booking['currency'] ?? 'EUR');
    }

    private static function localized_route_label(array $route, bool $is_ar): string
    {
        $pickup = $is_ar ? ($route['pickup']['ar'] ?? $route['pickup']['label'] ?? '') : ($route['pickup']['label'] ?? '');
        $destination = $is_ar ? ($route['destination']['ar'] ?? $route['destination']['label'] ?? '') : ($route['destination']['label'] ?? '');
        return trim((string) $pickup . ' -> ' . (string) $destination, ' ->');
    }

    private static function trip_type_label(string $trip_type, bool $is_ar): string
    {
        $labels = [
            'one_way' => $is_ar ? 'ذهاب فقط' : 'One way',
            'round_trip' => $is_ar ? 'ذهاب وعودة' : 'Round trip',
        ];

        return $labels[$trip_type] ?? ucwords(str_replace('_', ' ', $trip_type));
    }

    private static function vehicle_label(string $vehicle_key, bool $is_ar): string
    {
        $labels = [
            'sedan' => $is_ar ? 'سيدان' : 'Sedan',
            'mpv' => 'MPV',
            'minivan' => $is_ar ? 'ميني فان' : 'Mini Van',
        ];

        return $labels[$vehicle_key] ?? ucwords(str_replace('_', ' ', $vehicle_key));
    }

    private static function payment_method_label(string $method, bool $is_ar): string
    {
        $method = sanitize_key($method);
        if (in_array($method, ['', 'cash', 'cash_on_arrival', 'pay_on_transfer'], true)) {
            return $is_ar ? 'الدفع وقت التوصيل' : 'Pay on Transfer';
        }
        if ('paypal' === $method) {
            return $is_ar ? 'PayPal' : 'PayPal';
        }

        return ucwords(str_replace('_', ' ', $method));
    }

    private static function payment_status_label(string $status, bool $is_ar): string
    {
        $labels = [
            'unpaid' => $is_ar ? 'غير مدفوع' : 'Unpaid',
            'pending' => $is_ar ? 'قيد الانتظار' : 'Pending',
            'deposit_paid' => $is_ar ? 'دفعة مقدمة مدفوعة' : 'Deposit paid',
            'paid' => $is_ar ? 'مدفوع' : 'Paid',
            'refunded' => $is_ar ? 'مسترد' : 'Refunded',
        ];

        return $labels[$status] ?? ucwords(str_replace('_', ' ', $status));
    }

    private static function booking_datetime_label(string $value): string
    {
        if ('' === trim($value)) {
            return '';
        }

        $date = date_create_immutable($value, self::availability_timezone());
        if (!$date) {
            return $value;
        }

        $date_format = trim((string) get_option('date_format', 'Y-m-d'));
        $time_format = trim((string) get_option('time_format', 'H:i'));
        $format = trim($date_format . ' ' . $time_format);

        return wp_date($format ?: 'Y-m-d H:i', $date->getTimestamp(), self::availability_timezone());
    }

    private static function whatsapp_phone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        if (!$phone) {
            return '';
        }

        if ('+' === substr($phone, 0, 1)) {
            return substr($phone, 1);
        }
        if ('00' === substr($phone, 0, 2)) {
            return substr($phone, 2);
        }
        if ('0' === substr($phone, 0, 1)) {
            return '20' . substr($phone, 1);
        }

        return $phone;
    }

    private static function block_vehicle_key(string $vehicle_key): string
    {
        $vehicle_key = sanitize_key($vehicle_key);
        return in_array($vehicle_key, ['all', 'sedan', 'mpv', 'minivan'], true) ? $vehicle_key : 'all';
    }

    private static function route_label(array $route): string
    {
        $pickup = $route['pickup']['label'] ?? '';
        $destination = $route['destination']['label'] ?? '';
        return trim((string) $pickup . ' -> ' . (string) $destination, ' ->');
    }

    private static function availability_timezone(): DateTimeZone
    {
        return new DateTimeZone('Africa/Cairo');
    }
}
