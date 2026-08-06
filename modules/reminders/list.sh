#!/data/data/com.termux/files/usr/bin/bash
LOG="${HOME}/.local/share/remote-viewer/reminders.log"
if [[ -f "$LOG" ]]; then
  tail -n 30 "$LOG"
else
  echo "(no reminder log yet)"
fi
