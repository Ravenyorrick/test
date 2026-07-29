# Document viewer

Open `index.html` in a browser to show the loading screen.

After the loading screen:

- Phones, tablets, Macs, and other non-Windows devices open the configured
  `redirectUrl`.
- Windows devices are shown a PDF download button.

To change the website opened on phones and Macs, edit the `redirectUrl` value in
the `page-config` JSON block near the bottom of `index.html`.

The default loading delay is 15 seconds and can be changed with
`loadingDelayMs`.

The Windows download button only supports PDF files. Update `downloadFileName`
and `downloadPath` to point to your PDF.
