#!/data/data/com.termux/files/usr/bin/bash
# Append a local contribution event (offline JSONL)
set -euo pipefail

KIND="${1:-}"
AMOUNT="${2:-1}"
NOTE="${3:-}"

if [[ -z "$KIND" ]]; then
  echo "Usage: $0 <kind> [amount] [note]"
  echo "  kinds: uptime | optical_e2e | verification | presence | storage | other"
  exit 1
fi

# amount must be numeric (integer or simple decimal)
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

# Strip characters that break our minimal JSON line
NOTE_SAFE=$(printf '%s' "$NOTE" | tr -d '\n\r"\\' | head -c 200)
KIND_SAFE=$(printf '%s' "$KIND" | tr -d '\n\r"\\' | head -c 64)

printf '{"id":"%s","ts":"%s","kind":"%s","amount":%s,"note":"%s"}\n' \
  "$ID" "$TS" "$KIND_SAFE" "$AMOUNT" "$NOTE_SAFE" >> "$FILE"

chmod 600 "$FILE" 2>/dev/null || true
echo "Recorded: $KIND_SAFE amount=$AMOUNT id=$ID"
