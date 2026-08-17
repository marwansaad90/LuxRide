<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Bookings
{
    public const STATUSES = ['new', 'confirmed', 'cancelled', 'completed'];

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
        return false !== $wpdb->update(
            LuxRide_Booking_Schema::table('bookings'),
            ['status' => $status, 'updated_at' => current_time('mysql')],
            ['id' => $booking_id],
            ['%s', '%s'],
            ['%d']
        );
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
            $reference = 'LXR-' . $date . '-' . $suffix;
            $exists = (int) $wpdb->get_var($wpdb->prepare(
                'SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE booking_reference = %s',
                $reference
            ));
            if (!$exists) {
                return $reference;
            }
        }

        return 'LXR-' . $date . '-' . strtoupper(substr(md5((string) microtime(true)), 0, 4));
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
}
