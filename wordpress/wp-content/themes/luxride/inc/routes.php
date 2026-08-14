<?php
/**
 * Public route helpers for the React-backed theme.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

function luxride_public_routes(): array
{
    return [
        '' => 'Home',
        'about' => 'About Us',
        'fleet' => 'Our Fleet',
        'destinations' => 'Destinations',
        'experiences' => 'Unforgettable Experiences',
        'booking' => 'Book Now',
        'faq' => 'FAQ',
        'contact' => 'Contact',
        'cancellation-policy' => 'Cancellation Policy',
        'privacy-policy' => 'Privacy Policy',
        'terms' => 'Terms and Conditions',
        'booking-success' => 'Booking Success',
        'booking-error' => 'Booking Error',
        'transfer-details' => 'Transfer Details',
        'last-minute' => 'Last Minute Transfers',
    ];
}

function luxride_ensure_pages(): void
{
    $front_page_id = 0;

    foreach (luxride_public_routes() as $slug => $title) {
        $existing = '' === $slug
            ? get_page_by_path('home', OBJECT, 'page')
            : get_page_by_path($slug, OBJECT, 'page');

        if ($existing instanceof WP_Post) {
            $page_id = (int) $existing->ID;

            if ('publish' !== $existing->post_status) {
                wp_update_post([
                    'ID' => $page_id,
                    'post_status' => 'publish',
                    'comment_status' => 'closed',
                    'ping_status' => 'closed',
                ]);
            }
        } else {
            $page_id = wp_insert_post([
                'post_type' => 'page',
                'post_status' => 'publish',
                'post_title' => $title,
                'post_name' => '' === $slug ? 'home' : $slug,
                'post_content' => '',
                'comment_status' => 'closed',
                'ping_status' => 'closed',
            ]);
        }

        if ('' === $slug && !is_wp_error($page_id)) {
            $front_page_id = (int) $page_id;
        }
    }

    if ($front_page_id > 0) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $front_page_id);
    }

    update_option('permalink_structure', '/%postname%/');
}

add_action('template_redirect', function (): void {
    $path = trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');

    if (in_array($path, ['featured-transfers', 'journeys'], true)) {
        wp_safe_redirect(home_url('/experiences/'), 301);
        exit;
    }
});
