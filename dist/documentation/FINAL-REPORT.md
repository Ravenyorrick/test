# Final Report — Innovet Electric Inc. cPanel Rebuild

**Source:** https://www.innovet.us/  
**Rebuild date:** 2026-08-13  
**Package:** `innovet-cpanel-ready.zip` (contents of `public_html/`)

## Counts

| Metric | Number |
|--------|-------:|
| Pages discovered (HTTP 200 on source) | 14 |
| Linked Privacy Policy on source (404) | 1 |
| Pages rebuilt (including Privacy + 404 + Thank You) | 16+ |
| URL aliases added | 8 |
| Image/SVG assets downloaded locally | 35 |
| Forms | 1 (shared lead/contact handler) |
| Form fields | 7 (+ honeypot + CSRF) |
| Interactive systems | Promo bar, desktop dropdowns, mobile nav/accordions, service carousel, reviews carousel, gallery lightbox, back-to-top, form validation |
| Internal routes checked (local) | 15+ pages + assets (0 broken) |
| External links preserved | Google Fonts, Font Awesome CDN, Google Maps, Google Reviews |
| Issues found during build/test | 2 major (mbstring crash; missing privacy page on source) |
| Issues fixed | 2 (+ SRI hardening, form config guard, logs protection) |

## What was rebuilt

- Full public information architecture from the live WordPress site
- Visual system based on source CSS variables (red/coral primary, blue promo bar, Noto Serif / Noto Sans)
- Shared PHP header/footer includes
- Clean Apache URLs via `.htaccess`
- Working PHP contact form with validation, CSRF, honeypot, rate limit
- SEO titles/descriptions/canonicals + JSON-LD
- Dynamic `robots.txt` / `sitemap.xml` using live domain
- Local assets (no hotlinking to innovet.us uploads)

## Form configuration

Edit `forms/config.php`:

1. Set `destination_email`
2. Set `sender_email` (same domain recommended)
3. Submit a test from `/contact/`
4. Confirm delivery (or check `forms/logs/submissions.log` if still using placeholder domain)

## cPanel deployment

See `/README.md` (package root) for the 10-step File Manager upload/extract/SSL/test flow.

**Important:** Extract ZIP contents **directly** into `public_html/` — do not nest another folder.

## Remaining limitations

See `KNOWN-LIMITATIONS.md` (Podium chat not embedded; CF7/reCAPTCHA replaced with PHP mail; privacy page newly authored because source 404’d).

## Automated tests performed (local PHP server)

- All primary pages return HTTP 200
- Unknown URL returns custom 404
- CSS/JS/images return 200
- Invalid form → `/contact/?error=validation`
- Valid form → `/thank-you/` and log write when email not configured
- Honeypot → thank-you without treating as normal lead path spam mail
- Titles + canonicals present on all primary pages
- Internal crawl reported 0 broken links/assets
