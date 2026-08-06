#!/data/data/com.termux/files/usr/bin/bash
# RAG ask: plain local text → model
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
TAG="${1:-general}"
shift || true
QUESTION="${*:-}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 <model-tag> <question>"
  exit 1
fi

CTX=$(bash "$ROOT/modules/rag/retrieve.sh" "$QUESTION" 2>/dev/null || true)
if [[ -z "$CTX" ]]; then
  echo "[sources] none — model-only answer"
  CTX="No local notes matched this question."
else
  echo "[sources] local notes attached"
fi

PROMPT="You are The Sentinel on-device assistant.
Use the NOTES below when they answer the question. Prefer those words. If NOTES do not answer it, say you do not have that in local notes. Keep the answer short. Do not invent apps or websites.

NOTES:
$CTX

QUESTION: $QUESTION

ANSWER:"

export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
# --no-display-prompt hides the long prompt symbols from the screen
export LLAMA_ARGS="${LLAMA_ARGS:--n 160 -c 4096 -t 4 --no-display-prompt}"

bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$PROMPT"
