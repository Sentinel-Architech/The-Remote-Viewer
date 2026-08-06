#!/data/data/com.termux/files/usr/bin/bash
# Contribution ledger status (offline)
set -euo pipefail

DIR="${HOME}/.local/share/remote-viewer/contribution"
FILE="${DIR}/events.jsonl"

echo "=== Contribution Status ==="
echo "Time: $(date -Iseconds)"
echo "Dir:  $DIR"

if [[ ! -d "$DIR" ]]; then
  echo "State: no ledger dir yet"
  echo "Hint: bash modules/contribution/record.sh <kind> [amount] [note]"
  exit 0
fi

if [[ ! -f "$FILE" ]]; then
  echo "State: dir exists, no events.jsonl"
  exit 0
fi

LINES=$(wc -l < "$FILE" | tr -d ' ')
echo "Events: $LINES"
echo "File:   $FILE"
echo
if [[ "$LINES" -gt 0 ]]; then
  echo "Last 3:"
  tail -n 3 "$FILE"
fi
