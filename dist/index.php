<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/init.php';

$pageTitle = 'Electrical Company Affton, MO | 10% Discount for Veterans';
$pageDescription = 'Looking for a reliable electrical company in Affton, MO? Innovet Electric Inc. offers top-tier electrical services. Call us today at (314) 650-7696.';
$pageCanonical = page_url('/');
$bodyClass = 'home';
require __DIR__ . '/includes/header.php';

$services = [
    [
        'title' => 'Electrical Service & Repair',
        'text' => 'Get reliable electrical services for your home or business, including repairs, maintenance, upgrades, and inspections. We handle circuit breakers, GFCI outlets, surge protection, and more.',
        'img' => 'Electrical-Service-Repair-431x251.webp',
        'url' => '/services/electrical-services/',
    ],
    [
        'title' => 'Security Cameras',
        'text' => 'Providing security camera services for installation, repair, and replacement. We offer safety solutions with lighting services, CCTV installations, and residential security camera setup.',
        'img' => 'Security-Cameras-431x251.webp',
        'url' => '/services/security-camera-services/',
    ],
    [
        'title' => 'Pool & Hot Tub Electrical',
        'text' => 'Professional swimming pool electrician services, including pool panel and sub-panel installation, trenching, and pool heater installation to ensure safe and efficient operation.',
        'img' => 'Pool-Hot-Tub-Electrical-431x251.webp',
        'url' => '/services/swimming-pool-electrician/',
    ],
    [
        'title' => 'Commercial Electrical',
        'text' => 'Reliable commercial electrical services, including troubleshooting, light installation, and receptacle circuits to keep your business running smoothly and safely.',
        'img' => 'Commercial-Electrical-431x251.webp',
        'url' => '/services/commercial-electrical-services/',
    ],
    [
        'title' => 'Generators',
        'text' => 'Providing generator services for both residential and commercial needs. We offer installation, maintenance, and repair to ensure your power backup is always ready when needed.',
        'img' => 'Generators-431x251.webp',
        'url' => '/services/generator-services/',
    ],
];

$cities = ['Affton, MO','Kirkwood, MO','Sunset Hills, MO','Mehlville, MO','Oakville, MO','Crestwood, MO','Arnold, MO','Fenton, MO','Ballwin, MO','Clayton, MO','Brentwood, MO','Maplewood, MO','Florissant, MO'];

$reviews = [
    ['name' => 'Erich Wassilak', 'text' => 'The crew at Innovet had been over at my place for smaller electrical fixes the last few years and done great work. So when I needed to replaced my AC and my entire electric panel I went directly to these guys. Great work at the right price. I didn’t get sold a bunch of potential upgrades like many places try to offer to increase the price.'],
    ['name' => 'Mary Cooper', 'text' => 'Always friendly, timely and clean! I have had many issues come up over the years and I can always count on them showing up and providing excellent service!'],
    ['name' => 'Tiffany S', 'text' => 'Great quality of work, good people.'],
    ['name' => 'Matt Rench', 'text' => 'I cannot say enough positive things about Innovet. We are in the process of putting our house on the market and an electrical issue popped up right before we are about to list, causing a bit of panic. I called Innovet and Charlie worked with me and was able to come out the next day to take a look at our issue. He walked me through what the problem was and was able to fix it very quickly. He was fast, thorough, professional, friendly and genuinely wanted to help us get our problem fixed. I highly recommend you use Charlie and his team at Innovet for your electrical needs.'],
    ['name' => 'Erin Milligan', 'text' => 'Charlie is always responsive to me when I need his help, which is often under emergent circumstances. Steve does great work and works efficiently. I can’t recommend Innovet enough, and I like supporting a veteran-owned company.'],
    ['name' => 'Stacey King', 'text' => 'Charlie and Josh were an absolute pleasure to work with! I needed to get a drip loop created for my power lines and they were not only reasonable, but just great to do business with. Thank you!'],
    ['name' => 'Katie Hughes', 'text' => 'Charlie and his team provide incomparable service and value! I’ve never met a contractor who is so responsive and caring about their customers. Recently a storm downed trees and pulled the meter box/electric service from my house. I called Charlie the next morning and he was on site to assess within a few hours. Charlie was able to send a crew the following day to complete the repairs- all new service, including circuit breaker box, ground, mast and meter box were required to bring the service up to code; the Innovet team had work complete and electric restored by mid afternoon. It’s easy to see Charlie takes pride in building relationships and providing high-quality service to his customers. I am very grateful we received such quick and honest service; it would have been a long, hot weekend if not for Charlie’s team coming to our rescue! Innovet will continue to be my first call for future electrical work!'],
    ['name' => 'Kevin Carter', 'text' => 'Charlie and Josh were incredible to work with. My wife and I were wanting some electrical work done in the house to accommodate medical equipment for our son. They were extremely professional and trustworthy from the get go, listening to the reasons behind why we were wanting to get the work done and providing honest feedback and explanations behind their suggestions. Highly recommend their service!'],
    ['name' => 'Ali Alshati', 'text' => 'Prompt, clean, professional, and honest. Getting bids and being your own contractor is a pain. These guys exceeded expectations are incredibly knowledgeable and worked with me to find the best solutions to a laundry list of issues my new home purchase had'],
    ['name' => 'Micheal Anne', 'text' => 'Fantastic installer! Honest and nice person! I got to work with it and I still continue to do so! Available quickly, installer with a lot of experience even in systems of a certain thickness! Prepared to solve problems very effectively! I recommend it to all those who need a technician capable of solving simple and complex problems!'],
    ['name' => 'Paul Schmidt', 'text' => 'I work with Steve on a regular basis for home remodeling work. Great guy , and top notch work. He is easy to get along with and great to work with to accomplish the projects needs. Always keeping in touch and making things run smoothy!! No matter what the demands are, Innovet ALWAYS comes through'],
    ['name' => 'Hermonator4', 'text' => 'Great Customer Service, caring and knowledgeable. Thanks Charlie!'],
];
?>

