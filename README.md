# Adobe-themed document page

This repository contains a static, all-in-one Adobe-themed document page.

Open `index.html` in a browser to view the flow:

1. The page shows a blurred Request for Quote PDF preview in the background.
2. A centered Adobe Acrobat Reader loading state displays a spinner and progress bar.
3. After the configured loading delay, a compact Adobe-style dialog appears.
4. The dialog explains that the latest app is required and offers Download Adobe or Cancel.

To customize the displayed company name, document name, official download URL, or loading delay, edit the `page-config` JSON block near the bottom of `index.html`.

The page does not automatically download files or redirect users. The download link requires a user click.
