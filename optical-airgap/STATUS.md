# Optical Air-Gap — Status

**Branch:** `TheRemoteViewer`  
**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md) — **Optical Fountain 1.0**  
**Phase 1:** COMPLETE · **Phase 2:** [PHASE2.md](./PHASE2.md)

## Sentinel Standard (locked)

- LT + **Robust Soliton** (`c=0.1`, `δ=0.05`) is the **only** default fountain path  
- Golden degrees k=8 normative  
- **RaptorQ precode is non-standard** for default optical transfer  
- TRVL1 + age encrypt-first + local `@sentinel.viewer`  

## Phase 2 progress

| ID | Item | Status |
|----|------|--------|
| P2-2 | Robust Soliton default | **Done** (TS+Rust+browser+golden) — elevated to Sentinel Standard |
| P2-1 | jsQR fallback | Partial (vendor optional) |
| P2-3 | Cargo offline | Scaffold (`rust/OFFLINE.md`) |
| P2-4 | Optical reliability | Partial (FPS profiles, gateReject) |
| P2-5–P2-8 | Planned | Not started |

### Next engineering (still under the Standard)
1. Optional jsQR vendor drop  
2. `cargo vendor` on a networked host  
3. Gate v2 / CLI frame-stream  
