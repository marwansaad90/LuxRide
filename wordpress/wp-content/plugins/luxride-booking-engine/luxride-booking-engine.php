<?php
/**
 * Plugin Name: LuxRide Booking Engine
 * Description: Server-side route pricing, quotes, and booking operations for LuxRide.
 * Version: 0.6.0
 * Author: LuxRide
 * Text Domain: luxride-booking-engine
 */

if (!defined('ABSPATH')) {
    exit;
}

define('LUXRIDE_BOOKING_ENGINE_VERSION', '0.6.0');
define('LUXRIDE_BOOKING_ENGINE_FILE', __FILE__);
define('LUXRIDE_BOOKING_ENGINE_DIR', plugin_dir_path(__FILE__));

require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-schema.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-locations.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-settings.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-promotions.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-pricing-engine.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-bookings.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-rest.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-admin.php';
require_once LUXRIDE_BOOKING_ENGINE_DIR . 'includes/class-luxride-booking-importer.php';

register_activation_hook(__FILE__, ['LuxRide_Booking_Schema', 'install']);

add_action('plugins_loaded', static function (): void {
    LuxRide_Booking_Schema::maybe_install();
    LuxRide_Booking_Rest::register_hooks();
    LuxRide_Booking_Admin::register_hooks();
    add_action('luxride_booking_created', ['LuxRide_Booking_Bookings', 'notify_admin'], 10, 2);
});
