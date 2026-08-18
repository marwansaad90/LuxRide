<?php

if (!defined('ABSPATH')) {
    exit;
}

final class LuxRide_Booking_Admin
{
    public static function register_hooks(): void
    {
        add_action('admin_menu', [self::class, 'admin_menu']);
        add_action('admin_post_luxride_booking_save_settings', [self::class, 'save_settings']);
        add_action('admin_post_luxride_booking_save_route', [self::class, 'save_route']);
        add_action('admin_post_luxride_booking_import', [self::class, 'handle_import']);
        add_action('admin_post_luxride_booking_export', [self::class, 'handle_export']);
        add_action('admin_post_luxride_booking_update_status', [self::class, 'update_booking_status']);
    }

    public static function admin_menu(): void
    {
        add_menu_page(
            __('LuxRide', 'luxride-booking-engine'),
            __('LuxRide', 'luxride-booking-engine'),
            'manage_options',
            'luxride-booking-engine',
            [self::class, 'render_routes_page'],
            'dashicons-location-alt',
            58
        );

        add_submenu_page(
            'luxride-booking-engine',
            __('Pricing & Routes', 'luxride-booking-engine'),
            __('Pricing & Routes', 'luxride-booking-engine'),
            'manage_options',
            'luxride-booking-engine',
            [self::class, 'render_routes_page']
        );

        add_submenu_page(
            'luxride-booking-engine',
            __('Bookings', 'luxride-booking-engine'),
            __('Bookings', 'luxride-booking-engine'),
            'manage_options',
            'luxride-bookings',
            [self::class, 'render_bookings_page']
        );
    }

