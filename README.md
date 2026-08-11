# Simms Group Consulting — Website Replacement

Faithful static rebuild of [simmsgroupconsulting.com](https://www.simmsgroupconsulting.com) as a React + Vite + TypeScript SPA, deployable to cPanel shared hosting.

## Quick start (development)

```bash
npm install
npm run dev
```

## Production build + cPanel package

```bash
npm install
npm run build
```

This produces:

- `dist/` — Vite production output
- `cpanel-upload/` — ready-to-upload public_html contents
- `dist/cpanel-upload.zip` — zip of those contents (upload & extract into `public_html`)

See [docs/CPANEL-DEPLOYMENT.md](docs/CPANEL-DEPLOYMENT.md).

## Smoke tests

```bash
npm run build
npm run test:site
```

## Environment

Copy `.env.example` to `.env` only if you add a future contact API. The live site uses **mailto** CTAs; no backend is required for parity.

## Project docs

- `docs/site-inventory.md` — full page inventory
- `docs/site-map.json` — machine-readable sitemap
- `docs/functionality-audit.md` — interactive behavior audit
- `docs/button-test-results.md` — button verification
- `docs/assets-not-copied.md` — asset notes
- `docs/final-test-report.md` — automated test results
- `docs/CPANEL-DEPLOYMENT.md` — hosting instructions

## Stack

- React 19 + TypeScript
- Vite 6
- React Router 7
- Plain CSS (no UI framework)
