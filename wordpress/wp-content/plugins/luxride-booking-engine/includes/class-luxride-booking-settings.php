<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Settings
{
    private const OPTION = 'luxride_booking_engine_settings';

    public static function defaults(): array
    {
        return [
            'airport_surcharge_eur' => 2.0,
            'permit_fee_sedan_eur' => 20.0,
            'permit_fee_mpv_eur' => 20.0,
            'permit_fee_minivan_eur' => 30.0,
            'driver_accommodation_eur' => 42.0,
            'currency' => 'EUR',
            'taxes_included' => 1,
            'minimum_lead_hours' => 3,
            'child_seat_price_eur' => 0.0,
            'admin_notification_email' => get_option('admin_email'),
            'availability_window_hours' => 3,
            'availability_timezone' => 'Africa/Cairo',
            'fleet_sedan_count' => 1,
            'fleet_mpv_count' => 1,
            'fleet_minivan_count' => 1,
        ];
    }

    public static function ensure_defaults(): void
    {
        update_option(self::OPTION, self::all(), false);
    }

    public static function all(): array
    {
        $stored = get_option(self::OPTION, []);
        return array_merge(self::defaults(), is_array($stored) ? $stored : []);
    }

    public static function get(string $key)
    {
        $settings = self::all();
        return $settings[$key] ?? null;
    }

    public static function update(array $input): void
    {
        $current = self::all();
        $next = [
            'airport_surcharge_eur' => self::money($input['airport_surcharge_eur'] ?? $current['airport_surcharge_eur']),
            'permit_fee_sedan_eur' => self::money($input['permit_fee_sedan_eur'] ?? $current['permit_fee_sedan_eur']),
            'permit_fee_mpv_eur' => self::money($input['permit_fee_mpv_eur'] ?? $current['permit_fee_mpv_eur']),
            'permit_fee_minivan_eur' => self::money($input['permit_fee_minivan_eur'] ?? $current['permit_fee_minivan_eur']),
            'driver_accommodation_eur' => self::money($input['driver_accommodation_eur'] ?? $current['driver_accommodation_eur']),
            'currency' => 'EUR',
            'taxes_included' => !empty($input['taxes_included']) ? 1 : 0,
            'minimum_lead_hours' => max(0, (int) ($input['minimum_lead_hours'] ?? $current['minimum_lead_hours'])),
            'child_seat_price_eur' => 0.0,
            'admin_notification_email' => sanitize_email((string) ($input['admin_notification_email'] ?? $current['admin_notification_email'])),
            'availability_window_hours' => max(1, (int) ($input['availability_window_hours'] ?? $current['availability_window_hours'])),
            'availability_timezone' => 'Africa/Cairo',
            'fleet_sedan_count' => max(1, (int) ($input['fleet_sedan_count'] ?? $current['fleet_sedan_count'])),
            'fleet_mpv_count' => max(1, (int) ($input['fleet_mpv_count'] ?? $current['fleet_mpv_count'])),
            'fleet_minivan_count' => max(1, (int) ($input['fleet_minivan_count'] ?? $current['fleet_minivan_count'])),
        ];

        update_option(self::OPTION, $next, false);
    }

    private static function money($value): float
    {
        if (!is_numeric($value)) {
            return 0.0;
        }

        return max(0.0, round((float) $value, 2));
    }
}
