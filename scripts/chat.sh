#!/data/data/com.termux/files/usr/bin/bash
# Interactive local chat — stay in the loop. Ctrl+C or /exit only if you want to quit.
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 128 -c 4096 -t 4}"
TAG="${TRV_CHAT_TAG:-general}"
DOCS="${HOME}/.local/share/remote-viewer/rag/docs"
mkdir -p "$DOCS"

if [[ ! -x "$LLAMA_CLI" ]] && [[ ! -f "$LLAMA_CLI" ]]; then
  if command -v llama-cli >/dev/null 2>&1; then
    export LLAMA_CLI=$(command -v llama-cli)
  else
    echo "FAIL: set LLAMA_CLI to your llama-cli binary"
    exit 1
  fi
fi

USE_RAG=0
if [[ -d "$HOME/.local/share/remote-viewer/rag/chunks" ]] && \
   [[ -n "$(ls -A "$HOME/.local/share/remote-viewer/rag/chunks" 2>/dev/null || true)" ]]; then
  USE_RAG=1
fi

echo "The Sentinel — local chat (stays open)"
echo "  model: $TAG  |  RAG: $([[ $USE_RAG -eq 1 ]] && echo on || echo off)"
echo "  /note <text>   save a personal fact to RAG (no exit)"
echo "  /notes         list personal notes file"
echo "  /ingest        rebuild RAG chunks"
echo "  /tag general|code|moe   /rag on|off   /exit"
echo

while true; do
  printf "you> "
  if ! IFS= read -r line; then
    echo
    break
  fi
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"
  [[ -z "$line" ]] && continue

  case "$line" in
    /exit|/quit|/q) echo "bye"; break ;;
    /tag\ *)
      TAG="${line#/tag }"
      TAG="${TAG%% *}"
      echo "[tag=$TAG]"
      continue
      ;;
    /rag\ on) USE_RAG=1; echo "[rag=on]"; continue ;;
    /rag\ off) USE_RAG=0; echo "[rag=off]"; continue ;;
    /note)
      echo "Usage: /note your fact here"
      continue
      ;;
    /note\ *)
      fact="${line#/note }"
      printf '%s\n' "$fact" >> "$DOCS/personal.txt"
      echo "[saved to personal.txt]"
      bash "$ROOT/modules/rag/ingest.sh" >/dev/null 2>&1 || true
      USE_RAG=1
      echo "[rag re-ingested]"
      continue
      ;;
    /notes)
      if [[ -f "$DOCS/personal.txt" ]]; then
        echo "--- personal.txt ---"
        cat "$DOCS/personal.txt"
        echo "--------------------"
      else
        echo "(no personal.txt yet — use /note ...)"
      fi
      continue
      ;;
    /ingest)
      bash "$ROOT/modules/rag/ingest.sh" || true
      USE_RAG=1
      continue
      ;;
    /*) echo "unknown command"; continue ;;
  esac

  if [[ "$USE_RAG" -eq 1 ]]; then
    bash "$ROOT/modules/rag/ask.sh" "$TAG" "$line" || true
  else
    bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$line" || true
  fi
  echo
done
