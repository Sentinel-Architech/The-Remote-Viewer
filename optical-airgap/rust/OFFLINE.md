# Rust offline / cargo vendor (P2-3)

## One-time networked step

```bash
cd optical-airgap/rust
cargo vendor vendor
mkdir -p .cargo
cp .cargo/config.toml.example .cargo/config.toml
```

Optional: tar the tree for USB:

```bash
tar czf trv-rust-vendor.tgz vendor .cargo/config.toml Cargo.toml Cargo.lock src examples
```

## Air-gapped build

```bash
cd optical-airgap/rust
cargo build --offline
cargo test --offline
cargo run --offline --bin trv-optical -- keygen
```

## Notes

- `vendor/` is large; prefer release artifact or USB drop rather than forcing it into git unless you choose to.
- If `--offline` fails after documented steps, see PHASE2 R3 contingency (online-first still valid for Phase 1).
- Do not point replace-with at crates.io on air-gapped machines.
