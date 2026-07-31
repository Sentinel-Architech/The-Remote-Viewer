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
- [x] QR sender HTML scaffold
- [x] Security notes (encrypt-first, checksum, HIPAA architecture note)

## Not shipped yet
- [ ] Vendored pure-JS QR (no CDN)
- [ ] LT ↔ QR binary framing
- [ ] Camera receiver / peel UI
- [ ] Capture quality gate
- [ ] Recursive expert event hooks in code

## How this got here
Pushed directly to `Sentinel-Archetecht/The-Remote-Viewer` on branch `TheRemoteViewer` via connected GitHub integration. No separate PR required for the scaffold path; issue #38 tracks remaining Phase 1 work.
