# Apollo Lead Extractor Usage

## Installation

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the desktop app:

   ```bash
   npm run dev
   ```

## Build instructions

```bash
npm run test
npm run build
```

The Vite UI is written to `dist/ui`; Electron main and preload bundles are written to `dist/electron`.

## Folder structure

```text
src/
  automation/   Playwright extraction orchestration and page helper scripts
  browser/      Persistent Chromium profile and request interception
  database/     SQLite schema and repositories
  electron/     Electron main process and preload IPC bridge
  exports/      CSV, Excel, JSON, and SQLite export services
  extractors/   Dynamic DOM table/card mapping and pagination detection
  parsers/      Generic Apollo hash/query URL parser
  services/     Hashing and IDs
  ui/           React dashboard, Zustand store, and components
tests/          Unit and integration-style coverage
docs/           User and maintainer documentation
```

## Operation

1. Paste any Apollo People Search URL.
2. Click **Start extraction**.
3. If Apollo asks for login, complete login in the Playwright browser window. The app stores the Chromium profile and resumes automatically.
4. Watch the dashboard for page, speed, retries, errors, progress, and current company.
5. Export the active session as CSV, XLSX, JSON, or SQLite.

## Implementation notes

- URL filters are parsed dynamically from every query parameter in Apollo hash URLs. Unknown future parameters are preserved.
- Lead extraction inspects rendered tables/grids/cards, detects headers, maps cells to visible headers, captures links, and keeps unknown future columns.
- Pagination detection uses visible page text, selected page affordances, next-button hints, and disabled states.
- The browser blocks images, fonts, videos, and common analytics hosts to improve extraction speed while keeping a normal headed browser session.
- Duplicate detection hashes stable identity fields when present, including Apollo/person/org IDs, LinkedIn, and email.
- SQLite auto-save happens on every page batch; this is stricter than the required 50-lead checkpoint interval and improves crash recovery.

## Validation and benchmarks

Run:

```bash
npm run test
npm run build
```

The included benchmark expectation is architectural: 100 leads in under 5 seconds is possible when Apollo renders rows quickly because extraction runs in-page, writes in batches, blocks heavy resources, and avoids per-cell Playwright round trips. Real-world speed depends on Apollo account latency, available columns, network conditions, and throttling.

## Future extension points

- Add Apollo network-response extractors when authenticated API shapes are known, while preserving DOM fallback.
- Add packaged installers through Electron Forge or electron-builder.
- Add resumable per-page work queues for multi-search batches.
- Add encrypted-at-rest database support for regulated environments.
- Add column normalization presets without replacing dynamic raw-column exports.
