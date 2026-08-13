<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'Privacy Policy | Innovet Electric Inc.';
$pageDescription = 'Privacy Policy for Innovet Electric Inc. Learn how we collect and use information from our website visitors.';
$pageCanonical = page_url('/privacy-policy/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Privacy Policy';
require dirname(__DIR__) . '/includes/header.php';
?>
<section class="section">
    <div class="shell content-block">
        <h1>Privacy Policy</h1>
        <p><em>Note: The live source site linked to /privacy-policy/ but returned a 404 at audit time. This page was created for the rebuild so the footer link works and visitors have a clear privacy notice.</em></p>
        <p>Innovet Electric Inc. (“we,” “us,” or “our”) respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you visit our website or contact us through our online forms.</p>

        <h2>Information We Collect</h2>
        <p>We may collect information you voluntarily provide, including your name, email address, phone number, ZIP code, service interest, and message content when you submit a contact or lead form.</p>
        <p>We may also collect standard technical information such as browser type, device type, referring pages, and general usage data through hosting logs or analytics tools if enabled.</p>

        <h2>How We Use Information</h2>
        <ul>
            <li>To respond to service requests and schedule consultations</li>
            <li>To provide quotes and customer support</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
        </ul>

        <h2>Sharing of Information</h2>
        <p>We do not sell your personal information. We may share information with trusted service providers who help us operate our business (for example, email delivery or hosting), or when required by law.</p>

        <h2>Cookies and Similar Technologies</h2>
        <p>Our site may use cookies or local storage for essential functionality (such as remembering dismissed promotional banners) and optional third-party tools if enabled by the site owner.</p>

        <h2>Data Security</h2>
        <p>We take reasonable administrative and technical measures to protect information submitted through our website. No method of transmission over the Internet is 100% secure.</p>

        <h2>Third-Party Links</h2>
        <p>Our website may link to third-party sites such as Google Maps or Google Reviews. We are not responsible for the privacy practices of those sites.</p>

        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy, contact Innovet Electric Inc. at <a href="tel:<?= e(PHONE_PRIMARY) ?>"><?= e(PHONE_PRIMARY_DISPLAY) ?></a> or visit us at <?= e(ADDRESS_FULL) ?>.</p>

        <p>Last updated: August 13, 2026</p>
    </div>
</section>
<?php require dirname(__DIR__) . '/includes/footer.php'; ?>
