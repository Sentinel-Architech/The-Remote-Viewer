#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
command -v cargo >/dev/null || { echo "Install Rust from https://rustup.rs first."; exit 1; }
cargo build -p trv-holographic-ui --release
echo "Linux library built. Call trv_hologram_init_wayland."
