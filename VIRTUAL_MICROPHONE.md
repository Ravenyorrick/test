# Virtual Microphone

`VOXSHIFT Virtual Microphone` is a core production requirement and must be implemented as a real system-level virtual microphone.

## Windows

Use a proper Windows virtual audio driver architecture based on Microsoft-documented virtual audio device patterns. Production builds require driver packaging and signing.

## macOS

Use a modern macOS virtual audio architecture such as Audio DriverKit or an Audio Server Plug-in where appropriate. Production builds require signing and notarization.

## Phase 1 status

The virtual microphone is not installed or simulated. The safety gate remains muted.
