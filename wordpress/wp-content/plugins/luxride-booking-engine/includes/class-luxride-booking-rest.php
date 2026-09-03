<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Rest
{
    public static function register_hooks(): void
    {
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function register_routes(): void
    {
        register_rest_route('luxride/v1', '/routes', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [self::class, 'routes'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('luxride/v1', '/quote', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'quote'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('luxride/v1', '/availability', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'availability'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('luxride/v1', '/bookings', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'booking'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('luxride/v1', '/public-settings', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [self::class, 'public_settings'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function routes(WP_REST_Request $request): WP_REST_Response
    {
        global $wpdb;

        $pickup = sanitize_text_field((string) $request->get_param('pickup'));
        $where = 'WHERE r.enabled = 1';
        $args = [];

        if ('' !== $pickup) {
            $where .= ' AND (r.pickup_key = %s OR r.pickup_label = %s)';
            $args[] = sanitize_title($pickup);
            $args[] = $pickup;
        }

        $sql = "
            SELECT r.*, p.vehicle_key, p.one_way_price_eur, p.round_trip_price_eur
            FROM " . LuxRide_Booking_Schema::table('routes') . " r
            LEFT JOIN " . LuxRide_Booking_Schema::table('route_prices') . " p ON p.route_id = r.id
            {$where}
            ORDER BY r.display_order ASC, r.pickup_label ASC, r.destination_label ASC, p.vehicle_key ASC
        ";

        $rows = $args ? $wpdb->get_results($wpdb->prepare($sql, ...$args), ARRAY_A) : $wpdb->get_results($sql, ARRAY_A);
        $routes = [];

        foreach ($rows as $row) {
            $id = (int) $row['id'];
            if (!isset($routes[$id])) {
                $routes[$id] = [
                    'id' => $id,
                    'route_code' => $row['route_code'],
                    'pickup' => ['key' => $row['pickup_key'], 'label' => $row['pickup_label'], 'ar' => $row['pickup_label_ar']],
                    'destination' => ['key' => $row['destination_key'], 'label' => $row['destination_label'], 'ar' => $row['destination_label_ar']],
                    'trip_name_one_way' => $row['trip_name_one_way'],
                    'trip_name_return' => $row['trip_name_return'],
                    'trip_name_one_way_ar' => $row['trip_name_one_way_ar'],
                    'trip_name_return_ar' => $row['trip_name_return_ar'],
                    'supported_trip_types' => ['one_way', 'round_trip'],
                    'recommended_trip_type' => $row['recommended_trip_type'],
                    'round_trip_classification' => $row['round_trip_classification'],
                    'airport_fee_applicable' => (bool) $row['airport_fee_applicable'],
                    'permit_required' => (bool) $row['permit_required'],
                    'accommodation_fee_eur' => (float) $row['accommodation_fee_eur'],
                    'prices' => [],
                ];
            }

            if ($row['vehicle_key']) {
                $routes[$id]['prices'][$row['vehicle_key']] = [
                    'one_way' => (float) $row['one_way_price_eur'],
                    'round_trip' => (float) $row['round_trip_price_eur'],
                ];
            }
        }

        foreach ($routes as $id => $route) {
            $mpv_one_way = (float) ($route['prices']['mpv']['one_way'] ?? 0);
            $promotion = LuxRide_Booking_Promotions::calculate($mpv_one_way > 0 ? $mpv_one_way : 100.0, (int) $id, 'mpv', 'one_way');
            $routes[$id]['promotion'] = !empty($promotion['has_promotion']) ? [
                'name' => (string) $promotion['promotion_name'],
                'type' => (string) $promotion['promotion_type'],
                'value' => (float) $promotion['promotion_value'],
                'discount_percent' => (float) $promotion['promotion_discount_percent'],
                'start_at' => (string) ($promotion['promotion_start_at'] ?? ''),
                'end_at' => (string) ($promotion['promotion_end_at'] ?? ''),
            ] : null;
        }

        return self::no_cache_response([
            'source' => 'luxride-booking-engine',
            'routes' => array_values($routes),
            'pickup_locations' => array_values(LuxRide_Booking_Locations::ordered_pickups()),
        ]);
    }

    public static function quote(WP_REST_Request $request): WP_REST_Response
    {
        $input = (array) $request->get_json_params();
        $quote = LuxRide_Booking_Pricing_Engine::quote($input);

        if (is_wp_error($quote)) {
            return self::error_response($quote);
        }

        return self::no_cache_response($quote);
    }

    public static function availability(WP_REST_Request $request): WP_REST_Response
    {
        $input = (array) $request->get_json_params();
        $aliases = ['corolla' => 'sedan', 'xpander' => 'mpv', 'hiace' => 'minivan'];
        $vehicle = sanitize_key((string) ($input['vehicle'] ?? $input['vehicle_key'] ?? ''));
        $vehicle = $aliases[$vehicle] ?? $vehicle;
        $outbound = sanitize_text_field((string) ($input['outbound_datetime'] ?? ''));
        $returning = sanitize_text_field((string) ($input['return_datetime'] ?? ''));
        $result = LuxRide_Booking_Bookings::check_vehicle_availability($vehicle, $outbound, '' !== $returning ? $returning : null);

        if (is_wp_error($result)) {
            return self::error_response($result);
        }

        return self::no_cache_response(['available' => true, 'vehicle' => $vehicle]);
    }

    public static function booking(WP_REST_Request $request): WP_REST_Response
    {
        $input = (array) $request->get_json_params();
        $turnstile = self::verify_turnstile($request, $input);
        if (is_wp_error($turnstile)) {
            return self::error_response($turnstile);
        }

        $booking = LuxRide_Booking_Bookings::create($input);

        if (is_wp_error($booking)) {
            return self::error_response($booking);
        }

        return self::no_cache_response($booking, !empty($booking['idempotent_replay']) ? 200 : 201);
    }

    public static function public_settings(WP_REST_Request $request): WP_REST_Response
    {
        $settings = LuxRide_Booking_Settings::all();
        $enabled = !empty($settings['turnstile_enabled']) && '' !== (string) ($settings['turnstile_site_key'] ?? '') && '' !== (string) ($settings['turnstile_secret_key'] ?? '');

        return self::no_cache_response([
            'turnstile' => [
                'enabled' => $enabled,
                'site_key' => $enabled ? (string) $settings['turnstile_site_key'] : '',
                'mode' => 'managed',
            ],
            'minimum_lead_hours' => LuxRide_Booking_Settings::minimum_lead_hours(),
        ]);
    }

    private static function verify_turnstile(WP_REST_Request $request, array $input)
    {
        $settings = LuxRide_Booking_Settings::all();
        if (empty($settings['turnstile_enabled'])) {
            return true;
        }

        $secret = trim((string) ($settings['turnstile_secret_key'] ?? ''));
        $site_key = trim((string) ($settings['turnstile_site_key'] ?? ''));
        if ('' === $secret || '' === $site_key) {
            return new WP_Error('luxride_turnstile_not_configured', 'Booking protection is not configured yet. Please contact LuxRide on WhatsApp.', ['status' => 503, 'message_ar' => 'حماية الحجز غير مهيأة بعد. يرجى التواصل مع LuxRide عبر واتساب.']);
        }

        $token = sanitize_text_field((string) ($input['turnstile_token'] ?? $input['cf-turnstile-response'] ?? ''));
        if ('' === $token) {
            return new WP_Error('luxride_turnstile_required', 'Please complete the booking security check.', ['status' => 400, 'message_ar' => 'يرجى إكمال فحص أمان الحجز.']);
        }

        $response = wp_remote_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'timeout' => 10,
            'body' => [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $request->get_header('cf-connecting-ip') ?: $_SERVER['REMOTE_ADDR'] ?? '',
            ],
        ]);

        if (is_wp_error($response)) {
            return new WP_Error('luxride_turnstile_unavailable', 'Booking security check is temporarily unavailable. Please try again or contact us on WhatsApp.', ['status' => 503, 'message_ar' => 'فحص أمان الحجز غير متاح مؤقتاً. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.']);
        }

        $body = json_decode((string) wp_remote_retrieve_body($response), true);
        if (!is_array($body) || empty($body['success'])) {
            return new WP_Error('luxride_turnstile_failed', 'Booking security check failed. Please refresh and try again.', ['status' => 400, 'message_ar' => 'فشل فحص أمان الحجز. يرجى تحديث الصفحة والمحاولة مرة أخرى.']);
        }

        return true;
    }

    private static function no_cache_response($payload, int $status = 200): WP_REST_Response
    {
        do_action('litespeed_control_set_nocache', 'LuxRide booking engine REST response');

        $response = rest_ensure_response($payload);
        $response->set_status($status);
        $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
        $response->header('Pragma', 'no-cache');
        $response->header('Expires', 'Wed, 11 Jan 1984 05:00:00 GMT');

        return $response;
    }

    private static function error_response(WP_Error $error): WP_REST_Response
    {
        $data = $error->get_error_data();
        $status = is_array($data) && isset($data['status']) ? (int) $data['status'] : 400;

        return self::no_cache_response([
            'code' => $error->get_error_code(),
            'message' => $error->get_error_message(),
            'details' => is_array($data) ? array_diff_key($data, ['status' => true]) : $data,
        ], $status);
    }
}
