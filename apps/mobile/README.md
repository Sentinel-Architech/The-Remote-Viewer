# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` generation (Ed25519) | Working |
| On-device SecureStore | Working (hardened options) |
| Create / Sign / Destroy UI | Working |
| High-friction Destroy gate (type full DID) | Working |
| Create → Destroy → Empty smoke test | Working |
| Local demo VC issue / store / list | Working (Phase 1 first cut) |
| Demo VCs destroyed with identity | Working |
| Hardware-backed keys (StrongBox / Keystore) | Not yet |
| Full OpenID4VCI / OpenID4VP | Not yet |
| Production security claims | **None** |

## Destroy = Restart (user-facing)

Destruction is deliberate and local-only:

1. Tap **Destroy identity…**
2. Danger Zone appears.
3. Type the **full current DID** exactly.
4. Final confirmation dialog.
5. Path ends. Credentials held in the app for that path are wiped.

No email. No phone number. No SMS or carrier verification.  
The platform cannot restore a burned path.

See locked `docs/locked/13-Burn-Confirmation-Language.md`.

## Critical warning — Expo Go

**Expo Go is for exploration only.**

- It is **not** a security boundary.
- SecureStore options and authentication prompts can be ignored or weakened inside Expo Go.
- Do **not** treat keys or demo VCs generated under Expo Go as production or high-assurance material.

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
- Issue Demo VC
- Show held VCs
- **Destroy identity…** (opens Danger Zone; type full DID)
- **Run Smoke Test (Create → VC → Destroy → Empty)**

## Canonical files

- `crypto-polyfill.ts` — CSPRNG polyfill (`expo-crypto`)
- `src/services/presence.ts` — did:key create / get / destroy / sign + zeroize
- `src/services/credentials.ts` — local demo VC issue / list / destroy-with-identity
- `screens/PresenceScreen.tsx` — UI + high-friction destroy gate + smoke test

## Principles enforced so far

- Keys generated on-device with CSPRNG
- Stored under `WHEN_UNLOCKED_THIS_DEVICE_ONLY` + `requireAuthentication`
- Private key material zeroized after every use (best-effort)
- Destroy requires typed full DID then final confirmation
- Destroy wipes private key, DID, and all demo credentials from SecureStore
- No platform recovery path
- No email or phone number used as a gate

See `docs/locked/01-Identity-Layer.md`, `03-Destroy-Equals-Restart.md`, `09-Wallet-Architecture.md`, `11-Library-Choices.md`, `13-Burn-Confirmation-Language.md`.
