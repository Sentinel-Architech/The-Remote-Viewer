#!/data/data/com.termux/files/usr/bin/bash
# Simple local health report for TRV services

set -euo pipefail

LOG_DIR="${HOME}/.local/share/remote-viewer"
LOG_FILE="${LOG_DIR}/self-heal.log"

echo "=== TRV Self-Heal Health ==="
echo "Time: $(date -Iseconds)"
echo

if [[ -f "$LOG_FILE" ]]; then
  echo "Last 10 self-heal events:"
  tail -n 10 "$LOG_FILE"
else
  echo "No self-heal log yet ($LOG_FILE)"
fi

echo
echo "Running TRV-related processes (best-effort):"
pgrep -af "optical\|remote-viewer\|trv-\|llama\|watchdog" 2>/dev/null || echo "(none matched)"
