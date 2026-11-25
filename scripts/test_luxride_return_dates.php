<?php

declare(strict_types=1);

const HOUR_IN_SECONDS = 3600;

final class WP_Error
{
    public function __construct(
        public string $code,
        public string $message,
        public array $data = []
    ) {
    }
}

function is_wp_error($value): bool
{
    return $value instanceof WP_Error;
}

function wp_timezone(): DateTimeZone
{
    return new DateTimeZone('Africa/Cairo');
}

require_once __DIR__ . '/../wordpress/wp-content/plugins/luxride-booking-engine/includes/class-luxride-booking-pricing-engine.php';

function assert_same($expected, $actual, string $message): void
{
    if ($expected !== $actual) {
        fwrite(STDERR, $message . PHP_EOL);
        fwrite(STDERR, 'Expected: ' . var_export($expected, true) . PHP_EOL);
        fwrite(STDERR, 'Actual:   ' . var_export($actual, true) . PHP_EOL);
        exit(1);
    }
}

$validate = new ReflectionMethod(LuxRide_Booking_Pricing_Engine::class, 'validate_time_fields');
$nights = new ReflectionMethod(LuxRide_Booking_Pricing_Engine::class, 'return_nights');
$departureDate = (new DateTimeImmutable('now', wp_timezone()))->modify('+10 days')->format('Y-m-d');
$nextDate = (new DateTimeImmutable($departureDate, wp_timezone()))->modify('+1 day')->format('Y-m-d');
$secondDate = (new DateTimeImmutable($departureDate, wp_timezone()))->modify('+2 days')->format('Y-m-d');

assert_same(true, $validate->invoke(null, 'round_trip', 'overday', "$departureDate 08:00", "$departureDate 18:00", 3), 'Overday same-day return should remain valid.');
assert_same(true, $validate->invoke(null, 'round_trip', 'overday', "$departureDate 08:00", "$nextDate 08:00", 3), 'Overday later-date return should be valid.');
assert_same(true, is_wp_error($validate->invoke(null, 'round_trip', 'overnight', "$departureDate 08:00", "$departureDate 18:00", 3)), 'Overnight same-day return should remain invalid.');
assert_same(0, $nights->invoke(null, "$departureDate 08:00", "$departureDate 18:00"), 'Same-day return should not add accommodation nights.');
assert_same(1, $nights->invoke(null, "$departureDate 08:00", "$nextDate 08:00"), 'Next-day return should add one accommodation night.');
assert_same(2, $nights->invoke(null, "$departureDate 08:00", "$secondDate 08:00"), 'Two-day return should add two accommodation nights.');

fwrite(STDOUT, "LuxRide return-date checks passed.\n");
