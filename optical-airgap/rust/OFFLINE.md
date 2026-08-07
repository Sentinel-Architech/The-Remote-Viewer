# Rust offline / cargo vendor (P2-3)

Do **not** commit the `vendor/` tree unless you explicitly want a multi-hundred-MB git object. Prefer one-time networked pin → USB.

## One-shot (networked machine)

```bash
cd optical-airgap/rust
bash scripts/vendor-offline.sh           # vendor + .cargo/config.toml + offline check
# or
bash scripts/vendor-offline.sh --tarball # also writes trv-rust-vendor.tgz for USB
```

Manual equivalent:

```bash
cd optical-airgap/rust
cargo vendor vendor
mkdir -p .cargo
cp .cargo/config.toml.example .cargo/config.toml
cargo check --offline
```

## Air-gapped host

```bash
cd optical-airgap/rust
# if using tarball:
#   tar xzf trv-rust-vendor.tgz
cargo build --offline
cargo test --offline
cargo run --offline --bin trv-optical -- keygen
```

Termux: keep files under `$HOME` (not `/tmp`).

## What the config does

`.cargo/config.toml` (from the example) redirects crates.io to the local `vendor/` directory:

```toml
[source.crates-io]
replace-with = "vendored-sources"

[source.vendored-sources]
directory = "vendor"
```

## Notes / failure modes

- `vendor/` is large — USB or release artifact, not default git content.
- After dependency bumps, re-run the script on a networked host and refresh the tarball.
- If `--offline` fails after documented steps → PHASE2 **R3**: online-first still valid for Phase 1; offline is best-effort.
- Never leave a live crates.io source on an air-gapped machine when you intend pure offline builds.
