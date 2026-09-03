<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Locations
{
    private const PICKUP_ORDER_OPTION = 'luxride_pickup_order';

    public static function active_pickups(): array
    {
        global $wpdb;

        $rows = $wpdb->get_results(
            'SELECT pickup_key, MAX(pickup_label) AS pickup_label, MAX(pickup_label_ar) AS pickup_label_ar
            FROM ' . LuxRide_Booking_Schema::table('routes') . '
            WHERE enabled = 1
            GROUP BY pickup_key
            ORDER BY pickup_label ASC',
            ARRAY_A
        );

        $pickups = [];
        foreach ($rows as $row) {
            $key = sanitize_key((string) ($row['pickup_key'] ?? ''));
            if ('' === $key) {
                continue;
            }

            $pickups[$key] = [
                'key' => $key,
                'label' => (string) ($row['pickup_label'] ?? $key),
                'label_ar' => (string) ($row['pickup_label_ar'] ?? ''),
            ];
        }

        return $pickups;
    }

    public static function ordered_pickups(): array
    {
        $pickups = self::active_pickups();
        $saved = get_option(self::PICKUP_ORDER_OPTION, []);
        $saved = is_array($saved) ? $saved : [];
        $ordered = [];
        $seen = [];

        foreach ($saved as $key) {
            $key = sanitize_key((string) $key);
            if (isset($pickups[$key]) && !isset($seen[$key])) {
                $ordered[] = $pickups[$key];
                $seen[$key] = true;
            }
        }

        foreach ($pickups as $key => $pickup) {
            if (!isset($seen[$key])) {
                $ordered[] = $pickup;
            }
        }

        return $ordered;
    }

    public static function save_order(array $keys): bool
    {
        $pickups = self::active_pickups();
        $order = [];
        $seen = [];

        foreach ($keys as $key) {
            $key = sanitize_key((string) $key);
            if (isset($pickups[$key]) && !isset($seen[$key])) {
                $order[] = $key;
                $seen[$key] = true;
            }
        }

        foreach ($pickups as $key => $_pickup) {
            if (!isset($seen[$key])) {
                $order[] = $key;
            }
        }

        return update_option(self::PICKUP_ORDER_OPTION, $order, false);
    }
}
