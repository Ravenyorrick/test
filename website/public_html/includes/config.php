<?php
/**
 * Innovet Electric Inc. — Site Configuration
 * Configure SITE_URL for your production domain before going live.
 * Do not commit real SMTP passwords. Use forms/config.php for mail settings.
 */

declare(strict_types=1);

// Production site URL (no trailing slash). Change this for your domain.
if (!defined('SITE_URL')) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // Allow override via environment or local config
    $envUrl = getenv('SITE_URL') ?: '';
    define('SITE_URL', $envUrl !== '' ? rtrim($envUrl, '/') : ($scheme . '://' . $host));
}

define('SITE_NAME', 'Innovet Electric Inc.');
define('SITE_SHORT_NAME', 'Innovet');
define('SITE_TAGLINE', 'Powering Your Needs with Precision and Care');

define('PHONE_PRIMARY', '3143539700');
define('PHONE_PRIMARY_DISPLAY', '(314) 353-9700');
define('PHONE_MOBILE', '3146507696');
define('PHONE_MOBILE_DISPLAY', '(314) 650-7696');

define('ADDRESS_LINE', '8301 Crest Industrial Dr Affton, MO');
define('ADDRESS_FULL', '8301 Crest Industrial Dr, Affton, MO 63123');
define('MAPS_PLACE_URL', 'https://www.google.com/maps/place/Innovet+Electric/@38.4707758,-90.3296366,10z/data=!4m6!3m5!1s0x87d8c92a078fc4e3:0x9cabac7d4e6632d4!8m2!3d38.563148!4d-90.330739!16s%2Fg%2F1tgf3rlv');
define('MAPS_DIRECTIONS_URL', 'https://www.google.com/maps/dir/?api=1&destination=8301+Crest+Industrial+Dr,+Affton,+MO+63123');
define('GOOGLE_REVIEW_URL', 'https://search.google.com/local/writereview?placeid=ChIJ48SPByrJ2IcR1DJmTn2sq5w');

define('HOURS_WEEKDAY', 'Mon - Fri: 8:00 AM - 5:00 PM');
define('HOURS_WEEKEND', 'Sat - Sun: Closed');

define('ASSET_VERSION', '1.0.0');

/** Base path helper for assets (works in subdirectories). */
function asset_url(string $path): string
{
    return SITE_URL . '/assets/' . ltrim($path, '/');
}

function page_url(string $path = '/'): string
{
    if ($path === '/' || $path === '') {
        return SITE_URL . '/';
    }
    return SITE_URL . '/' . trim($path, '/') . '/';
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function current_path(): string
{
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH) ?: '/';
    return rtrim($path, '/') ?: '/';
}

function is_active(string $path): bool
{
    $current = current_path();
    $check = rtrim($path, '/') ?: '/';
    if ($check === '/') {
        return $current === '/';
    }
    return $current === $check || str_starts_with($current, $check . '/');
}
