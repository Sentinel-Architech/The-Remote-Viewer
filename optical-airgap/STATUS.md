# Optical Air-Gap — Status (Phase 1 complete)

**Branch:** `TheRemoteViewer`  
**Issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38)

## Phase 1 — DONE

- [x] Local `@sentinel.viewer` identity
- [x] age encryption (TS + Rust)
- [x] Histogram-shifting RDH + capacity + checksum header
- [x] encrypt-then-rdh pipeline
- [x] LT core + **Robust Soliton** helper (`fountain/robust-soliton.ts`)
- [x] TRVL binary frames + CRC16
- [x] Offline QR sender (no CDN)
- [x] Receiver: paste + **camera** + **quality gate** + LT peel
- [x] Recursive loop hooks (`loop/hooks.ts`)
- [x] Rust crate + LT peel tests + CLI (`keygen|encrypt|decrypt|…`)
- [x] INSTALL / TECHNICAL / COMPATIBILITY docs

## Phase 2 (optional later)
- Vendored jsQR fallback where BarcodeDetector is missing
- Full Robust Soliton wired as default in all encoders
- Cargo vendor for offline `cargo build`
- Acoustic fallback / higher-capacity RDH
- Production multi-block RS QR versions > 10

## Pair test
1. `optical/qr-sender.html` — Start LT Stream  
2. `optical/qr-receiver.html` — camera or paste `TRVL1.…` lines  
3. Recover payload when peel hits k/k  
