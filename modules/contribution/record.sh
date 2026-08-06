#!/data/data/com.termux/files/usr/bin/bash
# Append a local contribution event (offline JSONL + hash chain)
set -euo pipefail

KIND="${1:-}"
AMOUNT="${2:-1}"
NOTE="${3:-}"

if [[ -z "$KIND" ]]; then
  echo "Usage: $0 <kind> [amount] [note]"
  echo "  kinds: uptime | optical_e2e | verification | presence | storage | other"
  exit 1
fi

if ! [[ "$AMOUNT" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  echo "FAIL: amount must be numeric" >&2
  exit 1
fi

DIR="${HOME}/.local/share/remote-viewer/contribution"
mkdir -p "$DIR"
chmod 700 "$DIR" 2>/dev/null || true
FILE="${DIR}/events.jsonl"

TS=$(date -Iseconds)
ID="$(date +%s)-$$-$RANDOM"
NOTE_SAFE=$(printf '%s' "$NOTE" | tr -d '\n\r"\\' | head -c 200)
KIND_SAFE=$(printf '%s' "$KIND" | tr -d '\n\r"\\' | head -c 64)

# Previous line hash (or genesis)
if [[ -f "$FILE" ]] && [[ -s "$FILE" ]]; then
  PREV=$(tail -n 1 "$FILE")
  if command -v sha256sum >/dev/null 2>&1; then
    PREV_SHA=$(printf '%s' "$PREV" | sha256sum | awk '{print $1}')
  else
    PREV_SHA=$(printf '%s' "$PREV" | sha256 | awk '{print $1}')
  fi
else
  PREV_SHA="genesis"
fi

BODY=$(printf '{"id":"%s","ts":"%s","kind":"%s","amount":%s,"note":"%s","prev":"%s"}' \
  "$ID" "$TS" "$KIND_SAFE" "$AMOUNT" "$NOTE_SAFE" "$PREV_SHA")

if command -v sha256sum >/dev/null 2>&1; then
  SHA=$(printf '%s' "$BODY" | sha256sum | awk '{print $1}')
else
  SHA=$(printf '%s' "$BODY" | sha256 | awk '{print $1}')
fi

printf '%s,"sha":"%s"}\n' "${BODY%\}"" "$SHA" >> "$FILE"
chmod 600 "$FILE" 2>/dev/null || true
echo "Recorded: $KIND_SAFE amount=$AMOUNT id=$ID sha=${SHA:0:12}…"
