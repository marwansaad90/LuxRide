<?php

define('ABSPATH', __DIR__);
define('ARRAY_A', 'ARRAY_A');

final class WP_Error
{
    public function __construct(public string $code, public string $message, public $data = null)
    {
    }
}

function is_wp_error($value): bool
{
    return $value instanceof WP_Error;
}

function sanitize_text_field($value): string
{
    return trim(strip_tags((string) $value));
}

function sanitize_key($value): string
{
    return preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $value));
}

function sanitize_title($value): string
{
    return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $value)), '-');
}

function wp_json_encode($value, int $flags = 0): string
{
    return json_encode($value, $flags);
}

function current_time($type): string
{
    return '2026-11-03 12:00:00';
}

function wp_tempnam($filename): string
{
    return tempnam(sys_get_temp_dir(), 'luxride-');
}

final class LuxRide_Booking_Schema
{
    public static function table(string $name): string
    {
        return $name;
    }
}

final class FakeWpdb
{
    public array $routes;
    public array $prices;
    public array $updates = [];
    public array $queries = [];
    public array $imports = [];

    public function __construct()
    {
        $this->routes = [
            1 => $this->route(1, 'hurghada-airport-makadi-bay', 'Hurghada Airport', 'Makadi Bay', 'Airport to Makadi', 'المطار إلى مكادي'),
            2 => $this->route(2, 'hurghada-city-center-luxor', 'Hurghada City Center', 'Luxor', 'Hurghada to Luxor', 'الغردقة إلى الأقصر'),
        ];
        $this->prices = [
            11 => $this->price(11, 1, 'sedan', 13, 24),
            12 => $this->price(12, 1, 'mpv', 18, 32),
            13 => $this->price(13, 1, 'minivan', 25, 45),
            21 => $this->price(21, 2, 'sedan', 75, 130),
            22 => $this->price(22, 2, 'mpv', 95, 165),
            23 => $this->price(23, 2, 'minivan', 125, 215),
        ];
    }

    public function get_results($query, $format): array
    {
        $rows = [];
        foreach ($this->routes as $route) {
            foreach ($this->prices as $price) {
                if ($price['route_id'] === $route['id']) {
                    $joined = $route;
                    $joined['vehicle_key'] = $price['vehicle_key'];
                    $joined['one_way_price_eur'] = $price['one_way_price_eur'];
                    $joined['round_trip_price_eur'] = $price['round_trip_price_eur'];
                    $rows[] = $joined;
                }
            }
        }
        return $rows;
    }

    public function prepare(string $query, ...$args): array
    {
        return ['query' => $query, 'args' => $args];
    }

    public function get_var($prepared)
    {
        [$route_id, $vehicle] = $prepared['args'];
        foreach ($this->prices as $price) {
            if ($price['route_id'] === (int) $route_id && $price['vehicle_key'] === $vehicle) {
                return $price['id'];
            }
        }
        return null;
    }

    public function update(string $table, array $data, array $where)
    {
        $this->updates[] = compact('table', 'data', 'where');
        if ('route_prices' === $table && isset($this->prices[$where['id']])) {
            $this->prices[$where['id']] = array_merge($this->prices[$where['id']], $data);
        }
        return 1;
    }

    public function insert(string $table, array $data)
    {
        if ('pricing_imports' === $table) {
            $this->imports[] = $data;
            return 1;
        }
        $id = max(array_keys($this->prices)) + 1;
        $this->prices[$id] = array_merge(['id' => $id], $data);
        return 1;
    }

    public function query(string $query)
    {
        $this->queries[] = $query;
        return true;
    }

    private function route(int $id, string $code, string $pickup, string $destination, string $trip, string $trip_ar): array
    {
        return [
            'id' => $id,
            'route_code' => $code,
            'pickup_key' => sanitize_title($pickup),
            'pickup_label' => $pickup,
            'pickup_label_ar' => 'نقطة ' . $id,
            'destination_key' => sanitize_title($destination),
            'destination_label' => $destination,
            'destination_label_ar' => 'وجهة ' . $id,
            'trip_name_one_way' => $trip,
            'trip_name_return' => $trip . ' return',
            'trip_name_one_way_ar' => $trip_ar,
            'trip_name_return_ar' => $trip_ar . ' عودة',
            'enabled' => 1,
            'recommended_trip_type' => 'round_trip',
            'round_trip_classification' => 'overday',
            'airport_fee_applicable' => 0,
            'permit_required' => 0,
            'accommodation_applicable' => 0,
            'accommodation_fee_eur' => 0,
            'display_order' => $id,
            'source_row' => $id + 1,
            'source_checksum' => 'test',
            'updated_at' => '2026-11-01 10:00:00',
        ];
    }

    private function price(int $id, int $route_id, string $vehicle, float $one_way, float $round_trip): array
    {
        return [
            'id' => $id,
            'route_id' => $route_id,
            'vehicle_key' => $vehicle,
            'one_way_price_eur' => $one_way,
            'round_trip_price_eur' => $round_trip,
        ];
    }
}

