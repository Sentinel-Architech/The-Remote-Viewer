# Optical Air-Gap — GitHub Status

**Last assembled:** 2026-07-31  
**Branch:** `TheRemoteViewer`  
**Issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38)

## Shipped
- [x] Module layout + MIT license
- [x] Local `@sentinel.viewer` identity
- [x] Real age encryption (age-encryption / typage)
- [x] Histogram-shifting RDH + capacity + auth header
- [x] encrypt-then-rdh pipeline
- [x] LT encoder/decoder skeleton
- [x] LT binary frame (TRVL) + CRC16 + base64url
- [x] **Offline QR encoder** `optical/qrcode-lite.js` (no CDN)
- [x] **QR sender streams LT frames** `optical/qr-sender.html`
- [x] `fountain/stream-symbols.ts` host iterator
- [x] Docs: INSTALL, TECHNICAL, COMPATIBILITY, SECURITY

## Not shipped yet
- [ ] Camera receiver / peel UI (decode TRVL1.* → LTDecoder)
- [ ] Capture quality gate
- [ ] Recursive expert event hooks in code
- [ ] Rust port scaffold
- [ ] Hardening: full Robust Soliton, multi-block RS for QR, larger versions

## Test (Acer, no phone)
1. Open `optical-airgap/optical/qr-sender.html` (same folder as `qrcode-lite.js`)
2. Start LT Stream — QR should animate without network
3. Status line shows seed / k / degree / frame size
