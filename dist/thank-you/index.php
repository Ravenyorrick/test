<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'Thank You - Innovet Electric Inc.';
$pageDescription = 'Thank you for contacting Innovet Electric Inc. We will get back to you shortly.';
$pageCanonical = page_url('/thank-you/');
$showBreadcrumbHero = false;
require dirname(__DIR__) . '/includes/header.php';
?>
<section class="section">
    <div class="shell center" style="max-width:40rem;padding:4rem 0">
        <h1>Thank You</h1>
        <p>We’ve received your message. A member of the Innovet Electric Inc. team will follow up soon.</p>
        <p>Need immediate help? Call <a href="tel:<?= e(PHONE_MOBILE) ?>"><?= e(PHONE_MOBILE_DISPLAY) ?></a>.</p>
        <div class="btn-group" style="justify-content:center;margin-top:1.5rem">
            <a class="btn btn--primary" href="<?= e(page_url('/')) ?>">Back to Home</a>
            <a class="btn btn--outline" href="<?= e(page_url('/services/')) ?>">View Services</a>
        </div>
    </div>
</section>
<?php require dirname(__DIR__) . '/includes/footer.php'; ?>