function assert_true($condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function csv_file(array $rows): string
{
    $path = tempnam(sys_get_temp_dir(), 'luxride-csv-');
    $handle = fopen($path, 'wb');
    foreach ($rows as $row) {
        fputcsv($handle, $row);
    }
    fclose($handle);
    return $path;
}

require_once dirname(__DIR__) . '/wordpress/wp-content/plugins/luxride-booking-engine/includes/class-luxride-booking-importer.php';

$wpdb = new FakeWpdb();
$route_snapshot = $wpdb->routes;

$headers = ['mpv_round_trip_eur', 'route_code', 'sedan_round_trip_eur', 'minivan_one_way_eur', 'sedan_one_way_eur', 'mpv_one_way_eur', 'minivan_round_trip_eur'];
$csv = csv_file([$headers, [35, 'hurghada-airport-makadi-bay', 26, 27, 14, 19, 48]]);
$payload = LuxRide_Booking_Importer::parse_price_upload($csv, 'reordered-prices.csv');
assert_true(!is_wp_error($payload), 'Reordered columns must parse by header name.');
$dry_run = LuxRide_Booking_Importer::dry_run_price_update($payload);
assert_true($dry_run['clean'], 'Valid price update should pass dry run.');
assert_true(0 === $dry_run['routes_to_disable'], 'Price-only update must never disable routes.');
assert_true(3 === $dry_run['price_records_to_update'], 'One route should update three vehicle records.');

$result = LuxRide_Booking_Importer::apply_price_update($payload, 7);
assert_true(!is_wp_error($result), 'Valid price update should apply.');
assert_true(3 === $result['applied_price_count'], 'Exactly three vehicle records should be updated.');
assert_true($route_snapshot === $wpdb->routes, 'Price-only update must not modify route metadata.');
assert_true(!array_filter($wpdb->updates, static fn($update) => 'routes' === $update['table']), 'No route table update is allowed.');
assert_true(!array_filter($wpdb->queries, static fn($query) => str_contains(strtoupper($query), 'UPDATE ROUTES')), 'No route disable SQL is allowed.');
assert_true(14.0 === (float) $wpdb->prices[11]['one_way_price_eur'], 'Sedan one-way price was not updated.');
assert_true(35.0 === (float) $wpdb->prices[12]['round_trip_price_eur'], 'MPV round-trip price was not updated.');

$missing_column_csv = csv_file([
    array_slice($headers, 0, -1),
    [35, 'hurghada-airport-makadi-bay', 26, 27, 14, 19],
]);
$missing_result = LuxRide_Booking_Importer::parse_price_upload($missing_column_csv, 'missing-column.csv');
assert_true(is_wp_error($missing_result) && 'luxride_price_update_missing_columns' === $missing_result->code, 'Missing price columns must be rejected.');

$unknown_csv = csv_file([$headers, [35, 'unknown-route', 26, 27, 14, 19, 48]]);
$unknown_payload = LuxRide_Booking_Importer::parse_price_upload($unknown_csv, 'unknown-route.csv');
$unknown_dry_run = LuxRide_Booking_Importer::dry_run_price_update($unknown_payload);
assert_true(!$unknown_dry_run['clean'], 'Unknown route codes must fail validation.');
assert_true('unknown route_code' === $unknown_dry_run['invalid_rows'][0]['reason'], 'Unknown route reason must be explicit.');

$template = LuxRide_Booking_Importer::price_update_template_xlsx();
assert_true(!is_wp_error($template), 'Price update template should be generated.');
$template_path = sys_get_temp_dir() . '/luxride-template-test.xlsx';
file_put_contents($template_path, $template);
$template_payload = LuxRide_Booking_Importer::parse_price_upload($template_path, 'luxride-price-update-template.xlsx');
assert_true(!is_wp_error($template_payload), 'Generated template should be importable: ' . (is_wp_error($template_payload) ? $template_payload->code . ' ' . $template_payload->message : ''));
assert_true(2 === count($template_payload['routes']), 'Generated template should contain every current route.');

$zip = new ZipArchive();
$zip->open($template_path);
$sheet_xml = $zip->getFromName('xl/worksheets/sheet1.xml');
$zip->close();
foreach (['route_code', 'sedan_one_way_eur', 'sedan_round_trip_eur', 'mpv_one_way_eur', 'mpv_round_trip_eur', 'minivan_one_way_eur', 'minivan_round_trip_eur'] as $header) {
    assert_true(str_contains($sheet_xml, $header), 'Template is missing expected header: ' . $header);
}
assert_true(!str_contains($sheet_xml, 'pickup_ar'), 'Price-only template must not expose unrelated route columns.');
assert_true(7 === substr_count($sheet_xml, '<col '), 'Price-only template should define exactly seven visible columns.');

$backup = LuxRide_Booking_Importer::export_xlsx();
assert_true(!is_wp_error($backup), 'Full XLSX backup should be generated.');
$backup_path = tempnam(sys_get_temp_dir(), 'luxride-backup-');
file_put_contents($backup_path, $backup);
$backup_payload = LuxRide_Booking_Importer::parse_upload($backup_path, 'luxride-pricing-routes.xlsx');
assert_true(!is_wp_error($backup_payload), 'Full XLSX backup should be re-importable.');
assert_true('Airport to Makadi' === $backup_payload['routes'][0]['trip_name_one_way'], 'Full backup must preserve English trip names.');
assert_true('المطار إلى مكادي' === $backup_payload['routes'][0]['trip_name_one_way_ar'], 'Full backup must preserve Arabic trip names.');

$legacy_csv = LuxRide_Booking_Importer::export_csv();
assert_true(str_contains($legacy_csv, 'trip_name_one_way'), 'Legacy CSV backup must include trip-name columns.');
assert_true(str_contains($legacy_csv, 'Airport to Makadi'), 'Legacy CSV backup must preserve English trip names.');
assert_true(str_contains($legacy_csv, 'المطار إلى مكادي'), 'Legacy CSV backup must preserve Arabic trip names.');

@unlink($csv);
@unlink($missing_column_csv);
@unlink($unknown_csv);
@unlink($template_path);
@unlink($backup_path);

echo "LuxRide price update importer tests passed.\n";
