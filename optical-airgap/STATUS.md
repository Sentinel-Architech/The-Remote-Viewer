# Optical Air-Gap — Status

**Branch:** `TheRemoteViewer`  
**Phase 1:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38) — **COMPLETE**  
**Phase 2:** [PHASE2.md](./PHASE2.md) · R6: [PHASE2-R6.md](./PHASE2-R6.md)

## Phase 1 — DONE

All Phase 1 items shipped.

## Phase 2 — in progress

| ID | Item | Status |
|----|------|--------|
| **P2-2** | Robust Soliton default | **Mostly done** — TS + Rust + sender default Soliton; legacy flag retained; golden JSON scaffold |
| **P2-1** | jsQR fallback path | **Partial** — BarcodeDetector \| vendor hook \| paste \| file; drop `vendor/jsQR.js` to finish |
| **P2-4** | Optical reliability | **Partial** — FPS profiles safe/normal/fast on sender; gate reject counter on receiver |
| P2-3 | Cargo vendor | Not started |
| P2-5–P2-8 | As planned | Not started |

### Just shipped
- Rust `fountain/soliton.rs` (c=0.1, δ=0.05) aligned with TS math
- `LtEncoder` default Soliton; `DegreeMode::Legacy` + `EncodeOpts`
- Peel tests for both modes
- `fountain/testdata/` golden degree scaffold + R2 note
- Sender **safe / normal / fast** FPS profiles

### Next
1. Fill `golden-degrees-k8.json` from one language; assert both
2. Optional: commit vendored `jsQR.js`
3. P2-3 `cargo vendor` offline
4. Gate v2 (blur / adaptive thresholds)
