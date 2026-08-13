<?php
declare(strict_types=1);
http_response_code(404);
require_once __DIR__ . '/includes/init.php';
$pageTitle = 'Page not found - Innovet Electric Inc.';
$pageDescription = 'The page you requested could not be found.';
$pageCanonical = page_url('/404.php');
$showBreadcrumbHero = false;
require __DIR__ . '/includes/header.php';
?>
<section class="section">
    <div class="shell center" style="max-width:40rem;padding:4rem 0">
        <h1>Not Found 404</h1>
        <p>Sorry, we couldn’t find that page. It may have been moved or the link may be incorrect.</p>
        <div class="btn-group" style="justify-content:center;margin-top:1.5rem">
            <a class="btn btn--primary" href="<?= e(page_url('/')) ?>">Back to Home</a>
            <a class="btn btn--outline" href="<?= e(page_url('/contact/')) ?>">Contact Us</a>
        </div>
    </div>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
