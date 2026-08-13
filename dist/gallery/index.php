<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'Gallery';
$pageDescription = 'Browse our gallery to see our electrical work in Affton, MO. Call Innovet Electric Inc. at (314) 650-7696 for quality electrical services.';
$pageCanonical = page_url('/gallery/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Portfolio';
require dirname(__DIR__) . '/includes/header.php';

$gallery = [
    ['file' => 'POOL-scaled.jpg', 'alt' => 'POOL'],
    ['file' => '20240920_133021001-rotated.jpg', 'alt' => 'Electrical panel installation'],
    ['file' => '200-Amp-panel.jpg', 'alt' => '200 Amp panel'],
];
?>
<section class="section">
    <div class="shell">
        <h1 class="center section-title">See the Quality Electrical Work We’ve Done for Our Clients</h1>
        <div class="gallery-filters">
            <button type="button" class="filter-button-gal" data-filter="all" aria-pressed="true">All</button>
        </div>
        <div class="gallery-grid" id="galleryContainer">
            <?php foreach ($gallery as $item): ?>
                <button type="button" class="gallery-item" data-lightbox data-full="<?= e(asset_url('images/' . $item['file'])) ?>" data-alt="<?= e($item['alt']) ?>">
                    <img src="<?= e(asset_url('images/' . $item['file'])) ?>" alt="<?= e($item['alt']) ?>" loading="lazy" width="600" height="450">
                </button>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<div class="lightbox" id="lightbox" hidden>
    <button type="button" class="lightbox__close" id="lightbox-close" aria-label="Close image"><i class="fa-solid fa-xmark"></i></button>
    <img id="lightbox-img" src="" alt="">
</div>
<?php require dirname(__DIR__) . '/includes/footer.php'; ?>
