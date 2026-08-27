# VOXSHIFT

Real-Time Voice Conversion

VOXSHIFT is a cross-platform Electron, React, Vite, TypeScript desktop application being built in phases. This repository currently contains Phase 1: project foundation, secure Electron shell, premium UI shell, typed preload IPC, initial voice metadata, and documentation.

Core audio, voice conversion, and virtual microphone features are not simulated. Until native engine phases are implemented, VOXSHIFT stays safety-muted and never exposes a raw microphone bypass.

## Current phase

- Phase 1: Repository foundation and premium UI shell
- Phase 2: Microphone device manager foundation

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm test
npm run build
```
