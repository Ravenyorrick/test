<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$navServices = [
    ['label' => 'Electrical Service & Repair', 'url' => '/services/electrical-services/'],
    ['label' => 'Security Cameras', 'url' => '/services/security-camera-services/'],
    ['label' => 'Pool & Hot Tub Electrical', 'url' => '/services/swimming-pool-electrician/'],
    ['label' => 'Commercial Electrical', 'url' => '/services/commercial-electrical-services/'],
    ['label' => 'Generators', 'url' => '/services/generator-services/'],
];

$navLocations = [
    ['label' => 'St. Louis, MO', 'url' => '/st-louis-mo/'],
    ['label' => 'Webster Groves, MO', 'url' => '/webster-groves-mo/'],
];

$pageTitle = $pageTitle ?? SITE_NAME;
$pageDescription = $pageDescription ?? 'Reliable electrical services in Affton, MO. Call ' . PHONE_MOBILE_DISPLAY . '.';
$pageCanonical = $pageCanonical ?? page_url('/');
$ogImage = $ogImage ?? asset_url('images/Innovet-Electric-Inc.-SEO-and-Site-Rep.webp');
$bodyClass = $bodyClass ?? '';
$showBreadcrumbHero = $showBreadcrumbHero ?? false;
$breadcrumbTitle = $breadcrumbTitle ?? '';
?>
<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?></title>
    <meta name="description" content="<?= e($pageDescription) ?>">
    <link rel="canonical" href="<?= e($pageCanonical) ?>">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= e($pageTitle) ?>">
    <meta property="og:description" content="<?= e($pageDescription) ?>">
    <meta property="og:url" content="<?= e($pageCanonical) ?>">
    <meta property="og:site_name" content="<?= e(SITE_NAME) ?>">
    <meta property="og:image" content="<?= e($ogImage) ?>">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="<?= e(asset_url('images/cropped-Innovet-Electric-Inc.-favicon-32x32.webp')) ?>" sizes="32x32">
    <link rel="apple-touch-icon" href="<?= e(asset_url('images/cropped-Innovet-Electric-Inc.-favicon-180x180.webp')) ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="<?= e(asset_url('css/main.css')) ?>?v=<?= e(ASSET_VERSION) ?>">
    <script type="application/ld+json">
    <?= json_encode([
        '@context' => 'https://schema.org',
        '@graph' => [
            [
                '@type' => 'Electrician',
                '@id' => SITE_URL . '/#organization',
                'name' => SITE_NAME,
                'url' => SITE_URL . '/',
                'telephone' => '+' . PHONE_PRIMARY,
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => '8301 Crest Industrial Dr',
                    'addressLocality' => 'Affton',
                    'addressRegion' => 'MO',
                    'postalCode' => '63123',
                    'addressCountry' => 'US',
                ],
                'image' => $ogImage,
                'priceRange' => '$$',
            ],
            [
                '@type' => 'WebPage',
                '@id' => $pageCanonical . '#webpage',
                'url' => $pageCanonical,
                'name' => $pageTitle,
                'description' => $pageDescription,
                'isPartOf' => ['@id' => SITE_URL . '/#website'],
            ],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?>
    </script>
</head>
<body class="<?= e($bodyClass) ?>">
<a class="skip-link" href="#main-content">Skip to content</a>

<header class="site-header" id="site-header">
    <div class="promo-bar" id="promo-bar" style="background-color:#1880b5;">
        <div class="shell">
            <div class="promo-bar__row">
                <button type="button" class="promo-bar__trigger" id="promo-toggle" aria-expanded="false">
                    <span class="promo-bar__text">10% Discount for Veterans &amp; Seniors</span>
                    <span class="promo-bar__more">See More <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></span>
                </button>
                <button type="button" class="promo-bar__close" id="promo-close" aria-label="Close promotion">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
            <div class="promo-bar__content" id="promo-content" hidden>
                <p>Get your electrical repairs, upgrades, and installations with a 10% discount for veterans and senior citizens. Take advantage of these special offers today for reliable and fast service.</p>
                <a class="btn btn--light" href="tel:<?= e(PHONE_PRIMARY) ?>">Call Now <i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i></a>
            </div>
        </div>
    </div>

    <div class="header-info">
        <div class="shell header-info__inner">
            <div class="header-info__call">
                <span class="header-info__label">Call for Electrical Service</span>
                <a href="tel:<?= e(PHONE_PRIMARY) ?>"><i class="fa-solid fa-phone" aria-hidden="true"></i> <?= e(PHONE_PRIMARY_DISPLAY) ?></a>
            </div>
            <div class="header-info__address">
                <a href="<?= e(MAPS_DIRECTIONS_URL) ?>" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-location-dot" aria-hidden="true"></i> <?= e(ADDRESS_LINE) ?>
                </a>
            </div>
            <div class="header-info__google">
                <a href="<?= e(GOOGLE_REVIEW_URL) ?>" target="_blank" rel="noopener noreferrer" aria-label="Google Reviews">
                    <img src="<?= e(asset_url('images/google.png')) ?>" alt="Google" width="28" height="28">
                </a>
            </div>
        </div>
    </div>

    <div class="header-nav">
        <div class="shell header-nav__inner">
            <a class="logo" href="<?= e(page_url('/')) ?>" aria-label="<?= e(SITE_NAME) ?> home">
                <img src="<?= e(asset_url('images/Innovet-Electric-Inc.webp')) ?>" alt="<?= e(SITE_NAME) ?>" width="200" height="66">
            </a>

            <nav class="desktop-nav" aria-label="Primary">
                <ul>
                    <li><a class="<?= is_active('/') ? 'is-active' : '' ?>" href="<?= e(page_url('/')) ?>">Home</a></li>
                    <li><a class="<?= is_active('/about') ? 'is-active' : '' ?>" href="<?= e(page_url('/about/')) ?>">Our Story</a></li>
                    <li class="has-dropdown">
                        <button type="button" class="nav-parent <?= str_starts_with(current_path(), '/services') ? 'is-active' : '' ?>" aria-expanded="false" aria-haspopup="true">Services <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
                        <ul class="dropdown">
                            <?php foreach ($navServices as $item): ?>
                                <li><a href="<?= e(page_url($item['url'])) ?>"><?= e($item['label']) ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    </li>
                    <li class="has-dropdown">
                        <button type="button" class="nav-parent <?= in_array(current_path(), ['/areas-we-serve','/st-louis-mo','/webster-groves-mo'], true) ? 'is-active' : '' ?>" aria-expanded="false" aria-haspopup="true">Service Locations <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
                        <ul class="dropdown">
                            <?php foreach ($navLocations as $item): ?>
                                <li><a href="<?= e(page_url($item['url'])) ?>"><?= e($item['label']) ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    </li>
                    <li><a class="<?= is_active('/gallery') ? 'is-active' : '' ?>" href="<?= e(page_url('/gallery/')) ?>">Portfolio</a></li>
                    <li><a class="<?= is_active('/contact') ? 'is-active' : '' ?>" href="<?= e(page_url('/contact/')) ?>">Contact</a></li>
                </ul>
            </nav>

            <a class="btn btn--outline header-cta" href="tel:<?= e(PHONE_PRIMARY) ?>">Call Now</a>

            <button type="button" class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>

    <div class="mobile-nav" id="mobile-nav" hidden>
        <div class="mobile-nav__panel">
            <button type="button" class="mobile-nav__close" id="mobile-nav-close" aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button>
            <ul>
                <li><a href="<?= e(page_url('/')) ?>">Home <i class="fa-solid fa-chevron-right"></i></a></li>
                <li><a href="<?= e(page_url('/about/')) ?>">Our Story <i class="fa-solid fa-chevron-right"></i></a></li>
                <li class="mobile-accordion">
                    <button type="button" aria-expanded="false">Services <i class="fa-solid fa-chevron-down"></i></button>
                    <ul>
                        <?php foreach ($navServices as $item): ?>
                            <li><a href="<?= e(page_url($item['url'])) ?>"><?= e($item['label']) ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </li>
                <li class="mobile-accordion">
                    <button type="button" aria-expanded="false">Service Locations <i class="fa-solid fa-chevron-down"></i></button>
                    <ul>
                        <?php foreach ($navLocations as $item): ?>
                            <li><a href="<?= e(page_url($item['url'])) ?>"><?= e($item['label']) ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </li>
                <li><a href="<?= e(page_url('/gallery/')) ?>">Portfolio <i class="fa-solid fa-chevron-right"></i></a></li>
                <li><a href="<?= e(page_url('/contact/')) ?>">Contact <i class="fa-solid fa-chevron-right"></i></a></li>
            </ul>
            <a class="btn btn--light mobile-call" href="tel:<?= e(PHONE_MOBILE) ?>"><?= e(PHONE_MOBILE_DISPLAY) ?> <i class="fa-solid fa-phone"></i></a>
        </div>
    </div>
</header>

<?php if ($showBreadcrumbHero): ?>
<section class="page-banner" style="background-image:url('<?= e(asset_url('images/Breadcrumb-all-pages-1.webp')) ?>')">
    <div class="shell">
        <p class="page-banner__title"><?= e($breadcrumbTitle) ?></p>
    </div>
</section>
<?php endif; ?>

<main id="main-content">
