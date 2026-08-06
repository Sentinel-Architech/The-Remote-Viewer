#!/data/data/com.termux/files/usr/bin/bash
# Fired by termux-job-scheduler or manual run — medicine notification
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
MSG="${TRV_MED_MSG:-Take medicine}"
bash "$ROOT/modules/reminders/notify.sh" "$MSG"
echo "[daily-med $(date -Iseconds)] $MSG" >> "${HOME}/.local/share/remote-viewer/reminders.log"
