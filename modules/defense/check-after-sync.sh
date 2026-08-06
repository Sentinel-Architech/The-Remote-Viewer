#!/data/data/com.termux/files/usr/bin/bash
# Run after git-sync: integrity + minimize
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
echo "=== Defense check-after-sync ==="
bash "$ROOT/modules/defense/integrity-pulse.sh" || true
echo
bash "$ROOT/modules/data-sovereignty/minimize-check.sh" || true
