<?php
/**
 * Server-rendered SEO defaults before the React app hydrates.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

function luxride_seo_routes(): array
{
    return [
        '/' => ['LuxRide Taxi | Private Transfers in Hurghada, Egypt', 'Book Hurghada private transfers, airport transfers, fixed-price Red Sea resort rides, and long-distance LuxRide Taxi service in modern air-conditioned vehicles.'],
        '/about' => ['About LuxRide Taxi | Private Transfers in Hurghada', 'Learn about LuxRide Taxi private transfer service for Hurghada, Red Sea resorts, airport pickups, and long-distance destinations across Egypt.'],
        '/fleet' => ['LuxRide Fleet | Private Transfer Vehicles in Hurghada', 'View LuxRide Taxi vehicles for private transfers in Hurghada, including Sedan, MPV, and Mini Van options matched to passenger and luggage needs.'],
        '/destinations' => ['Private Transfers from Hurghada | LuxRide Taxi', 'Explore fixed-price private transfers from Hurghada to the airport, El Gouna, Makadi Bay, Soma Bay, Luxor, Cairo, Aswan, Marsa Alam, and more.'],
        '/experiences' => ['Unforgettable Transfer Experiences | LuxRide Taxi', 'Browse selected LuxRide Taxi private transfer experiences and book a similar fixed-price transfer from Hurghada with route details prepared.'],
        '/booking' => ['Book a Private Transfer in Hurghada | LuxRide Taxi', 'Calculate and request your LuxRide Taxi private transfer with fixed pricing, route details, vehicle choice, and applicable airport or permit fees shown clearly.'],
        '/faq' => ['LuxRide Taxi FAQ | Hurghada Private Transfers', 'Answers about LuxRide Taxi booking, fixed prices, airport pickup, flight monitoring, travel permits, round trips, and cancellation policy.'],
        '/contact' => ['Contact LuxRide Taxi | Hurghada Transfers', 'Contact LuxRide Taxi for Hurghada private transfers by phone, WhatsApp, email, Facebook, Instagram, or Tripadvisor.'],
        '/cancellation-policy' => ['LuxRide Cancellation Policy | Private Transfers Hurghada', 'Review the LuxRide Taxi cancellation terms for private transfer bookings and experience start-time rules.'],
        '/privacy-policy' => ['LuxRide Privacy Policy | Hurghada Private Transfers', 'Read how LuxRide Taxi handles booking details, contact information, and private transfer request data.'],
        '/terms' => ['LuxRide Terms and Conditions | Private Transfers Hurghada', 'Review LuxRide Taxi terms for private transfers, booking requests, route pricing, airport pickup, permits, and customer responsibilities.'],
        '/booking-success' => ['Booking Confirmation | LuxRide Taxi', 'LuxRide Taxi booking confirmation and request details.'],
    ];
}

function luxride_current_path(): string
{
    $path = '/' . trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    return '/' === $path ? '/' : untrailingslashit($path);
}

function luxride_current_seo(): array
{
    $routes = luxride_seo_routes();
    return $routes[luxride_current_path()] ?? ['Page Not Found | LuxRide Taxi', 'The requested LuxRide Taxi page could not be found. Return to booking, destinations, experiences, or contact pages.'];
}

function luxride_aioseo_active(): bool
{
    if (defined('AIOSEO_VERSION') || class_exists('AIOSEO\\Plugin\\Common\\Main\\Main')) {
        return true;
    }

    $active_plugins = (array) get_option('active_plugins', []);
    foreach ($active_plugins as $plugin) {
        if (str_starts_with((string) $plugin, 'all-in-one-seo-pack/')) {
            return true;
        }
    }

    return false;
}

add_filter('pre_get_document_title', fn() => luxride_current_seo()[0], 20);

add_action('wp_head', function (): void {
    if (luxride_aioseo_active()) {
        return;
    }

    [$title, $description] = luxride_current_seo();
    $canonical = home_url(luxride_current_path());
    $image = LUXRIDE_THEME_URI . '/luxride-og-image.webp';
    $not_found = str_starts_with($title, 'Page Not Found');
    ?>
    <meta name="description" content="<?php echo esc_attr($description); ?>" />
    <meta name="robots" content="<?php echo $not_found ? 'noindex,follow' : 'index,follow'; ?>" />
    <link rel="canonical" href="<?php echo esc_url($canonical); ?>" />
    <meta property="og:title" content="<?php echo esc_attr($title); ?>" />
    <meta property="og:description" content="<?php echo esc_attr($description); ?>" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="<?php echo esc_url($canonical); ?>" />
    <meta property="og:image" content="<?php echo esc_url($image); ?>" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<?php echo esc_attr($title); ?>" />
    <meta name="twitter:description" content="<?php echo esc_attr($description); ?>" />
    <meta name="twitter:image" content="<?php echo esc_url($image); ?>" />
    <?php
}, 1);
