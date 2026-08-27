# Phase 2 - Device Manager

## Implemented

- Real microphone enumeration through `navigator.mediaDevices.enumerateDevices()`.
- User-triggered microphone permission request through `getUserMedia()`, with tracks stopped immediately after labels are unlocked.
- Persistent selected microphone device ID in local storage.
- Device-change listener.
- Selected-device disconnect detection.
- No automatic fallback to another microphone when the selected device is unavailable.

## Current limitations

- Input channel count and sample rate require native audio engine integration in Phase 3.
- No audio is captured for processing or routed to output in Phase 2.
- Safety gate remains muted because voice engine and virtual microphone are not implemented yet.
