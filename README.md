# Apollo Lead Extractor

A production-oriented Electron desktop application for extracting leads from Apollo People Search pages with a dynamic DOM/URL parser, live dashboard, crash recovery, de-duplication, and CSV/Excel/JSON/SQLite exports.

## Quick start

```bash
npm install
npm run dev
```

## Build

```bash
npm run test
npm run build
```

The compiled Electron application assets are emitted to `dist/`.

## Architecture

- Electron + Playwright run authenticated browser automation; optional API-key mode uses Apollo search plus enrichment endpoints.
- React + Zustand render the live dashboard.
- Better-SQLite3 stores extraction sessions, leads, logs, and checkpoints.
- Export services stream CSV, JSON, Excel, and SQLite artifacts.
- DOM extraction is header/cell driven and includes unknown future visible columns.

See `docs/USAGE.md` for installation, operation, validation notes, benchmarks, and extension points.
