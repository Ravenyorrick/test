# Voice Model Licenses

No production voice-conversion model is currently bundled or enabled.

| Model | Provider | License | Commercial use | Redistribution | Attribution | Status |
| --- | --- | --- | --- | --- | --- | --- |
| American Female Natural | Resemble AI Live Voice Conversion | Requires configured commercial account/license | Blocked until account terms are confirmed | Provider/cloud use; redistribution depends on contract | Provider terms apply | BLOCKED BY EXTERNAL DEPENDENCY |

## Requirement

Before VOXSHIFT can report a voice as available, the provider/model license must explicitly allow the intended real-time voice-conversion use, commercial distribution terms must be documented, and any API keys must remain in secure backend storage only.

The renderer must never receive provider API keys.

## Required backend environment

- `VOICE_PROVIDER_HOST`
- `VOICE_PROVIDER_API_KEY`
- `VOICE_PROVIDER_AMERICAN_FEMALE_NATURAL_ID`
- Optional: `VOICE_PROVIDER_BASIC_USER`
- Optional: `VOICE_PROVIDER_BASIC_PASS`
