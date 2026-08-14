# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` generation (Ed25519) | Working |
| On-device SecureStore | Working (hardened options) |
| High-friction Destroy gate (type full DID) | Working |
| Local demo VC issue / store / list | Working |
| On-device connection list | Working (Social Layer slice 1) |
| Optical DID exchange (show + paste) | Working (Social Layer slice 2) |
| Connections + VCs wiped on Destroy | Working |
| Camera QR scan | Not yet (needs custom dev client) |
| Nostr publication | Not yet |
| Full OpenID4VCI / OpenID4VP | Not yet |
| Production security claims | **None** |

## Optical connection exchange (slice 2)

1. Viewer A: **Show my DID for optical exchange** → large selectable DID + system Share.
2. Viewer B: capture (photo / type / receive share) → paste into **Paste did:key from optical exchange** → Add connection.
3. No network required. No relays. Connection lives only on each device and dies with that identity path.

Camera-based QR scan is deferred until a custom development client (Expo Go cannot reliably host full scanner native modules for production use).

## Destroy = Restart

Danger Zone → type full DID → final confirmation. Wipes keys, demo VCs, and on-device connections. No email, no phone.

See `docs/locked/13` and `docs/locked/14`.

## Run

```bash
cd apps/mobile
npm install
npx expo start --host lan
```

## Canonical files

- `src/services/presence.ts` — did:key + destroy
- `src/services/credentials.ts` — demo VCs
- `src/services/connections.ts` — on-device connection list
- `screens/PresenceScreen.tsx` — UI, optical share, Danger Zone, smoke test
