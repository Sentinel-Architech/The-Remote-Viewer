#!/data/data/com.termux/files/usr/bin/bash
# Zero-invention answers: print matching local notes only. No model call.
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
QUESTION="${*:-}"

if [[ -z "$QUESTION" ]]; then
  echo "Usage: $0 <question>"
  exit 1
fi

CTX=$(bash "$ROOT/modules/rag/retrieve.sh" "$QUESTION" 2>/dev/null || true)
if [[ -z "$CTX" ]]; then
  echo "No local notes match that. Add facts with /note or seed-trv-docs.sh."
  exit 0
fi

echo "From your local notes:"
echo "$CTX"
