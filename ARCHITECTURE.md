# VOXSHIFT Architecture

VOXSHIFT separates UI, desktop orchestration, audio processing, voice conversion, driver management, model management, settings, diagnostics, and updates.

## Phase 1 implemented

- Electron main process with context isolation and disabled renderer Node integration.
- Secure preload API with a narrow IPC surface.
- React/Vite/TypeScript renderer.
- Premium UI shell for Home, Voices, Microphone, Call Mode, Settings, and Diagnostics.
- Built-in voice metadata only. No voice model assets are fabricated or bundled.

## Backend control correction

- Renderer controls use secure `audio:*` IPC commands.
- Electron main owns an `AudioController` state machine.
- UI status is derived from backend state and must not show `LIVE` unless the backend reports `RUNNING`.
- Native Rust `SafetyOutputGate` primitives enforce silence unless all ready conditions are satisfied.

## Required production pipeline

Physical Microphone -> Audio Capture -> Noise Suppression -> Voice Conversion -> Post Processing -> Limiter -> Safety Output Gate -> VOXSHIFT Virtual Microphone.

There must never be a raw physical microphone to virtual microphone fallback. If any required condition fails, the safety gate remains muted.

## Native subsystems

The real-time audio engine, voice conversion engine, and virtual microphone/driver components must be native. JavaScript is only used for orchestration and presentation.
