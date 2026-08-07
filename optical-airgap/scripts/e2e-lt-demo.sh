#!/usr/bin/env bash
# Sentinel Standard — LT Soliton stream/peel demo (no age required)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/rust"
MSG="${1:-hello-sentinel}"
echo "==> frame-stream | frame-peel" >&2
echo "$MSG" | cargo run --quiet --bin trv-optical -- frame-stream 16 48 \
  | cargo run --quiet --bin trv-optical -- frame-peel
echo >&2
echo "(expected: $MSG)" >&2
