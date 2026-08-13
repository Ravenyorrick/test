<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/includes/init.php';
$pageTitle = 'Swimming Pool Electrician Affton, MO | 10% Discount for Veterans';
$pageDescription = 'Get reliable swimming pool electrician services in Affton, MO. Call Innovet Electric Inc. at (314) 650-7696 for pool panel and heater installation.';
$pageCanonical = page_url('/services/swimming-pool-electrician/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Pool & Hot Tub Electrical';
require dirname(__DIR__, 2) . '/includes/header.php';
?>
<section class="section">
  <div class="shell">
    <div class="service-layout">

        <aside class="service-side">
            <h3>Services</h3>
            <a href="<?= e(page_url('/services/electrical-services/')) ?>" class="<?= is_active('/services/electrical-services') ? 'is-active' : '' ?>">Electrical Service &amp; Repair</a>
            <a href="<?= e(page_url('/services/security-camera-services/')) ?>" class="<?= is_active('/services/security-camera-services') ? 'is-active' : '' ?>">Security Cameras</a>
            <a href="<?= e(page_url('/services/swimming-pool-electrician/')) ?>" class="<?= is_active('/services/swimming-pool-electrician') ? 'is-active' : '' ?>">Pool &amp; Hot Tub Electrical</a>
            <a href="<?= e(page_url('/services/commercial-electrical-services/')) ?>" class="<?= is_active('/services/commercial-electrical-services') ? 'is-active' : '' ?>">Commercial Electrical</a>
            <a href="<?= e(page_url('/services/generator-services/')) ?>" class="<?= is_active('/services/generator-services') ? 'is-active' : '' ?>">Generators</a>
        </aside>

      <article class="content-block prose">
        <h1>Reliable Swimming Pool Electrician for All Your Pool Wiring Needs in Affton, MO</h1>
        <p>Electrical issues with your pool or hot tub can disrupt your leisure time and lead to unexpected costs. From faulty wiring to outdated pool systems, these problems create stress and safety concerns. At Innovet Electric Inc., in Affton, MO, we specialize in swimming pool electrician services, including pool panel installation, trenching, and pool heater installation.</p>
        <img class="service-hero-img" src="<?= e(asset_url('images/Pool-Hot-Tub-Electrical.webp')) ?>" alt="Pool and hot tub electrical" loading="lazy" width="900" height="520">
        <h2>Trust Us for All Your Pool & Hot Tub Electrical Needs</h2>
        <p>Whether you need a hot tub electrician or help with pool electrical service, we're here to resolve your pool electrical issues. We install panels and sub-panels, as well as provide trenching services to lay down wiring for your pool system. Our team also installs pool heating systems to ensure your pool is ready for use whenever you need it.</p>
        
        <h2>Don't Wait for Electrical Problems to Ruin Your Pool Time</h2>
        <p>Don't let electrical problems with your pool or hot tub keep you from enjoying them. Innovet Electric Inc., offers dependable swimming pool electrician services in Affton, MO, including pool panel installation and pool heater installation. Whether it's a new installation, repairs, or upgrades, our team is ready to help.</p>
        <div class="cta-band">
          <div>
            <h2>Get Electrical Help Now</h2>
            <p>Fast, reliable electrical services. Call now for repairs, upgrades, and installations.</p>
          </div>
          <a class="btn btn--light" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
        </div>
        <div class="discount-band">
          <h2>Claim 10% Off for Our Pool Electrical Service</h2>
          <p>Veterans and seniors save 10% on pool electrical services, book now.</p>
          <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call Now</a>
        </div>
      </article>
    </div>
  </div>
</section>
<?php require dirname(__DIR__, 2) . '/includes/footer.php'; ?>
