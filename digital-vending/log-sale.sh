#!/usr/bin/env bash
# Append one sale line to $HOME/trv-deliver/sales.log (local only).
# Usage: log-sale.sh <catalog-id> <note> [frames-path]
set -euo pipefail

DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
LOG="${SALES_LOG:-$DELIVER_DIR/sales.log}"
mkdir -p "$DELIVER_DIR"

ID="${1:-unknown}"
NOTE="${2:-}"
FRAMES="${3:-}"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Never log full age1 or identity — truncate recipient-looking strings in NOTE
SAFE_NOTE=$(printf '%s' "$NOTE" | sed -E 's/age1[a-z0-9]{10,}/age1…/gi' | tr '\n' ' ')

LINE="$TS\tid=$ID"
[[ -n "$SAFE_NOTE" ]] && LINE="$LINE\t$SAFE_NOTE"
[[ -n "$FRAMES" ]] && LINE="$LINE\tframes=$(basename "$FRAMES")"

printf '%b\n' "$LINE" >> "$LOG"
echo "[log] $LOG ← $TS id=$ID" >&2
