# Implementation Audit - UI-Only Controls

This audit was created after the critical correction that VOXSHIFT must be pipeline-first, not UI-first.

## Previously UI-only or placeholder behavior

- `VOICE ON`: disabled visual control; did not call a backend pipeline.
- `VOICE OFF`: no backend stop operation.
- `Change Voice`: updated React-selected metadata only.
- Voice-card `Preview`: disabled button with no backend test path.
- `Change Microphone`: navigated to the microphone page only.
- Microphone `Select`: stored browser device ID only; did not notify the audio backend.
- Home status: hard-coded safety-muted text.
- Diagnostics: hard-coded subsystem state.
- Meters and latency: displayed non-measured/empty values, correctly not fake, but not subscribed to native metrics.
- `MUTE`: reached Electron, but only changed an in-memory flag instead of an AudioController output gate.

## Correction implemented

- Added secure `audio:*` IPC commands and events.
- Added Electron `AudioController` as the authoritative backend state machine.
- UI power, mute, preview, voice selection, and microphone selection now call backend commands.
- UI live/status indicators and diagnostics now read backend state.
- Start/unmute cannot report `RUNNING`/`LIVE` unless backend prerequisites are satisfied.
- Raw input to virtual microphone is represented as an immutable blocked route.

## Still not complete

- Native real-time microphone capture is not implemented.
- Streaming voice conversion is not implemented.
- System virtual microphone driver/component is not implemented.
- Real meters and latency require native engine metrics.
- No built-in licensed voice model is installed.

The app must remain NOT READY/MUTED until those native subsystems exist and pass integration tests.
