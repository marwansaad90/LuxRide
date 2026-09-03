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
                'trip_name_one_way' => sanitize_text_field((string) ($row['trip_name_one_way'] ?? $row['outbound_trip_name'] ?? '')),
                'trip_name_return' => sanitize_text_field((string) ($row['trip_name_return'] ?? $row['return_trip_name'] ?? '')),
                'trip_name_one_way_ar' => sanitize_text_field((string) ($row['trip_name_one_way_ar'] ?? $row['outbound_trip_name_ar'] ?? '')),
                'trip_name_return_ar' => sanitize_text_field((string) ($row['trip_name_return_ar'] ?? $row['return_trip_name_ar'] ?? '')),
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

    public static function parse_upload(string $path, string $filename = '')
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if ('json' === $extension) {
            $payload = json_decode((string) file_get_contents($path), true);
            return is_array($payload) ? $payload : new WP_Error('luxride_import_invalid_json', 'Importer payload is not valid JSON.');
        }

        $matrix = 'xlsx' === $extension ? self::read_xlsx($path) : self::read_csv($path);
        if (is_wp_error($matrix)) {
            return $matrix;
        }

        if (count($matrix) < 2) {
            return new WP_Error('luxride_import_empty_file', 'The uploaded file has no route rows.');
        }

        return [
            'summary' => [
                'workbook' => sanitize_text_field($filename),
                'sha256' => hash_file('sha256', $path),
                'raw_data_rows' => count($matrix) - 1,
            ],
            'routes' => self::matrix_routes($matrix),
        ];
    }

    public static function export_xlsx()
    {
        return self::build_xlsx(self::export_matrix(), 'luxride-pricing-routes.xlsx');
    }

    public static function template_xlsx()
    {
        return self::build_xlsx([self::template_headers()], 'luxride-pricing-routes-template.xlsx');
    }

    private static function build_xlsx(array $matrix, string $temporary_name)
    {
        if (!class_exists('ZipArchive')) {
            return new WP_Error('luxride_zip_missing', 'PHP ZipArchive is required to create XLSX exports.');
        }

        $tmp = wp_tempnam($temporary_name);
        if (!$tmp) {
            return new WP_Error('luxride_xlsx_temp_failed', 'Could not create a temporary XLSX file.');
        }

        $zip = new ZipArchive();
        if (true !== $zip->open($tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
            return new WP_Error('luxride_xlsx_zip_failed', 'Could not open the XLSX archive.');
        }

        $zip->addFromString('[Content_Types].xml', self::xlsx_content_types());
        $zip->addFromString('_rels/.rels', self::xlsx_root_rels());
        $zip->addFromString('xl/workbook.xml', self::xlsx_workbook());
        $zip->addFromString('xl/_rels/workbook.xml.rels', self::xlsx_workbook_rels());
        $zip->addFromString('xl/worksheets/sheet1.xml', self::xlsx_sheet($matrix));
        $zip->close();

        $content = file_get_contents($tmp);
        unlink($tmp);

        return false === $content ? new WP_Error('luxride_xlsx_read_failed', 'Could not read the generated XLSX file.') : $content;
    }

    private static function template_headers(): array
    {
        return ['route_code', 'pickup', 'destination', 'pickup_ar', 'destination_ar', 'trip_name_one_way', 'trip_name_return', 'trip_name_one_way_ar', 'trip_name_return_ar', 'enabled', 'recommended_trip_type', 'round_trip_classification', 'airport_fee_applicable', 'permit_required', 'accommodation_applicable', 'accommodation_fee_eur', 'sedan_one_way_eur', 'sedan_round_trip_eur', 'mpv_one_way_eur', 'mpv_round_trip_eur', 'minivan_one_way_eur', 'minivan_round_trip_eur', 'source_row', 'source_checksum', 'updated_at'];
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

    private static function read_csv(string $path)
    {
        $handle = fopen($path, 'r');
        if (!$handle) {
            return new WP_Error('luxride_import_read_failed', 'Could not read the uploaded CSV file.');
        }

        $matrix = [];
        while (false !== ($row = fgetcsv($handle))) {
            if (isset($row[0])) {
                $row[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $row[0]);
            }
            $matrix[] = array_map(static fn($value) => is_string($value) ? trim($value) : $value, $row);
        }
        fclose($handle);
        return $matrix;
    }

    private static function read_xlsx(string $path)
    {
        if (!class_exists('ZipArchive')) {
            return new WP_Error('luxride_zip_missing', 'PHP ZipArchive is required to read XLSX files.');
        }

        $zip = new ZipArchive();
        if (true !== $zip->open($path)) {
            return new WP_Error('luxride_import_invalid_xlsx', 'The uploaded XLSX file could not be opened.');
        }

        $shared = [];
        $shared_xml = $zip->getFromName('xl/sharedStrings.xml');
        if (false !== $shared_xml) {
            $xml = simplexml_load_string($shared_xml);
            if ($xml) {
                $ns = $xml->getDocNamespaces(true);
                $main = $xml->children($ns[''] ?? null);
                foreach ($main->si as $item) {
                    $texts = [];
                    foreach ($item->xpath('.//*[local-name()="t"]') ?: [] as $text) {
                        $texts[] = (string) $text;
                    }
                    $shared[] = implode('', $texts);
                }
            }
        }

        $sheet_xml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        if (false === $sheet_xml) {
            return new WP_Error('luxride_import_invalid_xlsx', 'The uploaded XLSX file has no first worksheet.');
        }

        $sheet = simplexml_load_string($sheet_xml);
        if (!$sheet) {
            return new WP_Error('luxride_import_invalid_xlsx', 'The first worksheet could not be read.');
        }

        $ns = $sheet->getDocNamespaces(true);
        $main = $sheet->children($ns[''] ?? null);
        $matrix = [];
        foreach ($main->sheetData->row as $row) {
            $values = [];
            $row_node = $row->children($ns[''] ?? null);
            foreach ($row_node->c as $cell) {
                $cell_node = $cell->children($ns[''] ?? null);
                $ref = (string) $cell['r'];
                preg_match('/^([A-Z]+)/', $ref, $match);
                $index = self::xlsx_column_index($match[1] ?? 'A');
                $type = (string) $cell['t'];
                $value = 'inlineStr' === $type ? (string) ($cell_node->is->t ?? '') : (string) ($cell_node->v ?? '');
                if ('s' === $type && isset($shared[(int) $value])) {
                    $value = $shared[(int) $value];
                }
                $values[$index] = $value;
            }
            if ($values) {
                $max = max(array_keys($values));
                $normalized = array_fill(0, $max + 1, '');
                foreach ($values as $index => $value) {
                    $normalized[$index] = $value;
                }
                $matrix[] = $normalized;
            }
        }

        return $matrix;
    }

    private static function matrix_routes(array $matrix): array
    {
        $header_aliases = [
            'Pickup Location' => 'pickup',
            'Destination' => 'destination',
            'نقطة الانطلاق' => 'pickup_ar',
            'الوجهة' => 'destination_ar',
            'Sedan One Way (€)' => 'sedan_one_way_eur',
            'Sedan Round Trip (€)' => 'sedan_round_trip_eur',
            'MPV One Way (€)' => 'mpv_one_way_eur',
            'MPV Round Trip (€)' => 'mpv_round_trip_eur',
            'Mini Van One Way (€)' => 'minivan_one_way_eur',
            'Mini Van Round Trip (€)' => 'minivan_round_trip_eur',
            'Trip Name (One Way)' => 'trip_name_one_way',
            'Trip Name (Outbound)' => 'trip_name_one_way',
            'Trip Name (Return)' => 'trip_name_return',
            'اسم الرحلة - ذهاب' => 'trip_name_one_way_ar',
            'اسم الرحلة - عودة' => 'trip_name_return_ar',
        ];
        $headers = array_map(static function ($value) use ($header_aliases): string {
            $label = trim((string) $value);
            if (isset($header_aliases[$label])) {
                return $header_aliases[$label];
            }

            return sanitize_key(str_replace([' ', '-', '(', ')', '€'], ['', '_', '', '', 'eur'], $label));
        }, array_shift($matrix));
        $routes = [];
        foreach ($matrix as $values) {
            $row = [];
            foreach ($headers as $index => $header) {
                $row[$header] = $values[$index] ?? '';
            }
            $routes[] = [
                'route_code' => (string) ($row['route_code'] ?? ''),
                'pickup_label' => (string) ($row['pickup'] ?? $row['pickup_label'] ?? $row['pickup_en'] ?? ''),
                'destination_label' => (string) ($row['destination'] ?? $row['destination_label'] ?? $row['destination_en'] ?? ''),
                'pickup_label_ar' => (string) ($row['pickup_ar'] ?? $row['pickup_label_ar'] ?? ''),
                'destination_label_ar' => (string) ($row['destination_ar'] ?? $row['destination_label_ar'] ?? ''),
                'trip_name_one_way' => (string) ($row['trip_name_one_way'] ?? $row['trip_name_outbound'] ?? ''),
                'trip_name_return' => (string) ($row['trip_name_return'] ?? ''),
                'trip_name_one_way_ar' => (string) ($row['trip_name_one_way_ar'] ?? ''),
                'trip_name_return_ar' => (string) ($row['trip_name_return_ar'] ?? ''),
                'enabled' => self::import_bool($row['enabled'] ?? 1),
                'recommended_trip_type' => (string) ($row['recommended_trip_type'] ?? 'one_way'),
                'round_trip_classification' => (string) ($row['round_trip_classification'] ?? 'overnight'),
                'airport_fee_applicable' => self::import_bool($row['airport_fee_applicable'] ?? 0),
                'permit_required' => self::import_bool($row['permit_required'] ?? 0),
                'accommodation_applicable' => self::import_bool($row['accommodation_applicable'] ?? 1),
                'accommodation_fee_eur' => (float) ($row['accommodation_fee_eur'] ?? 0),
                'prices' => [
                    'sedan' => ['one_way' => (float) ($row['sedan_one_way_eur'] ?? 0), 'round_trip' => (float) ($row['sedan_round_trip_eur'] ?? 0)],
                    'mpv' => ['one_way' => (float) ($row['mpv_one_way_eur'] ?? 0), 'round_trip' => (float) ($row['mpv_round_trip_eur'] ?? 0)],
                    'minivan' => ['one_way' => (float) ($row['minivan_one_way_eur'] ?? 0), 'round_trip' => (float) ($row['minivan_round_trip_eur'] ?? 0)],
                ],
            ];
        }
        return $routes;
    }

    private static function import_bool($value): bool
    {
        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true);
    }

    private static function export_matrix(): array
    {
        global $wpdb;
        $rows = $wpdb->get_results('SELECT r.*, p.vehicle_key, p.one_way_price_eur, p.round_trip_price_eur FROM ' . LuxRide_Booking_Schema::table('routes') . ' r LEFT JOIN ' . LuxRide_Booking_Schema::table('route_prices') . ' p ON p.route_id = r.id ORDER BY r.display_order ASC, r.pickup_label ASC, r.destination_label ASC, p.vehicle_key ASC', ARRAY_A);
        $headers = ['route_code', 'pickup', 'destination', 'pickup_ar', 'destination_ar', 'trip_name_one_way', 'trip_name_return', 'trip_name_one_way_ar', 'trip_name_return_ar', 'enabled', 'recommended_trip_type', 'round_trip_classification', 'airport_fee_applicable', 'permit_required', 'accommodation_applicable', 'accommodation_fee_eur', 'sedan_one_way_eur', 'sedan_round_trip_eur', 'mpv_one_way_eur', 'mpv_round_trip_eur', 'minivan_one_way_eur', 'minivan_round_trip_eur', 'source_row', 'source_checksum', 'updated_at'];
        $grouped = [];
        foreach ($rows as $row) {
            $id = (int) $row['id'];
            if (!isset($grouped[$id])) {
                $grouped[$id] = [$row['route_code'], $row['pickup_label'], $row['destination_label'], $row['pickup_label_ar'], $row['destination_label_ar'], $row['trip_name_one_way'], $row['trip_name_return'], $row['trip_name_one_way_ar'], $row['trip_name_return_ar'], (int) $row['enabled'], $row['recommended_trip_type'], $row['round_trip_classification'], (int) $row['airport_fee_applicable'], (int) $row['permit_required'], (int) $row['accommodation_applicable'], $row['accommodation_fee_eur'], '', '', '', '', '', '', $row['source_row'], $row['source_checksum'], $row['updated_at']];
            }
            $offsets = ['sedan' => 16, 'mpv' => 18, 'minivan' => 20];
            if (isset($offsets[$row['vehicle_key']])) {
                $offset = $offsets[$row['vehicle_key']];
                $grouped[$id][$offset] = $row['one_way_price_eur'];
                $grouped[$id][$offset + 1] = $row['round_trip_price_eur'];
            }
        }
        return [$headers, ...array_values($grouped)];
    }

    private static function xlsx_sheet(array $matrix): string
    {
        $rows = [];
        foreach ($matrix as $row_number => $values) {
            $cells = [];
            foreach (array_values($values) as $index => $value) {
                $ref = self::xlsx_column_name($index + 1) . ($row_number + 1);
                $cells[] = is_numeric($value) && '' !== (string) $value
                    ? '<c r="' . $ref . '"><v>' . self::xlsx_xml_text((string) $value) . '</v></c>'
                    : '<c r="' . $ref . '" t="inlineStr"><is><t xml:space="preserve">' . self::xlsx_xml_text((string) $value) . '</t></is></c>';
            }
            $rows[] = '<row r="' . ($row_number + 1) . '">' . implode('', $cells) . '</row>';
        }
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' . implode('', $rows) . '</sheetData></worksheet>';
    }

    private static function xlsx_xml_text(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }

    private static function xlsx_column_name(int $index): string
    {
        $name = '';
        while ($index > 0) {
            $index--;
            $name = chr(65 + ($index % 26)) . $name;
            $index = intdiv($index, 26);
        }
        return $name;
    }

    private static function xlsx_column_index(string $name): int
    {
        $index = 0;
        foreach (str_split($name) as $char) {
            $index = ($index * 26) + ord($char) - 64;
        }
        return max(0, $index - 1);
    }

    private static function xlsx_content_types(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>';
    }

    private static function xlsx_root_rels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
    }

    private static function xlsx_workbook(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Pricing Routes" sheetId="1" r:id="rId1"/></sheets></workbook>';
    }

    private static function xlsx_workbook_rels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';
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
                'trip_name_one_way' => $route['trip_name_one_way'],
                'trip_name_return' => $route['trip_name_return'],
                'trip_name_one_way_ar' => $route['trip_name_one_way_ar'],
                'trip_name_return_ar' => $route['trip_name_return_ar'],
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
            'trip_name_one_way' => $route['trip_name_one_way'] ?? $route['outbound_trip_name'] ?? '',
            'trip_name_return' => $route['trip_name_return'] ?? $route['return_trip_name'] ?? '',
            'trip_name_one_way_ar' => $route['trip_name_one_way_ar'] ?? $route['outbound_trip_name_ar'] ?? '',
            'trip_name_return_ar' => $route['trip_name_return_ar'] ?? $route['return_trip_name_ar'] ?? '',
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
