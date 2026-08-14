# Mobile Client — The Remote Viewer (Scaffold)

Expo + React Native. **SCAFFOLD ONLY.** See [SCAFFOLD.md](./SCAFFOLD.md) for the full surface map.

## Tabs

| Tab | What |
|-----|------|
| **Identity** | did:key, social, Destroy, conduct (mute/report/block, XXX, IA of IA), deepfake rule, human attestation, tutorial replay |
| **Messages** | Local signed messages; entitlement + block awareness |
| **Senses** | Communication Freedom, Hey Sentinel (personality + RWB shield), camera, listen, search |

## Locked rules (client-visible)

- Communication Freedom: yearly sub **or** node-host opt-in (node ON) → free unlimited **TRV** human comms
- Human deepfakes / indistinguishable synthesis: **STRICTLY PROHIBITED**; distinguishable animation/likeness OK; adult behind **XXX**
- Community mute / report / block; IA of IA private inquiry steers conduct (scaffold)

## Run

```bash
cd apps/mobile && npm install && npx expo start --host lan
```

## Voice / camera

- TTS: `expo-speech` (Expo Go OK)
- STT: `expo-speech-recognition` (dev/release build preferred)
- Camera: `expo-camera` when Viewer enables Sight
