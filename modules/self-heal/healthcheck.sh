#!/data/data/com.termux/files/usr/bin/bash
# Local health report: self-heal log + optical vault readiness
set -euo pipefail

LOG_DIR="${HOME}/.local/share/remote-viewer"
LOG_FILE="${LOG_DIR}/self-heal.log"
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"

echo "=== TRV Self-Heal Health ==="
echo "Time: $(date -Iseconds)"
echo

echo "-- Optical vault --"
if [[ -f "$HOME/vault-recipient.txt" ]]; then
  echo "OK: vault-recipient.txt present"
else
  echo "MISS: vault-recipient.txt"
fi
if [[ -f "$HOME/vault-identity.txt" ]]; then
  MODE=$(stat -c '%a' "$HOME/vault-identity.txt" 2>/dev/null || stat -f '%Lp' "$HOME/vault-identity.txt" 2>/dev/null || echo '?')
  echo "OK: vault-identity.txt present (mode $MODE)"
else
  echo "MISS: vault-identity.txt"
fi
echo

if [[ -f "$LOG_FILE" ]]; then
  echo "Last 10 self-heal events:"
  tail -n 10 "$LOG_FILE"
else
  echo "No self-heal log yet ($LOG_FILE)"
fi

echo
echo "Running TRV-related processes (best-effort):"
pgrep -af "optical-pulse|supervise-optical|watchdog|trv-optical|remote-viewer" 2>/dev/null || echo "(none matched)"
echo
echo "One-shot pulse:"
bash "$ROOT/modules/self-heal/optical-pulse.sh" || true
