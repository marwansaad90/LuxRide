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

        register_rest_route('luxride/v1', '/bookings', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'booking'],
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

        return self::no_cache_response([
            'source' => 'luxride-booking-engine',
            'routes' => array_values($routes),
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

    public static function booking(WP_REST_Request $request): WP_REST_Response
    {
        $input = (array) $request->get_json_params();
        $booking = LuxRide_Booking_Bookings::create($input);

        if (is_wp_error($booking)) {
            return self::error_response($booking);
        }

        return self::no_cache_response($booking, !empty($booking['idempotent_replay']) ? 200 : 201);
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
