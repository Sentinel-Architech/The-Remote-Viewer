# Mobile Client

Expo + React Native scaffold for The Remote Viewer.

## Tabs

- **Identity** — did:key, social layer, Destroy, voice fields
- **Messages** — existing messaging surface
- **Senses** — camera (sight), listen (hearing), live web search

## Senses (2026-08-14)

| Sense | Behavior |
|-------|----------|
| Sight | Opt-in `expo-camera` preview + local capture. No TRV upload. |
| Hearing | Explicit Start/Stop listen → notes via OS STT when available. |
| Search | DuckDuckGo Instant Answer (no key) + open full DDG results in browser. |

All user-initiated. Text/voice modality still available via Speak/Dictate.

## Voice

- TTS: `expo-speech` (Expo Go OK)
- STT: `expo-speech-recognition` (dev/release build preferred)

## Run

```bash
cd apps/mobile && npm install && npx expo start --host lan
```

Camera + full STT: development or release build recommended.
