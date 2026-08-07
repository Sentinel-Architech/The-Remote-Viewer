#!/usr/bin/env bash
# Append one sale line to $HOME/trv-deliver/sales.log (local only).
# Usage: log-sale.sh <catalog-id> <note> [frames-path]
# Refuses empty frames files (exit 2).
set -euo pipefail

DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
LOG="${SALES_LOG:-$DELIVER_DIR/sales.log}"
mkdir -p "$DELIVER_DIR"

ID="${1:-unknown}"
NOTE="${2:-}"
FRAMES="${3:-}"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
SUM=""

SAFE_NOTE=$(printf '%s' "$NOTE" | sed -E 's/age1[a-z0-9]{10,}/age1…/gi' | tr '\n' ' ')

LINE="$TS\tid=$ID"
[[ -n "$SAFE_NOTE" ]] && LINE="$LINE\t$SAFE_NOTE"

if [[ -n "$FRAMES" ]]; then
  if [[ ! -f "$FRAMES" ]]; then
    echo "[log] ERROR: frames path not a file: $FRAMES" >&2
    exit 2
  fi
  BYTES=$(wc -c < "$FRAMES" | tr -d ' ')
  if [[ "$BYTES" -eq 0 ]]; then
    echo "[log] ERROR: frames file is empty (0 bytes): $FRAMES" >&2
    echo "[log] Refusing to append empty pack to sales.log — re-run deliver" >&2
    exit 2
  fi
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
  # Empty-file hash is always e3b0c44… — belt and suspenders
  if [[ "$SUM" == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" ]]; then
    echo "[log] ERROR: sha256 is empty-file digest — refusing log" >&2
    exit 2
  fi
  LINE="$LINE\tsha256=$SUM"
  LINE="$LINE\tbytes=$BYTES"
fi

printf '%b\n' "$LINE" >> "$LOG"
echo "[log] $LOG ← $TS id=$ID sha256=${SUM:-none} bytes=${BYTES:-n/a}" >&2
