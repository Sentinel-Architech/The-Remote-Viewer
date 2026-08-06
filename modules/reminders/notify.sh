#!/data/data/com.termux/files/usr/bin/bash
# Fire a local notification now
set -euo pipefail
TITLE="${TRV_NOTIFY_TITLE:-Sentinel}"
BODY="${*:-Reminder}"

if command -v termux-notification >/dev/null 2>&1; then
  termux-notification --title "$TITLE" --content "$BODY" --priority high || {
    echo "FAIL: termux-notification error (check Termux:API permissions)"
    exit 2
  }
  echo "[notify] $BODY"
else
  echo "FAIL: termux-api not installed"
  echo "  pkg install termux-api"
  echo "  Install Termux:API app from F-Droid"
  exit 1
fi
