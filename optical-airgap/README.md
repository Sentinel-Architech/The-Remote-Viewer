# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer for The Remote Viewer.

**Branch:** `TheRemoteViewer` · **License:** MIT  
**Standard:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**Open source:** [OPEN-SOURCE.md](./OPEN-SOURCE.md) — all required deps listed  
**Install:** [INSTALL.md](./INSTALL.md) · **Devices:** [COMPATIBILITY.md](./COMPATIBILITY.md)  
**Status:** [STATUS.md](./STATUS.md)

## Wired path

```
plaintext → age (OSS) → optional RDH → LT Robust Soliton → TRVL → QR/paste
         → peel → decrypt
```

| Layer | Code |
|-------|------|
| Full outbound | [`pipeline/full-path.ts`](./pipeline/full-path.ts) |
| Full inbound | [`pipeline/peel-path.ts`](./pipeline/peel-path.ts) |
| Rust CLI | `rust/` → `trv-optical frame-stream` / `frame-peel` |
| Browser | `optical/qr-sender.html` + `qr-receiver.html` |

## Prerequisites

```bash
cd optical-airgap && npm install          # age-encryption only
cd rust && cargo build                   # age, zeroize, sha2, thiserror
```

- **Mobile Android\*:** GrapheneOS from [grapheneos.org](https://grapheneos.org/) + Termux  
- **Not required:** Play Services, Meta/Microsoft SDKs, CDN scripts  

## Quick start

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer && git checkout TheRemoteViewer
cd optical-airgap && npm install && npm run test:golden
cd rust && cargo test
```

## Design locks

Encrypt-first · Soliton LT (not RaptorQ) · Zero Meta/Google/Microsoft core ·  
Destroy = Restart · `@sentinel.viewer` local-only · GrapheneOS official only  
