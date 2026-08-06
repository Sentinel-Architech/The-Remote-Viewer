#!/data/data/com.termux/files/usr/bin/bash
# Serve TRV local console on 127.0.0.1 only (no LAN bind)
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
UI="$ROOT/apps/ui"
PORT="${TRV_UI_PORT:-8765}"

cd "$UI"
echo "TRV UI → http://127.0.0.1:${PORT}/"
echo "Bind: 127.0.0.1 only. Ctrl+C to stop."
echo

if command -v python3 >/dev/null 2>&1; then
  exec python3 - <<PY
import http.server, socketserver
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[ui]", fmt % args)
with socketserver.TCPServer(("127.0.0.1", ${PORT}), H) as httpd:
    httpd.serve_forever()
PY
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT" --bind 127.0.0.1
else
  echo "FAIL: need python3" >&2
  exit 1
fi
