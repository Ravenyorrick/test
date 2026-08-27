# Audio Engine

The real-time audio engine is planned for Phase 3 and must be native. It must not be implemented entirely in JavaScript.

## Requirements

- 48 kHz floating-point mono speech processing path.
- Dedicated real-time audio thread.
- Preallocated buffers.
- Lock-free queues where cross-thread communication is required.
- No network requests, filesystem operations, blocking IPC, or heavy allocations in the audio callback.

## Implemented native primitives

- Rust workspace and `voxshift-audio-engine` crate.
- `AudioFrame`, `OutputFrame`, `StreamingVoiceConverter` trait, engine metrics, and state enums.
- `SafetyOutputGate` that outputs processed audio only in `READY`; otherwise it returns silence.
- Unit tests proving critical errors and incomplete prerequisites mute output.

## Safety

Until native capture, streaming voice conversion, and virtual microphone output are implemented and verified end-to-end, VOXSHIFT keeps output muted. The UI does not simulate input levels, output levels, or latency.
