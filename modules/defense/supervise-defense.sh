#!/data/data/com.termux/files/usr/bin/bash
# Periodic integrity pulse (local only)
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
INTERVAL="${DEFENSE_INTERVAL:-300}"
LOG="${HOME}/.local/share/remote-viewer/defense.log"
mkdir -p "${HOME}/.local/share/remote-viewer"

if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock || true
fi

echo "[$(date -Iseconds)] supervise-defense interval=${INTERVAL}s" | tee -a "$LOG"
while true; do
  # Rotate logs if needed (cheap check)
  bash "$ROOT/modules/defense/rotate-logs.sh" >/dev/null 2>&1 || true

  bash "$ROOT/modules/defense/integrity-pulse.sh" || true
  sleep "$INTERVAL"
done
