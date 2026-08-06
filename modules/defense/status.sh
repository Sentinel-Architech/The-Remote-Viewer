#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
BASE="${HOME}/.local/share/remote-viewer"
LOG="${BASE}/defense.log"
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
echo "=== TRV Defense / Hydra Status ==="
echo "Time: $(date -Iseconds)"
echo
bash "$ROOT/modules/defense/integrity-pulse.sh" || true
echo
if [[ -f "$LOG" ]]; then
  echo "Last 12 log lines:"
  tail -n 12 "$LOG"
fi
