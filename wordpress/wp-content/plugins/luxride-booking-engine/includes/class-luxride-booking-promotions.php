<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Promotions
{
    public const DISCOUNT_TYPES = ['percent', 'fixed'];
    public const SCOPES = ['all_routes', 'selected_routes'];

    public static function calculate(float $original_amount, int $route_id, string $vehicle_key = '', string $trip_type = '', ?string $when = null): array
    {
        $original_amount = self::money($original_amount);
        $fallback = self::empty_result($original_amount);
        if ($original_amount <= 0 || $route_id <= 0) {
            return $fallback;
        }

        $promotion = self::best_active_promotion($route_id, $when);
        if (!$promotion) {
            return $fallback;
        }

        $discount = self::discount_amount($original_amount, (string) $promotion['discount_type'], (float) $promotion['discount_value']);
        if ($discount <= 0) {
            return $fallback;
        }

        $promotional_amount = max(0.0, self::money($original_amount - $discount));
        $percent = $original_amount > 0 ? round(($discount / $original_amount) * 100, 2) : 0.0;

        return [
            'has_promotion' => true,
            'original_amount' => $original_amount,
            'promotion_id' => (int) $promotion['id'],
            'promotion_name' => (string) $promotion['name'],
            'promotion_type' => (string) $promotion['discount_type'],
            'promotion_value' => self::money((float) $promotion['discount_value']),
            'promotion_discount_amount' => $discount,
            'promotion_discount_percent' => $percent,
            'promotional_amount' => $promotional_amount,
            'promotion_start_at' => (string) ($promotion['start_at'] ?? ''),
            'promotion_end_at' => (string) ($promotion['end_at'] ?? ''),
            'vehicle_key' => sanitize_key($vehicle_key),
            'trip_type' => sanitize_key($trip_type),
        ];
    }

    public static function booking_discount(float $subtotal, string $type, $value): array
    {
        $subtotal = self::money($subtotal);
        $type = sanitize_key($type);
        $value = self::money((float) $value);
        if ($subtotal <= 0 || '' === $type || $value <= 0 || !in_array($type, self::DISCOUNT_TYPES, true)) {
            return [
                'type' => '',
                'value' => 0,
                'amount' => 0,
                'percent' => 0,
                'final_total' => $subtotal,
            ];
        }
        if (('percent' === $type && $value >= 100) || ('fixed' === $type && $value >= $subtotal)) {
            return [
                'type' => '',
                'value' => 0,
                'amount' => 0,
                'percent' => 0,
                'final_total' => $subtotal,
            ];
        }

        $amount = self::discount_amount($subtotal, $type, $value);
        $percent = $subtotal > 0 ? round(($amount / $subtotal) * 100, 2) : 0.0;

        return [
            'type' => $type,
            'value' => $value,
            'amount' => $amount,
            'percent' => $percent,
            'final_total' => max(0.0, self::money($subtotal - $amount)),
        ];
    }

    public static function route_card_pricing(string $pickup, string $destination, string $vehicle_key = 'mpv', string $trip_type = 'one_way'): array
    {
        global $wpdb;

        // Public cards use compact labels while the pricing tables use canonical route labels.
        $pickup = self::canonical_route_label($pickup);
        $destination = self::canonical_route_label($destination);

        $route = $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' . LuxRide_Booking_Schema::table('routes') . ' WHERE enabled = 1 AND pickup_key = %s AND destination_key = %s LIMIT 1',
                sanitize_title($pickup),
                sanitize_title($destination)
            ),
            ARRAY_A
        );
        if (!$route) {
            $route = $wpdb->get_row(
                $wpdb->prepare(
                    'SELECT * FROM ' . LuxRide_Booking_Schema::table('routes') . ' WHERE enabled = 1 AND pickup_label = %s AND destination_label = %s LIMIT 1',
                    sanitize_text_field($pickup),
                    sanitize_text_field($destination)
                ),
                ARRAY_A
            );
        }
        if (!$route) {
            return [];
        }

        $vehicle_key = sanitize_key($vehicle_key);
        $trip_type = 'round_trip' === sanitize_key($trip_type) ? 'round_trip' : 'one_way';
        $price = $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' . LuxRide_Booking_Schema::table('route_prices') . ' WHERE route_id = %d AND vehicle_key = %s LIMIT 1',
                (int) $route['id'],
                $vehicle_key
            ),
            ARRAY_A
        );
        if (!$price) {
            return [];
        }

        $base = self::money((float) ('round_trip' === $trip_type ? $price['round_trip_price_eur'] : $price['one_way_price_eur']));
        $promotion = self::calculate($base, (int) $route['id'], $vehicle_key, $trip_type);

        return [
            'route_id' => (int) $route['id'],
            'route_code' => (string) $route['route_code'],
            'original_price' => $base,
            'price' => $promotion['has_promotion'] ? $promotion['promotional_amount'] : $base,
            'promotion' => $promotion,
        ];
    }

    private static function canonical_route_label(string $value): string
    {
        $value = trim($value);
        $aliases = [
            'Hurghada' => 'Hurghada City Center',
            'Al Ahyaa' => 'Al Ahyaa Subdivisions',
        ];

        return $aliases[$value] ?? $value;
    }

    public static function all_for_admin(): array
    {
        global $wpdb;
        return $wpdb->get_results('SELECT * FROM ' . LuxRide_Booking_Schema::table('promotions') . ' ORDER BY updated_at DESC, id DESC LIMIT 300', ARRAY_A) ?: [];
    }

    public static function get(int $promotion_id): ?array
    {
        global $wpdb;
        $promotion = $wpdb->get_row(
            $wpdb->prepare('SELECT * FROM ' . LuxRide_Booking_Schema::table('promotions') . ' WHERE id = %d', $promotion_id),
            ARRAY_A
        );
        return $promotion ?: null;
    }

    public static function selected_route_ids(int $promotion_id): array
    {
        global $wpdb;
        return array_map('intval', $wpdb->get_col($wpdb->prepare(
            'SELECT route_id FROM ' . LuxRide_Booking_Schema::table('promotion_routes') . ' WHERE promotion_id = %d',
            $promotion_id
        )) ?: []);
    }

    public static function save(array $input, int $user_id)
    {
        global $wpdb;

        $promotion_id = isset($input['promotion_id']) ? absint($input['promotion_id']) : 0;
        $type = sanitize_key((string) ($input['discount_type'] ?? 'percent'));
        $scope = sanitize_key((string) ($input['scope'] ?? 'all_routes'));
        $value = self::money((float) ($input['discount_value'] ?? 0));
        $name = trim(sanitize_text_field((string) ($input['name'] ?? '')));
        $route_ids = array_values(array_unique(array_map('absint', (array) ($input['route_ids'] ?? []))));

        if ('' === $name || !in_array($type, self::DISCOUNT_TYPES, true) || !in_array($scope, self::SCOPES, true) || $value <= 0) {
            return new WP_Error('luxride_promotion_invalid', 'Promotion name, discount type, and discount value are required.');
        }
        if ('percent' === $type && $value >= 100) {
            return new WP_Error('luxride_promotion_percent_invalid', 'Percentage discounts must be greater than 0 and less than 100.');
        }
        if ('selected_routes' === $scope && !$route_ids) {
            return new WP_Error('luxride_promotion_routes_required', 'Select at least one route or choose All routes.');
        }
        if ('fixed' === $type) {
            $minimum_price = self::minimum_route_price('selected_routes' === $scope ? $route_ids : []);
            if ($minimum_price > 0 && $value >= $minimum_price) {
                return new WP_Error(
                    'luxride_promotion_fixed_too_large',
                    sprintf('Fixed discount must be less than the lowest affected route price (%s EUR).', number_format($minimum_price, 2))
                );
            }
        }

        $now = current_time('mysql');
        $data = [
            'name' => $name,
            'active' => !empty($input['active']) ? 1 : 0,
            'discount_type' => $type,
            'discount_value' => $value,
            'scope' => $scope,
            'priority' => (int) ($input['priority'] ?? 0),
            'start_at' => self::datetime_or_null((string) ($input['start_at'] ?? '')),
            'end_at' => self::datetime_or_null((string) ($input['end_at'] ?? '')),
            'internal_notes' => sanitize_textarea_field((string) ($input['internal_notes'] ?? '')),
            'updated_at' => $now,
        ];

        if ($data['start_at'] && $data['end_at'] && strtotime((string) $data['end_at']) <= strtotime((string) $data['start_at'])) {
            return new WP_Error('luxride_promotion_dates_invalid', 'End date must be after start date.');
        }

        $table = LuxRide_Booking_Schema::table('promotions');
        if ($promotion_id) {
            $saved = false !== $wpdb->update($table, $data, ['id' => $promotion_id]);
        } else {
            $data['created_by'] = $user_id;
            $data['created_at'] = $now;
            $saved = false !== $wpdb->insert($table, $data);
            $promotion_id = (int) $wpdb->insert_id;
        }
        if (!$saved || !$promotion_id) {
            return new WP_Error('luxride_promotion_save_failed', 'Promotion could not be saved.');
        }

        self::replace_routes($promotion_id, 'selected_routes' === $scope ? $route_ids : []);
        return $promotion_id;
    }

    public static function toggle(int $promotion_id): bool
    {
        global $wpdb;
        $promotion = self::get($promotion_id);
        if (!$promotion) {
            return false;
        }
        return false !== $wpdb->update(
            LuxRide_Booking_Schema::table('promotions'),
            ['active' => empty($promotion['active']) ? 1 : 0, 'updated_at' => current_time('mysql')],
            ['id' => $promotion_id],
            ['%d', '%s'],
            ['%d']
        );
    }

    public static function delete(int $promotion_id): bool
    {
        global $wpdb;
        $wpdb->delete(LuxRide_Booking_Schema::table('promotion_routes'), ['promotion_id' => $promotion_id], ['%d']);
        return false !== $wpdb->delete(LuxRide_Booking_Schema::table('promotions'), ['id' => $promotion_id], ['%d']);
    }

    public static function duplicate(int $promotion_id, int $user_id)
    {
        $promotion = self::get($promotion_id);
        if (!$promotion) {
            return new WP_Error('luxride_promotion_missing', 'Promotion not found.');
        }

        $routes = self::selected_route_ids($promotion_id);
        $promotion['promotion_id'] = 0;
        $promotion['name'] = sprintf('%s copy', (string) $promotion['name']);
        $promotion['active'] = 0;
        $promotion['route_ids'] = $routes;
        return self::save($promotion, $user_id);
    }

    public static function status(array $promotion): string
    {
        if (empty($promotion['active'])) {
            return 'disabled';
        }

        $now = new DateTimeImmutable('now', self::timezone());
        $start = self::date_or_null((string) ($promotion['start_at'] ?? ''));
        $end = self::date_or_null((string) ($promotion['end_at'] ?? ''));
        if ($start && $now < $start) {
            return 'scheduled';
        }
        if ($end && $now > $end) {
            return 'expired';
        }
        return 'active';
    }

    public static function active_summary_for_routes(array $route_ids, string $vehicle_key = 'mpv', string $trip_type = 'one_way'): array
    {
        global $wpdb;
        $route_ids = array_values(array_unique(array_filter(array_map('absint', $route_ids))));
        if (!$route_ids) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($route_ids), '%d'));
        $prices = $wpdb->get_results($wpdb->prepare(
            'SELECT route_id, one_way_price_eur, round_trip_price_eur FROM ' . LuxRide_Booking_Schema::table('route_prices') . " WHERE vehicle_key = %s AND route_id IN ({$placeholders})",
            ...array_merge([sanitize_key($vehicle_key)], $route_ids)
        ), ARRAY_A);

        $summary = [];
        foreach ($prices as $price) {
            $route_id = (int) $price['route_id'];
            $base = self::money((float) ('round_trip' === $trip_type ? $price['round_trip_price_eur'] : $price['one_way_price_eur']));
            $summary[$route_id] = self::calculate($base, $route_id, $vehicle_key, $trip_type);
        }
        return $summary;
    }

    private static function best_active_promotion(int $route_id, ?string $when): ?array
    {
        global $wpdb;

        $now = self::mysql_now($when);
        $sql = "
            SELECT p.*
            FROM " . LuxRide_Booking_Schema::table('promotions') . " p
            LEFT JOIN " . LuxRide_Booking_Schema::table('promotion_routes') . " pr ON pr.promotion_id = p.id AND pr.route_id = %d
            WHERE p.active = 1
              AND (p.start_at IS NULL OR p.start_at = '' OR p.start_at <= %s)
              AND (p.end_at IS NULL OR p.end_at = '' OR p.end_at >= %s)
              AND (p.scope = 'all_routes' OR pr.route_id IS NOT NULL)
            ORDER BY p.priority DESC, p.updated_at DESC, p.id DESC
            LIMIT 20
        ";

        $rows = $wpdb->get_results($wpdb->prepare($sql, $route_id, $now, $now), ARRAY_A) ?: [];
        $best = null;
        $best_amount = -1.0;
        foreach ($rows as $row) {
            $amount = self::discount_amount(100.0, (string) $row['discount_type'], (float) $row['discount_value']);
            if (null === $best || (int) $row['priority'] > (int) $best['priority'] || ((int) $row['priority'] === (int) $best['priority'] && $amount > $best_amount)) {
                $best = $row;
                $best_amount = $amount;
            }
        }
        return $best;
    }

    private static function replace_routes(int $promotion_id, array $route_ids): void
    {
        global $wpdb;
        $table = LuxRide_Booking_Schema::table('promotion_routes');
        $wpdb->delete($table, ['promotion_id' => $promotion_id], ['%d']);
        $now = current_time('mysql');
        foreach ($route_ids as $route_id) {
            if ($route_id > 0) {
                $wpdb->insert($table, ['promotion_id' => $promotion_id, 'route_id' => $route_id, 'created_at' => $now], ['%d', '%d', '%s']);
            }
        }
    }

    private static function minimum_route_price(array $route_ids = []): float
    {
        global $wpdb;

        $where = 'WHERE route_id > 0';
        $args = [];
        $route_ids = array_values(array_unique(array_filter(array_map('absint', $route_ids))));
        if ($route_ids) {
            $where .= ' AND route_id IN (' . implode(',', array_fill(0, count($route_ids), '%d')) . ')';
            $args = $route_ids;
        }

        $prices = LuxRide_Booking_Schema::table('route_prices');
        $sql = "SELECT MIN(price_value) FROM (
            SELECT one_way_price_eur AS price_value FROM {$prices} {$where} AND one_way_price_eur > 0
            UNION ALL
            SELECT round_trip_price_eur AS price_value FROM {$prices} {$where} AND round_trip_price_eur > 0
        ) lp";
        $value = $args ? $wpdb->get_var($wpdb->prepare($sql, ...array_merge($args, $args))) : $wpdb->get_var($sql);
        return is_numeric($value) ? (float) $value : 0.0;
    }

    private static function discount_amount(float $amount, string $type, float $value): float
    {
        if ('percent' === $type) {
            $discount = $amount * ($value / 100);
        } else {
            $discount = $value;
        }
        return self::money(min(max(0.0, $discount), $amount));
    }

    private static function empty_result(float $original_amount): array
    {
        return [
            'has_promotion' => false,
            'original_amount' => self::money($original_amount),
            'promotion_id' => 0,
            'promotion_name' => '',
            'promotion_type' => '',
            'promotion_value' => 0,
            'promotion_discount_amount' => 0,
            'promotion_discount_percent' => 0,
            'promotional_amount' => self::money($original_amount),
        ];
    }

    private static function datetime_or_null(string $value): ?string
    {
        $value = trim($value);
        if ('' === $value) {
            return null;
        }
        $date = date_create_immutable_from_format('Y-m-d\TH:i', $value, self::timezone())
            ?: date_create_immutable_from_format('Y-m-d H:i', $value, self::timezone())
            ?: date_create_immutable($value, self::timezone());
        return $date ? $date->format('Y-m-d H:i:s') : null;
    }

    private static function date_or_null(string $value): ?DateTimeImmutable
    {
        if ('' === trim($value)) {
            return null;
        }
        $date = date_create_immutable($value, self::timezone());
        return $date ?: null;
    }

    private static function mysql_now(?string $when): string
    {
        $date = $when ? self::date_or_null($when) : new DateTimeImmutable('now', self::timezone());
        return ($date ?: new DateTimeImmutable('now', self::timezone()))->format('Y-m-d H:i:s');
    }

    private static function money(float $value): float
    {
        return round($value, 2);
    }

    private static function timezone(): DateTimeZone
    {
        return new DateTimeZone('Africa/Cairo');
    }
}
