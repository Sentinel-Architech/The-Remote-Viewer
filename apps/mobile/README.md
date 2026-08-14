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
| Connection list export / import (`trv-connections-v1`) | Working (slice 5) |
| All social state wiped on Destroy | Working |
| secp256k1 Nostr relay publish | Not yet |
| Production security claims | **None** |

## Connection portability (slice 5)

- **Export connection list** → JSON `trv-connections-v1` via system Share.
- **Import** → paste the same JSON; merges by id (skips duplicates).
- Export is independent of kind-3 event packaging. Still fully wiped if you Destroy the identity path that holds the live list.

## Destroy = Restart

Danger Zone → type full DID → confirm. Wipes keys, VCs, connections, messages, and local profile. No email, no phone.

## Run

```bash
cd apps/mobile && npm install && npx expo start --host lan
```
