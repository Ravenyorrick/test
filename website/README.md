# Innovet Electric Inc. — cPanel Deployment Guide

This package is a **production-ready** rebuild of https://www.innovet.us/ for ordinary cPanel / Apache shared hosting.

**No Node.js, npm, Vite, React, Next.js, Python, or Docker is required on the server.**

---

## What’s in this package

Upload the contents of `public_html/` (or the ZIP root) into your hosting account’s `public_html/` directory.

Key pieces:

- PHP pages with clean URLs (`/about/`, `/services/…`, etc.)
- `.htaccess` for Apache clean URLs + security headers
- Local images under `assets/images/`
- Working contact form at `forms/contact.php`
- Configurable site URL (auto-detects current domain)

---

## Deploy to cPanel (step-by-step)

1. **Open cPanel** for your hosting account.
2. Open **File Manager**.
3. Open the **`public_html`** folder (or the document root for your domain/addon domain).
4. **Upload** `innovet-cpanel-ready.zip`.
5. **Extract** the ZIP inside `public_html`.
6. Confirm files are **directly** inside `public_html`:
   - You should see `index.php`, `.htaccess`, `assets/`, `forms/`, `about/`, etc.
   - You should **not** have `public_html/public_html/...` or an extra nested folder.
7. **Configure the form email** (see below).
8. **Enable SSL** in cPanel (AutoSSL / Let’s Encrypt). After SSL works, you may uncomment the HTTPS redirect lines in `.htaccess`.
9. Visit your domain: `https://YOURDOMAIN.com/`
10. **Test** Home, Services, Portfolio, Contact, mobile menu, phone links, and form submit.

---

## Configure the contact form

Edit:

`forms/config.php`

Set at minimum:

```php
'destination_email' => 'you@YOURDOMAIN.com',
'sender_email' => 'noreply@YOURDOMAIN.com',
```

Notes:

- `sender_email` should be an address on your domain (many hosts reject foreign From addresses).
- Until configured, submissions are appended to `forms/logs/submissions.log` (directory is web-blocked) and users still see Thank You.
- Optional SMTP settings are present but default to PHP `mail()`.

---

## Domain configuration

The site **does not hard-code** the old domain for links/canonicals.

- By default it uses the current host (`https://YOURDOMAIN.com`).
- Or set environment variable `SITE_URL=https://YOURDOMAIN.com` if your host supports it.
- `sitemap.xml` and `robots.txt` are served dynamically via `.htaccess` → `sitemap.php` / `robots.php` so they use the live domain.

---

## Clean URL aliases

These redirect to the original source paths:

| Alias | Destination |
|-------|-------------|
| `/our-story/` | `/about/` |
| `/portfolio/` | `/gallery/` |
| `/service-locations/` | `/areas-we-serve/` |
| `/electrical-service-repair/` | `/services/electrical-services/` |
| `/security-cameras/` | `/services/security-camera-services/` |
| `/pool-hot-tub-electrical/` | `/services/swimming-pool-electrician/` |
| `/commercial-electrical/` | `/services/commercial-electrical-services/` |
| `/generators/` | `/services/generator-services/` |

---

## PHP requirements

- PHP 8.0+ recommended (8.1/8.2/8.3 fine)
- `mail()` available **or** configure SMTP later
- Apache `mod_rewrite` enabled (standard on cPanel)

---

## Local preview (optional, developers only)

Not required for cPanel:

```bash
cd public_html
php -S 127.0.0.1:8080 router.php
```

`router.php` is only for local PHP built-in server. cPanel uses `.htaccess`.

---

## Documentation

Inside `documentation/`:

- `site-inventory.md` — full audit inventory
- `QA-CHECKLIST.md` — manual QA checklist
- `KNOWN-LIMITATIONS.md` — intentional differences / limits
- `FINAL-REPORT.md` — rebuild summary

---

## Support contacts (from source site)

- Phone: (314) 353-9700 / (314) 650-7696
- Address: 8301 Crest Industrial Dr, Affton, MO 63123
