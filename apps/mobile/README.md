# Mobile Client

Expo + React Native + TypeScript client for The Remote Viewer.

## Current status (2026-08-14)

| Piece | Status |
|-------|--------|
| `did:key` + hardened SecureStore | Working |
| High-friction Destroy (type full DID) | Working |
| Local demo VC | Working |
| On-device connection list | Working (slice 1) |
| Optical DID exchange (show + paste) | Working (slice 2) |
| Local private messages (DIDComm-shaped, on-device inbox) | Working (slice 3) |
| All of the above wiped on Destroy | Working |
| Camera QR scan / relay delivery / Nostr publish | Not yet |
| Production security claims | **None** |

## Local messages (slice 3)

- Compose a DIDComm basicmessage signed by your did:key to a connection DID.
- Stored only in the on-device inbox (hardened SecureStore).
- No relay transport in this slice — optical/out-of-band delivery of the message payload can be added later.
- Inbox is cleared on Destroy with the identity path.

## Optical connection exchange (slice 2)

Show my DID → capture/paste on the other device → Add connection.

## Destroy = Restart

Danger Zone → type full DID → final confirmation. Wipes keys, VCs, connections, and local messages. No email, no phone.

## Run

```bash
cd apps/mobile && npm install && npx expo start --host lan
```

## Canonical files

- `src/services/presence.ts` — did:key + destroy
- `src/services/credentials.ts` — demo VCs
- `src/services/connections.ts` — connection list
- `src/services/didcomm.ts` — local basicmessage inbox
- `screens/PresenceScreen.tsx` — full UI
