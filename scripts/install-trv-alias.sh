#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
LINE="alias trv='bash $ROOT/scripts/trv.sh'"
if grep -q "alias trv=" "$HOME/.bashrc" 2>/dev/null; then
  echo "trv alias already in ~/.bashrc"
else
  echo "$LINE" >> "$HOME/.bashrc"
  echo "Added: $LINE"
fi
echo "Run: source ~/.bashrc"
echo "Then: trv talk How does optical work?"
