#!/data/data/com.termux/files/usr/bin/bash
# Supervise optical-airgap related long-running helpers (if any)
# Default: no-op if nothing is running; use with watchdog for daemons you start.

set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
LOG_DIR="${HOME}/.local/share/remote-viewer"
mkdir -p "$LOG_DIR"

# Optical path is primarily on-demand (encrypt/frame/peel/decrypt).
# This supervisor is for optional background receivers or lab loops.
TARGET="${1:-optical-airgap}"

exec "$(dirname "$0")/watchdog.sh" "$TARGET"
