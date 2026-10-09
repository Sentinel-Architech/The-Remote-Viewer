#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ "$(uname -s)" != "Darwin" ]; then
  echo "The iOS installer must run on a Mac. No cross-binary is downloaded."
  exit 1
fi
command -v cargo >/dev/null || { echo "Install Rust from https://rustup.rs first."; exit 1; }
xcodebuild -version >/dev/null
rustup target add aarch64-apple-ios
cargo build -p trv-holographic-ui --release --target aarch64-apple-ios
echo "iOS library built. Call trv_hologram_init_ios with the UIView."
echo "A signed IPA still requires an Xcode project and your Apple signing identity."
