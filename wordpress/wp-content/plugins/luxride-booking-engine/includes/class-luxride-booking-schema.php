<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Schema
{
    public const SCHEMA_VERSION = '0.7.0';

    public static function table(string $name): string
    {
        global $wpdb;
        return $wpdb->prefix . 'luxride_' . $name;
    }

    public static function maybe_install(): void
    {
        if (get_option('luxride_booking_engine_schema_version') !== self::SCHEMA_VERSION) {
            self::install();
        }
    }

    public static function install(): void
    {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset = $wpdb->get_charset_collate();
        $routes = self::table('routes');
        $prices = self::table('route_prices');
        $bookings = self::table('bookings');
        $blocks = self::table('vehicle_blocks');
        $imports = self::table('pricing_imports');
        $promotions = self::table('promotions');
        $promotion_routes = self::table('promotion_routes');

        dbDelta("
CREATE TABLE {$routes} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  route_code varchar(191) NOT NULL,
  pickup_key varchar(191) NOT NULL,
  pickup_label varchar(191) NOT NULL,
  pickup_label_ar varchar(191) NOT NULL DEFAULT '',
  destination_key varchar(191) NOT NULL,
  destination_label varchar(191) NOT NULL,
  destination_label_ar varchar(191) NOT NULL DEFAULT '',
  trip_name_one_way varchar(191) NOT NULL DEFAULT '',
  trip_name_return varchar(191) NOT NULL DEFAULT '',
  trip_name_one_way_ar varchar(191) NOT NULL DEFAULT '',
  trip_name_return_ar varchar(191) NOT NULL DEFAULT '',
  recommended_trip_type varchar(20) NOT NULL DEFAULT 'one_way',
  round_trip_classification varchar(20) NOT NULL DEFAULT 'overday',
  airport_fee_applicable tinyint(1) NOT NULL DEFAULT 0,
  permit_required tinyint(1) NOT NULL DEFAULT 0,
  accommodation_applicable tinyint(1) NOT NULL DEFAULT 1,
  accommodation_fee_eur decimal(10,2) NOT NULL DEFAULT 0,
  enabled tinyint(1) NOT NULL DEFAULT 1,
  display_order int(11) NOT NULL DEFAULT 0,
  source_row int(11) NOT NULL DEFAULT 0,
  source_checksum char(64) NOT NULL DEFAULT '',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY route_code (route_code),
  KEY pickup_key (pickup_key),
  KEY destination_key (destination_key),
  KEY enabled (enabled)
) {$charset};
");

        dbDelta("
CREATE TABLE {$prices} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  route_id bigint(20) unsigned NOT NULL,
  vehicle_key varchar(20) NOT NULL,
  one_way_price_eur decimal(10,2) NOT NULL,
  round_trip_price_eur decimal(10,2) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY route_vehicle (route_id, vehicle_key),
  KEY vehicle_key (vehicle_key)
) {$charset};
");

        dbDelta("
CREATE TABLE {$bookings} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  booking_reference varchar(40) NOT NULL,
  idempotency_key varchar(80) DEFAULT NULL,
  status varchar(30) NOT NULL DEFAULT 'new',
  language varchar(5) NOT NULL DEFAULT 'EN',
  route_id bigint(20) unsigned NOT NULL,
  route_snapshot longtext NOT NULL,
  vehicle_key varchar(20) NOT NULL,
  trip_type varchar(20) NOT NULL,
  system_classification varchar(20) NOT NULL,
  passengers int(11) NOT NULL,
  bags int(11) NOT NULL,
  outbound_datetime datetime NOT NULL,
  return_datetime datetime NULL,
  customer_snapshot longtext NOT NULL,
  conditional_details longtext NOT NULL,
  price_snapshot longtext NOT NULL,
  final_total_eur decimal(10,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'EUR',
  notification_status varchar(30) NOT NULL DEFAULT 'pending',
  admin_notified_at datetime NULL,
  confirmation_email_status varchar(30) NOT NULL DEFAULT 'not_sent',
  confirmation_email_sent_at datetime NULL,
  confirmation_email_last_error text NULL,
  confirmed_at datetime NULL,
  cancel_reason text NULL,
  payment_method varchar(80) NOT NULL DEFAULT '',
  payment_status varchar(30) NOT NULL DEFAULT 'unpaid',
  payment_note varchar(255) NOT NULL DEFAULT '',
  booking_discount_type varchar(20) NOT NULL DEFAULT '',
  booking_discount_value decimal(10,2) NOT NULL DEFAULT 0,
  booking_discount_amount_eur decimal(10,2) NOT NULL DEFAULT 0,
  booking_discount_reason varchar(255) NOT NULL DEFAULT '',
  driver_name varchar(120) NOT NULL DEFAULT '',
  vehicle_plate varchar(80) NOT NULL DEFAULT '',
  admin_notes text NULL,
  customer_rating tinyint(3) unsigned NOT NULL DEFAULT 0,
  rating_feedback text NULL,
  operations_updated_by bigint(20) unsigned NOT NULL DEFAULT 0,
  operations_updated_at datetime NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY booking_reference (booking_reference),
  UNIQUE KEY idempotency_key (idempotency_key),
  KEY status (status),
  KEY payment_status (payment_status),
  KEY confirmed_at (confirmed_at),
  KEY vehicle_key (vehicle_key),
  KEY route_id (route_id),
  KEY outbound_datetime (outbound_datetime)
) {$charset};
");

        dbDelta("
CREATE TABLE {$promotions} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(191) NOT NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  discount_type varchar(20) NOT NULL DEFAULT 'percent',
  discount_value decimal(10,2) NOT NULL DEFAULT 0,
  scope varchar(20) NOT NULL DEFAULT 'all_routes',
  priority int(11) NOT NULL DEFAULT 0,
  start_at datetime NULL,
  end_at datetime NULL,
  internal_notes text NULL,
  created_by bigint(20) unsigned NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY active (active),
  KEY scope (scope),
  KEY start_at (start_at),
  KEY end_at (end_at),
  KEY priority (priority)
) {$charset};
");

        dbDelta("
CREATE TABLE {$promotion_routes} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  promotion_id bigint(20) unsigned NOT NULL,
  route_id bigint(20) unsigned NOT NULL,
  created_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY promotion_route (promotion_id, route_id),
  KEY promotion_id (promotion_id),
  KEY route_id (route_id)
) {$charset};
");

        dbDelta("
CREATE TABLE {$blocks} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  vehicle_key varchar(20) NOT NULL DEFAULT 'all',
  start_datetime datetime NOT NULL,
  end_datetime datetime NOT NULL,
  reason varchar(255) NOT NULL DEFAULT '',
  notes text NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  created_by bigint(20) unsigned NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY active (active),
  KEY vehicle_key (vehicle_key),
  KEY start_datetime (start_datetime),
  KEY end_datetime (end_datetime)
) {$charset};
");

        dbDelta("
CREATE TABLE {$imports} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  source_file varchar(255) NOT NULL DEFAULT '',
  source_checksum char(64) NOT NULL DEFAULT '',
  raw_route_count int(11) NOT NULL DEFAULT 0,
  applied_route_count int(11) NOT NULL DEFAULT 0,
  applied_price_count int(11) NOT NULL DEFAULT 0,
  summary longtext NOT NULL,
  applied_by bigint(20) unsigned NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY source_checksum (source_checksum),
  KEY created_at (created_at)
) {$charset};
");

        update_option('luxride_booking_engine_schema_version', self::SCHEMA_VERSION);
        LuxRide_Booking_Settings::ensure_defaults();
    }
}
