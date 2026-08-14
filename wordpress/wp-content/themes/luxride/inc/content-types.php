<?php
/**
 * Business content types for LuxRide admin management.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'luxride_register_content_types');

function luxride_register_content_types(): void
{
    luxride_register_cpt('luxride_vehicle', 'Vehicle', 'Vehicles', 'dashicons-car', ['title', 'thumbnail', 'page-attributes', 'custom-fields']);
    luxride_register_cpt('luxride_destination', 'Destination', 'Destinations', 'dashicons-location-alt', ['title', 'editor', 'thumbnail', 'page-attributes', 'custom-fields']);
    luxride_register_cpt('luxride_experience', 'Experience', 'Experiences', 'dashicons-palmtree', ['title', 'editor', 'thumbnail', 'page-attributes', 'custom-fields']);
    luxride_register_cpt('luxride_faq', 'FAQ Item', 'FAQ Items', 'dashicons-editor-help', ['title', 'editor', 'page-attributes', 'custom-fields']);

    $meta_fields = [
        'luxride_title_ar' => 'string',
        'luxride_summary_en' => 'string',
        'luxride_summary_ar' => 'string',
        'luxride_vehicle_type' => 'string',
        'luxride_vehicle_type_ar' => 'string',
        'luxride_passengers' => 'integer',
        'luxride_baggage' => 'integer',
        'luxride_features_en' => 'string',
        'luxride_features_ar' => 'string',
        'luxride_route_from' => 'string',
        'luxride_route_to' => 'string',
        'luxride_route_from_ar' => 'string',
        'luxride_route_to_ar' => 'string',
        'luxride_trip_type' => 'string',
        'luxride_active' => 'boolean',
        'luxride_wifi' => 'boolean',
        'luxride_source_id' => 'string',
        'luxride_image_url' => 'string',
        'luxride_image_position' => 'string',
        'luxride_context' => 'string',
        'luxride_group_en' => 'string',
        'luxride_group_ar' => 'string',
        'luxride_display_from_en' => 'string',
        'luxride_display_from_ar' => 'string',
        'luxride_display_to_en' => 'string',
        'luxride_display_to_ar' => 'string',
        'luxride_duration' => 'string',
        'luxride_from_price' => 'number',
        'luxride_old_price' => 'number',
        'luxride_discount_pct' => 'number',
        'luxride_airport_fee' => 'boolean',
        'luxride_permit_required' => 'boolean',
        'luxride_gallery_urls' => 'string',
        'luxride_route_type_en' => 'string',
        'luxride_route_type_ar' => 'string',
        'luxride_vehicle_en' => 'string',
        'luxride_vehicle_ar' => 'string',
        'luxride_description_ar' => 'string',
        'luxride_tags_en' => 'string',
        'luxride_tags_ar' => 'string',
        'luxride_booking_from' => 'string',
        'luxride_booking_to' => 'string',
        'luxride_booking_trip' => 'string',
        'luxride_faq_context' => 'string',
        'luxride_question_ar' => 'string',
        'luxride_answer_ar' => 'string',
    ];

    foreach (['luxride_vehicle', 'luxride_destination', 'luxride_experience', 'luxride_faq'] as $post_type) {
        foreach ($meta_fields as $key => $type) {
            register_post_meta($post_type, $key, [
                'type' => $type,
                'single' => true,
                'show_in_rest' => true,
                'sanitize_callback' => 'luxride_sanitize_meta',
                'auth_callback' => fn() => current_user_can('edit_posts'),
            ]);
        }
    }
}

function luxride_register_cpt(string $type, string $single, string $plural, string $icon, array $supports): void
{
    register_post_type($type, [
        'labels' => [
            'name' => __($plural, 'luxride'),
            'singular_name' => __($single, 'luxride'),
            'add_new_item' => sprintf(__('Add New %s', 'luxride'), $single),
            'edit_item' => sprintf(__('Edit %s', 'luxride'), $single),
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'menu_icon' => $icon,
        'supports' => $supports,
        'capability_type' => 'post',
    ]);
}

function luxride_sanitize_meta(mixed $value, WP_REST_Request|array|string|null $request = null, string $param = ''): mixed
{
    if (is_bool($value)) {
        return $value;
    }

    if (is_numeric($value) && str_contains((string) $param, 'passengers')) {
        return absint($value);
    }

    if (is_numeric($value) && str_contains((string) $param, 'baggage')) {
        return absint($value);
    }

    if (is_numeric($value) && (
        str_contains((string) $param, 'price')
        || str_contains((string) $param, 'discount')
    )) {
        return (float) $value;
    }

    return sanitize_text_field((string) $value);
}
