# LT degree sampling notes

## Defaults (Phase 2)

| Parameter | Value |
|-----------|-------|
| `degreeMode` | `soliton` (default) |
| `c` | `0.1` |
| `delta` | `0.05` |

Robust Soliton μ is built once per encoder from `robust-soliton.ts`. Degrees are sampled via CDF + `seedToUnit(seed)` so TS/Rust can share golden vectors later.

## Exact original length (2026-08-07)

Every payload fed to `LTEncoder` / `LtEncoder` is prefixed with a **u32 big-endian original length** before block split.

- Encoder: `withLengthPrefix(payload)` → splitIntoBlocks
- Decoder: assemble blocks → `stripLengthPrefix` → exact bytes

This eliminates the old trailing-zero heuristic. Ciphertexts that legitimately end in zero bytes recover correctly.

## Legacy mode

`degreeMode: "legacy"` keeps the Phase 1 heuristic (R2 hard-cut interop).

## Expected overhead

Under zero loss, peel typically completes near `K × (1.05–1.2)` symbols for moderate K. Optical loss raises that; send rateless until receiver reports complete.
