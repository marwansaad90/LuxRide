<?php
/**
 * Theme settings and REST exposure for Phase 2 integrations.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

function luxride_default_options(): array
{
    return [
        'phone_display' => '+20 101 355 4009',
        'whatsapp_number' => '201013554009',
        'email' => 'booking@luxride-eg.com',
        'facebook_url' => 'https://www.facebook.com/luxride.eg/',
        'instagram_url' => 'https://www.instagram.com/luxride.eg/',
        'tripadvisor_url' => 'https://www.tripadvisor.com/Attraction_Review-g297549-d34457256-Reviews-LuxRide_Taxi-Hurghada_Red_Sea_and_Sinai.html',
    ];
}

function luxride_seed_default_options(): void
{
    $settings = array_merge(luxride_default_options(), (array) get_option('luxride_site_settings', []));
    foreach (luxride_default_options() as $key => $default) {
        if ('' === ($settings[$key] ?? '')) {
            $settings[$key] = $default;
        }
    }
    update_option('luxride_site_settings', $settings);
}

add_action('admin_init', function (): void {
    register_setting('luxride_settings', 'luxride_site_settings', [
        'type' => 'array',
        'sanitize_callback' => 'luxride_sanitize_settings',
        'default' => luxride_default_options(),
    ]);
});

add_action('admin_menu', function (): void {
    add_options_page(
        __('LuxRide Settings', 'luxride'),
        __('LuxRide Settings', 'luxride'),
        'manage_options',
        'luxride-settings',
        'luxride_render_settings_page'
    );
});

function luxride_sanitize_settings(array $input): array
{
    $defaults = luxride_default_options();
    $clean = [];

    foreach ($defaults as $key => $default) {
        $value = isset($input[$key]) ? (string) $input[$key] : $default;
        $clean[$key] = str_ends_with($key, '_url') ? esc_url_raw($value) : sanitize_text_field($value);
    }

    return $clean;
}

function luxride_render_settings_page(): void
{
    $settings = array_merge(luxride_default_options(), (array) get_option('luxride_site_settings', []));
    $labels = [
        'phone_display' => __('Public phone number', 'luxride'),
        'whatsapp_number' => __('WhatsApp number', 'luxride'),
        'email' => __('Booking email', 'luxride'),
        'facebook_url' => __('Facebook page URL', 'luxride'),
        'instagram_url' => __('Instagram profile URL', 'luxride'),
        'tripadvisor_url' => __('Tripadvisor page URL', 'luxride'),
    ];
    $help = [
        'phone_display' => __('Shown in the header, footer and contact sections.', 'luxride'),
        'whatsapp_number' => __('Use country code only, for example 201013554009.', 'luxride'),
        'email' => __('Shown to customers and used for booking contact links.', 'luxride'),
        'facebook_url' => __('Leave the full https:// link.', 'luxride'),
        'instagram_url' => __('Leave the full https:// link.', 'luxride'),
        'tripadvisor_url' => __('Leave the full https:// link.', 'luxride'),
    ];
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('LuxRide Settings', 'luxride'); ?></h1>
        <p><?php esc_html_e('Manage the public contact and social details used by the LuxRide website. These are safe client-facing settings.', 'luxride'); ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('luxride_settings'); ?>
            <table class="form-table" role="presentation">
                <?php foreach (luxride_default_options() as $key => $default) : ?>
                    <tr>
                        <th scope="row">
                            <label for="luxride_<?php echo esc_attr($key); ?>"><?php echo esc_html($labels[$key] ?? ucwords(str_replace('_', ' ', $key))); ?></label>
                        </th>
                        <td>
                            <input
                                id="luxride_<?php echo esc_attr($key); ?>"
                                class="regular-text"
                                name="luxride_site_settings[<?php echo esc_attr($key); ?>]"
                                value="<?php echo esc_attr($settings[$key] ?? $default); ?>"
                            />
                            <?php if (isset($help[$key])) : ?>
                                <p class="description"><?php echo esc_html($help[$key]); ?></p>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

add_action('rest_api_init', function (): void {
    register_rest_route('luxride/v1', '/settings', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => fn() => rest_ensure_response(array_merge(luxride_default_options(), (array) get_option('luxride_site_settings', []))),
        'permission_callback' => '__return_true',
    ]);
});
