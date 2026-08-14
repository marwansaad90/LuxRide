<?php
/**
 * Theme document head.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?> dir="<?php echo esc_attr(is_rtl() ? 'rtl' : 'ltr'); ?>">
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#009933" />
    <?php wp_head(); ?>
</head>
<body <?php body_class('luxride-wordpress-theme'); ?>>
<?php wp_body_open(); ?>
