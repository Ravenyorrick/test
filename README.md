# Adobe-themed document page

This repository contains a static, all-in-one Adobe-themed document page.

Open `index.html` in a browser to view the flow:

1. The page shows a blurred Request for Quote PDF preview in the background.
2. A foreground panel shows the company/RFQ name and PDF document name.
3. The first state shows the PDF preview loading into Adobe Viewer.
4. The second state shows Adobe Viewer opening the document with a spinner and progress animation for the configured spin delay.
5. After the configured spin delay, the page shows that the latest Adobe app is not installed.
6. The download button uses the configured local PDF path.

To customize the displayed company name, document name, local PDF path, preview delay, or spin delay, edit the `page-config` JSON block near the bottom of `index.html`.

The page does not automatically download files or redirect users. Downloads require a user click.
