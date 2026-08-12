# cPanel Deployment

1. Log into cPanel.
2. Open File Manager.
3. Open `public_html`.
4. Upload `cpanel-upload.zip` (from `dist/cpanel-upload.zip` after `npm run build`).
5. Extract the ZIP.
6. Make sure `index.html` is directly inside `public_html` (not inside a nested folder).
7. Confirm `.htaccess` is present in `public_html` (required for deep links / refresh).
8. Visit the domain.
9. Test the homepage.
10. Test several internal URLs (e.g. `/contact-us`, `/our-team`, `/fractional-leaders`).
11. Test the contact buttons (they open your email client via mailto).
12. Test mobile menu on a phone or browser device toolbar.

## Notes

- No Node.js is required on the server.
- Contact actions use mailto links (same as the original Wix site).
- If deep links 404 after refresh, ensure Apache `mod_rewrite` is enabled (standard on cPanel) and `.htaccess` was uploaded.

## Other folders in `public_html`

You can create other folders next to this site (for example `public_html/blog` or `public_html/staging`).

The included `.htaccess` is set up so:

- Real folders and files are **not** rewritten into the React app
- Visiting `/your-folder/` uses that folder instead of showing the site 404 page

Put an `index.html` (or other site files) inside the new folder.  
If the folder is empty, the browser may still show a server error — that is normal until you add files.
