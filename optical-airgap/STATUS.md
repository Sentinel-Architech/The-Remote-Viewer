# Optical Air-Gap — Status

**Branch:** `TheRemoteViewer`  
**Phase 1:** COMPLETE  
**Phase 2:** [PHASE2.md](./PHASE2.md) · R6: [PHASE2-R6.md](./PHASE2-R6.md)

## Phase 2 — in progress

| ID | Item | Status |
|----|------|--------|
| **P2-2** | Robust Soliton default | **Done for encode path** — TS+Rust+sender; golden k=8 table locked in Rust tests |
| **P2-1** | jsQR fallback | **Partial** — paths ready; optional vendor drop |
| **P2-3** | Cargo vendor offline | **Scaffold** — `OFFLINE.md` + `.cargo/config.toml.example` (run `cargo vendor` on networked host) |
| **P2-4** | Optical reliability | **Partial** — FPS profiles + gateReject |
| P2-5–P2-8 | Planned | Not started |

### Just shipped
- `golden-degrees-k8.json` filled:  
  `[1,5,1,3,2,3,4,2,5,3,1,2,5,1,2,2,5,2,5,2,5,3,5,4,5,5,3,8,5,4,7,5]`
- Rust `golden_degrees_k8_soliton` asserts exact match
- P2-3 offline docs under `rust/OFFLINE.md`

### Next
1. Optional: commit vendored crates (size) or release tarball only
2. jsQR binary drop if desired
3. Gate v2 / CLI frame-stream (P2-4 / P2-8)
