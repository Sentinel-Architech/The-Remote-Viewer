# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` generation (Ed25519) | Working |
| On-device SecureStore | Working (hardened options) |
| Create / Sign / Destroy UI | Working |
| High-friction Destroy gate (type full DID) | Working |
| Local demo VC issue / store / list | Working |
| On-device connection list (add / remove / list) | Working (Social Layer slice 1) |
| Connections + VCs wiped on Destroy | Working |
| Hardware-backed keys | Not yet |
| Optical / QR connection exchange | Not yet |
| Nostr publication | Not yet |
| Full OpenID4VCI / OpenID4VP | Not yet |
| Production security claims | **None** |

## Destroy = Restart (user-facing)

1. Tap **Destroy identity…**
2. Danger Zone appears.
3. Type the **full current DID** exactly.
4. Final confirmation.
5. Path ends. Demo VCs **and** on-device connections for that path are wiped.

No email. No phone. No SMS. Platform cannot restore.

See `docs/locked/13-Burn-Confirmation-Language.md` and `docs/locked/14-Sovereign-Social-Layer.md`.

## Connections (slice 1)

- Paste a `did:key` (or other public id) → Add connection.
- List and remove locally.
- Stored only on device; destroyed with the identity path.
- No relays, no central graph.

## Critical warning — Expo Go

**Expo Go is for exploration only.** Not a security boundary.

## Run

```bash
cd apps/mobile
npm install
npx expo start --host lan
```

## Canonical files

- `src/services/presence.ts` — did:key + destroy (wipes credentials + connections)
- `src/services/credentials.ts` — local demo VCs
- `src/services/connections.ts` — on-device connection list
- `screens/PresenceScreen.tsx` — UI + Danger Zone + connections + smoke test
