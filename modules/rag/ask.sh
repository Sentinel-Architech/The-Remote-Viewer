#!/data/data/com.termux/files/usr/bin/bash
# RAG ask: retrieve local chunks → MoE run-model
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
TAG="${1:-general}"
shift || true
QUESTION="${*:-}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 <model-tag> <question>"
  echo "Example: $0 general How does optical e2e work?"
  echo "Example: $0 code What is the contribution ledger?"
  exit 1
fi

CTX=$(bash "$ROOT/modules/rag/retrieve.sh" "$QUESTION" 2>/dev/null || true)
if [[ -z "$CTX" ]]; then
  echo "[rag] no local chunks matched — answering without retrieval"
  CTX="(no local documents matched)"
else
  echo "[rag] retrieved context for prompt"
fi

PROMPT="You are The Sentinel local assistant. Use ONLY the CONTEXT when it is relevant. If context is empty or irrelevant, say you lack local docs for that. Be concise.

CONTEXT:
$CTX

QUESTION: $QUESTION

ANSWER:"

export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 128 -c 2048 -t 4}"

bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$PROMPT"
