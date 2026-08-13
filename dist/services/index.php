<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'Services';
$pageDescription = 'Explore top electrical services in Affton, MO. Contact our team at (314) 650-7696 for reliable electrical, security, and generator solutions.';
$pageCanonical = page_url('/services/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Services';
require dirname(__DIR__) . '/includes/header.php';

$services = [
    ['title' => 'Electrical Service & Repair', 'text' => 'Get reliable electrical services for your home or business, including repairs, maintenance, upgrades, and inspections. We handle circuit breakers, GFCI outlets, surge protection, and more.', 'img' => 'Electrical-Service-Repair-431x251.webp', 'url' => '/services/electrical-services/'],
    ['title' => 'Security Cameras', 'text' => 'Providing security camera services for installation, repair, and replacement. We offer safety solutions with lighting services, CCTV installations, and residential security camera setup.', 'img' => 'Security-Cameras-431x251.webp', 'url' => '/services/security-camera-services/'],
    ['title' => 'Pool & Hot Tub Electrical', 'text' => 'Professional swimming pool electrician services, including pool panel and sub-panel installation, trenching, and pool heater installation to ensure safe and efficient operation.', 'img' => 'Pool-Hot-Tub-Electrical-431x251.webp', 'url' => '/services/swimming-pool-electrician/'],
    ['title' => 'Commercial Electrical', 'text' => 'Reliable commercial electrical services, including troubleshooting, light installation, and receptacle circuits to keep your business running smoothly and safely.', 'img' => 'Commercial-Electrical-431x251.webp', 'url' => '/services/commercial-electrical-services/'],
    ['title' => 'Generators', 'text' => 'Providing generator services for both residential and commercial needs. We offer installation, maintenance, and repair to ensure your power backup is always ready when needed.', 'img' => 'Generators-431x251.webp', 'url' => '/services/generator-services/'],
];
?>
<section class="section">
    <div class="shell">
        <h1 class="center section-title">Our Electrical Services Keep You Powered and Safe</h1>
        <div class="service-grid">
            <?php foreach ($services as $svc): ?>
                <article class="service-card">
                    <img src="<?= e(asset_url('images/' . $svc['img'])) ?>" alt="<?= e($svc['title']) ?>" width="431" height="251" loading="lazy">
                    <div class="service-card__body">
                        <h2 style="font-size:1.2rem"><?= e($svc['title']) ?></h2>
                        <p><?= e($svc['text']) ?></p>
                        <a class="btn btn--outline" href="<?= e(page_url($svc['url'])) ?>">Learn More</a>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php require dirname(__DIR__) . '/includes/footer.php'; ?>
