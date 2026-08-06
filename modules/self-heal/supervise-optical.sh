#!/data/data/com.termux/files/usr/bin/bash
# Supervise optical readiness pulse (not full e2e — e2e stays on-demand).
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
PULSE="$ROOT/modules/self-heal/optical-pulse.sh"
INTERVAL="${WATCHDOG_INTERVAL:-60}"
LOG_DIR="${HOME}/.local/share/remote-viewer"
LOG_FILE="${LOG_DIR}/self-heal.log"

mkdir -p "$LOG_DIR"
chmod +x "$PULSE" 2>/dev/null || true

log() { echo "[$(date -Iseconds)] supervise-optical: $*" | tee -a "$LOG_FILE"; }

if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock || true
fi

log "starting optical pulse loop interval=${INTERVAL}s"

while true; do
  if bash "$PULSE"; then
    :
  else
    log "pulse failed — will retry"
  fi
  sleep "$INTERVAL"
done
