<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'Contact';
$pageDescription = 'Contact Innovet Electric Inc. in Affton, MO for exceptional electrical services. Call us now at (314) 650-7696 for quick assistance.';
$pageCanonical = page_url('/contact/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Contact';
require dirname(__DIR__) . '/includes/header.php';
$error = $_GET['error'] ?? '';
?>
<section class="section">
    <div class="shell">
        <h1 class="center">Let’s Solve Your Electrical Needs Together</h1>
        <?php if ($error): ?>
            <p class="center" style="color:var(--primary);font-weight:600">
                <?php if ($error === 'validation'): ?>Please check the required fields and try again.
                <?php elseif ($error === 'invalid_session'): ?>Your session expired. Please submit the form again.
                <?php elseif ($error === 'too_fast'): ?>Please wait a moment before submitting again.
                <?php else: ?>Something went wrong. Please call us at <?= e(PHONE_MOBILE_DISPLAY) ?>.
                <?php endif; ?>
            </p>
        <?php endif; ?>
        <div class="contact-split" style="margin-top:2rem">
            <div>
                <div class="hours-box">
                    <h3>Working Hours</h3>
                    <ul>
                        <li><?= e(HOURS_WEEKDAY) ?></li>
                        <li><?= e(HOURS_WEEKEND) ?></li>
                    </ul>
                    <p style="margin-top:1rem"><a href="tel:<?= e(PHONE_PRIMARY) ?>"><i class="fa-solid fa-phone"></i> <?= e(PHONE_PRIMARY_DISPLAY) ?></a></p>
                    <p><a href="<?= e(MAPS_DIRECTIONS_URL) ?>" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-location-dot"></i> <?= e(ADDRESS_LINE) ?></a></p>
                </div>
                <h2>Get in Touch for Reliable Electrical Services</h2>
                <p>Call us or send a message and our team will respond promptly.</p>
            </div>
            <div>
                <?php
                $formId = 'contact';
                $includeMessage = true;
                $heading = 'Contact Form';
                // Inline form without outer section chrome
                ?>
                <form class="lead-form" action="<?= e(SITE_URL) ?>/forms/contact.php" method="post" novalidate data-validate="true">
                    <input type="hidden" name="csrf_token" value="<?= e($_SESSION['csrf_token'] ?? '') ?>">
                    <input type="hidden" name="form_source" value="contact">
                    <div class="hp-field" aria-hidden="true">
                        <label for="contact-company">Company</label>
                        <input type="text" name="company" id="contact-company" tabindex="-1" autocomplete="off">
                    </div>
                    <div class="form-row">
                        <div class="form-col">
                            <label for="contact-first-name">First Name</label>
                            <input type="text" id="contact-first-name" name="first-name" maxlength="100" required placeholder="First Name" autocomplete="given-name">
                        </div>
                        <div class="form-col">
                            <label for="contact-last-name">Last Name</label>
                            <input type="text" id="contact-last-name" name="last-name" maxlength="100" required placeholder="Last Name" autocomplete="family-name">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-col">
                            <label for="contact-email">Email</label>
                            <input type="email" id="contact-email" name="email" maxlength="200" required placeholder="Email" autocomplete="email">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-col">
                            <label for="contact-telephone">Phone</label>
                            <input type="tel" id="contact-telephone" name="telephone" maxlength="40" placeholder="Phone" autocomplete="tel">
                        </div>
                        <div class="form-col">
                            <label for="contact-zipcode">ZIP Code</label>
                            <input type="text" id="contact-zipcode" name="zipcode" maxlength="20" placeholder="Zip Code" autocomplete="postal-code">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-col">
                            <label for="contact-service">Choose a Service</label>
                            <select id="contact-service" name="service" required>
                                <option value="">—Please choose an option—</option>
                                <option value="Electrical Service & Repair">Electrical Service &amp; Repair</option>
                                <option value="Security Cameras and Lighting">Security Cameras and Lighting</option>
                                <option value="Swimming Pool & Hot Tub Electrical">Swimming Pool &amp; Hot Tub Electrical</option>
                                <option value="Commercial Electrical Services">Commercial Electrical Services</option>
                                <option value="Generators">Generators</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-col">
                            <label for="contact-message">Message</label>
                            <textarea id="contact-message" name="message" maxlength="5000" rows="5" placeholder="How can we help?"></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn--primary">Submit</button>
                    </div>
                    <p class="form-status" role="status" aria-live="polite"></p>
                </form>
            </div>
        </div>
    </div>
</section>
<?php require dirname(__DIR__) . '/includes/footer.php'; ?>
