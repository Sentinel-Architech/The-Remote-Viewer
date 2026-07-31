# Optical Air-Gap — GitHub Status

**Last assembled:** 2026-07-31  
**Branch:** `TheRemoteViewer`  
**Issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38)

## Shipped
- [x] TS: age, RDH, LT core, TRVL frames, offline QR sender
- [x] **TRVL receiver / peel UI** `optical/qr-receiver.html` (paste mode)
- [x] Rust crate: age, RDH, TRVL frame, identity
- [x] **Rust LT encoder/peel** `fountain/lt.rs` + tests
- [x] **CLI** `trv-optical` (keygen, encrypt, rdh-cap, address, lt-demo)
- [x] Docs: INSTALL, TECHNICAL, COMPATIBILITY, SECURITY

## Not shipped yet
- [ ] Live camera → QR decode → auto-ingest (BarcodeDetector / vendored jsQR)
- [ ] Capture quality gate
- [ ] Recursive expert event hooks in code
- [ ] Full Robust Soliton parameters
- [ ] Vendor cargo deps for offline build
- [ ] decrypt CLI with file-based identity (partial)

## Quick tests
```bash
# HTML: open optical/qr-sender.html + optical/qr-receiver.html
# Paste TRVL1 lines from sender status tooling or manual capture into receiver

cd optical-airgap/rust
cargo test
cargo run --bin trv-optical -- keygen
echo 'hello' | cargo run --bin trv-optical -- lt-demo
```
