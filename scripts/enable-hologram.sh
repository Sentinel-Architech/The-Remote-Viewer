#!/bin/sh
# Three-step host enablement for the holographic surface.
# Step 1: clone the repository.
# Step 2: run this script.
# Step 3: use the command this script prints.
# A 30-second run is possible only when Rust is already installed and only for the host crate.
set -eu
cd "$(dirname "$0")/.."

os="$(uname -s 2>/dev/null || echo unknown)"
case "$os" in
  Linux) host="linux"; entry="trv_hologram_init_wayland" ;;
  Darwin) host="apple"; entry="trv_hologram_init_ios" ;;
  MINGW*|MSYS*|CYGWIN*) host="windows"; entry="trv_hologram_init_win32" ;;
  *) host="unknown"; entry="see PLATFORM-SUPPORT.md" ;;
esac

if [ -n "${OHOS_SDK_HOME:-}" ]; then
  host="harmonyos"
  entry="trv_hologram_init_harmonyos"
fi
if [ -n "${ANDROID_NDK_HOME:-}${ANDROID_NDK_ROOT:-}" ]; then
  host="android"
  entry="trv_hologram_init_android"
fi

echo "Host class: $host"
echo "Native entry: $entry"

if ! command -v cargo >/dev/null 2>&1; then
  echo "Rust is not installed. Install it from https://rustup.rs and run this script again."
  echo "That install is not a 30-second step."
  exit 1
fi

cargo check -p trv-holographic-ui

if command -v zip >/dev/null 2>&1; then
  mkdir -p dist
  (cd platforms/kaios && zip -qr "../../dist/trv-kaios.zip" .)
  echo "KaiOS package: dist/trv-kaios.zip"
else
  echo "zip is not installed; KaiOS package was not created."
fi

echo "Next: link the static library and call $entry from the host window."
echo "Desktop link only: cargo build -p desktop --features hologram"
