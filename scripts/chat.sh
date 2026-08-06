#!/data/data/com.termux/files/usr/bin/bash
# Local chat — default STRICT (extractive notes only). /strict on|off|extract
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 128 -c 4096 -t 4 --no-display-prompt}"
TAG="${TRV_CHAT_TAG:-general}"
DOCS="${HOME}/.local/share/remote-viewer/rag/docs"
mkdir -p "$DOCS"

# Default: no hallucinations from model — notes only
STRICT="${RAG_STRICT:-1}"
USE_RAG=1

if [[ ! -x "$LLAMA_CLI" ]] && [[ ! -f "$LLAMA_CLI" ]]; then
  if command -v llama-cli >/dev/null 2>&1; then
    export LLAMA_CLI=$(command -v llama-cli)
  fi
fi

bar() {
  echo
  echo "[-- mode: $([[ "$STRICT" == "0" ]] && echo model || echo strict-notes) | /note | /notes | /strict on|off | /remind | /exit --]"
}

echo "The Sentinel — local chat"
echo "  DEFAULT: strict notes only (zero model invention)"
echo "  /strict off  → allow small model (can hallucinate)"
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
    /strict|/strict\ on|/strict\ extract)
      STRICT=1; export RAG_STRICT=1
      echo "[strict] notes only — no model invention"; bar; continue ;;
    /strict\ off)
      STRICT=0; export RAG_STRICT=0
      echo "[strict off] model allowed — hallucinations possible"; bar; continue ;;
    /tag\ *)
      TAG="${line#/tag }"; TAG="${TAG%% *}"
      echo "[tag=$TAG]"; bar; continue ;;
    /rag\ on) USE_RAG=1; echo "[rag=on]"; bar; continue ;;
    /rag\ off) USE_RAG=0; STRICT=0; export RAG_STRICT=0; echo "[rag=off model-only]"; bar; continue ;;
    /note)
      echo "Usage: /note plain words here"; bar; continue ;;
    /note\ *)
      fact="${line#/note }"
      printf '%s\n' "$fact" >> "$DOCS/personal.txt"
      echo "[saved]"
      bash "$ROOT/modules/rag/ingest.sh" >/dev/null 2>&1 || true
      USE_RAG=1
      echo "[ingested]"; bar; continue ;;
    /notes)
      if [[ -f "$DOCS/personal.txt" ]]; then
        echo "--- personal.txt ---"; cat "$DOCS/personal.txt"; echo "--------------------"
      else
        echo "(no personal.txt — use /note ...)"
      fi
      bar; continue ;;
    /remind)
      echo "Usage: /remind message"; bar; continue ;;
    /remind\ *)
      bash "$ROOT/modules/reminders/notify.sh" "${line#/remind }" || true
      bar; continue ;;
    /remindat\ *)
      rest="${line#/remindat }"
      when="${rest%% *}"; msg="${rest#* }"
      bash "$ROOT/modules/reminders/remind-at.sh" "$when" "$msg" || true
      bar; continue ;;
    /ingest)
      bash "$ROOT/modules/rag/ingest.sh" || true; bar; continue ;;
    /*) echo "unknown command"; bar; continue ;;
  esac

  if [[ "$STRICT" != "0" ]]; then
    bash "$ROOT/modules/rag/ask-strict.sh" "$line" || true
  elif [[ "$USE_RAG" -eq 1 ]]; then
    RAG_STRICT=0 bash "$ROOT/modules/rag/ask.sh" "$TAG" "$line" || true
  else
    bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$line" || true
  fi
  bar
done
