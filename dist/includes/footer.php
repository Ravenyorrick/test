<?php
declare(strict_types=1);
/** @var array $navServices */
?>
</main>

<footer class="site-footer">
    <div class="shell footer-top">
        <div class="footer-brand">
            <a href="<?= e(page_url('/')) ?>">
                <img src="<?= e(asset_url('images/Innovet-Electric-Inc.webp')) ?>" alt="<?= e(SITE_NAME) ?>" width="180" height="60">
            </a>
            <p class="footer-tag">License, Bonded, and Insured</p>
        </div>
        <div class="footer-services">
            <h3>Services</h3>
            <ul>
                <?php foreach ($navServices as $item): ?>
                    <li><a href="<?= e(page_url($item['url'])) ?>"><?= e($item['label']) ?></a></li>
                <?php endforeach; ?>
            </ul>
        </div>
        <div class="footer-contact">
            <h3>Get Electrical Help Now</h3>
            <p><a href="tel:<?= e(PHONE_PRIMARY) ?>"><?= e(PHONE_PRIMARY_DISPLAY) ?></a></p>
            <p><a href="<?= e(MAPS_DIRECTIONS_URL) ?>" target="_blank" rel="noopener noreferrer"><?= e(ADDRESS_LINE) ?></a></p>
            <a class="btn btn--outline" href="<?= e(page_url('/contact/')) ?>">Send Us a Message</a>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="shell footer-bottom__inner">
            <p>&copy;<?= date('Y') ?>, <?= e(SITE_NAME) ?>. All Rights Reserved.</p>
            <p><a href="<?= e(page_url('/privacy-policy/')) ?>">Privacy Policy</a></p>
        </div>
    </div>
</footer>

<button type="button" class="back-to-top" id="back-to-top" aria-label="Back to top" hidden>
    <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
</button>

<script src="<?= e(asset_url('js/main.js')) ?>?v=<?= e(ASSET_VERSION) ?>" defer></script>
</body>
</html>
