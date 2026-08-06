#!/data/data/com.termux/files/usr/bin/bash
# Normal Q&A with optional notes + session memory. Not notes-only.
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
TAG="${1:-general}"
shift || true
QUESTION="${*:-}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 <model-tag> <question>"
  exit 1
fi

# Remember this user turn
bash "$ROOT/modules/rag/memory.sh" add "$QUESTION" || true

NOTES=$(bash "$ROOT/modules/rag/retrieve.sh" "$QUESTION" 2>/dev/null || true)
MEM=$(bash "$ROOT/modules/rag/memory.sh" dump 30 2>/dev/null || true)

PROMPT="You are The Sentinel, a local on-device assistant for the user (solo developer of The Remote Viewer). Be direct and useful.

Rules:
1. Answer the question. Do not repeat the user's words back unless you truly did not understand.
2. Use NOTES when relevant. Use MEMORY for what the user already told you — do not ask them to restate it.
3. Do not invent universities, labs, companies, or affiliations. The user is independent and not part of a school.
4. Do not invent medical diagnoses or claim you set phone alarms. If you cannot do something on-device, say so in one line.
5. Keep answers short unless asked for detail.

NOTES (local files, may be empty):
${NOTES:-none}

MEMORY (recent things the user said):
${MEM:-none}

QUESTION: $QUESTION

ANSWER:"

export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 180 -c 4096 -t 4 --no-display-prompt}"
bash "$ROOT/modules/moe-router/run-model.sh" "$TAG" "$PROMPT"