    public static function render_routes_page(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'luxride-booking-engine'));
        }

        global $wpdb;
        $route_count = (int) $wpdb->get_var('SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('routes'));
        $enabled_count = (int) $wpdb->get_var('SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('routes') . ' WHERE enabled = 1');
        $price_count = (int) $wpdb->get_var('SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('route_prices'));
        $booking_count = (int) $wpdb->get_var('SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('bookings'));
        $settings = LuxRide_Booking_Settings::all();
        $edit_route_id = isset($_GET['route_id']) ? absint($_GET['route_id']) : 0;

        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('LuxRide Pricing & Routes', 'luxride-booking-engine'); ?></h1>
            <?php self::render_notice(); ?>

            <table class="widefat striped" style="max-width: 900px; margin: 16px 0;">
                <tbody>
                    <tr><th><?php echo esc_html__('Routes', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $route_count); ?></td></tr>
                    <tr><th><?php echo esc_html__('Enabled routes', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $enabled_count); ?></td></tr>
                    <tr><th><?php echo esc_html__('Vehicle price records', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $price_count); ?></td></tr>
                    <tr><th><?php echo esc_html__('Bookings', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $booking_count); ?></td></tr>
                    <tr><th><?php echo esc_html__('Schema version', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) get_option('luxride_booking_engine_schema_version', 'not installed')); ?></td></tr>
                </tbody>
            </table>

            <?php self::render_settings_form($settings); ?>
            <?php self::render_import_form(); ?>

            <?php if ($edit_route_id) : ?>
                <?php self::render_route_editor($edit_route_id); ?>
            <?php endif; ?>

            <?php self::render_routes_table(); ?>
            <?php self::render_import_history(); ?>
        </div>
        <?php
    }

    public static function save_settings(): void
    {
        self::guard_action('luxride_booking_save_settings');
        LuxRide_Booking_Settings::update(wp_unslash($_POST['settings'] ?? []));
        self::redirect(['luxride_notice' => 'settings_saved']);
    }

    public static function save_route(): void
    {
        self::guard_action('luxride_booking_save_route');

        global $wpdb;
        $route_id = isset($_POST['route_id']) ? absint($_POST['route_id']) : 0;
        if (!$route_id) {
            self::redirect(['luxride_notice' => 'route_missing']);
        }

        $routes_table = LuxRide_Booking_Schema::table('routes');
        $prices_table = LuxRide_Booking_Schema::table('route_prices');
        $now = current_time('mysql');
        $route_data = [
            'recommended_trip_type' => in_array(($_POST['recommended_trip_type'] ?? ''), ['one_way', 'round_trip'], true) ? sanitize_key((string) $_POST['recommended_trip_type']) : 'one_way',
            'round_trip_classification' => in_array(($_POST['round_trip_classification'] ?? ''), ['overday', 'overnight'], true) ? sanitize_key((string) $_POST['round_trip_classification']) : 'overday',
            'airport_fee_applicable' => !empty($_POST['airport_fee_applicable']) ? 1 : 0,
            'permit_required' => !empty($_POST['permit_required']) ? 1 : 0,
            'accommodation_applicable' => !empty($_POST['accommodation_applicable']) ? 1 : 0,
            'accommodation_fee_eur' => self::money($_POST['accommodation_fee_eur'] ?? 0),
            'enabled' => !empty($_POST['enabled']) ? 1 : 0,
            'updated_at' => $now,
        ];

        $wpdb->update($routes_table, $route_data, ['id' => $route_id]);

        foreach (['sedan', 'mpv', 'minivan'] as $vehicle_key) {
            $vehicle_prices = $_POST['prices'][$vehicle_key] ?? [];
            $price_data = [
                'route_id' => $route_id,
                'vehicle_key' => $vehicle_key,
                'one_way_price_eur' => self::money($vehicle_prices['one_way'] ?? 0),
                'round_trip_price_eur' => self::money($vehicle_prices['round_trip'] ?? 0),
                'updated_at' => $now,
            ];
            $price_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$prices_table} WHERE route_id = %d AND vehicle_key = %s", $route_id, $vehicle_key));
            if ($price_id) {
                $wpdb->update($prices_table, $price_data, ['id' => $price_id]);
            } else {
                $price_data['created_at'] = $now;
                $wpdb->insert($prices_table, $price_data);
            }
        }

        self::redirect(['route_id' => $route_id, 'luxride_notice' => 'route_saved']);
    }

    public static function handle_import(): void
    {
        self::guard_action('luxride_booking_import');

        if (empty($_FILES['pricing_payload']['tmp_name'])) {
            self::redirect(['luxride_notice' => 'import_missing']);
        }

        $json = file_get_contents((string) $_FILES['pricing_payload']['tmp_name']);
        $payload = json_decode((string) $json, true);
        if (!is_array($payload)) {
            self::redirect(['luxride_notice' => 'import_invalid_json']);
        }

        $mode = sanitize_key((string) ($_POST['import_mode'] ?? 'dry_run'));
        $result = 'apply' === $mode
            ? LuxRide_Booking_Importer::apply($payload, get_current_user_id())
            : LuxRide_Booking_Importer::dry_run($payload);

        $key = 'luxride_import_' . get_current_user_id() . '_' . wp_generate_password(8, false, false);
        set_transient($key, is_wp_error($result) ? [
            'error' => $result->get_error_message(),
            'details' => $result->get_error_data(),
        ] : $result, 15 * MINUTE_IN_SECONDS);

        self::redirect(['luxride_notice' => is_wp_error($result) ? 'import_failed' : ('apply' === $mode ? 'import_applied' : 'import_dry_run'), 'result_key' => $key]);
    }

    public static function handle_export(): void
    {
        self::guard_action('luxride_booking_export');

        nocache_headers();
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="luxride-pricing-routes-' . gmdate('Ymd-His') . '.csv"');
        echo LuxRide_Booking_Importer::export_csv(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    public static function update_booking_status(): void
    {
        self::guard_action('luxride_booking_update_status');

        $booking_id = isset($_POST['booking_id']) ? absint($_POST['booking_id']) : 0;
        $status = sanitize_key((string) ($_POST['status'] ?? ''));
        $updated = $booking_id && LuxRide_Booking_Bookings::update_status($booking_id, $status);

        wp_safe_redirect(add_query_arg([
            'page' => 'luxride-bookings',
            'booking_id' => $booking_id,
            'luxride_notice' => $updated ? 'booking_status_saved' : 'booking_status_failed',
        ], admin_url('admin.php')));
        exit;
    }

    private static function render_settings_form(array $settings): void
    {
        ?>
        <h2><?php echo esc_html__('Fees & Rules', 'luxride-booking-engine'); ?></h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="max-width: 900px;">
            <input type="hidden" name="action" value="luxride_booking_save_settings">
            <?php wp_nonce_field('luxride_booking_save_settings'); ?>
            <table class="form-table" role="presentation">
                <?php foreach (self::setting_fields() as $key => $label) : ?>
                    <tr>
                        <th scope="row"><label for="<?php echo esc_attr($key); ?>"><?php echo esc_html($label); ?></label></th>
                        <td><input class="regular-text" id="<?php echo esc_attr($key); ?>" name="settings[<?php echo esc_attr($key); ?>]" type="number" min="0" step="0.01" value="<?php echo esc_attr((string) $settings[$key]); ?>"></td>
                    </tr>
                <?php endforeach; ?>
                <tr>
                    <th scope="row"><label for="minimum_lead_hours"><?php echo esc_html__('Minimum lead hours', 'luxride-booking-engine'); ?></label></th>
                    <td><input class="small-text" id="minimum_lead_hours" name="settings[minimum_lead_hours]" type="number" min="0" step="1" value="<?php echo esc_attr((string) $settings['minimum_lead_hours']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><?php echo esc_html__('Taxes included', 'luxride-booking-engine'); ?></th>
                    <td><label><input name="settings[taxes_included]" type="checkbox" value="1" <?php checked(!empty($settings['taxes_included'])); ?>> <?php echo esc_html__('Included in displayed prices', 'luxride-booking-engine'); ?></label></td>
                </tr>
            </table>
            <?php submit_button(__('Save settings', 'luxride-booking-engine')); ?>
        </form>
        <?php
    }

    private static function render_import_form(): void
    {
        ?>
        <h2><?php echo esc_html__('Workbook Import', 'luxride-booking-engine'); ?></h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" enctype="multipart/form-data" style="max-width: 900px;">
            <input type="hidden" name="action" value="luxride_booking_import">
            <?php wp_nonce_field('luxride_booking_import'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="pricing_payload"><?php echo esc_html__('Importer JSON payload', 'luxride-booking-engine'); ?></label></th>
                    <td><input id="pricing_payload" name="pricing_payload" type="file" accept="application/json,.json" required></td>
                </tr>
                <tr>
                    <th scope="row"><?php echo esc_html__('Action', 'luxride-booking-engine'); ?></th>
                    <td>
                        <button class="button" name="import_mode" value="dry_run"><?php echo esc_html__('Dry run / validate', 'luxride-booking-engine'); ?></button>
                        <button class="button button-primary" name="import_mode" value="apply"><?php echo esc_html__('Apply clean import', 'luxride-booking-engine'); ?></button>
                    </td>
                </tr>
            </table>
        </form>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin: 8px 0 24px;">
            <input type="hidden" name="action" value="luxride_booking_export">
            <?php wp_nonce_field('luxride_booking_export'); ?>
            <?php submit_button(__('Export pricing backup', 'luxride-booking-engine'), 'secondary', 'submit', false); ?>
        </form>
        <?php
    }

    private static function render_route_editor(int $route_id): void
    {
        global $wpdb;
        $route = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . LuxRide_Booking_Schema::table('routes') . ' WHERE id = %d', $route_id), ARRAY_A);
        if (!$route) {
            echo '<div class="notice notice-error"><p>' . esc_html__('Route not found.', 'luxride-booking-engine') . '</p></div>';
            return;
        }

        $prices = self::route_prices($route_id);
        ?>
        <h2><?php echo esc_html__('Edit Route', 'luxride-booking-engine'); ?></h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="max-width: 900px;">
            <input type="hidden" name="action" value="luxride_booking_save_route">
            <input type="hidden" name="route_id" value="<?php echo esc_attr((string) $route_id); ?>">
            <?php wp_nonce_field('luxride_booking_save_route'); ?>
            <table class="form-table" role="presentation">
                <tr><th scope="row"><?php echo esc_html__('Route', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($route['pickup_label'] . ' -> ' . $route['destination_label']); ?><br><code><?php echo esc_html($route['route_code']); ?></code></td></tr>
                <tr>
                    <th scope="row"><?php echo esc_html__('Recommended trip', 'luxride-booking-engine'); ?></th>
                    <td>
                        <select name="recommended_trip_type">
                            <option value="one_way" <?php selected($route['recommended_trip_type'], 'one_way'); ?>><?php echo esc_html__('One Way', 'luxride-booking-engine'); ?></option>
                            <option value="round_trip" <?php selected($route['recommended_trip_type'], 'round_trip'); ?>><?php echo esc_html__('Round Trip', 'luxride-booking-engine'); ?></option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php echo esc_html__('Round trip class', 'luxride-booking-engine'); ?></th>
                    <td>
                        <select name="round_trip_classification">
                            <option value="overday" <?php selected($route['round_trip_classification'], 'overday'); ?>><?php echo esc_html__('Overday', 'luxride-booking-engine'); ?></option>
                            <option value="overnight" <?php selected($route['round_trip_classification'], 'overnight'); ?>><?php echo esc_html__('Overnight', 'luxride-booking-engine'); ?></option>
                        </select>
                    </td>
                </tr>
                <?php foreach (['airport_fee_applicable' => __('Airport surcharge', 'luxride-booking-engine'), 'permit_required' => __('Permit fee', 'luxride-booking-engine'), 'accommodation_applicable' => __('Driver accommodation', 'luxride-booking-engine'), 'enabled' => __('Enabled', 'luxride-booking-engine')] as $key => $label) : ?>
                    <tr>
                        <th scope="row"><?php echo esc_html($label); ?></th>
                        <td><label><input name="<?php echo esc_attr($key); ?>" type="checkbox" value="1" <?php checked(!empty($route[$key])); ?>> <?php echo esc_html__('Yes', 'luxride-booking-engine'); ?></label></td>
                    </tr>
                <?php endforeach; ?>
                <tr>
                    <th scope="row"><label for="accommodation_fee_eur"><?php echo esc_html__('Route accommodation override', 'luxride-booking-engine'); ?></label></th>
                    <td><input id="accommodation_fee_eur" name="accommodation_fee_eur" type="number" min="0" step="0.01" value="<?php echo esc_attr((string) $route['accommodation_fee_eur']); ?>"></td>
                </tr>
            </table>
            <h3><?php echo esc_html__('Prices', 'luxride-booking-engine'); ?></h3>
            <table class="widefat striped">
                <thead><tr><th><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('One Way EUR', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Round Trip EUR', 'luxride-booking-engine'); ?></th></tr></thead>
                <tbody>
                    <?php foreach (['sedan' => 'Sedan', 'mpv' => 'MPV', 'minivan' => 'Mini Van'] as $vehicle_key => $label) : ?>
                        <tr>
                            <td><?php echo esc_html($label); ?></td>
                            <td><input name="prices[<?php echo esc_attr($vehicle_key); ?>][one_way]" type="number" min="0" step="0.01" value="<?php echo esc_attr((string) ($prices[$vehicle_key]['one_way'] ?? 0)); ?>"></td>
                            <td><input name="prices[<?php echo esc_attr($vehicle_key); ?>][round_trip]" type="number" min="0" step="0.01" value="<?php echo esc_attr((string) ($prices[$vehicle_key]['round_trip'] ?? 0)); ?>"></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php submit_button(__('Save route', 'luxride-booking-engine')); ?>
        </form>
        <?php
    }

    private static function render_routes_table(): void
    {
        global $wpdb;
        $search = sanitize_text_field((string) ($_GET['s'] ?? ''));
        $pickup = sanitize_text_field((string) ($_GET['pickup'] ?? ''));
        $destination = sanitize_text_field((string) ($_GET['destination'] ?? ''));
        $enabled = sanitize_key((string) ($_GET['enabled'] ?? ''));
        $where = ['1=1'];
        $args = [];

        if ('' !== $search) {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $where[] = '(r.pickup_label LIKE %s OR r.destination_label LIKE %s OR r.pickup_label_ar LIKE %s OR r.destination_label_ar LIKE %s OR r.route_code LIKE %s)';
            array_push($args, $like, $like, $like, $like, $like);
        }
        if ('' !== $pickup) {
            $where[] = 'r.pickup_key = %s';
            $args[] = sanitize_title($pickup);
        }
        if ('' !== $destination) {
            $where[] = 'r.destination_key = %s';
            $args[] = sanitize_title($destination);
        }
        if (in_array($enabled, ['0', '1'], true)) {
            $where[] = 'r.enabled = %d';
            $args[] = (int) $enabled;
        }

        $sql = 'SELECT r.*, COUNT(p.id) AS price_count
                FROM ' . LuxRide_Booking_Schema::table('routes') . ' r
                LEFT JOIN ' . LuxRide_Booking_Schema::table('route_prices') . ' p ON p.route_id = r.id
                WHERE ' . implode(' AND ', $where) . '
                GROUP BY r.id
                ORDER BY r.display_order ASC, r.pickup_label ASC, r.destination_label ASC
                LIMIT 500';
        $rows = $args ? $wpdb->get_results($wpdb->prepare($sql, ...$args), ARRAY_A) : $wpdb->get_results($sql, ARRAY_A);
        ?>
        <h2><?php echo esc_html__('Routes', 'luxride-booking-engine'); ?></h2>
        <form method="get" style="margin: 12px 0;">
            <input type="hidden" name="page" value="luxride-booking-engine">
            <input type="search" name="s" value="<?php echo esc_attr($search); ?>" placeholder="<?php echo esc_attr__('Search routes', 'luxride-booking-engine'); ?>">
            <input type="text" name="pickup" value="<?php echo esc_attr($pickup); ?>" placeholder="<?php echo esc_attr__('Pickup filter', 'luxride-booking-engine'); ?>">
            <input type="text" name="destination" value="<?php echo esc_attr($destination); ?>" placeholder="<?php echo esc_attr__('Destination filter', 'luxride-booking-engine'); ?>">
            <select name="enabled">
                <option value=""><?php echo esc_html__('Any status', 'luxride-booking-engine'); ?></option>
                <option value="1" <?php selected($enabled, '1'); ?>><?php echo esc_html__('Enabled', 'luxride-booking-engine'); ?></option>
                <option value="0" <?php selected($enabled, '0'); ?>><?php echo esc_html__('Disabled', 'luxride-booking-engine'); ?></option>
            </select>
            <?php submit_button(__('Filter', 'luxride-booking-engine'), 'secondary', '', false); ?>
        </form>
        <table class="widefat striped">
            <thead><tr><th><?php echo esc_html__('Route', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Arabic', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Recommended', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Class', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Fees', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Prices', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Status', 'luxride-booking-engine'); ?></th><th></th></tr></thead>
            <tbody>
                <?php foreach ($rows as $row) : ?>
                    <tr>
                        <td><?php echo esc_html($row['pickup_label'] . ' -> ' . $row['destination_label']); ?><br><code><?php echo esc_html($row['route_code']); ?></code></td>
                        <td dir="rtl"><?php echo esc_html($row['pickup_label_ar'] . ' ← ' . $row['destination_label_ar']); ?></td>
                        <td><?php echo esc_html($row['recommended_trip_type']); ?></td>
                        <td><?php echo esc_html($row['round_trip_classification']); ?></td>
                        <td><?php echo esc_html(self::fee_summary($row)); ?></td>
                        <td><?php echo esc_html((string) $row['price_count']); ?></td>
                        <td><?php echo !empty($row['enabled']) ? esc_html__('Enabled', 'luxride-booking-engine') : esc_html__('Disabled', 'luxride-booking-engine'); ?></td>
                        <td><a class="button button-small" href="<?php echo esc_url(add_query_arg(['page' => 'luxride-booking-engine', 'route_id' => (int) $row['id']], admin_url('admin.php'))); ?>"><?php echo esc_html__('Edit', 'luxride-booking-engine'); ?></a></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }

    public static function render_bookings_page(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'luxride-booking-engine'));
        }

        $booking_id = isset($_GET['booking_id']) ? absint($_GET['booking_id']) : 0;
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('LuxRide Bookings', 'luxride-booking-engine'); ?></h1>
            <?php self::render_notice(); ?>
            <?php $booking_id ? self::render_booking_detail($booking_id) : self::render_bookings_table(); ?>
        </div>
        <?php
    }

    private static function render_bookings_table(): void
    {
        global $wpdb;

        $search = sanitize_text_field((string) ($_GET['s'] ?? ''));
        $status = sanitize_key((string) ($_GET['status'] ?? ''));
        $where = ['1=1'];
        $args = [];

        if ('' !== $search) {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $where[] = '(booking_reference LIKE %s OR customer_snapshot LIKE %s OR route_snapshot LIKE %s)';
            array_push($args, $like, $like, $like);
        }
        if (in_array($status, LuxRide_Booking_Bookings::STATUSES, true)) {
            $where[] = 'status = %s';
            $args[] = $status;
        }

        $sql = 'SELECT * FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC LIMIT 200';
        $rows = $args ? $wpdb->get_results($wpdb->prepare($sql, ...$args), ARRAY_A) : $wpdb->get_results($sql, ARRAY_A);
        ?>
        <form method="get" style="margin: 12px 0;">
            <input type="hidden" name="page" value="luxride-bookings">
            <input type="search" name="s" value="<?php echo esc_attr($search); ?>" placeholder="<?php echo esc_attr__('Reference, customer, route', 'luxride-booking-engine'); ?>">
            <select name="status">
                <option value=""><?php echo esc_html__('Any status', 'luxride-booking-engine'); ?></option>
                <?php foreach (LuxRide_Booking_Bookings::STATUSES as $option) : ?>
                    <option value="<?php echo esc_attr($option); ?>" <?php selected($status, $option); ?>><?php echo esc_html(ucfirst($option)); ?></option>
                <?php endforeach; ?>
            </select>
            <?php submit_button(__('Filter', 'luxride-booking-engine'), 'secondary', '', false); ?>
        </form>
        <table class="widefat striped">
            <thead><tr><th><?php echo esc_html__('Reference', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Customer', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Route', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Trip', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Total', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Status', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Created', 'luxride-booking-engine'); ?></th><th></th></tr></thead>
            <tbody>
                <?php foreach ($rows as $row) : $route = self::decoded($row['route_snapshot']); $customer = self::decoded($row['customer_snapshot']); ?>
                    <tr>
                        <td><strong><?php echo esc_html($row['booking_reference']); ?></strong></td>
                        <td><?php echo esc_html((string) ($customer['full_name'] ?? '')); ?><br><code><?php echo esc_html((string) ($customer['phone'] ?? '')); ?></code></td>
                        <td><?php echo esc_html(self::route_label($route)); ?></td>
                        <td><?php echo esc_html($row['vehicle_key']); ?></td>
                        <td><?php echo esc_html($row['trip_type'] . ' / ' . $row['system_classification']); ?><br><?php echo esc_html($row['outbound_datetime']); ?></td>
                        <td><?php echo esc_html(number_format((float) $row['final_total_eur'], 2) . ' ' . $row['currency']); ?></td>
                        <td><?php echo esc_html($row['status']); ?></td>
                        <td><?php echo esc_html($row['created_at']); ?></td>
                        <td><a class="button button-small" href="<?php echo esc_url(add_query_arg(['page' => 'luxride-bookings', 'booking_id' => (int) $row['id']], admin_url('admin.php'))); ?>"><?php echo esc_html__('View', 'luxride-booking-engine'); ?></a></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }

    private static function render_booking_detail(int $booking_id): void
    {
        $booking = LuxRide_Booking_Bookings::get($booking_id);
        if (!$booking) {
            echo '<div class="notice notice-error"><p>' . esc_html__('Booking not found.', 'luxride-booking-engine') . '</p></div>';
            return;
        }

        $route = self::decoded($booking['route_snapshot']);
        $customer = self::decoded($booking['customer_snapshot']);
        $details = self::decoded($booking['conditional_details']);
        $price = self::decoded($booking['price_snapshot']);
        ?>
        <p><a class="button" href="<?php echo esc_url(admin_url('admin.php?page=luxride-bookings')); ?>"><?php echo esc_html__('Back to bookings', 'luxride-booking-engine'); ?></a></p>
        <h2><?php echo esc_html($booking['booking_reference']); ?></h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin: 12px 0 20px;">
            <input type="hidden" name="action" value="luxride_booking_update_status">
            <input type="hidden" name="booking_id" value="<?php echo esc_attr((string) $booking_id); ?>">
            <?php wp_nonce_field('luxride_booking_update_status'); ?>
            <select name="status">
                <?php foreach (LuxRide_Booking_Bookings::STATUSES as $status) : ?>
                    <option value="<?php echo esc_attr($status); ?>" <?php selected($booking['status'], $status); ?>><?php echo esc_html(ucfirst($status)); ?></option>
                <?php endforeach; ?>
            </select>
            <?php submit_button(__('Update status', 'luxride-booking-engine'), 'primary', 'submit', false); ?>
        </form>

        <table class="widefat striped" style="max-width: 1000px;">
            <tbody>
                <tr><th><?php echo esc_html__('Route', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::route_label($route)); ?></td></tr>
                <tr><th><?php echo esc_html__('Trip', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['trip_type'] . ' / ' . $booking['system_classification']); ?></td></tr>
                <tr><th><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['vehicle_key']); ?></td></tr>
                <tr><th><?php echo esc_html__('Passengers', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $booking['passengers']); ?></td></tr>
                <tr><th><?php echo esc_html__('Bags', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $booking['bags']); ?></td></tr>
                <tr><th><?php echo esc_html__('Outbound', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['outbound_datetime']); ?></td></tr>
                <tr><th><?php echo esc_html__('Return', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['return_datetime'] ?: '-'); ?></td></tr>
                <tr><th><?php echo esc_html__('Customer', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) ($customer['full_name'] ?? '')); ?><br><?php echo esc_html((string) ($customer['phone'] ?? '')); ?><br><?php echo esc_html((string) ($customer['email'] ?? '')); ?></td></tr>
                <tr><th><?php echo esc_html__('Conditional details', 'luxride-booking-engine'); ?></th><td><pre style="white-space: pre-wrap;"><?php echo esc_html(wp_json_encode($details, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)); ?></pre></td></tr>
                <tr><th><?php echo esc_html__('Price snapshot', 'luxride-booking-engine'); ?></th><td><pre style="white-space: pre-wrap;"><?php echo esc_html(wp_json_encode($price['quote']['pricing'] ?? $price, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)); ?></pre></td></tr>
                <tr><th><?php echo esc_html__('Final total', 'luxride-booking-engine'); ?></th><td><strong><?php echo esc_html(number_format((float) $booking['final_total_eur'], 2) . ' ' . $booking['currency']); ?></strong></td></tr>
            </tbody>
        </table>
        <?php
    }

    private static function render_import_history(): void
    {
        global $wpdb;
        $rows = $wpdb->get_results('SELECT * FROM ' . LuxRide_Booking_Schema::table('pricing_imports') . ' ORDER BY created_at DESC LIMIT 10', ARRAY_A);
        ?>
        <h2><?php echo esc_html__('Import History', 'luxride-booking-engine'); ?></h2>
        <table class="widefat striped">
            <thead><tr><th><?php echo esc_html__('Date', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Source', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Checksum', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Routes', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Prices', 'luxride-booking-engine'); ?></th></tr></thead>
            <tbody>
                <?php foreach ($rows as $row) : ?>
                    <tr>
                        <td><?php echo esc_html($row['created_at']); ?></td>
                        <td><?php echo esc_html($row['source_file']); ?></td>
                        <td><code><?php echo esc_html(substr((string) $row['source_checksum'], 0, 12)); ?></code></td>
                        <td><?php echo esc_html((string) $row['applied_route_count']); ?></td>
                        <td><?php echo esc_html((string) $row['applied_price_count']); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }

    private static function render_notice(): void
    {
        $notice = sanitize_key((string) ($_GET['luxride_notice'] ?? ''));
        $messages = [
            'settings_saved' => __('Settings saved.', 'luxride-booking-engine'),
            'route_saved' => __('Route saved.', 'luxride-booking-engine'),
            'route_missing' => __('Route was not selected.', 'luxride-booking-engine'),
            'import_missing' => __('Choose an importer JSON payload first.', 'luxride-booking-engine'),
            'import_invalid_json' => __('Importer payload is not valid JSON.', 'luxride-booking-engine'),
            'import_failed' => __('Import failed validation.', 'luxride-booking-engine'),
            'import_dry_run' => __('Dry run completed.', 'luxride-booking-engine'),
            'import_applied' => __('Clean import applied.', 'luxride-booking-engine'),
            'booking_status_saved' => __('Booking status updated.', 'luxride-booking-engine'),
            'booking_status_failed' => __('Booking status could not be updated.', 'luxride-booking-engine'),
        ];

        if ($notice && isset($messages[$notice])) {
            $class = in_array($notice, ['import_failed', 'import_missing', 'import_invalid_json', 'route_missing', 'booking_status_failed'], true) ? 'notice notice-error' : 'notice notice-success';
            echo '<div class="' . esc_attr($class) . '"><p>' . esc_html($messages[$notice]) . '</p>';
            $result_key = sanitize_key((string) ($_GET['result_key'] ?? ''));
            if ($result_key) {
                $result = get_transient($result_key);
                if ($result) {
                    echo '<pre style="white-space: pre-wrap; max-height: 360px; overflow: auto;">' . esc_html(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) . '</pre>';
                }
            }
            echo '</div>';
        }
    }

    private static function setting_fields(): array
    {
        return [
            'airport_surcharge_eur' => __('Airport surcharge EUR', 'luxride-booking-engine'),
            'permit_fee_sedan_eur' => __('Sedan permit fee EUR', 'luxride-booking-engine'),
            'permit_fee_mpv_eur' => __('MPV permit fee EUR', 'luxride-booking-engine'),
            'permit_fee_minivan_eur' => __('Mini Van permit fee EUR', 'luxride-booking-engine'),
            'driver_accommodation_eur' => __('Driver accommodation EUR per night', 'luxride-booking-engine'),
        ];
    }

    private static function route_prices(int $route_id): array
    {
        global $wpdb;
        $rows = $wpdb->get_results($wpdb->prepare('SELECT * FROM ' . LuxRide_Booking_Schema::table('route_prices') . ' WHERE route_id = %d', $route_id), ARRAY_A);
        $prices = [];
        foreach ($rows as $row) {
            $prices[$row['vehicle_key']] = [
                'one_way' => (float) $row['one_way_price_eur'],
                'round_trip' => (float) $row['round_trip_price_eur'],
            ];
        }
        return $prices;
    }

    private static function fee_summary(array $row): string
    {
        $fees = [];
        if (!empty($row['airport_fee_applicable'])) {
            $fees[] = 'airport';
        }
        if (!empty($row['permit_required'])) {
            $fees[] = 'permit';
        }
        if (!empty($row['accommodation_applicable'])) {
            $fees[] = 'accommodation';
        }
        return $fees ? implode(', ', $fees) : 'none';
    }

    private static function decoded(string $json): array
    {
        $decoded = json_decode($json, true);
        return is_array($decoded) ? $decoded : [];
    }

    private static function route_label(array $route): string
    {
        $pickup = $route['pickup']['label'] ?? '';
        $destination = $route['destination']['label'] ?? '';
        return trim((string) $pickup . ' -> ' . (string) $destination, ' ->');
    }

    private static function guard_action(string $nonce): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to perform this action.', 'luxride-booking-engine'));
        }
        check_admin_referer($nonce);
    }

    private static function redirect(array $args): void
    {
        wp_safe_redirect(add_query_arg($args, admin_url('admin.php?page=luxride-booking-engine')));
        exit;
    }

    private static function money($value): float
    {
        return is_numeric($value) ? max(0.0, round((float) $value, 2)) : 0.0;
    }
}
