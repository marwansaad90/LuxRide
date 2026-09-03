<?php
/**
 * WordPress content bridge for the LuxRide React bundle.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

function luxride_asset_or_url(string $value): string
{
    if ('' === $value) {
        return '';
    }

    if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, '/')) {
        return $value;
    }

    return LUXRIDE_THEME_URI . '/assets/' . ltrim($value, '/');
}

function luxride_meta(int $post_id, string $key, mixed $default = ''): mixed
{
    $value = get_post_meta($post_id, $key, true);
    return '' === $value || null === $value ? $default : $value;
}

function luxride_json_meta(int $post_id, string $key, array $default = []): array
{
    $value = luxride_meta($post_id, $key, '');
    if (is_array($value)) {
        return $value;
    }

    $decoded = json_decode((string) $value, true);
    return is_array($decoded) ? $decoded : $default;
}

function luxride_bool_meta(int $post_id, string $key, bool $default = false): bool
{
    $value = luxride_meta($post_id, $key, $default ? '1' : '0');
    return in_array($value, [true, 1, '1', 'true', 'yes', 'on'], true);
}

function luxride_plain_text(mixed $value): string
{
    return html_entity_decode(wp_strip_all_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function luxride_text_meta(int $post_id, string $key, mixed $default = ''): string
{
    return luxride_plain_text(luxride_meta($post_id, $key, $default));
}

function luxride_posts(string $post_type): array
{
    return get_posts([
        'post_type' => $post_type,
        'post_status' => 'publish',
        'numberposts' => -1,
        'orderby' => ['menu_order' => 'ASC', 'title' => 'ASC'],
        'order' => 'ASC',
        'suppress_filters' => false,
    ]);
}

function luxride_experience_images(int $post_id): array
{
    $gallery = array_values(array_filter(luxride_json_meta($post_id, 'luxride_gallery_urls')));
    $featured = (string) luxride_meta($post_id, 'luxride_image_url', '');
    if ('' !== $featured && !in_array($featured, $gallery, true)) {
        array_unshift($gallery, $featured);
    }

    return array_map('luxride_asset_or_url', $gallery);
}

function luxride_public_route_key(string $value): string
{
    $key = sanitize_title($value);
    $aliases = [
        'hurghada' => 'hurghada-city-center',
        'al-ahyaa' => 'al-ahyaa-subdivisions',
    ];

    return $aliases[$key] ?? $key;
}

function luxride_public_route_flags(): array
{
    if (!class_exists('LuxRide_Booking_Schema')) {
        return [];
    }

    global $wpdb;
    $rows = $wpdb->get_results(
        'SELECT pickup_label, destination_label, airport_fee_applicable, permit_required FROM ' . LuxRide_Booking_Schema::table('routes'),
        ARRAY_A
    );

    $flags = [];
    foreach (is_array($rows) ? $rows : [] as $row) {
        $key = luxride_public_route_key((string) ($row['pickup_label'] ?? '')) . '|' . luxride_public_route_key((string) ($row['destination_label'] ?? ''));
        $flags[$key] = [
            'airport' => !empty($row['airport_fee_applicable']),
            'permit' => !empty($row['permit_required']),
        ];
    }

    return $flags;
}

function luxride_content_payload(): array
{
    $payload = [
        'source' => 'wordpress',
        'settings' => luxride_camel_settings(),
        'vehicles' => [],
        'popularTransfers' => [],
        'destinationGroups' => [],
        'experiences' => [],
        'faqs' => [],
    ];

    $route_flags = luxride_public_route_flags();

    foreach (luxride_posts('luxride_vehicle') as $post) {
        if (!luxride_bool_meta($post->ID, 'luxride_active', true)) {
            continue;
        }

        $payload['vehicles'][] = [
            'id' => luxride_text_meta($post->ID, 'luxride_source_id', $post->post_name),
            'name' => luxride_plain_text(get_the_title($post)),
            'category' => luxride_text_meta($post->ID, 'luxride_vehicle_type', ''),
            'categoryAr' => luxride_text_meta($post->ID, 'luxride_vehicle_type_ar', ''),
            'image' => luxride_asset_or_url((string) luxride_meta($post->ID, 'luxride_image_url', '')),
            'pax' => (int) luxride_meta($post->ID, 'luxride_passengers', 1),
            'luggage' => (int) luxride_meta($post->ID, 'luxride_baggage', 1),
            'capacityEn' => luxride_text_meta($post->ID, 'luxride_features_en', ''),
            'capacityAr' => luxride_text_meta($post->ID, 'luxride_features_ar', ''),
            'permitTier' => luxride_text_meta($post->ID, 'luxride_trip_type', 'sedan'),
            'available' => luxride_bool_meta($post->ID, 'luxride_active', true),
            'bookingEnabled' => luxride_bool_meta($post->ID, 'luxride_booking_enabled', true),
            'wifi' => luxride_bool_meta($post->ID, 'luxride_wifi', false),
            'airConditioning' => luxride_bool_meta($post->ID, 'luxride_air_conditioning', true),
            'usbCharging' => luxride_bool_meta($post->ID, 'luxride_usb_charging', true),
            'iceBox' => luxride_bool_meta($post->ID, 'luxride_ice_box', false),
            'tagline' => luxride_text_meta($post->ID, 'luxride_summary_en', ''),
            'taglineAr' => luxride_text_meta($post->ID, 'luxride_summary_ar', ''),
            'displayOrder' => (int) $post->menu_order,
        ];
    }

    $groups = [];
    foreach (luxride_posts('luxride_destination') as $post) {
        if (!luxride_bool_meta($post->ID, 'luxride_active', true)) {
            continue;
        }

        $contexts = array_filter(array_map('trim', explode(',', (string) luxride_meta($post->ID, 'luxride_context', 'destination'))));
        $legacy_from_price = (float) luxride_meta($post->ID, 'luxride_from_price', 0);
        $promotion_price = [];
        if (class_exists('LuxRide_Booking_Promotions')) {
            $promotion_price = LuxRide_Booking_Promotions::route_card_pricing(
                luxride_text_meta($post->ID, 'luxride_route_from', ''),
                luxride_text_meta($post->ID, 'luxride_route_to', ''),
                'mpv',
                'one_way'
            );
        }
        $promotion = is_array($promotion_price['promotion'] ?? null) ? $promotion_price['promotion'] : [];
        $has_promotion = !empty($promotion['has_promotion']);

        $item = [
            'id' => luxride_text_meta($post->ID, 'luxride_source_id', $post->post_name),
            'from' => luxride_text_meta($post->ID, 'luxride_route_from', ''),
            'to' => luxride_text_meta($post->ID, 'luxride_route_to', ''),
            'image' => luxride_asset_or_url((string) luxride_meta($post->ID, 'luxride_image_url', '')),
            'imagePosition' => luxride_text_meta($post->ID, 'luxride_image_position', ''),
            'duration' => luxride_text_meta($post->ID, 'luxride_duration', ''),
            'fromPrice' => $has_promotion ? (float) $promotion_price['price'] : $legacy_from_price,
            'oldPrice' => $has_promotion ? (float) $promotion_price['original_price'] : null,
            'discountPct' => $has_promotion ? (float) $promotion['promotion_discount_percent'] : null,
            'promotionName' => $has_promotion ? (string) $promotion['promotion_name'] : null,
            'promotionStartAt' => $has_promotion ? (string) ($promotion['promotion_start_at'] ?? '') : null,
            'promotionEndAt' => $has_promotion ? (string) ($promotion['promotion_end_at'] ?? '') : null,
            'airport' => luxride_bool_meta($post->ID, 'luxride_airport_fee', false),
            'permit' => luxride_bool_meta($post->ID, 'luxride_permit_required', false),
            'displayFrom' => [
                'EN' => luxride_text_meta($post->ID, 'luxride_display_from_en', ''),
                'AR' => luxride_text_meta($post->ID, 'luxride_display_from_ar', ''),
            ],
            'displayTo' => [
                'EN' => luxride_text_meta($post->ID, 'luxride_display_to_en', ''),
                'AR' => luxride_text_meta($post->ID, 'luxride_display_to_ar', ''),
            ],
            'contexts' => array_values($contexts),
            'group' => [
                'EN' => luxride_text_meta($post->ID, 'luxride_group_en', ''),
                'AR' => luxride_text_meta($post->ID, 'luxride_group_ar', ''),
            ],
            'displayOrder' => (int) $post->menu_order,
        ];

        $route_key = luxride_public_route_key((string) $item['from']) . '|' . luxride_public_route_key((string) $item['to']);
        if (isset($route_flags[$route_key])) {
            $item['airport'] = $route_flags[$route_key]['airport'];
            $item['permit'] = $route_flags[$route_key]['permit'];
        }

        if (in_array('popular', $contexts, true)) {
            $payload['popularTransfers'][] = $item;
        }

        if (in_array('destination', $contexts, true) && $item['group']['EN']) {
            $group_key = sanitize_title($item['group']['EN']);
            if (!isset($groups[$group_key])) {
                $groups[$group_key] = [
                    'en' => $item['group']['EN'],
                    'ar' => $item['group']['AR'],
                    'routes' => [],
                    'displayOrder' => (int) floor(((int) $post->menu_order) / 100) * 100,
                ];
            }
            $groups[$group_key]['routes'][] = $item;
        }
    }

    $payload['destinationGroups'] = array_values($groups);

    foreach (luxride_posts('luxride_experience') as $post) {
        if (!luxride_bool_meta($post->ID, 'luxride_active', true)) {
            continue;
        }

        $payload['experiences'][] = [
            'id' => luxride_text_meta($post->ID, 'luxride_source_id', $post->post_name),
            'createdAt' => get_the_date('Y-m-d', $post),
            'images' => luxride_experience_images($post->ID),
            'video' => [
                'url' => luxride_asset_or_url((string) luxride_meta($post->ID, 'luxride_video_url', '')),
                'poster' => luxride_asset_or_url((string) luxride_meta($post->ID, 'luxride_video_poster_url', '')),
            ],
            'routeType' => ['EN' => luxride_text_meta($post->ID, 'luxride_route_type_en', ''), 'AR' => luxride_text_meta($post->ID, 'luxride_route_type_ar', '')],
            'title' => ['EN' => luxride_plain_text(get_the_title($post)), 'AR' => luxride_text_meta($post->ID, 'luxride_title_ar', get_the_title($post))],
            'vehicle' => ['EN' => luxride_text_meta($post->ID, 'luxride_vehicle_en', ''), 'AR' => luxride_text_meta($post->ID, 'luxride_vehicle_ar', '')],
            'excerpt' => ['EN' => luxride_text_meta($post->ID, 'luxride_summary_en', ''), 'AR' => luxride_text_meta($post->ID, 'luxride_summary_ar', '')],
            'description' => ['EN' => luxride_plain_text($post->post_content), 'AR' => luxride_text_meta($post->ID, 'luxride_description_ar', '')],
            'imagePosition' => luxride_text_meta($post->ID, 'luxride_image_position', ''),
            'tags' => ['EN' => luxride_json_meta($post->ID, 'luxride_tags_en'), 'AR' => luxride_json_meta($post->ID, 'luxride_tags_ar')],
            'booking' => [
                'from' => luxride_text_meta($post->ID, 'luxride_booking_from', ''),
                'to' => luxride_text_meta($post->ID, 'luxride_booking_to', ''),
                'trip' => luxride_text_meta($post->ID, 'luxride_booking_trip', 'oneWay'),
            ],
            'displayOrder' => (int) $post->menu_order,
        ];
    }

    foreach (luxride_posts('luxride_faq') as $post) {
        if (!luxride_bool_meta($post->ID, 'luxride_active', true)) {
            continue;
        }

        $payload['faqs'][] = [
            'id' => luxride_text_meta($post->ID, 'luxride_source_id', $post->post_name),
            'context' => luxride_text_meta($post->ID, 'luxride_faq_context', 'page'),
            'q' => ['EN' => luxride_plain_text(get_the_title($post)), 'AR' => luxride_text_meta($post->ID, 'luxride_question_ar', get_the_title($post))],
            'a' => ['EN' => luxride_plain_text($post->post_content), 'AR' => luxride_text_meta($post->ID, 'luxride_answer_ar', '')],
            'displayOrder' => (int) $post->menu_order,
        ];
    }

    return $payload;
}

function luxride_camel_settings(): array
{
    $settings = array_merge(luxride_default_options(), (array) get_option('luxride_site_settings', []));
    $booking_settings = class_exists('LuxRide_Booking_Settings') ? LuxRide_Booking_Settings::all() : [];
    return [
        'phoneDisplay' => $settings['phone_display'],
        'whatsappNumber' => $settings['whatsapp_number'],
        'email' => $settings['email'],
        'facebookUrl' => $settings['facebook_url'],
        'instagramUrl' => $settings['instagram_url'],
        'tripadvisorUrl' => $settings['tripadvisor_url'],
        'minimumLeadHours' => max(1, (int) ($booking_settings['minimum_lead_hours'] ?? 3)),
    ];
}

function luxride_inline_content_bootstrap(): void
{
    if (!wp_script_is('luxride-app', 'enqueued')) {
        return;
    }

    wp_add_inline_script(
        'luxride-app',
        'window.__LUXRIDE_BOOTSTRAP__ = ' . wp_json_encode(luxride_content_payload(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';',
        'before'
    );
}

add_action('wp_enqueue_scripts', 'luxride_inline_content_bootstrap', 30);

add_action('wp_head', function (): void {
    printf(
        '<script id="luxride-content-bootstrap">window.__LUXRIDE_BOOTSTRAP__ = %s;</script>' . "\n",
        wp_json_encode(luxride_content_payload(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
    );
}, 90);

add_action('rest_api_init', function (): void {
    register_rest_route('luxride/v1', '/content', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => fn() => rest_ensure_response(luxride_content_payload()),
        'permission_callback' => '__return_true',
    ]);
});
