<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Pricing_Engine
{
    public const CURRENCY = 'EUR';
    private const VEHICLES = [
        'sedan' => ['label' => 'Toyota Corolla', 'passengers' => 3, 'bags' => 2],
        'mpv' => ['label' => 'Mitsubishi Xpander 2027', 'passengers' => 4, 'bags' => 4],
        'minivan' => ['label' => 'Toyota HiAce', 'passengers' => 8, 'bags' => 8],
    ];

    private const VEHICLE_ALIASES = [
        'corolla' => 'sedan',
        'xpander' => 'mpv',
        'hiace' => 'minivan',
        'sedan' => 'sedan',
        'mpv' => 'mpv',
        'minivan' => 'minivan',
    ];

    public static function vehicle_config(string $vehicle_key): ?array
    {
        return self::VEHICLES[$vehicle_key] ?? null;
    }

    public static function quote(array $input)
    {
        global $wpdb;

        $pickup = sanitize_text_field((string) ($input['pickup'] ?? ''));
        $destination = sanitize_text_field((string) ($input['destination'] ?? ''));
        $trip_type = self::normalize_trip_type((string) ($input['trip_type'] ?? $input['trip'] ?? ''));
        $vehicle_key = self::normalize_vehicle((string) ($input['vehicle'] ?? $input['vehicle_key'] ?? ''));
        $passengers = isset($input['passengers']) ? (int) $input['passengers'] : 0;
        $bags = isset($input['bags']) ? (int) $input['bags'] : 0;
        $outbound_datetime = sanitize_text_field((string) ($input['outbound_datetime'] ?? ''));
        $return_datetime = sanitize_text_field((string) ($input['return_datetime'] ?? ''));
        $child_seat = !empty($input['child_seat']);
        $settings = LuxRide_Booking_Settings::all();

        if ('' === $pickup || '' === $destination) {
            return self::error('luxride_route_required', 'Pickup and destination are required.', 'موقع الانطلاق والوجهة مطلوبان.', 400);
        }

        if (!in_array($trip_type, ['one_way', 'round_trip'], true)) {
            return self::error('luxride_invalid_trip_type', 'Trip type must be one_way or round_trip.', 'نوع التوصيلة يجب أن يكون ذهاب فقط أو ذهاب وعودة.', 400);
        }

        $vehicle = self::vehicle_config($vehicle_key);
        if (!$vehicle) {
            return self::error('luxride_invalid_vehicle', 'Selected vehicle is not available for quoting.', 'السيارة المحددة غير متاحة للتسعير.', 400);
        }

        if (!self::vehicle_booking_enabled($vehicle_key)) {
            return self::error('luxride_vehicle_booking_disabled', 'Selected vehicle is temporarily unavailable for booking.', 'السيارة المحددة غير متاحة للحجز حالياً.', 409, ['vehicle' => $vehicle_key]);
        }

        if ($passengers < 1 || $bags < 0) {
            return self::error('luxride_invalid_capacity', 'Passengers and bags must be valid whole numbers.', 'عدد الركاب والحقائب يجب أن يكون أرقاماً صحيحة.', 400);
        }

        if ($passengers > $vehicle['passengers'] || $bags > $vehicle['bags']) {
            return new WP_Error(
                'luxride_capacity_exceeded',
                'Selected vehicle does not support the requested passengers or bags.',
                [
                    'status' => 400,
                    'message_ar' => 'السيارة المحددة لا تناسب عدد الركاب أو الحقائب المطلوب.',
                    'vehicle' => $vehicle_key,
                    'max_passengers' => $vehicle['passengers'],
                    'max_bags' => $vehicle['bags'],
                    'suggested_vehicles' => self::suggest_vehicles($passengers, $bags),
                ]
            );
        }

        $route = self::find_route($pickup, $destination);
        if (!$route) {
            return self::error('luxride_route_not_found', 'No enabled route exists for the selected pickup and destination.', 'لا يوجد مسار متاح لموقع الانطلاق والوجهة المحددين.', 404);
        }

        $price = $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' . LuxRide_Booking_Schema::table('route_prices') . ' WHERE route_id = %d AND vehicle_key = %s',
                (int) $route['id'],
                $vehicle_key
            ),
            ARRAY_A
        );

        if (!$price) {
            return self::error('luxride_price_not_found', 'No price exists for the selected route and vehicle.', 'لا يوجد سعر للسيارة المحددة على هذا المسار.', 404);
        }

        $base = 'one_way' === $trip_type ? (float) $price['one_way_price_eur'] : (float) $price['round_trip_price_eur'];
        $classification = 'one_way' === $trip_type ? 'one_way' : (string) $route['round_trip_classification'];
        $trip_name = 'one_way' === $trip_type ? (string) ($route['trip_name_one_way'] ?? '') : (string) ($route['trip_name_return'] ?? '');
        $trip_name_ar = 'one_way' === $trip_type ? (string) ($route['trip_name_one_way_ar'] ?? '') : (string) ($route['trip_name_return_ar'] ?? '');
        $airport_fee = (int) $route['airport_fee_applicable'] ? (float) $settings['airport_surcharge_eur'] : 0.0;
        $permit_fee = (int) $route['permit_required'] ? (float) $settings['permit_fee_' . $vehicle_key . '_eur'] : 0.0;
        $accommodation_enabled = (int) ($route['accommodation_applicable'] ?? 1) === 1;
        $nights = $accommodation_enabled ? self::overnight_nights($classification, $outbound_datetime, $return_datetime) : 0;
        $route_accommodation = isset($route['accommodation_fee_eur']) ? (float) $route['accommodation_fee_eur'] : 0.0;
        $accommodation_per_night = $route_accommodation > 0 ? $route_accommodation : (float) $settings['driver_accommodation_eur'];
        $accommodation_fee = $nights * $accommodation_per_night;
        $promotion = LuxRide_Booking_Promotions::calculate($base, (int) $route['id'], $vehicle_key, $trip_type, $outbound_datetime);
        $discount = (float) $promotion['promotion_discount_amount'];
        $promotional_base = (float) $promotion['promotional_amount'];
        $original_total = $base + $airport_fee + $permit_fee + $accommodation_fee;
        $total = $promotional_base + $airport_fee + $permit_fee + $accommodation_fee;
        $required_fields = self::required_fields($route, $trip_type, $classification);
        $validation = self::validate_time_fields($trip_type, $classification, $outbound_datetime, $return_datetime, (int) $settings['minimum_lead_hours']);

        if (is_wp_error($validation)) {
            return $validation;
        }

        $availability = LuxRide_Booking_Bookings::check_vehicle_availability($vehicle_key, $outbound_datetime, '' !== $return_datetime ? $return_datetime : null);
        if (is_wp_error($availability)) {
            return $availability;
        }

        return [
            'route' => [
                'id' => (int) $route['id'],
                'route_code' => $route['route_code'],
                'pickup' => ['key' => $route['pickup_key'], 'label' => $route['pickup_label'], 'ar' => $route['pickup_label_ar']],
                'destination' => ['key' => $route['destination_key'], 'label' => $route['destination_label'], 'ar' => $route['destination_label_ar']],
                'trip_name_one_way' => (string) ($route['trip_name_one_way'] ?? ''),
                'trip_name_return' => (string) ($route['trip_name_return'] ?? ''),
                'trip_name_one_way_ar' => (string) ($route['trip_name_one_way_ar'] ?? ''),
                'trip_name_return_ar' => (string) ($route['trip_name_return_ar'] ?? ''),
                'recommended_trip_type' => $route['recommended_trip_type'],
            ],
            'trip_type' => $trip_type,
            'classification' => $classification,
            'trip_name' => $trip_name,
            'trip_name_ar' => $trip_name_ar,
            'vehicle' => ['key' => $vehicle_key, 'label' => $vehicle['label']],
            'pricing' => [
                'base' => self::money($base),
                'original_base' => self::money($base),
                'discount' => self::money($discount),
                'promotion' => $promotion,
                'promotional_base' => self::money($promotional_base),
                'airport_fee' => self::money($airport_fee),
                'permit_fee' => self::money($permit_fee),
                'accommodation' => [
                    'nights' => $nights,
                    'price_per_night' => self::money($accommodation_per_night),
                    'total' => self::money($accommodation_fee),
                ],
                'accommodation_fee' => self::money($accommodation_fee),
                'original_total' => self::money($original_total),
                'promotional_total' => self::money($total),
                'child_seat' => [
                    'requested' => $child_seat,
                    'price' => self::money((float) $settings['child_seat_price_eur']),
                    'label' => 'Free Child Seat',
                    'label_ar' => 'كرسي أطفال مجاني',
                ],
                'total' => self::money($total),
                'currency' => (string) $settings['currency'],
                'taxes_included' => (bool) $settings['taxes_included'],
            ],
            'required_fields' => $required_fields,
            'validation' => ['ok' => true],
        ];
    }

    private static function normalize_trip_type(string $value): string
    {
        $value = sanitize_key($value);
        if ('oneway' === $value || 'oneWay' === $value || 'one-way' === $value) {
            return 'one_way';
        }
        if ('roundtrip' === $value || 'roundTrip' === $value || 'round-trip' === $value) {
            return 'round_trip';
        }
        return $value;
    }

    private static function normalize_vehicle(string $value): string
    {
        $key = sanitize_key($value);
        return self::VEHICLE_ALIASES[$key] ?? $key;
    }

    public static function vehicle_booking_enabled(string $vehicle_key): bool
    {
        $vehicle_key = self::normalize_vehicle($vehicle_key);
        $aliases = array_keys(array_filter(self::VEHICLE_ALIASES, fn($value) => $value === $vehicle_key));
        $posts = get_posts([
            'post_type' => 'luxride_vehicle',
            'post_status' => ['publish', 'draft', 'private'],
            'numberposts' => 1,
            'meta_query' => [
                'relation' => 'OR',
                ['key' => 'luxride_trip_type', 'value' => $vehicle_key],
                ['key' => 'luxride_source_id', 'value' => $aliases, 'compare' => 'IN'],
            ],
            'suppress_filters' => false,
        ]);

        if (!$posts) {
            return true;
        }

        $value = get_post_meta($posts[0]->ID, 'luxride_booking_enabled', true);
        return '' === $value || in_array($value, [true, 1, '1', 'true', 'yes', 'on'], true);
    }

    private static function find_route(string $pickup, string $destination): ?array
    {
        global $wpdb;

        $pickup_key = sanitize_title($pickup);
        $destination_key = sanitize_title($destination);

        $route = $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' . LuxRide_Booking_Schema::table('routes') . ' WHERE enabled = 1 AND pickup_key = %s AND destination_key = %s LIMIT 1',
                $pickup_key,
                $destination_key
            ),
            ARRAY_A
        );

        if ($route) {
            return $route;
        }

        return $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' . LuxRide_Booking_Schema::table('routes') . ' WHERE enabled = 1 AND pickup_label = %s AND destination_label = %s LIMIT 1',
                $pickup,
                $destination
            ),
            ARRAY_A
        ) ?: null;
    }

    private static function required_fields(array $route, string $trip_type, string $classification): array
    {
        $fields = ['customer_name', 'phone', 'passengers', 'bags', 'outbound_datetime', 'exact_location'];

        if ('round_trip' === $trip_type) {
            $fields[] = 'return_time';
        }

        if ('overnight' === $classification) {
            $fields[] = 'return_date';
        }

        if ((int) $route['airport_fee_applicable'] && false !== strpos(strtolower((string) $route['pickup_label']), 'airport')) {
            $fields[] = 'flight_number';
        }

        if ((int) $route['permit_required']) {
            $fields[] = 'passport_or_id';
        }

        return array_values(array_unique($fields));
    }

    private static function validate_time_fields(string $trip_type, string $classification, string $outbound_datetime, string $return_datetime, int $minimum_lead_hours)
    {
        if ('' === $outbound_datetime) {
            return self::error('luxride_outbound_required', 'Outbound date and time are required.', 'تاريخ ووقت الانطلاق مطلوبان.', 400);
        }

        $timezone = wp_timezone();
        $outbound = date_create_immutable_from_format('Y-m-d H:i', $outbound_datetime, $timezone)
            ?: date_create_immutable($outbound_datetime, $timezone);

        if (!$outbound) {
            return self::error('luxride_invalid_outbound_datetime', 'Outbound date and time are invalid.', 'تاريخ ووقت الانطلاق غير صالحين.', 400);
        }

        $now = new DateTimeImmutable('now', $timezone);
        if (($outbound->getTimestamp() - $now->getTimestamp()) < $minimum_lead_hours * HOUR_IN_SECONDS) {
            return self::error(
                'luxride_last_minute',
                sprintf('Standard bookings require at least %d hours before departure.', $minimum_lead_hours),
                sprintf('الحجز القياسي يتطلب %d ساعات على الأقل قبل الانطلاق.', $minimum_lead_hours),
                409,
                ['last_minute' => true, 'minimum_lead_hours' => $minimum_lead_hours]
            );
        }

        if ('round_trip' !== $trip_type) {
            return true;
        }

        if ('' === $return_datetime) {
            return self::error('luxride_return_required', 'Return date and time are required for round trips.', 'تاريخ ووقت العودة مطلوبان للذهاب والعودة.', 400);
        }

        $returning = date_create_immutable_from_format('Y-m-d H:i', $return_datetime, $timezone)
            ?: date_create_immutable($return_datetime, $timezone);

        if (!$returning || $returning <= $outbound) {
            return self::error('luxride_invalid_return_datetime', 'Return date and time must be after departure.', 'تاريخ ووقت العودة يجب أن يكونا بعد الانطلاق.', 400);
        }

        if ('overday' === $classification && $returning->format('Y-m-d') !== $outbound->format('Y-m-d')) {
            return self::error('luxride_invalid_overday_return', 'Overday returns must be on the departure date.', 'عودة اليوم الكامل يجب أن تكون في نفس تاريخ الانطلاق.', 400);
        }

        if ('overnight' === $classification && $returning->format('Y-m-d') <= $outbound->format('Y-m-d')) {
            return self::error('luxride_invalid_overnight_return', 'Overnight returns must use a later return date.', 'رحلات المبيت يجب أن تستخدم تاريخ عودة لاحقاً.', 400);
        }

        return true;
    }

    private static function overnight_nights(string $classification, string $outbound_datetime, string $return_datetime): int
    {
        if ('overnight' !== $classification || '' === $outbound_datetime || '' === $return_datetime) {
            return 0;
        }

        $timezone = wp_timezone();
        $outbound = date_create_immutable_from_format('Y-m-d H:i', $outbound_datetime, $timezone)
            ?: date_create_immutable($outbound_datetime, $timezone);
        $returning = date_create_immutable_from_format('Y-m-d H:i', $return_datetime, $timezone)
            ?: date_create_immutable($return_datetime, $timezone);

        if (!$outbound || !$returning || $returning <= $outbound) {
            return 1;
        }

        $days = (int) $outbound->setTime(0, 0)->diff($returning->setTime(0, 0))->format('%a');
        return max(1, $days);
    }

    private static function suggest_vehicles(int $passengers, int $bags): array
    {
        $matches = [];
        foreach (self::VEHICLES as $key => $vehicle) {
            if ($passengers <= $vehicle['passengers'] && $bags <= $vehicle['bags']) {
                $matches[] = ['key' => $key, 'label' => $vehicle['label']];
            }
        }
        return $matches;
    }

    private static function money(float $value)
    {
        $rounded = round($value, 2);
        return floor($rounded) === $rounded ? (int) $rounded : $rounded;
    }

    private static function error(string $code, string $message, string $message_ar, int $status, array $extra = []): WP_Error
    {
        return new WP_Error($code, $message, array_merge(['status' => $status, 'message_ar' => $message_ar], $extra));
    }
}
