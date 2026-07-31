# Optical Air-Gap — GitHub Status

**Last assembled:** 2026-07-31  
**Branch:** `TheRemoteViewer`  
**Issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38)

## Shipped
- [x] Module layout + MIT license
- [x] Local `@sentinel.viewer` identity (also in `apps/shared`)
- [x] Real age encryption interface (age-encryption / typage)
- [x] Histogram-shifting RDH with capacity check + authenticated header
- [x] encrypt-then-rdh pipeline (phone-optional)
- [x] LT fountain encoder/decoder skeleton
- [x] **LT binary frame encode/decode + CRC16 + base64url** (`fountain/lt-frame.ts`)
- [x] QR sender HTML scaffold
- [x] Security notes, INSTALL, TECHNICAL, COMPATIBILITY docs

## Not shipped yet
- [ ] Vendored pure-JS QR (no CDN)
- [ ] Wire lt-frame into qr-sender.html (use base64url frames)
- [ ] Camera receiver / peel UI
- [ ] Capture quality gate
- [ ] Recursive expert event hooks in code
- [ ] Rust port scaffold (optional parallel path)

## How this got here
Pushed directly to `Sentinel-Archetecht/The-Remote-Viewer` on branch `TheRemoteViewer`.
