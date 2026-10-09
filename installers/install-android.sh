#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
command -v cargo >/dev/null || { echo "Install Rust from https://rustup.rs first."; exit 1; }
if [ -z "${ANDROID_NDK_HOME:-}${ANDROID_NDK_ROOT:-}" ]; then
  echo "Set ANDROID_NDK_HOME. This installer does not download the NDK."
  exit 1
fi
rustup target add aarch64-linux-android
cargo build -p trv-holographic-ui --release --target aarch64-linux-android
echo "Android library built. Call trv_hologram_init_android with ANativeWindow."
echo "A signed APK still requires your Android app project and a local keystore."
