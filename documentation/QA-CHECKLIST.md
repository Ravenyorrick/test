# QA Checklist — Innovet Electric Inc. Rebuild

Use this checklist on the production domain after cPanel upload.

## Pages

* [ ] Homepage `/`
* [ ] Our Story `/about/`
* [ ] Services `/services/`
* [ ] Electrical Service & Repair `/services/electrical-services/`
* [ ] Security Cameras `/services/security-camera-services/`
* [ ] Pool & Hot Tub Electrical `/services/swimming-pool-electrician/`
* [ ] Commercial Electrical `/services/commercial-electrical-services/`
* [ ] Generators `/services/generator-services/`
* [ ] Service Locations `/areas-we-serve/`
* [ ] St. Louis `/st-louis-mo/`
* [ ] Webster Groves `/webster-groves-mo/`
* [ ] Portfolio `/gallery/`
* [ ] Contact `/contact/`
* [ ] Privacy Policy `/privacy-policy/`
* [ ] Thank You `/thank-you/`
* [ ] 404 (visit a nonsense URL)
* [ ] Alias `/our-story/` → `/about/`
* [ ] Alias `/portfolio/` → `/gallery/`
* [ ] Alias `/service-locations/` → `/areas-we-serve/`

## Navigation

* [ ] Desktop menu links
* [ ] Desktop Services dropdown
* [ ] Desktop Service Locations dropdown
* [ ] Mobile menu opens
* [ ] Mobile menu closes
* [ ] Mobile Services accordion
* [ ] Mobile Service Locations accordion
* [ ] Footer service links
* [ ] Footer Privacy Policy
* [ ] Header Call Now (`tel:`)
* [ ] Promo bar See More / close

## Forms

* [ ] Required fields block empty submit
* [ ] Invalid email blocked
* [ ] Missing service blocked
* [ ] Valid submission → `/thank-you/`
* [ ] Success message / thank-you page loads
* [ ] Spam honeypot does not email
* [ ] `forms/config.php` destination email configured

## Phone / Map

* [ ] `(314) 353-9700` tel link
* [ ] `(314) 650-7696` tel link
* [ ] Address opens maps/directions
* [ ] Google review badge opens review URL

## Interactive

* [ ] Service carousel arrows (home)
* [ ] Reviews carousel arrows (home)
* [ ] Gallery lightbox open/close
* [ ] Back-to-top button
* [ ] Sticky header remains usable

## Responsive

* [ ] 320px
* [ ] 375px
* [ ] 390px
* [ ] 414px
* [ ] 768px
* [ ] 1024px
* [ ] 1280px
* [ ] 1440px
* [ ] 1920px
* [ ] No horizontal scroll
* [ ] Images scale
* [ ] Cards stack on mobile

## Technical

* [ ] `/robots.txt` returns live domain sitemap
* [ ] `/sitemap.xml` lists production URLs
* [ ] CSS loads
* [ ] JS loads
* [ ] No console errors for missing assets
* [ ] Direct URL refresh does not 404 on clean routes
* [ ] Browser back/forward works
