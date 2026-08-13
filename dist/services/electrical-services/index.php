<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/includes/init.php';
$pageTitle = 'Electrical Services Affton, MO | 10% Discount for Veterans';
$pageDescription = 'Looking for electrical services in Affton, MO? Contact our team now at (314) 650-7696 for reliable repairs, upgrades, installations, and more.';
$pageCanonical = page_url('/services/electrical-services/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Electrical Service & Repair';
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
        <h1>Experience Hassle-Free Electrical Services in Affton, MO</h1>
        <p>Electrical issues can quickly disrupt daily life. From faulty wiring and outdated panels to unexpected repairs, these problems cause stress and safety concerns. As your local electrical contractor in Affton, MO, we provide reliable electrical services to resolve these issues. If you need GFCI outlet installation or electrical repair services, our team has the expertise to restore safety and functionality to your home or business. With our dependable solutions, you can enjoy a stress-free electrical system.</p>
        <img class="service-hero-img" src="<?= e(asset_url('images/Electrical-Service-Repair.webp')) ?>" alt="Electrical service and repair" loading="lazy" width="900" height="520">
        <h2>We've Got Your Electrical Service & Repair Covered</h2>
        <p>Our electrical services cover a wide range of solutions for both residential and commercial properties. From electrical repairs and maintenance to upgrades and inspections, we ensure your system runs efficiently. We offer services such as surge protection, breaker panels, and electrical panel upgrades to help keep your property safe. Whether it's GFCI outlet installation, code correction, or generator service, our team is equipped to handle it all.</p>
        <p>If you're dealing with outdated knob and tube wiring, we can help. This type of wiring poses serious fire risks and can break down over time. In addition to the repairs and upgrades, we also specialize in outdoor lighting and all types of wiring, ensuring your system is both safe and functional. Reach out for reliable and fast service tailored to your needs, and let us help you avoid costly hazards and disruptions.</p>
        <h2>Don't Risk Your Safety with Faulty Wiring – Call Now</h2>
        <p>Don't wait until electrical problems worsen. Reach out to Innovet Electric Inc., for prompt electrical services in Affton, MO. Our team offers solutions for electrical repair services, electrical maintenance services, and more. With over 30 years of experience, we ensure that your home or business stays powered safely and efficiently. Let us handle the stress of electrical issues so you can focus on what matters.</p>
        <div class="cta-band">
          <div>
            <h2>Get Electrical Help Now</h2>
            <p>Fast, reliable electrical services. Call now for repairs, upgrades, and installations.</p>
          </div>
          <a class="btn btn--light" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
        </div>
        <div class="discount-band">
          <h2>Get 10% Off Your Electrical Service Today</h2>
          <p>Veterans and senior citizens save 10% on electrical services. Act now.</p>
          <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call Now</a>
        </div>
      </article>
    </div>
  </div>
</section>
<?php require dirname(__DIR__, 2) . '/includes/footer.php'; ?>
