#!/usr/bin/env bash
# auto-deliver.sh — Automated delivery wrapper for sales watcher
# Generates age + Soliton LT frames when a buyer age recipient is known.
#
# Exit codes:
#   0  — success (frames + DM written)
#   1  — bad usage / missing required args
#   2  — missing or invalid age recipient (pending)
#   3  — encrypt or frame-stream failed
#   4  — catalog / payload problem
#
# Recipient discovery order:
#   1. 3rd argument
#   2. $RECIPIENT env
#   3. Drop file: $DELIVER_DIR/<sig-prefix>.recipient
#
# On missing recipient a PENDING marker is written so the seller can see
# which sales are waiting.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
mkdir -p "$DELIVER_DIR"

ID="${1:-}"
SIG="${2:-}"
RECIPIENT="${3:-${RECIPIENT:-}}"
BLOCK_SIZE="${4:-32}"

log()  { echo "[auto] $*" >&2; }
err()  { echo "[auto] ERROR: $*" >&2; }

if [[ -z "$ID" || -z "$SIG" ]]; then
  err "Usage: $0 <catalog-id> <tx-sig> [age-recipient] [block_size]"
  exit 1
fi

PREFIX="${SIG:0:12}"
PENDING_FILE="$DELIVER_DIR/${PREFIX}_${ID}.PENDING"
FRAMES_OUT="$DELIVER_DIR/${PREFIX}_${ID}.trvl"
DM_OUT="$DELIVER_DIR/${PREFIX}_${ID}_dm.txt"

# Resolve recipient
if [[ -z "$RECIPIENT" ]]; then
  DROP="$DELIVER_DIR/${PREFIX}.recipient"
  if [[ -f "$DROP" ]]; then
    RECIPIENT=$(tr -d '[:space:]' < "$DROP")
    log "Found recipient drop file: $DROP"
  fi
fi

# Validate recipient
if [[ -z "$RECIPIENT" ]]; then
  err "No age recipient supplied"
  err "Create drop file:  echo 'age1...' > $DELIVER_DIR/${PREFIX}.recipient"
  err "Then re-run:       $0 $ID $SIG"
  # Write pending marker so watcher / seller can see it
  cat > "$PENDING_FILE" << EOF
PENDING age recipient
catalog_id=$ID
sig=$SIG
created=$(date -u +%Y-%m-%dT%H:%M:%SZ)
action=echo "age1..." > $DELIVER_DIR/${PREFIX}.recipient && $0 $ID $SIG
EOF
  log "Wrote pending marker: $PENDING_FILE"
  exit 2
fi

if [[ ! "$RECIPIENT" =~ ^age1[a-z0-9]+$ ]]; then
  err "Invalid age recipient format (must start with age1 and contain only valid chars)"
  err "Got: ${RECIPIENT:0:20}..."
  cat > "$PENDING_FILE" << EOF
PENDING invalid age recipient
catalog_id=$ID
sig=$SIG
created=$(date -u +%Y-%m-%dT%H:%M:%SZ)
note=recipient did not match ^age1[a-z0-9]+$
EOF
  exit 2
fi

# Clean any previous pending marker
rm -f "$PENDING_FILE"

# Catalog / payload check (seller-deliver will also fail, but catch early)
if [[ ! -f "$ROOT/catalog.json" ]]; then
  err "catalog.json missing in $ROOT"
  exit 4
fi

log "Generating age+LT for $ID → $FRAMES_OUT"
log "Recipient: ${RECIPIENT:0:12}...${RECIPIENT: -6}"

# Run seller-deliver; capture failure cleanly
set +e
"$ROOT/seller-deliver.sh" "$ID" "$RECIPIENT" "$BLOCK_SIZE" > "$FRAMES_OUT" 2>"$DELIVER_DIR/${PREFIX}_${ID}.log"
rc=$?
set -e

if [[ $rc -ne 0 ]]; then
  err "seller-deliver.sh failed (exit $rc). See $DELIVER_DIR/${PREFIX}_${ID}.log"
  rm -f "$FRAMES_OUT"
  exit 3
fi

if [[ ! -s "$FRAMES_OUT" ]]; then
  err "Frames file is empty after encrypt/stream"
  exit 3
fi

# Write DM
cat > "$DM_OUT" << EOF
Thanks for the payment. Sig: ${SIG}

Your encrypted delivery is ready (age + Robust Soliton LT / TRVL).

1. Save the frames file: ${FRAMES_OUT}
2. Peel + decrypt on your device only:

   cat frames.trvl | ./buyer-receive.sh /path/to/your-identity.txt

Or feed the same frames into the optical QR path.

Destroy = Restart. Never reuse identities that appeared in chat.
EOF

log "SUCCESS Frames: $FRAMES_OUT ($(wc -c < "$FRAMES_OUT") bytes)"
log "SUCCESS DM:     $DM_OUT"
echo "-------- DM PREVIEW --------" >&2
cat "$DM_OUT" >&2
echo "----------------------------" >&2
exit 0
