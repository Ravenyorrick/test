# Known Limitations

## Source Privacy Policy was 404

The live site footer linked to `/privacy-policy/`, but that URL returned **404** during the 2026-08-13 audit. A privacy policy page was created for the rebuild so the footer link works. It is a practical privacy notice for the rebuilt static/PHP site, not a verbatim copy of a missing source page.

## Podium “Text us” chat widget

The source site embeds Podium chat (`connect.podium.com`) with a public org token. The rebuild does **not** embed third-party chat by default to avoid unintended account coupling and tracking. Phone CTAs and the contact form remain the primary conversion paths. The widget can be re-added by the site owner if desired.

## Google reCAPTCHA / Akismet / Contact Form 7 backend

The source form posts to WordPress Contact Form 7 with reCAPTCHA v3 and Akismet. Those proprietary backends cannot be reproduced on plain cPanel without WordPress. The rebuild uses a secure PHP mail handler with CSRF, honeypot, rate limiting, and server-side validation. Destination email must be configured in `forms/config.php`.

## Staging domain artifacts on source

Some source meta tags referenced `innovet.mystagingwebsite.com` and occasional `noindex`. The rebuild uses the live host via `SITE_URL` and is indexable.

## St. Louis H1 typo on source

The live St. Louis page H1 rendered as “hoose a Trusted…”. The rebuild uses the corrected **“Choose a Trusted…”**.

## Fonts / icons CDN

Noto fonts (Google Fonts) and Font Awesome 6 are loaded from public CDNs for fidelity and size. They can be self-hosted later if desired; no build step is required.

## SMTP

Default mail transport is PHP `mail()`. SMTP credentials are optional in `forms/config.php` and should be filled by the host admin; a full SMTP client library was intentionally not bundled.

## Visual pixel parity

The rebuild matches the Rushmore-based structure, colors, typography, sections, and interactions of the source. Exact WordPress theme CSS/JS bundle behavior (every micro-animation) is approximated in vanilla CSS/JS rather than shipping the proprietary theme bundle.
