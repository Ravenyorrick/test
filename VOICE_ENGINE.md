# Voice Engine

The voice conversion engine is planned as a provider-agnostic native subsystem.

## Required interface

- `initialize()`
- `shutdown()`
- `loadVoice()`
- `unloadVoice()`
- `processAudio()`
- `getStatus()`
- `getLatency()`
- `getCapabilities()`
- `warmup()`

## Providers

The architecture must support both `LocalVoiceEngine` and `CloudVoiceEngine` without hard-coding a single vendor in the UI.

No pitch-shift-only implementation may be used as the primary voice conversion technology.
