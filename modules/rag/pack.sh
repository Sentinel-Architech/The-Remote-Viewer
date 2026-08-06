#!/data/data/com.termux/files/usr/bin/bash
# Pack retrieved notes + memory into a single context block
set -euo pipefail
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
QUESTION="${*:-}"
MAX="${RAG_PACK_CHARS:-3500}"

NOTES=$(bash "$ROOT/modules/rag/retrieve.sh" "$QUESTION" 2>/dev/null || true)
MEM=$(bash "$ROOT/modules/rag/memory.sh" dump 25 2>/dev/null || true)

{
  echo "NOTES:"
  if [[ -n "$NOTES" ]]; then echo "$NOTES"; else echo "(none)"; fi
  echo
  echo "MEMORY:"
  if [[ -n "$MEM" ]]; then echo "$MEM"; else echo "(none)"; fi
} | head -c "$MAX"
echo
