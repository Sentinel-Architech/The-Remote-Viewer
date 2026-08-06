#!/data/data/com.termux/files/usr/bin/bash
# Supervise on-device specialist / router path (llama.cpp or route.py long-runners)

set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
# Prefer explicit command; fallback to router list loop is wrong — require user target
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <command-or-script-to-supervise>"
  echo "Example: $0 'python $ROOT/grok/router/route.py --serve'"
  echo "Example: $0 'llama-server -m $HOME/models/Qwen*.gguf --port 8080'"
  exit 1
fi

exec "$(dirname "$0")/watchdog.sh" "$TARGET"
