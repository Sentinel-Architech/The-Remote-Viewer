#!/data/data/com.termux/files/usr/bin/bash
# RAG ask — STRICT=1 (default) refuses model if weak match; STRICT=0 allows model
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
TAG="${1:-general}"
shift || true
QUESTION="${*:-}"
STRICT="${RAG_STRICT:-1}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 <model-tag> <question>"
  exit 1
fi

# Pure extractive path — no LLM
if [[ "$STRICT" == "1" ]] || [[ "$STRICT" == "extract" ]]; then
  exec bash "$ROOT/modules/rag/ask-strict.sh" "$QUESTION"
fi

CTX=$(bash "$ROOT/modules/rag/retrieve.sh" "$QUESTION" 2>/dev/null || true)
if [[ -z "$CTX" ]]; then
  echo "No local notes match. (Model disabled in safe mode. Set RAG_STRICT=0 to allow model.)"
  exit 0
fi

echo "[sources] local notes attached"

PROMPT="Answer ONLY using NOTES. If NOTES are insufficient, reply exactly: I do not have that in local notes. No extra facts.

NOTES:
$CTX

QUESTION: $QUESTION

ANSWER:"

export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 120 -c 4096 -t 4 --no-display-prompt}"
bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$PROMPT"