<section class="hero" style="background-image:url('<?= e(asset_url('images/homepage.webp')) ?>')">
    <div class="hero__inner">
        <h1 class="hero-title"><span class="accent">Powering Your Needs</span> with Precision and Care</h1>
        <p>Reliable electrical services for homes and businesses, ensuring safety and efficiency every time.</p>
        <div class="btn-group" style="justify-content:center">
            <a class="btn" href="<?= e(page_url('/contact/')) ?>"><i class="fa-solid fa-phone" aria-hidden="true"></i> Send Us a Message</a>
            <a class="btn" href="<?= e(page_url('/gallery/')) ?>"><i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i> View Our Work</a>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell split">
        <div>
            <h2>Your Trusted Electrical Company in Affton, MO</h2>
            <p>Electrical issues disrupt daily life. At Innovet Electric Inc., in Affton, MO, we offer reliable solutions for residential and commercial needs, with 30+ years of experience in repairs, installations, and more—earning industry praise for quality.</p>
            <a class="btn btn--outline" href="<?= e(page_url('/about/')) ?>">Our Background</a>
        </div>
        <div>
            <img src="<?= e(asset_url('images/homepage-image-square.webp')) ?>" alt="Electrical panel work by Innovet Electric" width="732" height="800" loading="lazy">
        </div>
    </div>
</section>

<section class="section section--soft">
    <div class="shell">
        <h2 class="center">Committed to Quality and Reliability</h2>
        <p class="center" style="max-width:48rem;margin-inline:auto">We’ve built our reputation on offering consistent, high-quality electrical services to homes and businesses. As a Certified Combat Service Disabled Veteran Owned Business, we understand the frustrations that come with electrical issues, and we work hard to fix them right the first time. Our founder, a Vietnam War veteran, brings dedication and discipline to every job. Customers appreciate our clear communication and punctual service, which sets us apart from the competition.</p>
    </div>
</section>

<section class="section">
    <div class="shell split split--reverse">
        <div>
            <img src="<?= e(asset_url('images/Electrical-Service-Repair.webp')) ?>" alt="Electrical repairs and installations" width="900" height="520" loading="lazy">
        </div>
        <div class="card-panel">
            <h2>Top-Quality Electrical Solutions Tailored to Your Needs</h2>
            <p class="prose">We stand out for our commitment to quality and our thorough approach to every job. Our team provides top-notch <a href="<?= e(page_url('/services/electrical-services/')) ?>">electrical repairs</a>, <a href="<?= e(page_url('/services/security-camera-services/')) ?>">security camera installations</a>, <a href="<?= e(page_url('/services/generator-services/')) ?>">generator services</a>, and more. From <a href="<?= e(page_url('/services/swimming-pool-electrician/')) ?>">pool and hot tub electrical</a> to <a href="<?= e(page_url('/services/commercial-electrical-services/')) ?>">commercial electrical services</a>, we offer everything needed to keep your home or business running smoothly.</p>
            <a class="btn btn--outline" href="<?= e(page_url('/contact/')) ?>">Contact Our Electricians</a>
        </div>
    </div>
</section>

