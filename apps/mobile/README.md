# Mobile Client (Scaffold Only)

Expo + React Native + TypeScript shell for The Remote Viewer.

**This is not secure.** It does not implement identity, credentials, selective disclosure, keys, or burn.

**Expo SDK:** 54 (matches current Expo Go). If Expo Go reports a different SDK, run `npx expo install --fix` or upgrade/downgrade to match.

## Install

```bash
cd apps/mobile
npm install
npx expo install --fix
```

## Run on device (Termux + Expo Go)

**Do not rely on tunnel on Termux** if you see ngrok `Received null` — use LAN:

```bash
npm run start:lan
# or:
npx expo start --host lan
```

Scan the QR with **Expo Go**. Project SDK must match Expo Go SDK (this app targets **54**).

### Scripts

| Script | Purpose |
|--------|--------|
| `npm run start:lan` | Preferred on Termux |
| `npm run start:tunnel` | Only if ngrok works |
| `npm run start:localhost` | Same-device experiments |
| `npm run doctor` | `expo-doctor` |

### SDK mismatch error

If Expo Go says “Project is incompatible… SDK 54 vs SDK 51” (or similar):

```bash
npx expo install expo@~54.0.0
npx expo install --fix
```

## Design authority

Real identity / Vault / burn work follows `docs/locked/`. This app remains scaffold until those are implemented.
