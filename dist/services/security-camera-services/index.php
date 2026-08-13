<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/includes/init.php';
$pageTitle = 'Security Camera Services Affton, MO | 10% Discount for Veterans';
$pageDescription = 'Avail of our reliable security camera services in Affton, MO. Call us at (314) 650-7696 for security camera installation, repair, and replacement.';
$pageCanonical = page_url('/services/security-camera-services/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Security Cameras';
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
        <h1>Protect What Matters Most with Security Camera Services in Affton, MO</h1>
        <p>Security issues can cause stress and concern for homeowners and businesses. From break-ins to theft, having a reliable security system is crucial. At Innovet Electric Inc. in Affton, MO, we specialize in security camera services that offer top-tier protection for your property. Whether you need security camera installation, repair, or replacement, our team delivers reliable solutions tailored to your needs.</p>
        <img class="service-hero-img" src="<?= e(asset_url('images/Security-Cameras.webp')) ?>" alt="Security cameras" loading="lazy" width="900" height="520">
        <h2>Secure Your Property with Our Security Cameras</h2>
        <p>Our security camera services provide more than just surveillance – they offer the tools to protect your property effectively. Whether it's CCTV installations, security camera replacement, or the installation of security cameras and safety lights, we ensure your home or business is secure. We also provide lighting services that work with your security system for complete coverage.</p>
        
        <h2>Don't Wait for a Break-In, Get Your Security Cameras Installed</h2>
        <p>Don't wait for a security threat to happen—get reliable security camera services in Affton, MO, today. At Innovet Electric Inc., we handle everything from security camera installation to security camera repair with precision and care. Whether you need a new system or your existing cameras repaired, our experienced team is ready to help.</p>
        <div class="cta-band">
          <div>
            <h2>Get Electrical Help Now</h2>
            <p>Fast, reliable electrical services. Call now for repairs, upgrades, and installations.</p>
          </div>
          <a class="btn btn--light" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
        </div>
        <div class="discount-band">
          <h2>Save 10% on Security Camera Installation Today</h2>
          <p>Get 10% off security camera installation for veterans and seniors.</p>
          <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call Now</a>
        </div>
      </article>
    </div>
  </div>
</section>
<?php require dirname(__DIR__, 2) . '/includes/footer.php'; ?>
