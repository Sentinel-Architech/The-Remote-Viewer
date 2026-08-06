#!/data/data/com.termux/files/usr/bin/bash
# Local contribution tally (best-effort, no network)

set -euo pipefail

FILE="${HOME}/.local/share/remote-viewer/contribution/events.jsonl"

if [[ ! -f "$FILE" ]]; then
  echo "No contribution events yet."
  exit 0
fi

echo "=== Local Contribution Tally ==="
echo "Events file: $FILE"
echo

# Count by kind using pure bash/awk (Termux friendly)
awk -F'"kind":"' '
  NF>1 {
    split($2, a, "\"")
    kind=a[1]
    count[kind]++
  }
  END {
    for (k in count) print count[k], k
  }
' "$FILE" | sort -rn

echo
echo "Total events: $(wc -l < "$FILE")"
