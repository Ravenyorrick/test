<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'Areas We Serve';
$pageDescription = 'Explore the areas we serve in Affton, MO. Call Innovet Electric Inc., at (314) 650-7696 for reliable electrical services near you.';
$pageCanonical = page_url('/areas-we-serve/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Service Locations';
require dirname(__DIR__) . '/includes/header.php';
?>
<section class="section">
    <div class="shell split">
        <div>
            <h1>Lighting Up Affton, MO and Beyond with Reliable Electrical Expertise</h1>
            <p>Explore how we light up Affton, MO, and surrounding areas with quality electrical services.</p>
            <ul class="areas-grid" style="margin-top:1.5rem">
                <?php foreach (['Affton, MO','Kirkwood, MO','Sunset Hills, MO','Mehlville, MO','Oakville, MO','Crestwood, MO','Arnold, MO','Fenton, MO','Ballwin, MO','Clayton, MO','Brentwood, MO','Maplewood, MO','Florissant, MO','St. Louis, MO','Webster Groves, MO'] as $city): ?>
                    <li><?= e($city) ?></li>
                <?php endforeach; ?>
            </ul>
            <div class="btn-group" style="margin-top:1.5rem">
                <a class="btn btn--outline" href="<?= e(page_url('/st-louis-mo/')) ?>">St. Louis, MO</a>
                <a class="btn btn--outline" href="<?= e(page_url('/webster-groves-mo/')) ?>">Webster Groves, MO</a>
            </div>
        </div>
        <div>
            <img src="<?= e(asset_url('images/MAP.webp')) ?>" alt="Service area map" width="1200" height="444" loading="lazy" style="border-radius:16px">
        </div>
    </div>
</section>

<section class="section section--soft">
    <div class="shell center">
        <h2>Ready to Power Your Home or Business? Contact Us Now</h2>
        <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
    </div>
</section>

<?php
$formId = 'areas';
$includeMessage = false;
$heading = 'Get More Info';
require dirname(__DIR__) . '/includes/form-lead.php';
require dirname(__DIR__) . '/includes/footer.php';
