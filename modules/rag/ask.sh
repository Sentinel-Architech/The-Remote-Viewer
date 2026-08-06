#!/data/data/com.termux/files/usr/bin/bash
# Generate stage: packed notes + memory → llama.cpp
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
TAG="${1:-general}"
shift || true
QUESTION="${*:-}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 <model-tag> <question>"
  exit 1
fi

bash "$ROOT/modules/rag/memory.sh" add "$QUESTION" || true
PACKED=$(bash "$ROOT/modules/rag/pack.sh" "$QUESTION" 2>/dev/null || true)

echo "[rag] pipeline: retrieve → pack → generate"

PROMPT="You are The Sentinel, local assistant for a solo independent developer (The Remote Viewer). Not a university lab product.

Rules:
1. Answer the question. Do not echo the question back unless you did not understand.
2. Prefer NOTES and MEMORY when they apply.
3. Never invent schools, labs, employers, or telepathy.
4. If you cannot do an action on the device (alarms, email), say you cannot in one line.
5. Short answers.

$PACKED

QUESTION: $QUESTION

ANSWER:"

export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 180 -c 4096 -t 4 --no-display-prompt}"
bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$PROMPT"
