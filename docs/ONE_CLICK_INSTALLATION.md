# One-Click Installation and Browser Calling

VOXSHIFT's production installer must install and verify every component needed for browser calling through the operating system microphone device stack.

## Installer responsibilities

1. VOXSHIFT desktop application.
2. Native audio engine binary/service.
3. Licensed voice-conversion engine and dependencies.
4. Voice models where licensing permits bundling.
5. `VOXSHIFT Virtual Microphone`.
6. Required Windows/macOS audio driver or audio component.
7. Background audio service where platform-appropriate.
8. Configuration files.
9. Permission/setup checks.
10. Uninstaller and repair/removal flows.

## Post-install verification

The installer must report `VOXSHIFT IS READY` only when all checks pass:

- Native audio engine installed.
- Voice engine available.
- At least one licensed voice available.
- Virtual microphone installed.
- OS detects `VOXSHIFT Virtual Microphone`.
- Audio pipeline can initialize.

If hardware or OS validation cannot run in the current environment, the installer must report `Hardware validation required`, not `PASS`.

## Browser architecture

VOXSHIFT must not inject into browsers, modify WebRTC, modify WhatsApp Web, or bypass browser permissions. Browsers consume VOXSHIFT only through the normal OS microphone selection UI.

Browser/site microphone:

```text
VOXSHIFT Virtual Microphone
```

## Current implementation status

The desktop application and native audio engine foundation exist. The product is not one-click installable yet because licensed voice conversion and Windows/macOS virtual microphone drivers are not implemented.