<section class="section section--beige">
    <div class="shell">
        <div class="services-head">
            <h2 class="section-title" style="margin:0">Explore Our Electrical Services</h2>
            <div class="carousel-nav">
                <button type="button" id="services-prev" aria-label="Previous services"><i class="fa-solid fa-arrow-left"></i></button>
                <button type="button" id="services-next" class="is-next" aria-label="Next services"><i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
        <div class="services-track" id="services-track">
            <?php foreach ($services as $svc): ?>
                <article class="service-card">
                    <img src="<?= e(asset_url('images/' . $svc['img'])) ?>" alt="<?= e($svc['title']) ?>" width="431" height="251" loading="lazy">
                    <div class="service-card__body">
                        <h3><?= e($svc['title']) ?></h3>
                        <p><?= e($svc['text']) ?></p>
                        <a class="btn btn--outline" href="<?= e(page_url($svc['url'])) ?>">Learn More</a>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell center" style="max-width:48rem">
        <h2>Get Your Electrical Needs Taken Care of Today</h2>
        <p>Looking for a trusted electrical company in Affton, MO? Our team at Innovet Electric Inc. delivers reliable electrical services to residential and commercial clients.</p>
        <p>When you choose us at Innovet Electric Inc., you can expect prompt, professional service backed by over 30 years of experience. We take pride in our reputation for delivering quality work that meets the highest standards. As a licensed, bonded, and insured company, we’re here to handle all your electrical needs. Don’t wait for problems to escalate, reach out today to schedule a consultation or request service. Call us at <a href="tel:<?= e(PHONE_MOBILE) ?>"><?= e(PHONE_MOBILE_DISPLAY) ?></a> to get started.</p>
        <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call Now</a>
    </div>
</section>

<section class="section section--soft">
    <div class="shell center">
        <h2>Save 10% on Electrical Services Today</h2>
        <p>Veterans and seniors get 10% off all services. Call us now.</p>
        <a class="btn btn--primary" href="tel:<?= e(PHONE_MOBILE) ?>">Call <?= e(PHONE_MOBILE_DISPLAY) ?></a>
    </div>
</section>

<section class="section">
    <div class="shell split">
        <div>
            <h2>Bringing Electrical Expertise to Your Area</h2>
            <p>See how our services meet the needs of homes and businesses in Affton, MO, and surrounding areas.</p>
            <h3 style="margin-top:1.5rem">Areas We Serve</h3>
            <ul class="areas-grid">
                <?php foreach ($cities as $city): ?>
                    <li><?= e($city) ?></li>
                <?php endforeach; ?>
            </ul>
            <div class="btn-group" style="margin-top:1.5rem">
                <a class="btn btn--outline" href="<?= e(page_url('/st-louis-mo/')) ?>">St. Louis, MO</a>
                <a class="btn btn--outline" href="<?= e(page_url('/webster-groves-mo/')) ?>">Webster Groves, MO</a>
            </div>
        </div>
        <div>
            <a href="<?= e(MAPS_PLACE_URL) ?>" target="_blank" rel="noopener noreferrer">
                <img src="<?= e(asset_url('images/MAP-square.webp')) ?>" alt="Map of Innovet Electric service area" width="732" height="800" loading="lazy">
            </a>
        </div>
    </div>
</section>

<section class="section section--beige">
    <div class="shell">
        <div class="services-head">
            <h2 class="section-title" style="margin:0">See What Our Clients Think</h2>
            <div class="carousel-nav">
                <button type="button" id="reviews-prev" aria-label="Previous reviews"><i class="fa-solid fa-arrow-left"></i></button>
                <button type="button" id="reviews-next" class="is-next" aria-label="Next reviews"><i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
        <div class="reviews-track" id="reviews-track">
            <?php foreach ($reviews as $review): ?>
                <article class="review-card">
                    <div class="review-card__top">
                        <div class="review-avatar" aria-hidden="true"><?= e(substr($review['name'], 0, 1)) ?></div>
                        <div>
                            <h3><?= e($review['name']) ?></h3>
                            <div class="stars" aria-label="5 star rating">★★★★★</div>
                        </div>
                    </div>
                    <p><?= e($review['text']) ?></p>
                    <div class="review-source">Google Reviews</div>
                </article>
            <?php endforeach; ?>
        </div>
        <p class="center" style="margin-top:1.25rem">
            <a class="btn btn--outline" href="<?= e(GOOGLE_REVIEW_URL) ?>" target="_blank" rel="noopener noreferrer">Read More on Google</a>
        </p>
    </div>
</section>

<?php
$formId = 'home';
$includeMessage = false;
$heading = 'Get More Info';
require __DIR__ . '/includes/form-lead.php';
require __DIR__ . '/includes/footer.php';
