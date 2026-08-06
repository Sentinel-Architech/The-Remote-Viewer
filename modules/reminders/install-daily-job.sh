#!/data/data/com.termux/files/usr/bin/bash
# Register a periodic Termux job (best-effort). Requires termux-api + Termux:API app.
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
SCRIPT="$ROOT/modules/reminders/daily-med.sh"
chmod +x "$SCRIPT" "$ROOT/modules/reminders/notify.sh" 2>/dev/null || true

if ! command -v termux-job-scheduler >/dev/null 2>&1; then
  echo "FAIL: termux-job-scheduler missing — pkg install termux-api"
  exit 1
fi

# Job id 42 = TRV daily med. period_ms ~ 24h is not exact; Android batches jobs.
# For exact 18:00 use system Clock; this is a backup nudge.
termux-job-scheduler -p "$SCRIPT" --job-id 42 --period-ms 86400000 --network none --battery-not-low false || {
  echo "Scheduler call failed. Check Termux:API permissions / background limits."
  exit 2
}
echo "[ok] job-id 42 registered → $SCRIPT"
echo "Note: Android may delay jobs. Set Clock app alarm for exact 18:00."
echo "Test now: bash $SCRIPT"
