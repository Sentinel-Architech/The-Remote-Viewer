#!/data/data/com.termux/files/usr/bin/bash
# Local contribution tally by kind (offline)
set -euo pipefail

FILE="${HOME}/.local/share/remote-viewer/contribution/events.jsonl"

if [[ ! -f "$FILE" ]]; then
  echo "No contribution events yet."
  echo "Record with: bash modules/contribution/record.sh <kind> [amount] [note]"
  exit 0
fi

echo "=== Local Contribution Tally ==="
echo "File: $FILE"
echo

awk -F'"kind":"' '
  NF > 1 {
    split($2, a, "\"")
    kind = a[1]
    count[kind]++
  }
  END {
    for (k in count) printf "%6d  %s\n", count[k], k
  }
' "$FILE" | sort -rn

echo
echo "Total events: $(wc -l < "$FILE" | tr -d ' ')"
