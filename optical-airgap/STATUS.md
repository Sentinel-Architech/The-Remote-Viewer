# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**OSS:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md)

## Shipped (wired)

age (TS+Rust) · RDH · Soliton LT · TRVL · offline QR · gate v2 · FPS profiles ·  
`frame-stream` / `frame-peel` · `full-path` / `peel-path` · golden k=8 · e2e script

## Phase 2 remainder

| ID | Status |
|----|--------|
| P2-1 jsQR | Optional vendor drop |
| P2-3 cargo vendor | Run on networked host (`rust/OFFLINE.md`) |
| P2-5 acoustic | Deferred — [PHASE2-R6.md](./PHASE2-R6.md) |
| Device optical lab | User Acer ↔ Pixel when available |

```bash
cd optical-airgap && npm install && npm run test:golden
bash scripts/e2e-lt-demo.sh
```
