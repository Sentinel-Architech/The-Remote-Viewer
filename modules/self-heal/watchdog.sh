#!/data/data/com.termux/files/usr/bin/bash
# TRV Self-Heal Watchdog — local process supervisor
# Runs under GrapheneOS + Termux. No network. No telemetry.

set -euo pipefail

TARGET="${1:-}"
INTERVAL="${WATCHDOG_INTERVAL:-15}"
LOG_DIR="${HOME}/.local/share/remote-viewer"
LOG_FILE="${LOG_DIR}/self-heal.log"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <script-or-command-to-supervise>"
  exit 1
fi

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date -Iseconds)] $*" | tee -a "$LOG_FILE"
}

# Acquire wake-lock if termux-api is present
if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock || true
fi

log "Self-heal watchdog started for: $TARGET"

while true; do
  if ! pgrep -f "$TARGET" >/dev/null 2>&1; then
    log "Process not running. Restarting: $TARGET"
    # shellcheck disable=SC2086
    nohup bash -c "$TARGET" >>"$LOG_FILE" 2>&1 &
    sleep 2
    if pgrep -f "$TARGET" >/dev/null 2>&1; then
      log "Restart successful"
    else
      log "Restart failed — will retry"
    fi
  fi
  sleep "$INTERVAL"
done
