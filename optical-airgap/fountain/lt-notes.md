# LT degree sampling notes

## Defaults (Phase 2)

| Parameter | Value |
|-----------|-------|
| `degreeMode` | `soliton` (default) |
| `c` | `0.1` |
| `delta` | `0.05` |

Robust Soliton μ is built once per encoder from `robust-soliton.ts`. Degrees are sampled via CDF + `seedToUnit(seed)` so TS/Rust can share golden vectors later.

## Legacy mode

`degreeMode: "legacy"` keeps the Phase 1 heuristic (R2 hard-cut interop).

## Expected overhead

Under zero loss, peel typically completes near `K × (1.05–1.2)` symbols for moderate K. Optical loss raises that; send rateless until receiver reports complete.
