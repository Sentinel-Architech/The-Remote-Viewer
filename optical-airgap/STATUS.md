# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**OSS:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md)

## Verification (2026-07-31)

**On-device success** — GrapheneOS\* / Termux (Pixel-class):

| Test | Result |
|------|--------|
| Soliton LT short | `hello-sentinel` recovered |
| Soliton LT longer | `TRV optical air-gap on GrapheneOS+Termux` recovered |
| age keygen | `age1…` + Vault identity file |
| **Full chain** | encrypt → frame-stream (k=10) → peel → decrypt → **`secret viewer message`** |

Workspace member `optical-airgap/rust` · age 0.11 Decryptor/Identity CLI fixes · Termux: use `$HOME` not `/tmp`.

\* GrapheneOS: [grapheneos.org](https://grapheneos.org/)

## Shipped (wired)

age (TS + Rust) · RDH · Soliton LT · TRVL · offline QR + gate v2 · FPS profiles ·  
`trv-optical` CLI (`frame-stream` / `frame-peel` / `encrypt` / `decrypt` / `keygen`) ·  
`pipeline/full-path.ts` · `peel-path.ts` · golden k=8 · e2e script · OSS inventory

## Phase 2 remainder

| ID | Status |
|----|--------|
| P2-1 jsQR | Optional vendor drop |
| P2-3 cargo vendor | Run on networked host (`rust/OFFLINE.md`) |
| P2-5 acoustic | Deferred — [PHASE2-R6.md](./PHASE2-R6.md) |
| Multi-device optical | Acer ↔ phone QR when ready |
| Paste QR lab | `optical/qr-*.html` + `trvl.txt` lines |

```bash
cd optical-airgap && npm install && npm run test:golden
cd rust
# LT only:
echo hello-sentinel | cargo run --quiet --bin trv-optical -- frame-stream 16 40 \
  | cargo run --quiet --bin trv-optical -- frame-peel
# Full age+LT: see INSTALL.md § full chain
```
