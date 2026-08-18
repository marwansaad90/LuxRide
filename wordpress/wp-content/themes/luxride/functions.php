<?php
/**
 * LuxRide custom theme bootstrap.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

define('LUXRIDE_THEME_VERSION', '0.1.0');
define('LUXRIDE_THEME_DIR', get_template_directory());
define('LUXRIDE_THEME_URI', get_template_directory_uri());

require_once LUXRIDE_THEME_DIR . '/inc/content-types.php';
require_once LUXRIDE_THEME_DIR . '/inc/routes.php';
require_once LUXRIDE_THEME_DIR . '/inc/seo.php';
require_once LUXRIDE_THEME_DIR . '/inc/settings.php';
require_once LUXRIDE_THEME_DIR . '/inc/seed-data.php';
require_once LUXRIDE_THEME_DIR . '/inc/content-bootstrap.php';

function luxride_is_public_html_request(): bool
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request() || is_feed() || is_robots() || is_trackback()) {
        return false;
    }

    if (defined('REST_REQUEST') && REST_REQUEST) {
        return false;
    }

    return true;
}

function luxride_send_revalidation_headers(): void
{
    if (!luxride_is_public_html_request()) {
        return;
    }

    header_remove('Expires');
    header('Cache-Control: no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: Wed, 11 Jan 1984 05:00:00 GMT');
}

add_action('template_redirect', function (): void {
    if (!luxride_is_public_html_request()) {
        return;
    }

    do_action('litespeed_control_set_nocache', 'LuxRide HTML contains bundle and CMS bootstrap data');
}, 0);

add_action('send_headers', 'luxride_send_revalidation_headers', 0);

add_action('after_setup_theme', function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['script', 'style', 'search-form', 'gallery', 'caption']);

    register_nav_menus([
        'primary' => __('Primary Navigation', 'luxride'),
        'footer' => __('Footer Navigation', 'luxride'),
    ]);
});

function luxride_first_asset(string $pattern): ?string
{
    $matches = glob(LUXRIDE_THEME_DIR . '/assets/' . $pattern);
    if (!$matches) {
        return null;
    }

    usort($matches, fn(string $a, string $b): int => filemtime($a) <=> filemtime($b));
    return basename((string) end($matches));
}

add_action('wp_enqueue_scripts', function (): void {
    wp_enqueue_style('luxride-theme', get_stylesheet_uri(), [], LUXRIDE_THEME_VERSION);

    $css = luxride_first_asset('index-*.css');
    if ($css) {
        wp_enqueue_style('luxride-app', LUXRIDE_THEME_URI . '/assets/' . $css, [], filemtime(LUXRIDE_THEME_DIR . '/assets/' . $css));
    }

    $js = luxride_first_asset('index-*.js');
    if ($js) {
        wp_enqueue_script('luxride-app', LUXRIDE_THEME_URI . '/assets/' . $js, [], filemtime(LUXRIDE_THEME_DIR . '/assets/' . $js), true);
    }
}, 20);

add_filter('script_loader_tag', function (string $tag, string $handle, string $src): string {
    if ('luxride-app' !== $handle) {
        return $tag;
    }

    return sprintf(
        '<script type="module" crossorigin src="%s" id="%s-js"></script>' . "\n",
        esc_url($src),
        esc_attr($handle)
    );
}, 10, 3);

add_filter('style_loader_tag', function (string $tag, string $handle, string $href): string {
    if ('luxride-app' !== $handle) {
        return $tag;
    }

    return sprintf(
        '<link rel="stylesheet" crossorigin href="%s" id="%s-css" media="all" />' . "\n",
        esc_url($href),
        esc_attr($handle)
    );
}, 10, 3);

add_action('wp_head', function (): void {
    $logo = luxride_first_asset('LuxRide-Logo-SVG-1-*.svg');
    if (!$logo) {
        return;
    }

    $icon_url = LUXRIDE_THEME_URI . '/assets/' . $logo;
    $version = (string) filemtime(LUXRIDE_THEME_DIR . '/assets/' . $logo);
    printf('<link rel="icon" type="image/svg+xml" href="%s" />' . "\n", esc_url(add_query_arg('v', $version, $icon_url)));
    printf('<link rel="shortcut icon" type="image/svg+xml" href="%s" />' . "\n", esc_url(add_query_arg('v', $version, $icon_url)));
    printf('<link rel="apple-touch-icon" href="%s" />' . "\n", esc_url(add_query_arg('v', $version, $icon_url)));
}, 5);

register_activation_hook(__FILE__, 'luxride_activate_theme');

add_action('after_switch_theme', 'luxride_activate_theme');

function luxride_activate_theme(): void
{
    luxride_register_content_types();
    luxride_ensure_pages();
    luxride_seed_default_options();
    luxride_ensure_seed_content();
    flush_rewrite_rules();
}
