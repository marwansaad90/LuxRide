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
        add_action('admin_post_luxride_booking_export_bookings', [self::class, 'export_bookings']);
        add_action('admin_post_luxride_booking_export_bookings_xlsx', [self::class, 'export_bookings_xlsx']);
        add_action('admin_post_luxride_booking_update_status', [self::class, 'update_booking_status']);
        add_action('admin_post_luxride_booking_update_operations', [self::class, 'update_booking_operations']);
        add_action('admin_post_luxride_booking_delete', [self::class, 'delete_booking']);
        add_action('admin_post_luxride_booking_save_block', [self::class, 'save_block']);
        add_action('admin_post_luxride_booking_delete_block', [self::class, 'delete_block']);
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

        add_submenu_page(
            'luxride-booking-engine',
            __('Availability', 'luxride-booking-engine'),
            __('Availability', 'luxride-booking-engine'),
            'manage_options',
            'luxride-availability',
            [self::class, 'render_availability_page']
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

    public static function update_booking_operations(): void
    {
        self::guard_action('luxride_booking_update_operations');

        $booking_id = isset($_POST['booking_id']) ? absint($_POST['booking_id']) : 0;
        $updated = $booking_id && LuxRide_Booking_Bookings::update_operations($booking_id, wp_unslash($_POST), get_current_user_id());

        wp_safe_redirect(add_query_arg([
            'page' => 'luxride-bookings',
            'booking_id' => $booking_id,
            'luxride_notice' => $updated ? 'booking_operations_saved' : 'booking_operations_failed',
        ], admin_url('admin.php')));
        exit;
    }

    public static function delete_booking(): void
    {
        self::guard_action('luxride_booking_delete');

        $booking_id = isset($_POST['booking_id']) ? absint($_POST['booking_id']) : 0;
        $deleted = $booking_id && LuxRide_Booking_Bookings::delete($booking_id);

        wp_safe_redirect(add_query_arg([
            'page' => 'luxride-bookings',
            'luxride_notice' => $deleted ? 'booking_deleted' : 'booking_delete_failed',
        ], admin_url('admin.php')));
        exit;
    }

    public static function export_bookings(): void
    {
        self::guard_action('luxride_booking_export_bookings');
        $rows = self::booking_export_rows(wp_unslash($_POST));

        nocache_headers();
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="luxride-bookings-' . gmdate('Ymd-His') . '.csv"');
        echo self::bookings_export_csv($rows); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    public static function export_bookings_xlsx(): void
    {
        self::guard_action('luxride_booking_export_bookings_xlsx');
        $rows = self::booking_export_rows(wp_unslash($_POST));
        $xlsx = self::bookings_export_xlsx($rows);

        if (is_wp_error($xlsx)) {
            wp_safe_redirect(add_query_arg([
                'page' => 'luxride-bookings',
                'luxride_notice' => 'booking_xlsx_failed',
            ], admin_url('admin.php')));
            exit;
        }

        nocache_headers();
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="luxride-bookings-' . gmdate('Ymd-His') . '.xlsx"');
        header('Content-Length: ' . strlen($xlsx));
        echo $xlsx; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    public static function save_block(): void
    {
        self::guard_action('luxride_booking_save_block');

        $saved = LuxRide_Booking_Bookings::create_block(wp_unslash($_POST), get_current_user_id());
        wp_safe_redirect(add_query_arg([
            'page' => 'luxride-availability',
            'luxride_notice' => $saved ? 'block_saved' : 'block_failed',
        ], admin_url('admin.php')));
        exit;
    }

    public static function delete_block(): void
    {
        self::guard_action('luxride_booking_delete_block');

        $block_id = isset($_POST['block_id']) ? absint($_POST['block_id']) : 0;
        $deleted = $block_id && LuxRide_Booking_Bookings::delete_block($block_id);

        wp_safe_redirect(add_query_arg([
            'page' => 'luxride-availability',
            'luxride_notice' => $deleted ? 'block_deleted' : 'block_delete_failed',
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
                    <th scope="row"><label for="admin_notification_email"><?php echo esc_html__('Admin notification email', 'luxride-booking-engine'); ?></label></th>
                    <td><input class="regular-text" id="admin_notification_email" name="settings[admin_notification_email]" type="email" value="<?php echo esc_attr((string) $settings['admin_notification_email']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="availability_window_hours"><?php echo esc_html__('One-way booking hold hours', 'luxride-booking-engine'); ?></label></th>
                    <td><input class="small-text" id="availability_window_hours" name="settings[availability_window_hours]" type="number" min="1" step="1" value="<?php echo esc_attr((string) $settings['availability_window_hours']); ?>"></td>
                </tr>
                <?php foreach (['fleet_sedan_count' => __('Sedan fleet count', 'luxride-booking-engine'), 'fleet_mpv_count' => __('MPV fleet count', 'luxride-booking-engine'), 'fleet_minivan_count' => __('Mini Van fleet count', 'luxride-booking-engine')] as $key => $label) : ?>
                    <tr>
                        <th scope="row"><label for="<?php echo esc_attr($key); ?>"><?php echo esc_html($label); ?></label></th>
                        <td><input class="small-text" id="<?php echo esc_attr($key); ?>" name="settings[<?php echo esc_attr($key); ?>]" type="number" min="1" step="1" value="<?php echo esc_attr((string) $settings[$key]); ?>"></td>
                    </tr>
                <?php endforeach; ?>
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
            <?php $booking_id ? self::render_booking_detail($booking_id) : self::render_bookings_overview(); ?>
        </div>
        <?php
    }

    private static function render_bookings_overview(): void
    {
        self::render_booking_analytics();
        self::render_bookings_table();
    }

    private static function render_booking_analytics(): void
    {
        global $wpdb;

        $table = LuxRide_Booking_Schema::table('bookings');
        $today = current_time('Y-m-d');
        $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
        $upcoming = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE status IN ('new', 'pending', 'confirmed', 'assigned') AND outbound_datetime >= %s", current_time('mysql')));
        $today_count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE outbound_datetime BETWEEN %s AND %s", $today . ' 00:00:00', $today . ' 23:59:59'));
        $revenue = (float) $wpdb->get_var("SELECT COALESCE(SUM(final_total_eur), 0) FROM {$table} WHERE status <> 'cancelled'");
        $new_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table} WHERE status = 'new'");
        $confirmed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table} WHERE status = 'confirmed'");
        ?>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; max-width: 1000px; margin: 16px 0;">
            <?php foreach ([
                __('Total bookings', 'luxride-booking-engine') => number_format($total),
                __('Upcoming', 'luxride-booking-engine') => number_format($upcoming),
                __('Today', 'luxride-booking-engine') => number_format($today_count),
                __('Open new', 'luxride-booking-engine') => number_format($new_count),
                __('Confirmed', 'luxride-booking-engine') => number_format($confirmed_count),
                __('Non-cancelled EUR', 'luxride-booking-engine') => number_format($revenue, 2),
            ] as $label => $value) : ?>
                <div style="background: #fff; border: 1px solid #ccd0d4; padding: 14px 16px;">
                    <div style="color: #646970;"><?php echo esc_html($label); ?></div>
                    <strong style="display: block; font-size: 24px; margin-top: 6px;"><?php echo esc_html((string) $value); ?></strong>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
    }

    private static function render_bookings_table(): void
    {
        global $wpdb;

        $search = sanitize_text_field((string) ($_GET['s'] ?? ''));
        $status = sanitize_key((string) ($_GET['status'] ?? ''));
        $payment_status = sanitize_key((string) ($_GET['payment_status'] ?? ''));
        $date_from = sanitize_text_field((string) ($_GET['date_from'] ?? ''));
        $date_to = sanitize_text_field((string) ($_GET['date_to'] ?? ''));
        $orderby = sanitize_key((string) ($_GET['orderby'] ?? 'outbound_datetime'));
        $order = 'asc' === strtolower((string) ($_GET['order'] ?? 'desc')) ? 'ASC' : 'DESC';
        $paged = max(1, absint($_GET['paged'] ?? 1));
        $per_page = 25;
        $offset = ($paged - 1) * $per_page;
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
        if (in_array($payment_status, self::payment_statuses(), true)) {
            $where[] = 'payment_status = %s';
            $args[] = $payment_status;
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_from)) {
            $where[] = 'outbound_datetime >= %s';
            $args[] = $date_from . ' 00:00:00';
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_to)) {
            $where[] = 'outbound_datetime <= %s';
            $args[] = $date_to . ' 23:59:59';
        }

        $where_sql = implode(' AND ', $where);
        $count_sql = 'SELECT COUNT(*) FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE ' . $where_sql;
        $total = (int) ($args ? $wpdb->get_var($wpdb->prepare($count_sql, ...$args)) : $wpdb->get_var($count_sql));
        $sortable = [
            'created_at' => 'created_at',
            'outbound_datetime' => 'outbound_datetime',
            'final_total_eur' => 'final_total_eur',
            'status' => 'status',
            'payment_status' => 'payment_status',
        ];
        $order_column = $sortable[$orderby] ?? 'outbound_datetime';
        $sql = 'SELECT * FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE ' . $where_sql . ' ORDER BY ' . $order_column . ' ' . $order . ', created_at DESC LIMIT %d OFFSET %d';
        $query_args = array_merge($args, [$per_page, $offset]);
        $rows = $wpdb->get_results($wpdb->prepare($sql, ...$query_args), ARRAY_A);
        $total_pages = max(1, (int) ceil($total / $per_page));
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
            <select name="payment_status">
                <option value=""><?php echo esc_html__('Any payment', 'luxride-booking-engine'); ?></option>
                <?php foreach (self::payment_statuses() as $option) : ?>
                    <option value="<?php echo esc_attr($option); ?>" <?php selected($payment_status, $option); ?>><?php echo esc_html(self::labelize($option)); ?></option>
                <?php endforeach; ?>
            </select>
            <input type="date" name="date_from" value="<?php echo esc_attr($date_from); ?>">
            <input type="date" name="date_to" value="<?php echo esc_attr($date_to); ?>">
            <select name="orderby">
                <option value="outbound_datetime" <?php selected($orderby, 'outbound_datetime'); ?>><?php echo esc_html__('Pickup date', 'luxride-booking-engine'); ?></option>
                <option value="created_at" <?php selected($orderby, 'created_at'); ?>><?php echo esc_html__('Created date', 'luxride-booking-engine'); ?></option>
                <option value="final_total_eur" <?php selected($orderby, 'final_total_eur'); ?>><?php echo esc_html__('Total', 'luxride-booking-engine'); ?></option>
                <option value="status" <?php selected($orderby, 'status'); ?>><?php echo esc_html__('Status', 'luxride-booking-engine'); ?></option>
                <option value="payment_status" <?php selected($orderby, 'payment_status'); ?>><?php echo esc_html__('Payment', 'luxride-booking-engine'); ?></option>
            </select>
            <select name="order">
                <option value="desc" <?php selected($order, 'DESC'); ?>><?php echo esc_html__('Descending', 'luxride-booking-engine'); ?></option>
                <option value="asc" <?php selected($order, 'ASC'); ?>><?php echo esc_html__('Ascending', 'luxride-booking-engine'); ?></option>
            </select>
            <?php submit_button(__('Filter', 'luxride-booking-engine'), 'secondary', '', false); ?>
        </form>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display: inline-block; margin: 8px 8px 16px 0;">
            <input type="hidden" name="action" value="luxride_booking_export_bookings_xlsx">
            <?php wp_nonce_field('luxride_booking_export_bookings_xlsx'); ?>
            <?php self::render_booking_filter_hidden_fields(compact('search', 'status', 'payment_status', 'date_from', 'date_to', 'orderby', 'order')); ?>
            <?php submit_button(__('Export Excel (.xlsx)', 'luxride-booking-engine'), 'primary', 'submit', false); ?>
        </form>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display: inline-block; margin: 8px 0 16px;">
            <input type="hidden" name="action" value="luxride_booking_export_bookings">
            <?php wp_nonce_field('luxride_booking_export_bookings'); ?>
            <?php self::render_booking_filter_hidden_fields(compact('search', 'status', 'payment_status', 'date_from', 'date_to', 'orderby', 'order')); ?>
            <?php submit_button(__('Export bookings CSV', 'luxride-booking-engine'), 'secondary', 'submit', false); ?>
        </form>
        <table class="widefat striped">
            <thead><tr><th><?php echo esc_html__('Reference', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Customer', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Route', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Pickup', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Total', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Status', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Payment', 'luxride-booking-engine'); ?></th><th><?php echo esc_html__('Driver', 'luxride-booking-engine'); ?></th><th></th></tr></thead>
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
                        <td><?php echo esc_html(self::labelize((string) ($row['payment_status'] ?? 'unpaid'))); ?></td>
                        <td><?php echo esc_html((string) ($row['driver_name'] ?? '')); ?><br><code><?php echo esc_html((string) ($row['vehicle_plate'] ?? '')); ?></code></td>
                        <td><a class="button button-small" href="<?php echo esc_url(add_query_arg(['page' => 'luxride-bookings', 'booking_id' => (int) $row['id']], admin_url('admin.php'))); ?>"><?php echo esc_html__('View', 'luxride-booking-engine'); ?></a></td>
                    </tr>
                <?php endforeach; ?>
                <?php if (!$rows) : ?>
                    <tr><td colspan="10"><?php echo esc_html__('No bookings found.', 'luxride-booking-engine'); ?></td></tr>
                <?php endif; ?>
            </tbody>
        </table>
        <p>
            <?php echo esc_html(sprintf(__('Showing %1$d of %2$d bookings. Page %3$d of %4$d.', 'luxride-booking-engine'), count($rows), $total, $paged, $total_pages)); ?>
            <?php if ($paged > 1) : ?>
                <a class="button button-small" href="<?php echo esc_url(add_query_arg(['paged' => $paged - 1])); ?>"><?php echo esc_html__('Previous', 'luxride-booking-engine'); ?></a>
            <?php endif; ?>
            <?php if ($paged < $total_pages) : ?>
                <a class="button button-small" href="<?php echo esc_url(add_query_arg(['paged' => $paged + 1])); ?>"><?php echo esc_html__('Next', 'luxride-booking-engine'); ?></a>
            <?php endif; ?>
        </p>
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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; max-width: 1200px;">
            <div>
                <h3><?php echo esc_html__('Booking Summary', 'luxride-booking-engine'); ?></h3>
                <table class="widefat striped">
                    <tbody>
                        <tr><th><?php echo esc_html__('Route', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::route_label($route)); ?></td></tr>
                        <tr><th><?php echo esc_html__('Trip', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['trip_type'] . ' / ' . $booking['system_classification']); ?></td></tr>
                        <tr><th><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::labelize((string) $booking['vehicle_key'])); ?></td></tr>
                        <tr><th><?php echo esc_html__('Passengers / bags', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $booking['passengers'] . ' / ' . (string) $booking['bags']); ?></td></tr>
                        <tr><th><?php echo esc_html__('Outbound', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['outbound_datetime']); ?></td></tr>
                        <tr><th><?php echo esc_html__('Return', 'luxride-booking-engine'); ?></th><td><?php echo esc_html($booking['return_datetime'] ?: '-'); ?></td></tr>
                        <tr><th><?php echo esc_html__('Language', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) $booking['language']); ?></td></tr>
                    </tbody>
                </table>
            </div>
            <div>
                <h3><?php echo esc_html__('Customer', 'luxride-booking-engine'); ?></h3>
                <table class="widefat striped">
                    <tbody>
                        <tr><th><?php echo esc_html__('Name', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) ($customer['full_name'] ?? '')); ?></td></tr>
                        <tr><th><?php echo esc_html__('Phone', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) ($customer['phone'] ?? '')); ?></td></tr>
                        <tr><th><?php echo esc_html__('WhatsApp', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) ($customer['whatsapp'] ?? '')); ?></td></tr>
                        <tr><th><?php echo esc_html__('Email', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) ($customer['email'] ?? '')); ?></td></tr>
                    </tbody>
                </table>
            </div>
            <div>
                <h3><?php echo esc_html__('Required Details', 'luxride-booking-engine'); ?></h3>
                <table class="widefat striped">
                    <tbody>
                        <?php foreach (self::detail_fields() as $key => $label) : ?>
                            <tr><th><?php echo esc_html($label); ?></th><td><?php echo esc_html(self::detail_value($details[$key] ?? '')); ?></td></tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <div>
                <h3><?php echo esc_html__('Price', 'luxride-booking-engine'); ?></h3>
                <?php self::render_price_table($price['quote']['pricing'] ?? [], $booking); ?>
            </div>
        </div>

        <h3><?php echo esc_html__('Operations', 'luxride-booking-engine'); ?></h3>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="max-width: 900px;">
            <input type="hidden" name="action" value="luxride_booking_update_operations">
            <input type="hidden" name="booking_id" value="<?php echo esc_attr((string) $booking_id); ?>">
            <?php wp_nonce_field('luxride_booking_update_operations'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="status"><?php echo esc_html__('Booking status', 'luxride-booking-engine'); ?></label></th>
                    <td>
                        <select id="status" name="status" disabled>
                            <option><?php echo esc_html(self::labelize((string) $booking['status'])); ?></option>
                        </select>
                        <span class="description"><?php echo esc_html__('Use the status form below for workflow changes.', 'luxride-booking-engine'); ?></span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="payment_status"><?php echo esc_html__('Payment status', 'luxride-booking-engine'); ?></label></th>
                    <td><select id="payment_status" name="payment_status"><?php foreach (self::payment_statuses() as $option) : ?><option value="<?php echo esc_attr($option); ?>" <?php selected((string) ($booking['payment_status'] ?? 'unpaid'), $option); ?>><?php echo esc_html(self::labelize($option)); ?></option><?php endforeach; ?></select></td>
                </tr>
                <tr><th scope="row"><label for="payment_method"><?php echo esc_html__('Payment method', 'luxride-booking-engine'); ?></label></th><td><input class="regular-text" id="payment_method" name="payment_method" value="<?php echo esc_attr((string) ($booking['payment_method'] ?? '')); ?>"></td></tr>
                <tr><th scope="row"><label for="payment_note"><?php echo esc_html__('Payment note', 'luxride-booking-engine'); ?></label></th><td><input class="regular-text" id="payment_note" name="payment_note" value="<?php echo esc_attr((string) ($booking['payment_note'] ?? '')); ?>"></td></tr>
                <tr><th scope="row"><label for="cancel_reason"><?php echo esc_html__('Cancel reason', 'luxride-booking-engine'); ?></label></th><td><textarea class="large-text" id="cancel_reason" name="cancel_reason" rows="2"><?php echo esc_textarea((string) ($booking['cancel_reason'] ?? '')); ?></textarea></td></tr>
                <tr><th scope="row"><label for="driver_name"><?php echo esc_html__('Driver name', 'luxride-booking-engine'); ?></label></th><td><input class="regular-text" id="driver_name" name="driver_name" value="<?php echo esc_attr((string) ($booking['driver_name'] ?? '')); ?>"></td></tr>
                <tr><th scope="row"><label for="vehicle_plate"><?php echo esc_html__('Vehicle plate', 'luxride-booking-engine'); ?></label></th><td><input class="regular-text" id="vehicle_plate" name="vehicle_plate" value="<?php echo esc_attr((string) ($booking['vehicle_plate'] ?? '')); ?>"></td></tr>
                <tr><th scope="row"><label for="customer_rating"><?php echo esc_html__('Customer rating', 'luxride-booking-engine'); ?></label></th><td><input class="small-text" id="customer_rating" name="customer_rating" type="number" min="0" max="5" value="<?php echo esc_attr((string) ($booking['customer_rating'] ?? 0)); ?>"></td></tr>
                <tr><th scope="row"><label for="rating_feedback"><?php echo esc_html__('Rating feedback', 'luxride-booking-engine'); ?></label></th><td><textarea class="large-text" id="rating_feedback" name="rating_feedback" rows="2"><?php echo esc_textarea((string) ($booking['rating_feedback'] ?? '')); ?></textarea></td></tr>
                <tr><th scope="row"><label for="admin_notes"><?php echo esc_html__('Admin notes', 'luxride-booking-engine'); ?></label></th><td><textarea class="large-text" id="admin_notes" name="admin_notes" rows="4"><?php echo esc_textarea((string) ($booking['admin_notes'] ?? '')); ?></textarea></td></tr>
            </table>
            <?php submit_button(__('Save operations', 'luxride-booking-engine')); ?>
        </form>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin: 12px 0 20px;">
            <input type="hidden" name="action" value="luxride_booking_update_status">
            <input type="hidden" name="booking_id" value="<?php echo esc_attr((string) $booking_id); ?>">
            <?php wp_nonce_field('luxride_booking_update_status'); ?>
            <select name="status">
                <?php foreach (LuxRide_Booking_Bookings::STATUSES as $status) : ?>
                    <option value="<?php echo esc_attr($status); ?>" <?php selected($booking['status'], $status); ?>><?php echo esc_html(self::labelize($status)); ?></option>
                <?php endforeach; ?>
            </select>
            <?php submit_button(__('Update status', 'luxride-booking-engine'), 'primary', 'submit', false); ?>
        </form>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" onsubmit="return confirm('<?php echo esc_js(__('Delete this booking permanently?', 'luxride-booking-engine')); ?>');">
            <input type="hidden" name="action" value="luxride_booking_delete">
            <input type="hidden" name="booking_id" value="<?php echo esc_attr((string) $booking_id); ?>">
            <?php wp_nonce_field('luxride_booking_delete'); ?>
            <?php submit_button(__('Delete booking', 'luxride-booking-engine'), 'delete', 'submit', false); ?>
        </form>
        <?php
    }

    public static function render_availability_page(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'luxride-booking-engine'));
        }

        global $wpdb;
        $rows = $wpdb->get_results('SELECT * FROM ' . LuxRide_Booking_Schema::table('vehicle_blocks') . ' ORDER BY start_datetime DESC LIMIT 200', ARRAY_A);
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('LuxRide Availability', 'luxride-booking-engine'); ?></h1>
            <?php self::render_notice(); ?>
            <p><?php echo esc_html__('Availability blocks use Africa/Cairo time.', 'luxride-booking-engine'); ?></p>

            <h2><?php echo esc_html__('Add vehicle block', 'luxride-booking-engine'); ?></h2>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="max-width: 900px;">
                <input type="hidden" name="action" value="luxride_booking_save_block">
                <?php wp_nonce_field('luxride_booking_save_block'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="vehicle_key"><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?></label></th>
                        <td>
                            <select id="vehicle_key" name="vehicle_key">
                                <option value="all"><?php echo esc_html__('All vehicles', 'luxride-booking-engine'); ?></option>
                                <option value="sedan"><?php echo esc_html__('Sedan', 'luxride-booking-engine'); ?></option>
                                <option value="mpv"><?php echo esc_html__('MPV', 'luxride-booking-engine'); ?></option>
                                <option value="minivan"><?php echo esc_html__('Mini Van', 'luxride-booking-engine'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr><th scope="row"><label for="start_datetime"><?php echo esc_html__('Start', 'luxride-booking-engine'); ?></label></th><td><input id="start_datetime" name="start_datetime" type="datetime-local" required></td></tr>
                    <tr><th scope="row"><label for="end_datetime"><?php echo esc_html__('End', 'luxride-booking-engine'); ?></label></th><td><input id="end_datetime" name="end_datetime" type="datetime-local" required></td></tr>
                    <tr><th scope="row"><label for="reason"><?php echo esc_html__('Reason', 'luxride-booking-engine'); ?></label></th><td><input class="regular-text" id="reason" name="reason" value=""></td></tr>
                    <tr><th scope="row"><label for="notes"><?php echo esc_html__('Notes', 'luxride-booking-engine'); ?></label></th><td><textarea class="large-text" id="notes" name="notes" rows="3"></textarea></td></tr>
                    <tr><th scope="row"><?php echo esc_html__('Active', 'luxride-booking-engine'); ?></th><td><label><input name="active" type="checkbox" value="1" checked> <?php echo esc_html__('Block affects availability', 'luxride-booking-engine'); ?></label></td></tr>
                </table>
                <?php submit_button(__('Save block', 'luxride-booking-engine')); ?>
            </form>

            <h2><?php echo esc_html__('Current blocks', 'luxride-booking-engine'); ?></h2>
            <?php foreach ($rows as $row) : ?>
                <div style="max-width: 1000px; margin: 12px 0; padding: 14px; background: #fff; border: 1px solid #ccd0d4;">
                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                        <input type="hidden" name="action" value="luxride_booking_save_block">
                        <input type="hidden" name="block_id" value="<?php echo esc_attr((string) $row['id']); ?>">
                        <?php wp_nonce_field('luxride_booking_save_block'); ?>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; align-items: end;">
                            <label><?php echo esc_html__('Vehicle', 'luxride-booking-engine'); ?><br>
                                <select name="vehicle_key">
                                    <?php foreach (['all' => __('All vehicles', 'luxride-booking-engine'), 'sedan' => __('Sedan', 'luxride-booking-engine'), 'mpv' => __('MPV', 'luxride-booking-engine'), 'minivan' => __('Mini Van', 'luxride-booking-engine')] as $key => $label) : ?>
                                        <option value="<?php echo esc_attr($key); ?>" <?php selected((string) $row['vehicle_key'], $key); ?>><?php echo esc_html($label); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label>
                            <label><?php echo esc_html__('Start', 'luxride-booking-engine'); ?><br><input name="start_datetime" type="datetime-local" value="<?php echo esc_attr(self::datetime_local_value((string) $row['start_datetime'])); ?>" required></label>
                            <label><?php echo esc_html__('End', 'luxride-booking-engine'); ?><br><input name="end_datetime" type="datetime-local" value="<?php echo esc_attr(self::datetime_local_value((string) $row['end_datetime'])); ?>" required></label>
                            <label><?php echo esc_html__('Reason', 'luxride-booking-engine'); ?><br><input name="reason" value="<?php echo esc_attr((string) $row['reason']); ?>"></label>
                            <label><input name="active" type="checkbox" value="1" <?php checked(!empty($row['active'])); ?>> <?php echo esc_html__('Active', 'luxride-booking-engine'); ?></label>
                        </div>
                        <p><label><?php echo esc_html__('Notes', 'luxride-booking-engine'); ?><br><textarea name="notes" rows="2" class="large-text"><?php echo esc_textarea((string) $row['notes']); ?></textarea></label></p>
                        <?php submit_button(__('Save block', 'luxride-booking-engine'), 'secondary', 'submit', false); ?>
                    </form>
                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" onsubmit="return confirm('<?php echo esc_js(__('Delete this block?', 'luxride-booking-engine')); ?>');" style="margin-top: 8px;">
                        <input type="hidden" name="action" value="luxride_booking_delete_block">
                        <input type="hidden" name="block_id" value="<?php echo esc_attr((string) $row['id']); ?>">
                        <?php wp_nonce_field('luxride_booking_delete_block'); ?>
                        <?php submit_button(__('Delete block', 'luxride-booking-engine'), 'delete', 'submit', false); ?>
                    </form>
                </div>
            <?php endforeach; ?>
            <?php if (!$rows) : ?>
                <p><?php echo esc_html__('No blocks saved.', 'luxride-booking-engine'); ?></p>
            <?php endif; ?>
        </div>
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
            'booking_operations_saved' => __('Booking operations saved.', 'luxride-booking-engine'),
            'booking_operations_failed' => __('Booking operations could not be saved.', 'luxride-booking-engine'),
            'booking_deleted' => __('Booking deleted.', 'luxride-booking-engine'),
            'booking_delete_failed' => __('Booking could not be deleted.', 'luxride-booking-engine'),
            'booking_xlsx_failed' => __('Excel export could not be created on this server.', 'luxride-booking-engine'),
            'block_saved' => __('Availability block saved.', 'luxride-booking-engine'),
            'block_failed' => __('Availability block could not be saved.', 'luxride-booking-engine'),
            'block_deleted' => __('Availability block deleted.', 'luxride-booking-engine'),
            'block_delete_failed' => __('Availability block could not be deleted.', 'luxride-booking-engine'),
        ];

        if ($notice && isset($messages[$notice])) {
            $class = in_array($notice, ['import_failed', 'import_missing', 'import_invalid_json', 'route_missing', 'booking_status_failed', 'booking_operations_failed', 'booking_delete_failed', 'booking_xlsx_failed', 'block_failed', 'block_delete_failed'], true) ? 'notice notice-error' : 'notice notice-success';
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

    private static function booking_export_rows(array $input): array
    {
        global $wpdb;

        $filters = self::booking_filters($input);
        $where = $filters['where'];
        $args = $filters['args'];
        $order_column = $filters['order_column'];
        $order = $filters['order'];
        $sql = 'SELECT * FROM ' . LuxRide_Booking_Schema::table('bookings') . ' WHERE ' . implode(' AND ', $where) . ' ORDER BY ' . $order_column . ' ' . $order . ', created_at DESC';
        $rows = $args ? $wpdb->get_results($wpdb->prepare($sql, ...$args), ARRAY_A) : $wpdb->get_results($sql, ARRAY_A);

        return array_map([self::class, 'booking_export_row'], $rows);
    }

    private static function booking_filters(array $input): array
    {
        global $wpdb;

        $search = sanitize_text_field((string) ($input['s'] ?? $input['search'] ?? ''));
        $status = sanitize_key((string) ($input['status'] ?? ''));
        $payment_status = sanitize_key((string) ($input['payment_status'] ?? ''));
        $date_from = sanitize_text_field((string) ($input['date_from'] ?? ''));
        $date_to = sanitize_text_field((string) ($input['date_to'] ?? ''));
        $orderby = sanitize_key((string) ($input['orderby'] ?? 'outbound_datetime'));
        $order = 'asc' === strtolower((string) ($input['order'] ?? 'desc')) ? 'ASC' : 'DESC';
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
        if (in_array($payment_status, self::payment_statuses(), true)) {
            $where[] = 'payment_status = %s';
            $args[] = $payment_status;
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_from)) {
            $where[] = 'outbound_datetime >= %s';
            $args[] = $date_from . ' 00:00:00';
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_to)) {
            $where[] = 'outbound_datetime <= %s';
            $args[] = $date_to . ' 23:59:59';
        }

        $sortable = [
            'created_at' => 'created_at',
            'outbound_datetime' => 'outbound_datetime',
            'final_total_eur' => 'final_total_eur',
            'status' => 'status',
            'payment_status' => 'payment_status',
        ];

        return [
            'where' => $where,
            'args' => $args,
            'order_column' => $sortable[$orderby] ?? 'outbound_datetime',
            'order' => $order,
        ];
    }

    private static function booking_export_manifest(): array
    {
        return [
            'Booking_Reference',
            'Created_At',
            'Confirmed_At',
            'Booking_Status',
            'Cancel_Reason',
            'Customer_Name',
            'Customer_Phone',
            'Customer_Email',
            'Customer_Country',
            'Customer_Language',
            'Pickup_Location',
            'Dropoff_Location',
            'Hotel_Room_Number',
            'Trip_Type',
            'Trip_Category',
            'Pickup_Date',
            'Pickup_Time',
            'Return_Date',
            'Return_Time',
            'Vehicle_Type',
            'Assigned_Vehicle_Plates',
            'Assigned_Driver',
            'Passenger_Count',
            'Luggage_Count',
            'Child_Seat',
            'Base_Fare',
            'Airport_Fee',
            'Travel_Permit_Fee',
            'Driver_Overnight_Fee',
            'Extra_Stops_Fee',
            'Discount_Amount',
            'Total_Amount',
            'Currency',
            'Payment_Method',
            'Payment_Status',
            'Flight_Number',
            'Special_Requests',
            'Rating_Feedback',
        ];
    }

    private static function booking_export_row(array $row): array
    {
        $route = self::decoded((string) $row['route_snapshot']);
        $customer = self::decoded((string) $row['customer_snapshot']);
        $details = self::decoded((string) $row['conditional_details']);
        $price = self::decoded((string) $row['price_snapshot']);
        $pricing = is_array($price['quote']['pricing'] ?? null) ? $price['quote']['pricing'] : [];
        $pickup = self::split_datetime((string) ($row['outbound_datetime'] ?? ''));
        $return = self::split_datetime((string) ($row['return_datetime'] ?? ''));

        return [
            'Booking_Reference' => (string) ($row['booking_reference'] ?? ''),
            'Created_At' => (string) ($row['created_at'] ?? ''),
            'Confirmed_At' => (string) ($row['confirmed_at'] ?? ''),
            'Booking_Status' => (string) ($row['status'] ?? ''),
            'Cancel_Reason' => (string) ($row['cancel_reason'] ?? ''),
            'Customer_Name' => (string) ($customer['full_name'] ?? ''),
            'Customer_Phone' => (string) ($customer['phone'] ?? ''),
            'Customer_Email' => (string) ($customer['email'] ?? ''),
            'Customer_Country' => (string) ($customer['country'] ?? ''),
            'Customer_Language' => (string) ($row['language'] ?? $customer['preferred_language'] ?? ''),
            'Pickup_Location' => (string) ($route['pickup']['label'] ?? ''),
            'Dropoff_Location' => (string) ($route['destination']['label'] ?? ''),
            'Hotel_Room_Number' => (string) ($details['room_number'] ?? ''),
            'Trip_Type' => (string) ($row['trip_type'] ?? ''),
            'Trip_Category' => (string) ($row['system_classification'] ?? ''),
            'Pickup_Date' => $pickup['date'],
            'Pickup_Time' => $pickup['time'],
            'Return_Date' => $return['date'],
            'Return_Time' => $return['time'],
            'Vehicle_Type' => (string) ($row['vehicle_key'] ?? ''),
            'Assigned_Vehicle_Plates' => (string) ($row['vehicle_plate'] ?? ''),
            'Assigned_Driver' => (string) ($row['driver_name'] ?? ''),
            'Passenger_Count' => (int) ($row['passengers'] ?? 0),
            'Luggage_Count' => (int) ($row['bags'] ?? 0),
            'Child_Seat' => !empty($details['child_seat_requested']) ? 'Yes' : 'No',
            'Base_Fare' => self::numeric_export($pricing['base'] ?? 0),
            'Airport_Fee' => self::numeric_export($pricing['airport_fee'] ?? 0),
            'Travel_Permit_Fee' => self::numeric_export($pricing['permit_fee'] ?? 0),
            'Driver_Overnight_Fee' => self::numeric_export($pricing['accommodation_fee'] ?? 0),
            'Extra_Stops_Fee' => '',
            'Discount_Amount' => self::numeric_export($pricing['discount'] ?? 0),
            'Total_Amount' => self::numeric_export($row['final_total_eur'] ?? 0),
            'Currency' => (string) ($row['currency'] ?? 'EUR'),
            'Payment_Method' => (string) ($row['payment_method'] ?? ''),
            'Payment_Status' => (string) ($row['payment_status'] ?? ''),
            'Flight_Number' => (string) ($details['flight_number'] ?? ''),
            'Special_Requests' => (string) ($details['notes'] ?? ''),
            'Rating_Feedback' => (string) ($row['rating_feedback'] ?? ''),
        ];
    }

    private static function bookings_export_csv(array $rows): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, self::booking_export_manifest());
        foreach ($rows as $row) {
            fputcsv($handle, self::manifest_values($row));
        }

        rewind($handle);
        return (string) stream_get_contents($handle);
    }

    private static function bookings_export_xlsx(array $rows)
    {
        if (!class_exists('ZipArchive')) {
            return new WP_Error('luxride_zip_missing', 'PHP ZipArchive is required to create XLSX exports.');
        }

        $tmp = wp_tempnam('luxride-bookings.xlsx');
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
        $zip->addFromString('xl/styles.xml', self::xlsx_styles());
        $zip->addFromString('xl/worksheets/sheet1.xml', self::xlsx_sheet($rows));
        $zip->close();

        $content = file_get_contents($tmp);
        unlink($tmp);

        return false === $content ? new WP_Error('luxride_xlsx_read_failed', 'Could not read the generated XLSX file.') : $content;
    }

    private static function manifest_values(array $row): array
    {
        $values = [];
        foreach (self::booking_export_manifest() as $key) {
            $values[] = $row[$key] ?? '';
        }
        return $values;
    }

    private static function render_booking_filter_hidden_fields(array $filters): void
    {
        foreach ($filters as $key => $value) {
            echo '<input type="hidden" name="' . esc_attr((string) $key) . '" value="' . esc_attr((string) $value) . '">';
        }
    }

    private static function split_datetime(string $value): array
    {
        $value = trim($value);
        if ('' === $value) {
            return ['date' => '', 'time' => ''];
        }

        $timestamp = strtotime($value);
        if (false === $timestamp) {
            return ['date' => '', 'time' => ''];
        }

        return [
            'date' => gmdate('Y-m-d', $timestamp),
            'time' => gmdate('H:i', $timestamp),
        ];
    }

    private static function datetime_local_value(string $value): string
    {
        $parts = self::split_datetime($value);
        return $parts['date'] && $parts['time'] ? $parts['date'] . 'T' . $parts['time'] : '';
    }

    private static function numeric_export($value)
    {
        return is_numeric($value) ? round((float) $value, 2) : '';
    }

    private static function xlsx_sheet(array $rows): string
    {
        $manifest = self::booking_export_manifest();
        $sheet_rows = [];
        $sheet_rows[] = self::xlsx_row(1, $manifest, true);
        $row_number = 2;
        foreach ($rows as $row) {
            $sheet_rows[] = self::xlsx_row($row_number, self::manifest_values($row), false);
            $row_number++;
        }

        $last_row = max(1, $row_number - 1);
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheetViews><sheetView workbookViewId="0" rightToLeft="0"/></sheetViews>'
            . '<sheetFormatPr defaultRowHeight="15"/>'
            . '<cols>' . self::xlsx_columns(count($manifest)) . '</cols>'
            . '<sheetData>' . implode('', $sheet_rows) . '</sheetData>'
            . '<autoFilter ref="A1:' . self::xlsx_column_name(count($manifest)) . $last_row . '"/>'
            . '</worksheet>';
    }

    private static function xlsx_row(int $row_number, array $values, bool $header): string
    {
        $cells = [];
        foreach (array_values($values) as $index => $value) {
            $cells[] = self::xlsx_cell(self::xlsx_column_name($index + 1) . $row_number, $value, $header, $index);
        }

        return '<row r="' . $row_number . '">' . implode('', $cells) . '</row>';
    }

    private static function xlsx_cell(string $ref, $value, bool $header, int $index): string
    {
        $date_serial = $header ? null : self::xlsx_date_serial($value, $index);
        if (null !== $date_serial) {
            return '<c r="' . esc_attr($ref) . '" s="1"><v>' . esc_html((string) $date_serial) . '</v></c>';
        }

        if (!$header && is_numeric($value)) {
            return '<c r="' . esc_attr($ref) . '"><v>' . esc_html((string) $value) . '</v></c>';
        }

        return '<c r="' . esc_attr($ref) . '" t="inlineStr"><is><t>' . self::xml_text((string) $value) . '</t></is></c>';
    }

    private static function xlsx_date_serial($value, int $index): ?int
    {
        if (!in_array($index, [15, 17], true) || !is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return null;
        }

        $date = date_create_immutable_from_format('Y-m-d', $value, new DateTimeZone('UTC'));
        if (!$date) {
            return null;
        }

        return ((int) floor($date->getTimestamp() / DAY_IN_SECONDS)) + 25569;
    }

    private static function xlsx_columns(int $count): string
    {
        $columns = [];
        for ($i = 1; $i <= $count; $i++) {
            $columns[] = '<col min="' . $i . '" max="' . $i . '" width="' . ($i <= 5 ? '18' : '22') . '" customWidth="1"/>';
        }
        return implode('', $columns);
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

    private static function xlsx_content_types(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '</Types>';
    }

    private static function xlsx_root_rels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>';
    }

    private static function xlsx_workbook(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets><sheet name="LuxRide Bookings" sheetId="1" r:id="rId1"/></sheets>'
            . '</workbook>';
    }

    private static function xlsx_workbook_rels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '</Relationships>';
    }

    private static function xlsx_styles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
            . '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
            . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>'
            . '</styleSheet>';
    }

    private static function xml_text(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }

    private static function detail_fields(): array
    {
        return [
            'exact_location' => __('Exact location / hotel', 'luxride-booking-engine'),
            'room_number' => __('Room number', 'luxride-booking-engine'),
            'flight_number' => __('Flight number', 'luxride-booking-engine'),
            'passport_or_id' => __('Passport or ID', 'luxride-booking-engine'),
            'child_seat_requested' => __('Child seat', 'luxride-booking-engine'),
            'notes' => __('Customer notes', 'luxride-booking-engine'),
        ];
    }

    private static function render_price_table(array $pricing, array $booking): void
    {
        ?>
        <table class="widefat striped">
            <tbody>
                <tr><th><?php echo esc_html__('Base', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::money_display($pricing['base'] ?? 0, $booking)); ?></td></tr>
                <tr><th><?php echo esc_html__('Airport fee', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::money_display($pricing['airport_fee'] ?? 0, $booking)); ?></td></tr>
                <tr><th><?php echo esc_html__('Permit fee', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::money_display($pricing['permit_fee'] ?? 0, $booking)); ?></td></tr>
                <tr><th><?php echo esc_html__('Accommodation nights', 'luxride-booking-engine'); ?></th><td><?php echo esc_html((string) ($pricing['accommodation']['nights'] ?? 0)); ?></td></tr>
                <tr><th><?php echo esc_html__('Accommodation fee', 'luxride-booking-engine'); ?></th><td><?php echo esc_html(self::money_display($pricing['accommodation_fee'] ?? 0, $booking)); ?></td></tr>
                <tr><th><?php echo esc_html__('Child seat', 'luxride-booking-engine'); ?></th><td><?php echo !empty($pricing['child_seat']['requested']) ? esc_html__('Requested / free', 'luxride-booking-engine') : esc_html__('Not requested', 'luxride-booking-engine'); ?></td></tr>
                <tr><th><?php echo esc_html__('Final total', 'luxride-booking-engine'); ?></th><td><strong><?php echo esc_html(self::money_display($booking['final_total_eur'] ?? 0, $booking)); ?></strong></td></tr>
            </tbody>
        </table>
        <?php
    }

    private static function detail_value($value): string
    {
        if (is_bool($value)) {
            return $value ? __('Yes', 'luxride-booking-engine') : __('No', 'luxride-booking-engine');
        }

        $value = trim((string) $value);
        return '' === $value ? '-' : $value;
    }

    private static function money_display($value, array $booking): string
    {
        return number_format((float) $value, 2) . ' ' . (string) ($booking['currency'] ?? 'EUR');
    }

    private static function payment_statuses(): array
    {
        return ['unpaid', 'deposit_paid', 'paid', 'refunded'];
    }

    private static function labelize(string $value): string
    {
        return ucwords(str_replace('_', ' ', $value));
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
