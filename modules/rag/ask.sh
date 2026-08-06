#!/data/data/com.termux/files/usr/bin/bash
# RAG ask: retrieve local chunks → MoE run-model
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
  echo "[sources] none matched — answer will be model-only (less reliable)"
  CTX="(no local documents matched)"
else
  echo "[sources] using local chunks below in the prompt"
fi

PROMPT="You are The Sentinel on-device assistant.
Rules:
1. Prefer facts that appear in CONTEXT. Quote or paraphrase them tightly.
2. If CONTEXT is empty or does not answer the question, say: I do not have that in local docs.
3. Do not invent hardware chips, cloud services, or features not listed in CONTEXT.
4. Be short.

CONTEXT:
$CTX

QUESTION: $QUESTION

ANSWER:"

export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 160 -c 4096 -t 4}"

bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$PROMPT"
