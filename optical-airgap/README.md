# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer for The Remote Viewer.

**Branch:** `TheRemoteViewer` · **License:** MIT  
**Standard:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**Open source:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md) · **Devices:** [COMPATIBILITY.md](./COMPATIBILITY.md)  
**Status:** [STATUS.md](./STATUS.md)

## Verified path (2026-07-31)

On **GrapheneOS\* + Termux** (Pixel-class hardware):

```
plaintext → age → Soliton LT (TRVL) → peel → age decrypt
```

Full CLI chain recovered live plaintext (`secret viewer message`) after encrypt → frame-stream → peel → decrypt.

\* Install GrapheneOS only from [grapheneos.org](https://grapheneos.org/).

## Wired modules

| Layer | Code |
|-------|------|
| Outbound | [`pipeline/full-path.ts`](./pipeline/full-path.ts) |
| Inbound | [`pipeline/peel-path.ts`](./pipeline/peel-path.ts) |
| Rust CLI | `rust/` → `trv-optical` |
| Browser | `optical/qr-sender.html` + `qr-receiver.html` |

## Quick start

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer && git checkout TheRemoteViewer
cd optical-airgap && npm install && npm run test:golden
cd rust && cargo test
```

Termux: prefer `$HOME` for temp files (not `/tmp`). See INSTALL.md.

## Design locks

Encrypt-first · Soliton LT (not RaptorQ) · Zero Meta/Google/Microsoft core ·  
Destroy = Restart · `@sentinel.viewer` local-only · GrapheneOS official source only  
