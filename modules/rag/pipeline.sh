#!/data/data/com.termux/files/usr/bin/bash
# Run full RAG pipeline: memory add → pack → generate|extract
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
MODE="${1:-generate}"  # generate | extract | pack
shift || true
QUESTION="${*:-}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 generate|extract|pack <question>"
  exit 1
fi

bash "$ROOT/modules/rag/memory.sh" add "$QUESTION" || true

case "$MODE" in
  pack)
    bash "$ROOT/modules/rag/pack.sh" "$QUESTION"
    ;;
  extract)
    bash "$ROOT/modules/rag/ask-strict.sh" "$QUESTION"
    ;;
  generate)
    bash "$ROOT/modules/rag/ask.sh" general "$QUESTION"
    ;;
  *)
    echo "Unknown mode $MODE"
    exit 1
    ;;
esac
