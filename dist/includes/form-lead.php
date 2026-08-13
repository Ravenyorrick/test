<?php
declare(strict_types=1);
/**
 * Shared contact / lead form partial.
 * @var string $formId unique DOM id prefix
 * @var bool $includeMessage
 * @var string $heading
 */
$formId = $formId ?? 'lead';
$includeMessage = $includeMessage ?? false;
$heading = $heading ?? 'Get More Info';
$csrfToken = $_SESSION['csrf_token'] ?? '';
?>
<section class="section section--form" id="lead-form">
    <div class="shell shell--narrow">
        <h2 class="section-title center"><?= e($heading) ?></h2>
        <form class="lead-form" action="<?= e(SITE_URL) ?>/forms/contact.php" method="post" novalidate data-validate="true">
            <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
            <input type="hidden" name="form_source" value="<?= e($formId) ?>">
            <!-- Honeypot -->
            <div class="hp-field" aria-hidden="true">
                <label for="<?= e($formId) ?>-company">Company</label>
                <input type="text" name="company" id="<?= e($formId) ?>-company" tabindex="-1" autocomplete="off">
            </div>

            <div class="form-row">
                <div class="form-col">
                    <label for="<?= e($formId) ?>-first-name">First Name</label>
                    <input type="text" id="<?= e($formId) ?>-first-name" name="first-name" maxlength="100" required placeholder="First Name" autocomplete="given-name">
                </div>
                <div class="form-col">
                    <label for="<?= e($formId) ?>-last-name">Last Name</label>
                    <input type="text" id="<?= e($formId) ?>-last-name" name="last-name" maxlength="100" required placeholder="Last Name" autocomplete="family-name">
                </div>
            </div>

            <div class="form-row">
                <div class="form-col">
                    <label for="<?= e($formId) ?>-email">Email</label>
                    <input type="email" id="<?= e($formId) ?>-email" name="email" maxlength="200" required placeholder="Email" autocomplete="email">
                </div>
            </div>

            <div class="form-row">
                <div class="form-col">
                    <label for="<?= e($formId) ?>-telephone">Phone</label>
                    <input type="tel" id="<?= e($formId) ?>-telephone" name="telephone" maxlength="40" placeholder="Phone" autocomplete="tel">
                </div>
                <div class="form-col">
                    <label for="<?= e($formId) ?>-zipcode">ZIP Code</label>
                    <input type="text" id="<?= e($formId) ?>-zipcode" name="zipcode" maxlength="20" placeholder="Zip Code" autocomplete="postal-code">
                </div>
            </div>

            <div class="form-row">
                <div class="form-col">
                    <label for="<?= e($formId) ?>-service">Choose a Service</label>
                    <select id="<?= e($formId) ?>-service" name="service" required>
                        <option value="">—Please choose an option—</option>
                        <option value="Electrical Service & Repair">Electrical Service &amp; Repair</option>
                        <option value="Security Cameras and Lighting">Security Cameras and Lighting</option>
                        <option value="Swimming Pool & Hot Tub Electrical">Swimming Pool &amp; Hot Tub Electrical</option>
                        <option value="Commercial Electrical Services">Commercial Electrical Services</option>
                        <option value="Generators">Generators</option>
                    </select>
                </div>
            </div>

            <?php if ($includeMessage): ?>
            <div class="form-row">
                <div class="form-col">
                    <label for="<?= e($formId) ?>-message">Message</label>
                    <textarea id="<?= e($formId) ?>-message" name="message" maxlength="5000" rows="5" placeholder="How can we help?"></textarea>
                </div>
            </div>
            <?php endif; ?>

            <div class="form-actions">
                <button type="submit" class="btn btn--primary">Submit</button>
            </div>
            <p class="form-status" role="status" aria-live="polite"></p>
        </form>
    </div>
</section>
