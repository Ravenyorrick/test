# Adobe-themed document page

This repository contains a static, all-in-one Adobe-themed document page.

Open `index.html` in a browser to view the flow:

1. The page shows a blurred Request for Quote PDF preview in the background.
2. A centered Adobe Acrobat Reader loading state displays a spinner and progress bar.
3. After the configured loading delay, a compact Adobe-style dialog appears.
4. The dialog explains that the latest app is required and offers Download Adobe or Cancel.
5. The Download Adobe button fetches the configured local PDF in the background and shows download status text without navigating away.

To customize the displayed company name, document name, logo path, local PDF file name/path, loading delay, or optional download-click notification endpoint, edit the `page-config` JSON block near the bottom of `index.html`.
The default logo is `adobe-logo.svg`; replace `logoPath` with the logo file you upload to the same directory.

The page does not automatically download files or redirect users. The download link requires a user click and is constrained to a configured PDF path.
If `notificationEndpoint` is set, the page sends a minimal click event to your own server-side endpoint. Do not put Telegram bot tokens or other secrets in this HTML file.
