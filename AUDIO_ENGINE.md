# Audio Engine

The real-time audio engine is planned for Phase 3 and must be native. It must not be implemented entirely in JavaScript.

## Requirements

- 48 kHz floating-point mono speech processing path.
- Dedicated real-time audio thread.
- Preallocated buffers.
- Lock-free queues where cross-thread communication is required.
- No network requests, filesystem operations, blocking IPC, or heavy allocations in the audio callback.

## Safety

Until the native engine is implemented and verified, VOXSHIFT keeps output muted. The Phase 1 UI does not simulate input levels, output levels, or latency.
