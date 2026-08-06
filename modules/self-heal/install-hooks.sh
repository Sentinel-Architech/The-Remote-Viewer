#!/data/data/com.termux/files/usr/bin/bash
# One-shot: make self-heal scripts executable and ensure log dir exists

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
chmod +x "$DIR"/*.sh
mkdir -p "${HOME}/.local/share/remote-viewer"
echo "Self-heal scripts executable. Log dir ready."
echo "Wire into a service with:"
echo "  $DIR/watchdog.sh 'your-daemon-command'"
echo "  $DIR/supervise-specialist.sh 'python path/to/route.py ...'"
