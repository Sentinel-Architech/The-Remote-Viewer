#!/usr/bin/env bash
# One-time networked step: vendor crates for air-gapped cargo --offline.
# Run from a machine with crates.io access, then USB the result.
#
# Usage:
#   bash scripts/vendor-offline.sh           # vendor + config
#   bash scripts/vendor-offline.sh --tarball # also write trv-rust-vendor.tgz
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v cargo >/dev/null 2>&1; then
  echo "error: cargo not found" >&2
  exit 1
fi

echo "==> cargo vendor vendor"
cargo vendor vendor

mkdir -p .cargo
if [[ ! -f .cargo/config.toml.example ]]; then
  echo "error: missing .cargo/config.toml.example" >&2
  exit 1
fi
cp -f .cargo/config.toml.example .cargo/config.toml
echo "==> wrote .cargo/config.toml (replace-with vendored-sources)"

echo "==> verifying offline resolve"
cargo check --offline --quiet
echo "==> cargo check --offline OK"

if [[ "${1:-}" == "--tarball" ]]; then
  OUT="${ROOT}/trv-rust-vendor.tgz"
  echo "==> packing $OUT"
  tar czf "$OUT" \
    vendor \
    .cargo/config.toml \
    .cargo/config.toml.example \
    Cargo.toml \
    Cargo.lock \
    src \
    examples \
    scripts \
    OFFLINE.md \
    README.md 2>/dev/null || tar czf "$OUT" vendor .cargo/config.toml Cargo.toml Cargo.lock src
  ls -lh "$OUT"
  echo "USB this tarball + extract on air-gapped host, then: cargo test --offline"
fi

echo "done. Air-gap: cargo build --offline && cargo test --offline"
