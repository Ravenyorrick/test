# Adobe-themed document page

This repository contains a static, all-in-one Adobe-themed document page.

Open `index.html` in a browser to view the flow:

1. The page shows a blurred Request for Quote PDF preview in the background.
2. A foreground panel shows the PDF document name.
3. The loading state shows Adobe Viewer opening the document with a spinner and progress animation.
4. After the configured delay, the page shows that the latest Adobe app is not installed.
5. The download button uses the configured local PDF path.

To customize the displayed document name, local PDF path, or loading delay, edit the `page-config` JSON block near the bottom of `index.html`.

The page does not automatically download files or redirect users. Downloads require a user click.
