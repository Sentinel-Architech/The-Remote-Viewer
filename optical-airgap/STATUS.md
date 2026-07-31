# Optical Air-Gap — GitHub Status

**Last assembled:** 2026-07-31  
**Branch:** `TheRemoteViewer`  
**Issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38)

## Shipped
- [x] Module layout + MIT license
- [x] Local `@sentinel.viewer` identity
- [x] Real age encryption (TS age-encryption / typage)
- [x] Histogram-shifting RDH + capacity + auth header (TS)
- [x] encrypt-then-rdh pipeline (TS)
- [x] LT encoder/decoder skeleton (TS)
- [x] LT binary frame TRVL + CRC16 + base64url (TS)
- [x] Offline QR encoder + sender HTML (no CDN)
- [x] **Rust crate `optical-airgap/rust`** — age, RDH, TRVL frame, identity, tests/example
- [x] Docs: INSTALL, TECHNICAL, COMPATIBILITY, SECURITY

## Not shipped yet
- [ ] Camera receiver / peel UI
- [ ] Capture quality gate
- [ ] Recursive expert event hooks in code
- [ ] Full LT Soliton + peel in Rust
- [ ] Rust CLI binary + QR crate optional
- [ ] Vendor cargo deps for offline build

## Rust quickstart
```bash
cd optical-airgap/rust
cargo test
cargo run --example age_roundtrip
```
