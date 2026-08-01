# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**Open source inventory:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Phase 1:** COMPLETE

## Wired open-source stack

| Layer | Implementation | OSS |
|-------|----------------|-----|
| age crypto | TS `age-encryption` + Rust `age` | BSD-3 / MIT-Apache |
| RDH | first-party histogram shifting | MIT |
| LT + Soliton | first-party TS + Rust | MIT |
| TRVL | first-party framing | MIT |
| QR encode | `qrcode-lite.js` | MIT |
| QR decode | BarcodeDetector + optional jsQR | platform / Apache-2.0 |
| CLI | `trv-optical` frame-stream / peel | MIT |
| Full path | `pipeline/full-path.ts` + `peel-path.ts` | MIT |

**Excluded from core:** Meta, Google, Microsoft SDKs; RaptorQ default.

## Phase 2

| ID | Status |
|----|--------|
| P2-2 Soliton | **Done** + Standard |
| P2-8 CLI stream/peel | **Done** |
| P2-4 gate v2 / FPS | **Done** (tune on device) |
| Full path wire | **Done** |
| OSS inventory | **Done** |
| P2-1 jsQR | Optional vendor drop |
| P2-3 cargo vendor | Scaffold — run on networked host |

```bash
cd optical-airgap && npm install && npm run test:golden
cd rust && cargo test
echo hello | cargo run --quiet --bin trv-optical -- frame-stream 16 40 \
  | cargo run --quiet --bin trv-optical -- frame-peel
```
