# Setup

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Rust toolchain for future native audio and voice engine phases
- Platform SDKs for future driver work:
  - Windows Driver Kit for Windows virtual audio driver development
  - Apple signing/notarization tooling and modern macOS audio extension tooling

## Install

```bash
npm install
```

## Run during development

```bash
npm run dev
```

Phase 1 does not require microphone permissions because it does not capture audio yet.
