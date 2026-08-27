# Voice Provider Decision

Provider: Resemble AI Live Voice Conversion

Technology: Cloud-hosted real-time speech-to-speech voice conversion over WebSocket.

Streaming: Yes. The documented protocol streams binary audio chunks and receives converted binary audio chunks over one WebSocket session.

Commercial License: Requires a Resemble AI commercial account/license and API access. VOXSHIFT does not bundle or claim a licensed model until credentials and contract terms are configured.

SDK: Public protocol documentation and WebSocket/HTTP APIs. VOXSHIFT integrates directly from the Electron main process.

Latency: Documentation states end-to-end latency includes input accumulation, network transit, server processing, and playback/output buffer. Current deployment notes describe roughly 90 ms server processing for a recommended 120 ms chunk; actual latency must be measured from returned timestamps/headers.

Authentication: `VOICE_PROVIDER_API_KEY` is read only by Electron/main backend code and exchanged for a short-lived connection ticket using `POST https://<host>/api/auth/ticket` with `X-Api-Key`.

Input format: 48 kHz mono PCM, signed 16-bit little-endian, sent as binary WebSocket frames with an 8-byte little-endian float64 timestamp followed by PCM samples.

Output format: Converted mono PCM, signed 16-bit little-endian, returned as binary WebSocket frames with a 4-byte JSON header length, UTF-8 JSON header, then PCM samples. Output sample rate is reported by provider capabilities and can be requested up to 48 kHz.

Custom voices: Provider voice IDs are returned in `capabilities.voices`/`get_voices`. Custom voice availability and authorization restrictions depend on the configured Resemble account and must be enforced before exposing a custom profile as selectable.

Limitations:

- Requires network connectivity and provider capacity.
- Requires valid API credentials and commercial terms.
- Audio is streamed to the provider in cloud mode.
- VOXSHIFT must mute output if the provider is unavailable, over capacity, disconnected, or too slow.
- Built-in display name `American Female Natural` maps to a configured provider voice ID; it is not available until that mapping is configured.
