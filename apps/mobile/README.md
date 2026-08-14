# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` + high-friction Destroy | Working |
| Social Layer slices 1–5 | Working |
| **Text-to-speech (expo-speech)** | Working (Expo Go OK) |
| **Speech-to-text (dictate)** | Working in dev/release builds; graceful fallback in Expo Go |
| Production security claims | **None** |

## Voice modality

Viewers can use **text, voice, or both**:

- **Speak** — system TTS reads the field or status aloud (`expo-speech`).
- **Dictate** — OS speech recognition fills the field (`expo-speech-recognition`).
- No TRV cloud transcription. Permissions are optional; text-only always works.

STT requires a **development or release build** (native module). In Expo Go, Dictate explains the limitation; Speak still works.

On GrapheneOS, behavior depends on installed speech packages — prefer text if the OS has no recognizer.

## Social / identity (prior)

Connections, optical exchange, local messages, profile export, connection list import/export, Destroy = Restart — see locked docs `13` / `14`.

## Run

```bash
cd apps/mobile && npm install && npx expo start --host lan
```

For full STT:

```bash
npx expo prebuild
npx expo run:android
# or eas build --profile development
```
