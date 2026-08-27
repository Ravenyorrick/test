# Build

## Application build

```bash
npm run build
```

The build runs TypeScript checks, creates the Vite renderer bundle, and compiles Electron main/preload code.

## Installer preparation

```bash
npm run package:win
npm run package:mac
```

Installer scripts are configured for `.exe` and `.dmg` targets. Production signing, notarization, and virtual microphone driver packaging are required before release.
