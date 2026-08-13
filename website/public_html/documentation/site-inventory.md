# Innovet Electric Inc. — Site Inventory

**Source audited:** https://www.innovet.us/  
**Audit date:** 2026-08-13  
**Platform discovered:** WordPress + Rushmore V2 theme + Contact Form 7 + My Reviews + Podium chat  

## Summary

| Metric | Count |
|--------|------:|
| Public pages (HTTP 200) | 14 |
| Linked but 404 (Privacy Policy) | 1 |
| Service detail pages | 5 |
| Location landing pages | 2 |
| Forms (shared CF7 #539) | 1 form type on Home, Contact, About |
| Primary phone numbers | 2 |
| Gallery images | 3 |
| External integrations | Podium, Google Maps, Google Reviews, reCAPTCHA, Font Awesome, Google Fonts |

---

## Page Inventory

| Page | Original URL | New URL | Status | Forms | Interactive Elements |
|------|--------------|---------|--------|-------|----------------------|
| Home | https://www.innovet.us/ | `/` | Rebuilt | Contact form (Get More Info) | Promo bar, dropdowns, mobile menu, service carousel, reviews slider, tel/map links, Podium chat |
| Our Story | https://www.innovet.us/about/ | `/about/` | Rebuilt | Lead form (Ready to Get Our Services?) | Promo bar, dropdowns, mobile menu, values icons |
| Services | https://www.innovet.us/services/ | `/services/` | Rebuilt | None | Service cards, Learn More CTAs |
| Electrical Service & Repair | https://www.innovet.us/services/electrical-services/ | `/services/electrical-services/` | Rebuilt | None | Service sidebar nav, CTAs, discount banner |
| Security Cameras | https://www.innovet.us/services/security-camera-services/ | `/services/security-camera-services/` | Rebuilt | None | Service sidebar nav, CTAs, discount banner |
| Pool & Hot Tub Electrical | https://www.innovet.us/services/swimming-pool-electrician/ | `/services/swimming-pool-electrician/` | Rebuilt | None | Service sidebar nav, CTAs, discount banner |
| Commercial Electrical | https://www.innovet.us/services/commercial-electrical-services/ | `/services/commercial-electrical-services/` | Rebuilt | None | Service sidebar nav, CTAs, discount banner |
| Generators | https://www.innovet.us/services/generator-services/ | `/services/generator-services/` | Rebuilt | None | Service sidebar nav, CTAs, discount banner |
| Service Locations | https://www.innovet.us/areas-we-serve/ | `/areas-we-serve/` | Rebuilt | Contact form | Map image, CTAs |
| St. Louis, MO | https://www.innovet.us/st-louis-mo/ | `/st-louis-mo/` | Rebuilt | None | Service list, tips list, CTAs |
| Webster Groves, MO | https://www.innovet.us/webster-groves-mo/ | `/webster-groves-mo/` | Rebuilt | None | CTAs |
| Portfolio | https://www.innovet.us/gallery/ | `/gallery/` | Rebuilt | None | Gallery filter (All), lightbox |
| Contact | https://www.innovet.us/contact/ | `/contact/` | Rebuilt | Contact form + hours | Tel/map links, form validation |
| Thank You | https://www.innovet.us/thank-you/ | `/thank-you/` | Rebuilt | None | Post-submit confirmation |
| Privacy Policy | https://www.innovet.us/privacy-policy/ | `/privacy-policy/` | **Original 404** — recreated | None | Footer link target |
| 404 | Theme 404 | `/404.php` | Rebuilt | None | Nav back to Home |

**Note:** Clean URL aliases also provided where useful (`/our-story/` → `/about/`, `/portfolio/` → `/gallery/`, `/service-locations/` → `/areas-we-serve/`).

---

## Navigation Structure

### Desktop / Mobile primary nav
1. **Home** → `/`
2. **Our Story** → `/about/`
3. **Services** (dropdown)
   - Electrical Service & Repair → `/services/electrical-services/`
   - Security Cameras → `/services/security-camera-services/`
   - Pool & Hot Tub Electrical → `/services/swimming-pool-electrician/`
   - Commercial Electrical → `/services/commercial-electrical-services/`
   - Generators → `/services/generator-services/`
4. **Service Locations** (dropdown)
   - St. Louis, MO → `/st-louis-mo/`
   - Webster Groves, MO → `/webster-groves-mo/`
5. **Portfolio** → `/gallery/`
6. **Contact** → `/contact/`
7. **Call Now** CTA → `tel:3143539700` (header) / mobile uses `tel:3146507696`

### Promo top bar
- Text: “10% Discount for Veterans & Seniors”
- Expandable “See More” content + Call Now (`tel:3143539700`)
- Dismissible

### Header info bar
- Label: Call for Electrical Service
- Phone: `(314) 353-9700` → `tel:3143539700`
- Address: `8301 Crest Industrial Dr Affton, MO` → Google Maps directions
- Google badge link → Google write-a-review / place

### Footer
- Logo
- Services list (5 services)
- License, Bonded, and Insured
- Copyright ©2026 Innovet Electric Inc.
- Privacy Policy → `/privacy-policy/`

---

## Per-Page SEO (Source)

| Page | Title | Meta Description |
|------|-------|------------------|
| Home | Electrical Company Affton, MO \| 10% Discount for Veterans | Looking for a reliable electrical company in Affton, MO? Innovet Electric Inc. offers top-tier electrical services. Call us today at (314) 650-7696. |
| About | About | Learn more about our electrical services in Affton, MO. Call our team now at (314) 650-7696 for reliable, professional electrical solutions. |
| Services | Services | Explore top electrical services in Affton, MO. Contact our team at (314) 650-7696 for reliable electrical, security, and generator solutions. |
| Electrical | Electrical Services Affton, MO \| 10% Discount for Veterans | Looking for electrical services in Affton, MO? Contact our team now at (314) 650-7696 for reliable repairs, upgrades, installations, and more. |
| Security | Security Camera Services Affton, MO \| 10% Discount for Veterans | Avail of our reliable security camera services in Affton, MO. Call us at (314) 650-7696 for security camera installation, repair, and replacement. |
| Pool | Swimming Pool Electrician Affton, MO \| 10% Discount for Veterans | Get reliable swimming pool electrician services in Affton, MO. Call Innovet Electric Inc. at (314) 650-7696 for pool panel and heater installation. |
| Commercial | Commercial Electrical Services Affton, MO \| 10% Discount for Veterans | Get commercial electrical services in Affton, MO. Call us at (314) 650-7696 for commercial lighting installation, troubleshooting, and more. |
| Generators | Generator Services Affton, MO \| 10% Discount for Senior Citizens | Get dependable generator services in Affton, MO. Contact us at (314) 650-7696 for generator installation services, repair, and maintenance. |
| Areas | Areas We Serve | Explore the areas we serve in Affton, MO. Call Innovet Electric Inc., at (314) 650-7696 for reliable electrical services near you. |
| St. Louis | Electrical Company St. Louis, MO \| 10% Discount for Veterans | Trusted electrical company in St. Louis, MO with 30 years of experience. Contact Innovet Electric Inc. at (314) 650-7696. |
| Webster Groves | Electrical Services in Webster Groves, MO \| Innovet Electric Inc. | Professional electrical services in Webster Groves, MO. Innovet Electric Inc. provides panel upgrades, wiring, lighting, and more. |
| Gallery | Gallery | Browse our gallery to see our electrical work in Affton, MO. Call Innovet Electric Inc. at (314) 650-7696 for quality electrical services. |
| Contact | Contact | Contact Innovet Electric Inc. in Affton, MO for exceptional electrical services. Call us now at (314) 650-7696 for quick assistance. |
| Thank You | Thank You - Innovet Electric Inc. | (none on source) |
| Privacy | Page not found (source) | Recreated locally |

---

## Forms

### Contact / Lead Form (CF7 id 539)
Used on: Home (“Get More Info”), Contact, About (“Ready to Get Our Services?”), Areas We Serve

| Field | Name | Required | Type |
|-------|------|----------|------|
| First Name | first-name | Yes | text |
| Last Name | last-name | Yes | text |
| Email | email | Yes | email |
| Phone | telephone | No | tel |
| ZIP Code | zipcode | No | text |
| Choose a Service | menu-201 | Yes | select |
| Message | message | No* | textarea (Contact page) |
| Honeypot | _wpcf7_ak_hp_textarea | — | hidden spam field |

**Service options:**
- Electrical Service & Repair
- Security Cameras and Lighting
- Swimming Pool & Hot Tub Electrical
- Commercial Electrical Services
- Generators

**Source backend:** Contact Form 7 + reCAPTCHA v3 + Akismet + redirect plugin → `/thank-you/`  
**Rebuild backend:** `/forms/contact.php` (PHP mail) → redirect `/thank-you/`

---

## Phone / Email / Map Links

| Type | Value | Usage |
|------|-------|-------|
| tel | `3143539700` / (314) 353-9700 | Header info bar, promo Call Now |
| tel | `3146507696` / (314) 650-7696 | Body CTAs, mobile menu, SEO copy |
| mailto | (none publicly listed) | — |
| Maps | Google Maps place / directions for 8301 Crest Industrial Dr, Affton, MO 63123 | Address links |
| Reviews | Google write-a-review placeid `ChIJ48SPByrJ2IcR1DJmTn2sq5w` | Google badge |

---

## Interactive Elements Inventory

| Element | Location | Behavior |
|---------|----------|----------|
| Promo top bar expand/collapse | All pages | Toggle “See More” content |
| Promo top bar dismiss | All pages | Hide bar (session/local) |
| Desktop dropdown menus | Header | Hover/focus Services & Service Locations |
| Mobile hamburger menu | Header ≤1024px | Slide-over coral/red panel |
| Mobile submenu accordions | Mobile nav | Expand Services / Locations |
| Sticky header | All pages | Remains visible on scroll |
| Service carousel arrows | Home | Prev/next service cards |
| Reviews slider / dots | Home | Cycle Google review cards |
| Gallery filter “All” | Portfolio | Filter (single category on source) |
| Gallery lightbox | Portfolio | Open image overlay |
| Contact form validation | Home/Contact/About/Areas | Client + server validation |
| Form success redirect | After submit | `/thank-you/` |
| Podium “Text us” widget | All pages (source) | Third-party chat — optional/documented |
| Google floating badge | Desktop | Link to Google reviews |
| tel: / maps links | Throughout | Native protocol handlers |
| CTA buttons | Throughout | Navigate or tel: |

---

## Areas Served (Home list)

Affton, Kirkwood, Sunset Hills, Mehlville, Oakville, Crestwood, Arnold, Fenton, Ballwin, Clayton, Brentwood, Maplewood, Florissant (all MO)

---

## Fonts

| Role | Family | Source |
|------|--------|--------|
| Primary (headings) | Noto Serif (300–800) | Google Fonts (self-host or CDN) |
| Secondary (body/UI) | Noto Sans (400–700) | Google Fonts |
| Icons | Font Awesome 6.7.2 | Local subset / CDN |

---

## Brand Colors (from source `:root`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#bf4646` | Accents, review avatars, mobile menu |
| `--secondary` | `#bf4c4c` | Secondary red |
| `--third` | `#1c1489` | Deep accent |
| `--fourth` | `#000228` | Near-black text / masks |
| Promo bar | `#1880b5` | Top promotion background |
| CTA gold | `#BC915F` | Review CTA |
| Soft section bg | `#FBE8E7` / light pink | Alternating sections |
| Logo blue | ~`#0891B2` / `#1880b5` | Brand mark |

---

## Assets (key)

See `/assets/images/` — logos, hero, service cards, map, about photo, value SVGs, gallery photos, favicons, breadcrumb banner.

---

## External Dependencies (source)

- Google Fonts / Font Awesome
- Podium widget (`ORG_TOKEN` public widget id — do not treat as secret)
- Google reCAPTCHA v3 site key (public) — not copied into production secrets
- Jetpack stats
- Contact Form 7 / Ultimate Addons CF7 / WPCF7 Redirect
- Google Maps / Google Reviews

---

## Analytics / Structured Data

- Yoast SEO JSON-LD (Organization, WebSite, WebPage, BreadcrumbList) present on source
- Staging domain leaked in some OG/canonical references (`innovet.mystagingwebsite.com`) — corrected in rebuild to configurable `SITE_URL`
- Source homepage meta robots sometimes `noindex,nofollow` (staging artifact) — production rebuild uses indexable robots

---

## Hidden / Extra Public Pages

- `/thank-you/` — form confirmation (in sitemap)
- `/areas-we-serve/` — Service Locations landing (in sitemap; nav parent is `#`)
- `/privacy-policy/` — linked in footer but **404 on live source**
