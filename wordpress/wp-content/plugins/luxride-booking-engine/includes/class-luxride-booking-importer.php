<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Importer
{
    public static function dry_run(array $payload): array
    {
        $rows = self::payload_routes($payload);
        $seen = [];
        $duplicates = [];
        $invalid = [];
        $conflicts = [];
        $existing = self::existing_routes();
        $new = 0;
        $updated = 0;
        $unchanged = 0;

        foreach ($rows as $index => $row) {
            $pickup = sanitize_text_field((string) ($row['pickup_label'] ?? $row['pickup'] ?? ''));
            $destination = sanitize_text_field((string) ($row['destination_label'] ?? $row['destination'] ?? ''));
            $pickup_key = sanitize_title((string) ($row['pickup_key'] ?? $pickup));
            $destination_key = sanitize_title((string) ($row['destination_key'] ?? $destination));
            $key = $pickup_key . '|' . $destination_key;
            $prices = $row['prices'] ?? [];

            if ('' === $pickup || '' === $destination || !is_array($prices)) {
                $invalid[] = ['index' => $index, 'reason' => 'missing route labels or prices'];
                continue;
            }

            foreach (['sedan', 'mpv', 'minivan'] as $vehicle) {
                if (!isset($prices[$vehicle]['one_way'], $prices[$vehicle]['round_trip'])) {
                    $invalid[] = ['index' => $index, 'reason' => 'missing vehicle price', 'vehicle' => $vehicle];
                    continue;
                }
                if ((float) $prices[$vehicle]['one_way'] < 0 || (float) $prices[$vehicle]['round_trip'] < 0) {
                    $invalid[] = ['index' => $index, 'reason' => 'negative price', 'vehicle' => $vehicle];
                }
            }

            if (isset($seen[$key])) {
                $duplicates[] = ['index' => $index, 'first_index' => $seen[$key]['index'], 'pickup' => $pickup, 'destination' => $destination];
                if (wp_json_encode($seen[$key]['prices']) !== wp_json_encode($prices)) {
                    $conflicts[] = ['index' => $index, 'pickup' => $pickup, 'destination' => $destination, 'reason' => 'duplicate route has conflicting prices'];
                }
            } else {
                $seen[$key] = ['index' => $index, 'route' => $row, 'prices' => $prices];
                $route_code = sanitize_text_field((string) ($row['route_code'] ?? ($pickup_key . '-' . $destination_key)));
                $fingerprint = self::route_fingerprint($row);
                if (!isset($existing[$route_code])) {
                    $new++;
                } elseif ($existing[$route_code]['fingerprint'] === $fingerprint) {
                    $unchanged++;
                } else {
                    $updated++;
                }
            }
        }

        $incoming_codes = [];
        foreach ($seen as $item) {
            $route = $item['route'];
            $incoming_codes[] = sanitize_text_field((string) ($route['route_code'] ?? ''));
        }
        $removed = count(array_diff(array_keys($existing), array_filter($incoming_codes)));

        return [
            'source_file' => sanitize_text_field((string) ($payload['summary']['workbook'] ?? '')),
            'source_checksum' => sanitize_text_field((string) ($payload['summary']['sha256'] ?? '')),
            'total_rows' => count($rows),
            'valid_rows' => count($rows) - count($invalid),
            'invalid_rows' => $invalid,
            'duplicates' => $duplicates,
            'conflicts' => $conflicts,
            'routes_to_create' => $new,
            'routes_to_update' => $updated,
            'routes_unchanged' => $unchanged,
            'routes_to_disable' => $removed,
            'price_records_to_create' => count($seen) * 3,
            'unique_routes' => count($seen),
            'clean' => !$invalid && !$conflicts,
        ];
    }

    public static function apply(array $payload, int $user_id = 0)
    {
        global $wpdb;

        $dry_run = self::dry_run($payload);
        if (!$dry_run['clean']) {
            return new WP_Error('luxride_import_not_clean', 'Import dry run is not clean.', ['status' => 400, 'dry_run' => $dry_run]);
        }

        $routes = self::payload_routes($payload);
        $now = current_time('mysql');
        $routes_table = LuxRide_Booking_Schema::table('routes');
        $prices_table = LuxRide_Booking_Schema::table('route_prices');
        $incoming_codes = [];
        $route_count = 0;
        $price_count = 0;

        $wpdb->query('START TRANSACTION');

        foreach ($routes as $row) {
            $pickup = sanitize_text_field((string) ($row['pickup_label'] ?? $row['pickup'] ?? ''));
            $destination = sanitize_text_field((string) ($row['destination_label'] ?? $row['destination'] ?? ''));
            $pickup_key = sanitize_title((string) ($row['pickup_key'] ?? $pickup));
            $destination_key = sanitize_title((string) ($row['destination_key'] ?? $destination));
            $route_code = sanitize_text_field((string) ($row['route_code'] ?? ($pickup_key . '-' . $destination_key)));
            $incoming_codes[] = $route_code;

            $route_data = [
                'route_code' => $route_code,
                'pickup_key' => $pickup_key,
                'pickup_label' => $pickup,
                'pickup_label_ar' => sanitize_text_field((string) ($row['pickup_label_ar'] ?? '')),
                'destination_key' => $destination_key,
                'destination_label' => $destination,
                'destination_label_ar' => sanitize_text_field((string) ($row['destination_label_ar'] ?? '')),
                'recommended_trip_type' => in_array(($row['recommended_trip_type'] ?? ''), ['one_way', 'round_trip'], true) ? $row['recommended_trip_type'] : 'one_way',
                'round_trip_classification' => in_array(($row['round_trip_classification'] ?? ''), ['overday', 'overnight'], true) ? $row['round_trip_classification'] : 'overday',
                'airport_fee_applicable' => !empty($row['airport_fee_applicable']) ? 1 : 0,
                'permit_required' => !empty($row['permit_required']) ? 1 : 0,
                'accommodation_applicable' => array_key_exists('accommodation_applicable', $row) ? (!empty($row['accommodation_applicable']) ? 1 : 0) : 1,
                'accommodation_fee_eur' => isset($row['accommodation_fee_eur']) ? max(0, (float) $row['accommodation_fee_eur']) : 0,
                'enabled' => !array_key_exists('enabled', $row) || !empty($row['enabled']) ? 1 : 0,
                'display_order' => (int) ($row['display_order'] ?? $row['source_row'] ?? 0),
                'source_row' => (int) ($row['source_row'] ?? 0),
                'source_checksum' => sanitize_text_field((string) ($payload['summary']['sha256'] ?? '')),
                'updated_at' => $now,
            ];

            $existing_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$routes_table} WHERE route_code = %s", $route_code));
            if ($existing_id) {
                $wpdb->update($routes_table, $route_data, ['id' => $existing_id]);
                $route_id = $existing_id;
            } else {
                $route_data['created_at'] = $now;
                $wpdb->insert($routes_table, $route_data);
                $route_id = (int) $wpdb->insert_id;
            }

            if (!$route_id) {
                $wpdb->query('ROLLBACK');
                return new WP_Error('luxride_import_route_failed', 'Route import failed.', ['status' => 500, 'route' => $route_code]);
            }

            foreach ((array) ($row['prices'] ?? []) as $vehicle_key => $prices) {
                $vehicle_key = sanitize_key((string) $vehicle_key);
                if (!in_array($vehicle_key, ['sedan', 'mpv', 'minivan'], true)) {
                    continue;
                }

                $price_data = [
                    'route_id' => $route_id,
                    'vehicle_key' => $vehicle_key,
                    'one_way_price_eur' => round((float) ($prices['one_way'] ?? 0), 2),
                    'round_trip_price_eur' => round((float) ($prices['round_trip'] ?? 0), 2),
                    'updated_at' => $now,
                ];

                $price_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$prices_table} WHERE route_id = %d AND vehicle_key = %s", $route_id, $vehicle_key));
                if ($price_id) {
                    $wpdb->update($prices_table, $price_data, ['id' => $price_id]);
                } else {
                    $price_data['created_at'] = $now;
                    $wpdb->insert($prices_table, $price_data);
                }
                $price_count++;
            }

            $route_count++;
        }

        if ($incoming_codes) {
            $placeholders = implode(',', array_fill(0, count($incoming_codes), '%s'));
            $wpdb->query($wpdb->prepare("UPDATE {$routes_table} SET enabled = 0, updated_at = %s WHERE route_code NOT IN ({$placeholders})", array_merge([$now], $incoming_codes)));
        }

        $wpdb->insert(LuxRide_Booking_Schema::table('pricing_imports'), [
            'source_file' => sanitize_text_field((string) ($payload['summary']['workbook'] ?? '')),
            'source_checksum' => sanitize_text_field((string) ($payload['summary']['sha256'] ?? '')),
            'raw_route_count' => (int) ($payload['summary']['raw_data_rows'] ?? count($routes)),
            'applied_route_count' => $route_count,
            'applied_price_count' => $price_count,
            'summary' => wp_json_encode($dry_run, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'applied_by' => $user_id,
            'created_at' => $now,
        ]);

        $wpdb->query('COMMIT');

        return array_merge($dry_run, [
            'applied_route_count' => $route_count,
            'applied_price_count' => $price_count,
        ]);
    }

    public static function export_csv(): string
    {
        global $wpdb;

        $rows = $wpdb->get_results(
            'SELECT r.*, p.vehicle_key, p.one_way_price_eur, p.round_trip_price_eur
             FROM ' . LuxRide_Booking_Schema::table('routes') . ' r
             LEFT JOIN ' . LuxRide_Booking_Schema::table('route_prices') . ' p ON p.route_id = r.id
             ORDER BY r.display_order ASC, r.pickup_label ASC, r.destination_label ASC, p.vehicle_key ASC',
            ARRAY_A
        );
        $routes = [];

        foreach ($rows as $row) {
            $route_id = (int) $row['id'];
            if (!isset($routes[$route_id])) {
                $routes[$route_id] = $row;
                $routes[$route_id]['prices'] = [];
            }
            if ($row['vehicle_key']) {
                $routes[$route_id]['prices'][$row['vehicle_key']] = [
                    'one_way' => $row['one_way_price_eur'],
                    'round_trip' => $row['round_trip_price_eur'],
                ];
            }
        }

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, [
            'route_code',
            'pickup',
            'destination',
            'pickup_ar',
            'destination_ar',
            'enabled',
            'recommended_trip_type',
            'round_trip_classification',
            'airport_fee_applicable',
            'permit_required',
            'accommodation_applicable',
            'accommodation_fee_eur',
            'sedan_one_way_eur',
            'sedan_round_trip_eur',
            'mpv_one_way_eur',
            'mpv_round_trip_eur',
            'minivan_one_way_eur',
            'minivan_round_trip_eur',
            'source_row',
            'source_checksum',
            'updated_at',
        ]);
        foreach ($routes as $row) {
            $prices = $row['prices'];
            fputcsv($handle, [
                $row['route_code'],
                $row['pickup_label'],
                $row['destination_label'],
                $row['pickup_label_ar'],
                $row['destination_label_ar'],
                $row['enabled'],
                $row['recommended_trip_type'],
                $row['round_trip_classification'],
                $row['airport_fee_applicable'],
                $row['permit_required'],
                $row['accommodation_applicable'],
                $row['accommodation_fee_eur'],
                $prices['sedan']['one_way'] ?? '',
                $prices['sedan']['round_trip'] ?? '',
                $prices['mpv']['one_way'] ?? '',
                $prices['mpv']['round_trip'] ?? '',
                $prices['minivan']['one_way'] ?? '',
                $prices['minivan']['round_trip'] ?? '',
                $row['source_row'],
                $row['source_checksum'],
                $row['updated_at'],
            ]);
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        return (string) $csv;
    }

    private static function payload_routes(array $payload): array
    {
        if (isset($payload['routes']) && is_array($payload['routes'])) {
            return $payload['routes'];
        }

        return $payload;
    }

    private static function existing_routes(): array
    {
        global $wpdb;

        $rows = $wpdb->get_results(
            'SELECT r.*, p.vehicle_key, p.one_way_price_eur, p.round_trip_price_eur
             FROM ' . LuxRide_Booking_Schema::table('routes') . ' r
             LEFT JOIN ' . LuxRide_Booking_Schema::table('route_prices') . ' p ON p.route_id = r.id',
            ARRAY_A
        );
        $routes = [];

        foreach ($rows as $row) {
            $code = $row['route_code'];
            if (!isset($routes[$code])) {
                $routes[$code] = $row;
                $routes[$code]['prices'] = [];
            }
            if ($row['vehicle_key']) {
                $routes[$code]['prices'][$row['vehicle_key']] = [
                    'one_way' => (float) $row['one_way_price_eur'],
                    'round_trip' => (float) $row['round_trip_price_eur'],
                ];
            }
        }

        foreach ($routes as $code => $route) {
            $routes[$code]['fingerprint'] = self::route_fingerprint([
                'route_code' => $route['route_code'],
                'pickup_key' => $route['pickup_key'],
                'pickup_label' => $route['pickup_label'],
                'pickup_label_ar' => $route['pickup_label_ar'],
                'destination_key' => $route['destination_key'],
                'destination_label' => $route['destination_label'],
                'destination_label_ar' => $route['destination_label_ar'],
                'recommended_trip_type' => $route['recommended_trip_type'],
                'round_trip_classification' => $route['round_trip_classification'],
                'airport_fee_applicable' => (bool) $route['airport_fee_applicable'],
                'permit_required' => (bool) $route['permit_required'],
                'accommodation_applicable' => (bool) $route['accommodation_applicable'],
                'accommodation_fee_eur' => (float) $route['accommodation_fee_eur'],
                'prices' => $route['prices'],
            ]);
        }

        return $routes;
    }

    private static function route_fingerprint(array $route): string
    {
        return md5(wp_json_encode([
            'route_code' => $route['route_code'] ?? '',
            'pickup_key' => $route['pickup_key'] ?? '',
            'pickup_label' => $route['pickup_label'] ?? $route['pickup'] ?? '',
            'pickup_label_ar' => $route['pickup_label_ar'] ?? '',
            'destination_key' => $route['destination_key'] ?? '',
            'destination_label' => $route['destination_label'] ?? $route['destination'] ?? '',
            'destination_label_ar' => $route['destination_label_ar'] ?? '',
            'recommended_trip_type' => $route['recommended_trip_type'] ?? '',
            'round_trip_classification' => $route['round_trip_classification'] ?? '',
            'airport_fee_applicable' => !empty($route['airport_fee_applicable']),
            'permit_required' => !empty($route['permit_required']),
            'accommodation_applicable' => !empty($route['accommodation_applicable']),
            'accommodation_fee_eur' => isset($route['accommodation_fee_eur']) ? (float) $route['accommodation_fee_eur'] : 0.0,
            'prices' => $route['prices'] ?? [],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
}
