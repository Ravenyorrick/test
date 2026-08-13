<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/init.php';
$pageTitle = 'About';
$pageDescription = 'Learn more about our electrical services in Affton, MO. Call our team now at (314) 650-7696 for reliable, professional electrical solutions.';
$pageCanonical = page_url('/about/');
$showBreadcrumbHero = true;
$breadcrumbTitle = 'Our Story';
require dirname(__DIR__) . '/includes/header.php';

$values = [
    ['title' => 'Reliability', 'img' => 'Reliability.svg', 'text' => 'We pride ourselves on being a reliable partner for all your electrical needs. Our team is dedicated to delivering consistent, high-quality service every time, ensuring that we meet deadlines, exceed expectations, and keep your electrical systems running smoothly.'],
    ['title' => 'Integrity', 'img' => 'integrity.svg', 'text' => 'Integrity is at the core of everything we do. We believe in being honest and transparent with our clients, offering fair solutions, and only recommending what’s necessary for the job. You can trust us to provide accurate assessments and honest pricing.'],
    ['title' => 'Fair Pricing', 'img' => 'Fair-price-1.svg', 'text' => 'We believe in offering fair and competitive pricing without compromising on quality. Our goal is to provide affordable solutions tailored to your needs, ensuring that you get the best value for your investment in our services.'],
    ['title' => 'Professionalism Backed by Experience', 'img' => 'Professionalism.svg', 'text' => 'With over 30 years of experience, our team brings professionalism to every project. We use our extensive knowledge and expertise to tackle even the most complex electrical challenges, providing top-notch service and lasting solutions for our clients.'],
    ['title' => 'Honesty', 'img' => 'Honesty.svg', 'text' => 'Honesty is fundamental to building strong, lasting relationships with our clients. We provide clear, straightforward communication at every step of the process, ensuring you’re fully informed and confident in the services we provide.'],
];
?>
<section class="section">
    <div class="shell split">
        <div class="content-block">
            <h1>Building Trust Through Quality Electrical Work and Service</h1>
            <p>We’ve built a strong reputation in the electrical industry with over 30 years of experience serving residential and commercial clients in Affton, MO. As a Certified Combat Service Disabled Veteran Owned Business, our founder, a Vietnam War veteran, brings dedication and discipline to every job.</p>
            <p>Our commitment to excellence is at the heart of everything we do, with inspectors calling our work the best they’ve seen. As a licensed, bonded, and insured electrical company, we deliver reliable electrical services with personalized care, ensuring our clients’ needs are met with precision and reliability.</p>
        </div>
        <div>
            <img src="<?= e(asset_url('images/Charlie-1.jpg')) ?>" alt="Charlie of Innovet Electric Inc." width="640" height="598" loading="lazy" style="border-radius:16px">
        </div>
    </div>
</section>

<section class="section section--soft">
    <div class="shell">
        <h2 class="center">Driven by Integrity and Excellence in Electrical Services</h2>
        <p class="center" style="max-width:46rem;margin-inline:auto">At our core, we value reliability, integrity, fair pricing, and professionalism backed by experience. With over 30 years in the electrical industry, we prioritize honesty in every interaction, offering transparent, affordable solutions that meet your needs and deliver lasting quality.</p>
        <div class="values-grid">
            <?php foreach ($values as $value): ?>
                <article class="value-card">
                    <img src="<?= e(asset_url('images/' . $value['img'])) ?>" alt="" width="72" height="72" loading="lazy">
                    <h3><?= e($value['title']) ?></h3>
                    <p><?= e($value['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php
$formId = 'about';
$includeMessage = false;
$heading = 'Ready to Get Our Services?';
require dirname(__DIR__) . '/includes/form-lead.php';
require dirname(__DIR__) . '/includes/footer.php';
