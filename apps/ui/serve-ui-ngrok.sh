#!/data/data/com.termux/files/usr/bin/bash
# OPTIONAL: expose local TRV UI via ngrok
# Default posture remains 127.0.0.1 only. This is opt-in and risky.
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
PORT="${TRV_UI_PORT:-8765}"

echo "WARNING: This creates a public HTTPS URL to your local UI."
echo "  - UI does not run shell or read keys, but the page is visible to anyone with the URL."
echo "  - Prefer SSH/Tailscale for remote admin. Ngrok is convenience, not sovereignty."
echo "  - Stop with Ctrl+C (kills tunnel; stop UI separately if needed)."
echo

if ! command -v ngrok >/dev/null 2>&1; then
  echo "FAIL: ngrok not installed."
  echo "  Termux: download from https://ngrok.com/download or pkg if available"
  echo "  Then: ngrok config add-authtoken <YOUR_TOKEN>"
  exit 1
fi

# Start UI in background if port free
if ! (echo >/dev/tcp/127.0.0.1/"$PORT") 2>/dev/null; then
  echo "Starting local UI on 127.0.0.1:${PORT}…"
  bash "$ROOT/apps/ui/serve-ui.sh" &
  UI_PID=$!
  sleep 1
  trap 'kill $UI_PID 2>/dev/null || true' EXIT
else
  echo "UI already listening on ${PORT}"
  UI_PID=""
fi

echo "Starting ngrok http ${PORT}…"
exec ngrok http "127.0.0.1:${PORT}"
