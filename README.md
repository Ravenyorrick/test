# Apollo Lead Extractor

A production-oriented Electron desktop application for extracting leads from Apollo People Search pages with a dynamic DOM/URL parser, live dashboard, crash recovery, de-duplication, and CSV/Excel/JSON/SQLite exports.

## Step-by-step setup

### 1. Download the app

Download the latest ZIP from this branch:

https://github.com/Ravenyorrick/test/archive/refs/heads/cursor/apollo-lead-extractor-f199.zip

Unzip it, then open a terminal inside the unzipped folder.

### 2. Install Node.js

Install Node.js `22.22` or newer.

Check your version:

```bash
node --version
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the desktop app

```bash
npm run dev
```

The Electron desktop window should open automatically.

### 5. Configure extraction mode

In the app:

1. Open **Settings**.
2. Choose **API mode** or **Browser mode**.
3. Return to **Extraction**.

API mode is fastest and uses an Apollo API key.

Browser mode opens Apollo in a real browser session and uses the visible table/DOM.

### 6. Add your Apollo API key, if using API mode

Option A: paste the key into the app on the **Extraction** page.

Option B: create a `.env` file in the project folder:

```bash
APOLLO_API_KEY=your_key_here
```

Do not commit `.env`; it is ignored by git.

### 7. Paste an Apollo People Search URL

Example:

```text
https://app.apollo.io/#/people?page=1&personTitles[]=owner
```

The app validates that the URL is an Apollo People Search URL.

### 8. Start extraction

Click **Start extraction**.

The app will show:

1. Current page
2. Leads extracted
3. Rows per second
4. Elapsed time
5. Estimated remaining time
6. Errors and retries
7. Live logs
8. Lead preview

### Developer Mode request debugger

If an Apollo API request fails, open **Settings** and enable **Developer Mode request debugger**.

The **Extract Leads** page will show:

1. Original Apollo URL
2. Parsed parameters
3. Normalized API payload
4. Sanitized headers
5. Response metadata
6. Validation warnings/errors

Array URL parameters such as `personTitles[]` are always sent as arrays, even when only one value is present.

### 9. Export results

Open **Exports** and choose:

1. CSV
2. Excel
3. JSON
4. SQLite

### 10. Reopen history

Open **History** to reload previous extraction sessions.

## Production build and verification

```bash
npm run test
npm run lint
npm run build
npm run smoke:electron
```

The compiled Electron application assets are emitted to:

```text
dist/ui
dist/electron/main.cjs
dist/electron/preload.cjs
```

Run production mode:

```bash
npx electron .
```

## Troubleshooting

### Renderer says the desktop bridge is unavailable

Start the app with:

```bash
npm run dev
```

Do not open the Vite URL directly in a normal browser. The desktop app requires Electron preload APIs.

### npm install shows engine warnings

Use Node.js `22.22` or newer.

### Apollo asks you to log in

This is expected in browser mode. Log in once in the opened browser window; the session is reused.

## Architecture

- Electron + Playwright run authenticated browser automation; optional API-key mode uses Apollo search plus enrichment endpoints.
- React + Zustand render the live dashboard.
- Better-SQLite3 stores extraction sessions, leads, logs, and checkpoints.
- Export services stream CSV, JSON, Excel, and SQLite artifacts.
- DOM extraction is header/cell driven and includes unknown future visible columns.

See `docs/USAGE.md` for installation, operation, validation notes, benchmarks, and extension points.
