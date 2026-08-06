#!/data/data/com.termux/files/usr/bin/bash
# Redacted contribution export for audit (offline)
# Never includes AGE secrets, vault paths, or raw notes by default.
set -euo pipefail

DIR="${HOME}/.local/share/remote-viewer/contribution"
FILE="${DIR}/events.jsonl"
OUT_DIR="${DIR}/exports"
mkdir -p "$OUT_DIR"
chmod 700 "$DIR" "$OUT_DIR" 2>/dev/null || true

TS_FILE=$(date +%Y%m%dT%H%M%S)
OUT="${OUT_DIR}/contribution-export-${TS_FILE}.txt"

if [[ ! -f "$FILE" ]] || [[ ! -s "$FILE" ]]; then
  echo "No events to export."
  exit 0
fi

{
  echo "TRV Contribution Export (redacted)"
  echo "Generated: $(date -Iseconds)"
  echo "Source: events.jsonl (local only)"
  echo "Policy: no secrets, no vault paths, notes omitted"
  echo "----------------------------------------"
  echo

  FIRST=$(head -n 1 "$FILE")
  LAST=$(tail -n 1 "$FILE")
  FIRST_TS=$(printf '%s' "$FIRST" | sed -n 's/.*"ts":"\([^"]*\)".*/\1/p')
  LAST_TS=$(printf '%s' "$LAST" | sed -n 's/.*"ts":"\([^"]*\)".*/\1/p')
  LAST_SHA=$(printf '%s' "$LAST" | sed -n 's/.*"sha":"\([^"]*\)".*/\1/p')
  N=$(wc -l < "$FILE" | tr -d ' ')

  echo "Event count: $N"
  echo "First ts:    ${FIRST_TS:-unknown}"
  echo "Last ts:     ${LAST_TS:-unknown}"
  echo "Tip sha:     ${LAST_SHA:-none}"
  echo
  echo "Counts by kind:"
  awk -F'"kind":"' '
    NF > 1 {
      split($2, a, "\"")
      kind = a[1]
      count[kind]++
    }
    END {
      for (k in count) printf "  %6d  %s\n", count[k], k
    }
  ' "$FILE" | sort -rn
  echo
  echo "----------------------------------------"
  echo "Verify locally: bash modules/contribution/verify.sh"
  echo "Optional seal: encrypt this file with age to your recipient"
  echo "  age -r \"\$(cat \"\$HOME/vault-recipient.txt\")\" -o export.age \"$OUT\""
} > "$OUT"

chmod 600 "$OUT" 2>/dev/null || true
echo "Export written: $OUT"
echo "(redacted — safe to review; still local until you move it)"
