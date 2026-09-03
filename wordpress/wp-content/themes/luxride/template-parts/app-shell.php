<?php
/**
 * React application mount point.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<?php
$initial_copy = luxride_current_seo();
$initial_is_not_found = str_starts_with((string) ($initial_copy[0] ?? ''), 'Page Not Found');
?>
<style id="luxride-initial-shell-styles">
    .luxride-initial-seo { box-sizing: border-box; min-height: calc(100vh - 84px); padding: 72px max(24px, calc((100vw - 1180px) / 2)); background: #f7f4ee; color: #182230; font-family: Arial, sans-serif; }
    .luxride-initial-seo__inner { max-width: 720px; }
    .luxride-initial-seo__brand { display: inline-flex; align-items: center; min-height: 28px; margin-bottom: 28px; color: #009f43; font-size: 14px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .luxride-initial-seo__brand::before { content: ""; width: 32px; height: 2px; margin-right: 12px; background: #009f43; }
    .luxride-initial-seo h1 { max-width: 680px; margin: 0 0 16px; color: #182230; font-size: 4.5rem; line-height: 1.04; }
    .luxride-initial-seo p { max-width: 620px; margin: 0 0 28px; color: #657184; font-size: 18px; line-height: 1.7; }
    .luxride-initial-seo nav { display: flex; flex-wrap: wrap; gap: 12px 20px; }
    .luxride-initial-seo nav a { color: #008f3d; font-weight: 700; text-decoration: none; }
    .luxride-initial-seo__loading { width: 180px; height: 3px; margin-top: 42px; overflow: hidden; background: #dce8df; }
    .luxride-initial-seo__loading::after { content: ""; display: block; width: 40%; height: 100%; background: #009f43; animation: luxride-initial-progress 1.2s ease-in-out infinite; }
    @keyframes luxride-initial-progress { from { transform: translateX(-100%); } to { transform: translateX(350%); } }
    @media (prefers-reduced-motion: reduce) { .luxride-initial-seo__loading::after { animation: none; margin-left: 30%; } }
    @media (max-width: 700px) { .luxride-initial-seo { min-height: calc(100vh - 64px); padding: 48px 24px; } .luxride-initial-seo h1 { font-size: 2.25rem; } .luxride-initial-seo p { font-size: 16px; } }
</style>
<div id="root">
<?php if (!$initial_is_not_found) : ?>
    <main class="luxride-initial-seo" aria-label="LuxRide">
        <div class="luxride-initial-seo__inner">
            <div class="luxride-initial-seo__brand">LuxRide Taxi</div>
            <h1><?php echo esc_html($initial_copy[0]); ?></h1>
            <p><?php echo esc_html($initial_copy[1]); ?></p>
            <nav aria-label="LuxRide pages">
                <a href="<?php echo esc_url(home_url('/booking/')); ?>">Book a transfer</a>
                <a href="<?php echo esc_url(home_url('/destinations/')); ?>">Destinations</a>
                <a href="<?php echo esc_url(home_url('/fleet/')); ?>">Fleet</a>
                <a href="<?php echo esc_url(home_url('/faq/')); ?>">FAQ</a>
            </nav>
            <div class="luxride-initial-seo__loading" role="status" aria-label="Loading LuxRide"></div>
        </div>
    </main>
<?php endif; ?>
</div>
<noscript>
    <div style="padding:2rem;font-family:Arial,sans-serif">
        LuxRide requires JavaScript for the booking interface and bilingual navigation.
    </div>
</noscript>
