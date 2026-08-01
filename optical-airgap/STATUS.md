# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md) — Optical Fountain 1.0  
**Phase 1:** COMPLETE · **Phase 2:** [PHASE2.md](./PHASE2.md)

## Sentinel Standard (locked)

LT + Robust Soliton · golden k=8 · no RaptorQ default · TRVL1 · age first

## Phase 2 progress

| ID | Item | Status |
|----|------|--------|
| P2-2 | Soliton default | **Done** |
| P2-8 | CLI frame-stream / peel | **Done** — `trv-optical frame-stream` / `frame-peel` |
| P2-4 | Optical reliability | **Partial** — FPS profiles; gate v2 (mean/var + edge) |
| P2-1 | jsQR | Partial |
| P2-3 | Cargo offline | Scaffold |
| P2-5–P2-7 | Planned | Not started |

### Verify

```bash
cd optical-airgap/rust
cargo test
echo 'hello-sentinel' | cargo run --quiet --bin trv-optical -- frame-stream 16 40 | cargo run --quiet --bin trv-optical -- frame-peel
```

### Next
Gate tuning on device · optional jsQR · cargo vendor on networked host
