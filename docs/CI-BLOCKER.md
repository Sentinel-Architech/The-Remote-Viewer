# CI blocker — Solana program build (2026-08-14)

## Symptom

`anchor build` fails inside `solanafoundation/anchor:v0.32.1` (and earlier 0.30/0.31 paths) with:

```text
error: failed to parse manifest at '…/CRATE/Cargo.toml'
feature `edition2024` is required
… not stabilized in this version of Cargo (1.84.0)
```

Crate names rotate: `digest`, `indexmap`, `constant_time_eq`, `crypto-common`, `block-buffer`, `toml_parser`, `toml_edit`, …

## Root cause

| Layer | Cargo version | Can parse edition2024? |
|-------|---------------|------------------------|
| Host / `rustup 1.85` | 1.85 | Yes |
| **`cargo-build-sbf` platform-tools** | **~1.84** | **No** |

On-chain builds always go through SBF tools. Host 1.85 does not replace that nested Cargo. Pinning one crate only surfaces the next crates.io release that set `edition = "2024"`.

## What is NOT broken

- Program source (`trv_governance`) scaffold  
- Policy: $96, 95/5, 90/10, safety, PATH-TO-LIVE  
- GitHub Actions wiring, Docker pull, npm Anchor CLI  
- PROVEN mobile / optical / vending surfaces  

## Ways to unblock (pick one later)

1. **x86 Linux/macOS build host** with a Solana install whose platform-tools Cargo is **≥ 1.85**, then commit `Cargo.lock` from a green `anchor build`.  
2. **Newer Foundation image** once `solanafoundation/anchor` ships tools that parse edition2024.  
3. **Vendor / offline registry** of pre-edition2024 crates (heavy; last resort).  
4. **Program rewrite** only if APIs force it — not required for this error class.  

## Decision (2026-08-14 night)

**Stop pin-war CI loops.** Phase 0 remains **open**. Track A policy stays Solana; compile waits on toolchain reality, not more YAML churn.
