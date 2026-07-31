# trv-optical-airgap (Rust)

Sovereign runtime path for TRV optical air-gap.

Interoperates with the TypeScript module under `optical-airgap/`:

| Layer | Rust | TS reference |
|-------|------|----------------|
| age | `age` crate | `crypto/age-interface.ts` |
| RDH | `rdh::histogram` | `rdh/histogram-shifting.ts` |
| LT frame | `fountain::frame` | `fountain/lt-frame.ts` |
| Identity | `identity` | `identity/local-address.ts` |

**Constraints:** MIT, no Meta/Google/Microsoft deps, encrypt-first, Destroy = Restart (use `zeroize`).

## Prerequisites

- Rust 1.74+ (`rustup`)
- Network only for first `cargo build` (crates.io). Vendor later for full air-gap builds.

```bash
cd optical-airgap/rust
cargo build
cargo test
cargo run --example age_roundtrip
```

## Pipeline (same as TS)

```
plaintext → age → RDH embed → LT symbols → TRVL frames → QR
```

## Status

- [x] Crate layout + `age` encrypt/decrypt helpers + zeroize
- [x] Histogram-shifting RDH (port of TS logic + SHA-256 header prefix)
- [x] TRVL frame encode/decode (magic, CRC-16/IBM)
- [x] Local `@sentinel.viewer` helper
- [ ] Full LT Robust Soliton encoder/peel (skeleton hooks only)
- [ ] QR encode in pure Rust (optional; host can use `qrcode` crate later)
- [ ] CLI binary

See parent [../TECHNICAL.md](../TECHNICAL.md) and [../COMPATIBILITY.md](../COMPATIBILITY.md).
