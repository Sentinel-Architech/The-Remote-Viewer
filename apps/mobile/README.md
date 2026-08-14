# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` + high-friction Destroy | Working |
| Local demo VC | Working |
| On-device connection list | Working (slice 1) |
| Optical DID exchange | Working (slice 2) |
| Local private messages | Working (slice 3) |
| Local profile + kind-0 / kind-3 shaped export | Working (slice 4) |
| All social state wiped on Destroy | Working |
| secp256k1 Nostr relay publish | Not yet |
| Connection list export file | Not yet (slice 5) |
| Production security claims | **None** |

## Profile + Nostr-shaped export (slice 4)

- Optional display name / about stored on-device.
- **Export kind-0 shaped event** — profile metadata JSON + TRV (Ed25519) signature.
- **Export kind-3 follow list event** — tags from on-device connections + TRV signature.
- Share via system sheet. Not a full NIP-01 secp256k1 publish path; that requires a separate Nostr key binding later.

## Destroy = Restart

Danger Zone → type full DID → confirm. Wipes keys, VCs, connections, messages, and local profile.

## Run

```bash
cd apps/mobile && npm install && npx expo start --host lan
```
