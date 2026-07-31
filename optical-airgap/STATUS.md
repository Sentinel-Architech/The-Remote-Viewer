# Optical Air-Gap — Status

**Branch:** `TheRemoteViewer`  
**Phase 1 issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38) — **COMPLETE**  
**Phase 2 detail:** [PHASE2.md](./PHASE2.md)

## Phase 1 — DONE

- [x] Local `@sentinel.viewer` identity
- [x] age encryption (TS + Rust)
- [x] Histogram-shifting RDH + capacity + checksum header
- [x] encrypt-then-rdh pipeline
- [x] LT core + Robust Soliton helper + TRVL frames (CRC16)
- [x] Offline QR sender (no CDN)
- [x] Receiver: paste + camera + quality gate + LT peel
- [x] Recursive loop hooks module
- [x] Rust crate + `trv-optical` CLI
- [x] INSTALL / TECHNICAL / COMPATIBILITY docs

## Phase 2 — planned (not started)

| ID | Item | Priority |
|----|------|----------|
| P2-1 | jsQR (or pure) fallback when BarcodeDetector missing | 1 |
| P2-2 | Robust Soliton as default in all LT encoders (TS+Rust) | 2 |
| P2-4 | Optical reliability (gate v2, larger QR, byte-mode frames) | 3 |
| P2-3 | Cargo vendor / `cargo build --offline` | 4 |
| P2-7 | Wire loop hooks to adaptive policy (IA-of-IA) | 5 |
| P2-8 | CLI / release polish | 6 |
| P2-6 | Higher-capacity RDH if metrics require | 7 |
| P2-5 | Acoustic secondary channel | 8 |

Full acceptance criteria and tasks: **[PHASE2.md](./PHASE2.md)**.

## Pair test (Phase 1)
1. `optical/qr-sender.html` — Start LT Stream  
2. `optical/qr-receiver.html` — camera or paste  
3. Peel to k/k → payload  
