# Optical Air-Gap — Status

**Branch:** `TheRemoteViewer`  
**Phase 1:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38) — **COMPLETE**  
**Phase 2:** [PHASE2.md](./PHASE2.md) · R6: [PHASE2-R6.md](./PHASE2-R6.md)

## Phase 1 — DONE

All Phase 1 items shipped.

## Phase 2 — in progress

| ID | Item | Status |
|----|------|--------|
| **P2-2** | Robust Soliton default | **In progress / default on** — `lt-core.ts` + `qr-sender.html`; `degreeMode=legacy` retained |
| **P2-1** | jsQR fallback path | **Partial** — receiver: BarcodeDetector \| optional `vendor/jsQR.js` \| paste \| **file import**; NOTICE + vendor README; drop jsQR dist to finish |
| P2-3 | Cargo vendor | Not started |
| P2-4 | Optical reliability | Gate reject counter live; more later |
| P2-5–P2-8 | As planned | Not started |

### Just shipped
- Soliton CDF sampling as **default** encode path (c=0.1, δ=0.05)
- Sender UI mode toggle soliton/legacy
- Receiver: path badge, file ingest, gateReject counter, jsQR hook when vendored
- `optical/vendor/NOTICE` + README (Apache-2.0 jsQR drop instructions)

### Next build steps
1. Pin + commit `vendor/jsQR.js` (or document USB drop only)
2. Rust LT degree = same Soliton defaults + golden seed vectors
3. P2-3 cargo vendor offline
4. Gate v2 / FPS profiles (P2-4)
