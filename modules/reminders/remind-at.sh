#!/data/data/com.termux/files/usr/bin/bash
# Best-effort remind at HH:MM local (24h). Survives only while process can run.
set -euo pipefail
WHEN="${1:-}"
shift || true
BODY="${*:-Reminder}"

if [[ ! "$WHEN" =~ ^[0-2][0-9]:[0-5][0-9]$ ]]; then
  echo "Usage: $0 HH:MM message..."
  exit 1
fi

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
LOG="${HOME}/.local/share/remote-viewer/reminders.log"
mkdir -p "$(dirname "$LOG")"

now_s=$(date +%s)
target_s=$(date -d "today $WHEN" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M" "$(date +%Y-%m-%d) $WHEN" +%s 2>/dev/null || true)
if [[ -z "${target_s:-}" ]]; then
  # BusyBox/Android date fallback: compute with python
  target_s=$(python3 - "$WHEN" <<'PY'
import sys, datetime
h, m = map(int, sys.argv[1].split(":"))
now = datetime.datetime.now()
t = now.replace(hour=h, minute=m, second=0, microsecond=0)
if t <= now:
    t += datetime.timedelta(days=1)
print(int(t.timestamp()))
PY
)
fi
if [[ "$target_s" -le "$now_s" ]]; then
  target_s=$((target_s + 86400))
fi
delta=$((target_s - now_s))
echo "[remind-at] in ${delta}s → $BODY" | tee -a "$LOG"

(
  sleep "$delta"
  bash "$ROOT/modules/reminders/notify.sh" "$BODY"
  echo "[fired $(date -Iseconds)] $BODY" >> "$LOG"
) &
echo "[remind-at] scheduled pid $! (keep Termux alive; Clock app is more reliable for daily meds)"
