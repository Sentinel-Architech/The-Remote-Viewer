#!/usr/bin/env bash
# auto-deliver.sh — Automated delivery wrapper for sales watcher
# Called after payment detected. Generates age + Soliton LT frames
# when a buyer age recipient is known.
#
# Usage:
#   RECIPIENT=age1... ./auto-deliver.sh <catalog-id> <tx-sig> [block_size]
#   ./auto-deliver.sh <catalog-id> <tx-sig> <age-recipient> [block_size]
#
# Recipient discovery order:
#   1. 3rd argument
#   2. $RECIPIENT env
#   3. Drop file: $DELIVER_DIR/<sig-prefix>.recipient
#
# Writes to $DELIVER_DIR:
#   <sig-prefix>_<id>.trvl     — TRVL frames (ready for optical or file handoff)
#   <sig-prefix>_<id>_dm.txt   — ready-to-paste DM text

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
mkdir -p "$DELIVER_DIR"

ID="${1:-}"
SIG="${2:-}"
RECIPIENT="${3:-${RECIPIENT:-}}"
BLOCK_SIZE="${4:-32}"

if [[ -z "$ID" || -z "$SIG" ]]; then
  echo "Usage: $0 <catalog-id> <tx-sig> [age-recipient] [block_size]" >&2
  exit 1
fi

PREFIX="${SIG:0:12}"

if [[ -z "$RECIPIENT" ]]; then
  DROP="$DELIVER_DIR/${PREFIX}.recipient"
  if [[ -f "$DROP" ]]; then
    RECIPIENT=$(tr -d '[:space:]' < "$DROP")
    echo "[auto] Found recipient drop file: $DROP" >&2
  fi
fi

if [[ -z "$RECIPIENT" || ! "$RECIPIENT" =~ ^age1 ]]; then
  echo "[auto] No valid age recipient. Skipping encrypted frames." >&2
  echo "[auto] Create $DELIVER_DIR/${PREFIX}.recipient containing the age1 key, then re-run." >&2
  exit 0
fi

FRAMES_OUT="$DELIVER_DIR/${PREFIX}_${ID}.trvl"
DM_OUT="$DELIVER_DIR/${PREFIX}_${ID}_dm.txt"

echo "[auto] Generating age+LT for $ID → $FRAMES_OUT" >&2

"$ROOT/seller-deliver.sh" "$ID" "$RECIPIENT" "$BLOCK_SIZE" > "$FRAMES_OUT"

TITLE="$ID"
if command -v jq >/dev/null 2>&1 && [[ -f "$ROOT/catalog.json" ]]; then
  TITLE=$(jq -r --arg id "$ID" '.[] | select(.id==$id) | .title // $id' "$ROOT/catalog.json")
fi

cat > "$DM_OUT" << EOF
Thanks for the payment. Sig: ${SIG}

Your encrypted delivery is ready (age + Robust Soliton LT / TRVL).

1. Save the frames file: ${FRAMES_OUT}
2. Peel + decrypt on your device only:

   cat frames.trvl | ./buyer-receive.sh /path/to/your-identity.txt

Or feed the same frames into the optical QR path.

Destroy = Restart. Never reuse identities that appeared in chat.
EOF

echo "[auto] Frames: $FRAMES_OUT ($(wc -c < "$FRAMES_OUT") bytes)" >&2
echo "[auto] DM: $DM_OUT" >&2
echo "-------- DM PREVIEW --------" >&2
cat "$DM_OUT" >&2
echo "----------------------------" >&2
