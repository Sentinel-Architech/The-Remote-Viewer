#!/data/data/com.termux/files/usr/bin/bash
# Append a local contribution event (offline)

set -euo pipefail

KIND="${1:-}"
AMOUNT="${2:-0}"
NOTE="${3:-}"

if [[ -z "$KIND" ]]; then
  echo "Usage: $0 <kind> [amount] [note]"
  echo "  kind examples: uptime, storage, verification, presence"
  exit 1
fi

DIR="${HOME}/.local/share/remote-viewer/contribution"
mkdir -p "$DIR"
FILE="${DIR}/events.jsonl"

TS=$(date -Iseconds)
# Simple JSON line (no external jq dependency required)
printf '{"ts":"%s","kind":"%s","amount":%s,"note":"%s"}\n' \
  "$TS" "$KIND" "$AMOUNT" "${NOTE//"/\"}" >> "$FILE"

echo "Recorded: $KIND ($AMOUNT) at $TS"
