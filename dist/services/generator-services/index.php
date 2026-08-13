<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/includes/init.php';
$pageTitle = 'Generator Services Affton, MO | 10% Discount for Senior Citizens';
$pageDescription = 'Get dependable generator services in Affton, MO. Contact us at (314) 650-7696 for generator installation services, repair, and maintenance.';
$pageCanonical = page_url('/services/generator-services/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Generators';
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
        <h1>Ensure Uninterrupted Power with Our Generator Services in Affton, MO</h1>
        <p>Power outages can disrupt your daily life, leaving you without electricity when you need it most. Whether it's for your home or business, an unreliable generator can be frustrating and costly. At Innovet Electric Inc., in Affton, MO, we specialize in generator services, including generator installation, maintenance, and repair.</p>
        <img class="service-hero-img" src="<?= e(asset_url('images/Generators.webp')) ?>" alt="Generator services" loading="lazy" width="900" height="520">
        <h2>Keep Your Power Flowing with Our Generator Services</h2>
        <p>Generators are essential for maintaining power during an outage, but they need to be properly maintained and serviced. Our generator services include generator maintenance and repairs to keep your unit running efficiently. We install residential and commercial generators, and provide ongoing maintenance so your backup power is ready when you need it.</p>
        
        <h2>Don't Wait for an Outage, Ensure Your Generator is Ready</h2>
        <p>Don't wait for your generator to fail during a power outage. Connect with us for reliable generator services in Affton, MO. We offer generator maintenance and generator repair services to keep your system running at peak performance. Whether you're looking to install a new generator or service an existing one, our team is ready to help.</p>
        <div class="cta-band">
          <div>
            <h2>Get Electrical Help Now</h2>
            <p>Fast, reliable electrical services. Call now for repairs, upgrades, and installations.</p>
          </div>
          <a class="btn btn--light" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
        </div>
        <div class="discount-band">
          <h2>Get 10% Off Generator Services Today</h2>
          <p>Veterans and seniors save 10% on generator services, call us today.</p>
          <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call Now</a>
        </div>
      </article>
    </div>
  </div>
</section>
<?php require dirname(__DIR__, 2) . '/includes/footer.php'; ?>
