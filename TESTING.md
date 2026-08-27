# Testing

## Phase 1 automated checks

```bash
npm run typecheck
npm test
npm run build
```

The current tests verify the UI shell exposes safety status, voice categories, and custom voice authorization language.

## Future required suites

- Native audio callback and processing tests.
- Voice model loading, warmup, switching, and failure tests.
- Virtual microphone install/repair/remove tests.
- Device disconnect and reconnect tests.
- Long-run stability tests for memory, CPU, latency, underruns, and overruns.
