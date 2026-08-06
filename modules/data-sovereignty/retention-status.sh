#!/data/data/com.termux/files/usr/bin/bash
# Report age of local artifacts vs locked retention intent (device-side)

set -euo pipefail

BASE="${HOME}/.local/share/remote-viewer"

echo "=== Local Retention Status ==="
echo "Locked reference: docs/locked/12-Retention-Schedules.md"
echo "Note: schedules govern platform-side max; this reports *device* artifacts."
echo

if [[ ! -d "$BASE" ]]; then
  echo "No $BASE — nothing retained locally under TRV share path."
  exit 0
fi

now=$(date +%s)

report() {
  local path="$1"
  local label="$2"
  if [[ -e "$path" ]]; then
    local mtime
    mtime=$(stat -c '%Y' "$path" 2>/dev/null || stat -f '%m' "$path" 2>/dev/null || echo 0)
    local age=$(( (now - mtime) / 3600 ))
    echo "$label: ${age}h since mtime ($path)"
  else
    echo "$label: (absent)"
  fi
}

report "$BASE/identity" "Identity dir"
report "$BASE/identity/identity.agekey" "Identity secret"
report "$BASE/contribution/events.jsonl" "Contribution ledger"
report "$BASE/self-heal.log" "Self-heal log"

echo
echo "Guidance: identity is user-held (no platform TTL)."
echo "Contribution/events are local design data — prune with destroy-restart when path ends."
