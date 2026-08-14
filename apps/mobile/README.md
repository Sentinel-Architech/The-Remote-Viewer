# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` generation (Ed25519) | Working |
| On-device SecureStore | Working (hardened options) |
| Create / Sign / Destroy UI | Working |
| Create → Destroy → Assert Empty smoke test | Working |
| Hardware-backed keys (StrongBox / Keystore) | Not yet |
| Full credential / VC path | Not yet |
| Production security claims | **None** |

## Critical warning — Expo Go

**Expo Go is for exploration only.**

- It is **not** a security boundary.
- SecureStore options and authentication prompts can be ignored or weakened inside Expo Go.
- Do **not** treat keys generated under Expo Go as production or high-assurance material.

Real testing of the Destroy = Restart posture requires either:

1. A **custom development client** (`npx expo run:android` / `eas build --profile development`), or
2. A **production / release build** installed via Obtainium, sideload, or store.

On GrapheneOS the preferred path is a custom client or release APK, never Expo Go for anything beyond UI experiments.

## Run (hobbyist / exploration)

```bash
cd apps/mobile
npm install
npx expo start --host lan
```

Scan with Expo Go on the same Wi-Fi.  
You will see the `did:key` screen with:

- Create did:key Identity
- Sign Test Message
- Show DID Document
- Destroy Identity
- **Run Smoke Test (Create → Destroy → Empty)**

## Canonical files

- `crypto-polyfill.ts` — CSPRNG polyfill (`expo-crypto`)
- `src/services/presence.ts` — did:key create / get / destroy / sign + zeroize
- `screens/PresenceScreen.tsx` — UI + smoke test

## Principles enforced so far

- Keys generated on-device with CSPRNG
- Stored under `WHEN_UNLOCKED_THIS_DEVICE_ONLY` + `requireAuthentication`
- Private key material zeroized after every use (best-effort)
- Destroy wipes both private key and DID from SecureStore
- No platform recovery path

See `docs/locked/01-Identity-Layer.md`, `03-Destroy-Equals-Restart.md`, and `docs/public/COMMAND-LOG.md` §9 for the full context.
