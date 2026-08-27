# Security

## Electron baseline

- `contextIsolation` is enabled.
- Renderer `nodeIntegration` is disabled.
- The preload exposes a narrow typed API.
- Renderer content is protected by a Content Security Policy.

## Data handling

VOXSHIFT must never log API keys, tokens, passwords, voice recordings, raw microphone audio, or private call content.

## Future requirements

- Validate every IPC payload.
- Use OS credential storage for secrets.
- Do not execute arbitrary remote code.
- Do not load arbitrary websites.
