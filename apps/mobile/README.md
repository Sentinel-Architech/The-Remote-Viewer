# Mobile Client (Scaffold Only)

Expo + React Native + TypeScript shell for The Remote Viewer.

**This is not secure.** It does not implement identity, credentials, selective disclosure, keys, or burn.

## Install

```bash
cd apps/mobile
npm install
# Align native module versions with the installed Expo SDK:
npx expo install expo-crypto expo-secure-store expo-status-bar
```

## Run on device (Termux + Expo Go)

Metro must **not** advertise only `127.0.0.1` if you scan the QR from Expo Go (same phone or another device). Use tunnel or LAN.

### Recommended from Termux

```bash
cd apps/mobile
npm run start:tunnel
```

Then open **Expo Go** → scan the QR. Tunnel works when LAN isolation blocks device-to-Termux traffic.

### Same Wi‑Fi LAN

```bash
npm run start:lan
```

QR should show `exp://192.168.x.x:8081` (not `127.0.0.1`). Phone and Termux host must be on the same network without client isolation.

### Scripts

| Script | Command |
|--------|--------|
| `npm start` | Default Expo start |
| `npm run start:tunnel` | Expo tunnel (best for Termux → Expo Go) |
| `npm run start:lan` | LAN IP in QR |
| `npm run start:localhost` | Localhost only |
| `npm run doctor` | `expo-doctor` |

### Do not

- Rely on pressing `a` in Metro unless ADB sees a device/emulator.
- Use `npm audit fix --force` casually (can break Expo peer deps).
- Scan an old QR after restarting Metro — scan the **new** one.

## Version pin policy

Use `npx expo install <pkg>` so versions match the Expo SDK (currently ~51). Avoid floating major bumps on `expo-crypto` / `expo-secure-store` without `expo install`.

## Design authority

Real identity / Vault / burn work follows `docs/locked/` (especially roadmap and key-loss threat model). This app remains scaffold until those are implemented.
