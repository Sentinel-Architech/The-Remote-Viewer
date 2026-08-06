#!/data/data/com.termux/files/usr/bin/bash
# Local chat — normal Q&A + memory of what you say. Not notes-only.
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 180 -c 4096 -t 4 --no-display-prompt}"
TAG="${TRV_CHAT_TAG:-general}"
DOCS="${HOME}/.local/share/remote-viewer/rag/docs"
mkdir -p "$DOCS"

if [[ ! -x "$LLAMA_CLI" ]] && [[ ! -f "$LLAMA_CLI" ]]; then
  if command -v llama-cli >/dev/null 2>&1; then
    export LLAMA_CLI=$(command -v llama-cli)
  else
    echo "FAIL: llama-cli not found"; exit 1
  fi
fi

bar() {
  echo
  echo "[-- /note | /memory | /memclear | /remind | /strict notes | /exit --]"
}

echo "The Sentinel — talk normally. I keep what you say in local memory."
echo "  Small model can still err; memory reduces re-asking."
bar
echo

while true; do
  printf "you> "
  if ! IFS= read -r line; then echo; break; fi
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"
  [[ -z "$line" ]] && continue

  case "$line" in
    /exit|/quit|/q) echo "bye"; break ;;
    /memory|/mem)
      bash "$ROOT/modules/rag/memory.sh" dump 50; bar; continue ;;
    /memclear)
      bash "$ROOT/modules/rag/memory.sh" clear; bar; continue ;;
    /strict|/strict\ notes)
      bash "$ROOT/modules/rag/ask-strict.sh" ""; echo "For one extractive answer: bash modules/rag/ask-strict.sh your question"; bar; continue ;;
    /note)
      echo "Usage: /note fact to store permanently in RAG"; bar; continue ;;
    /note\ *)
      fact="${line#/note }"
      printf '%s\n' "$fact" >> "$DOCS/personal.txt"
      bash "$ROOT/modules/rag/memory.sh" add "$fact" || true
      bash "$ROOT/modules/rag/ingest.sh" >/dev/null 2>&1 || true
      echo "[saved to notes + memory]"; bar; continue ;;
    /notes)
      if [[ -f "$DOCS/personal.txt" ]]; then cat "$DOCS/personal.txt"; else echo "(empty)"; fi
      bar; continue ;;
    /remind\ *)
      bash "$ROOT/modules/reminders/notify.sh" "${line#/remind }" 2>/dev/null || echo "termux-api?"; bar; continue ;;
    /remindat\ *)
      rest="${line#/remindat }"; when="${rest%% *}"; msg="${rest#* }"
      bash "$ROOT/modules/reminders/remind-at.sh" "$when" "$msg" 2>/dev/null || true; bar; continue ;;
    /ingest)
      bash "$ROOT/modules/rag/ingest.sh" || true; bar; continue ;;
    /tag\ *)
      TAG="${line#/tag }"; TAG="${TAG%% *}"; echo "[tag=$TAG]"; bar; continue ;;
    /*) echo "unknown"; bar; continue ;;
  esac

  bash "$ROOT/modules/rag/ask.sh" "$TAG" "$line" || true
  bar
done
