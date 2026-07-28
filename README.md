# Adobe-themed document page

This repository contains a static, all-in-one Adobe-themed document page.

Open `index.html` in a browser to view the flow:

1. The page confirms that a document was received.
2. A loading state checks viewer compatibility.
3. The page recommends the latest Adobe Acrobat Reader and links to Adobe's official download page.

To customize the displayed document name and local PDF path, edit the `page-config` JSON block near the bottom of `index.html`.
By default, the page expects `Request-for-Quote.pdf` to exist in the same directory as `index.html`.

The page does not automatically download files. Downloads require a user click and use the configured local PDF path.
