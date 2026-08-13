<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/includes/init.php';
$pageTitle = 'Commercial Electrical Services Affton, MO | 10% Discount for Veterans';
$pageDescription = 'Get commercial electrical services in Affton, MO. Call us at (314) 650-7696 for commercial lighting installation, troubleshooting, and more.';
$pageCanonical = page_url('/services/commercial-electrical-services/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Commercial Electrical';
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
        <h1>Efficient Commercial Electrical Services for Every Business in Affton, MO</h1>
        <p>Electrical issues in your business can cause significant disruptions, leading to downtime, lost revenue, and safety risks. Whether it's faulty wiring or inadequate lighting, these problems can affect both employees and customers. At Innovet Electric Inc., in Affton, MO, we specialize in commercial electrical services that keep your business running safely and efficiently.</p>
        <img class="service-hero-img" src="<?= e(asset_url('images/Commercial-Electrical.webp')) ?>" alt="Commercial electrical work" loading="lazy" width="900" height="520">
        <h2>Keep Your Business Running with Our Commercial Electrical Services</h2>
        <p>Our commercial electrical services are designed to address any issue, big or small. From commercial electrical troubleshooting to commercial lighting installation and commercial lighting installers, we ensure that your electrical systems meet the highest standards. We also provide receptacle circuits and related commercial electrical work tailored to your facility.</p>
        
        <h2>Don't Let Electrical Problems Interrupt Your Business</h2>
        <p>Don't let electrical problems impact your business. Whether you need commercial electrical troubleshooting, commercial lighting installation, or any other service, Innovet Electric Inc., in Affton, MO is here to help. Our team is ready to provide fast and effective service tailored to your commercial needs.</p>
        <div class="cta-band">
          <div>
            <h2>Get Electrical Help Now</h2>
            <p>Fast, reliable electrical services. Call now for repairs, upgrades, and installations.</p>
          </div>
          <a class="btn btn--light" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
        </div>
        <div class="discount-band">
          <h2>Enjoy 10% Off Your Commercial Electrical Services</h2>
          <p>Get 10% off commercial electrical services for veterans and seniors.</p>
          <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call Now</a>
        </div>
      </article>
    </div>
  </div>
</section>
<?php require dirname(__DIR__, 2) . '/includes/footer.php'; ?>
