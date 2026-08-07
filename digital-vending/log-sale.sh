#!/usr/bin/env bash
# Append one sale line to $HOME/trv-deliver/sales.log (local only).
# Usage: log-sale.sh <catalog-id> <note> [frames-path]
# Includes sha256 of frames file when path is given and readable.
set -euo pipefail

DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
LOG="${SALES_LOG:-$DELIVER_DIR/sales.log}"
mkdir -p "$DELIVER_DIR"

ID="${1:-unknown}"
NOTE="${2:-}"
FRAMES="${3:-}"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Never log full age1 — redact
SAFE_NOTE=$(printf '%s' "$NOTE" | sed -E 's/age1[a-z0-9]{10,}/age1…/gi' | tr '\n' ' ')

LINE="$TS\tid=$ID"
[[ -n "$SAFE_NOTE" ]] && LINE="$LINE\t$SAFE_NOTE"

if [[ -n "$FRAMES" && -f "$FRAMES" ]]; then
  LINE="$LINE\tframes=$(basename "$FRAMES")"
  if command -v sha256sum >/dev/null 2>&1; then
    SUM=$(sha256sum "$FRAMES" | awk '{print $1}')
  elif command -v shasum >/dev/null 2>&1; then
    SUM=$(shasum -a 256 "$FRAMES" | awk '{print $1}')
  elif command -v openssl >/dev/null 2>&1; then
    SUM=$(openssl dgst -sha256 "$FRAMES" | awk '{print $NF}')
  else
    SUM="unavailable"
  fi
  LINE="$LINE\tsha256=$SUM"
  LINE="$LINE\tbytes=$(wc -c < "$FRAMES" | tr -d ' ')"
fi

printf '%b\n' "$LINE" >> "$LOG"
echo "[log] $LOG ← $TS id=$ID sha256=${SUM:-none}" >&2
