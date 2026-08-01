#!/usr/bin/env bash
# seller-deliver.sh — Digital Vending Chute (Level 1)
# Catalog + manual/Solana-pay → age encrypt → Robust Soliton LT frames
# Wraps trv-optical CLI. Optical air-gap delivery only.
#
# Usage:
#   ./seller-deliver.sh <catalog-id> <buyer-age-recipient> [block_size]
#   or pipe payment confirmation note.
#
# Requires:
#   - optical-airgap/rust built (trv-optical)
#   - $HOME/vault or local age tools if needed
#   - Catalog and payloads present
#
# Output: TRVL frames to stdout (redirect to file or QR sender)
# Buyer peels with frame-peel then decrypts with their identity.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CATALOG="${ROOT}/catalog.json"
PAYLOADS="${ROOT}/payloads"
TRV_BIN="${TRV_BIN:-$(command -v trv-optical || echo "")}"

if [[ -z "$TRV_BIN" ]]; then
  # Fallback: assume repo layout
  if [[ -d "$HOME/The-Remote-Viewer/optical-airgap/rust" ]]; then
    TRV_BIN="cargo run --quiet --manifest-path $HOME/The-Remote-Viewer/optical-airgap/rust/Cargo.toml --bin trv-optical --"
  elif [[ -d "/home/workdir/artifacts/../The-Remote-Viewer/optical-airgap/rust" ]]; then
    TRV_BIN="cargo run --quiet --manifest-path /home/workdir/artifacts/../The-Remote-Viewer/optical-airgap/rust/Cargo.toml --bin trv-optical --"
  else
    echo "ERROR: trv-optical not found. Build optical-airgap/rust or set TRV_BIN." >&2
    exit 1
  fi
fi

ID="${1:-}"
RECIPIENT="${2:-}"
BLOCK_SIZE="${3:-32}"

if [[ -z "$ID" || -z "$RECIPIENT" ]]; then
  echo "Usage: $0 <catalog-id> <buyer-age1-recipient> [block_size=32]" >&2
  echo "  recipient must be a valid age1... public key" >&2
  echo "Catalog IDs:" >&2
  if command -v jq >/dev/null; then
    jq -r '.[].id' "$CATALOG" >&2
  else
    grep -o '"id": "[^"]*"' "$CATALOG" >&2
  fi
  exit 1
fi

if [[ ! "$RECIPIENT" =~ ^age1 ]]; then
  echo "ERROR: recipient must start with age1 (got: ${RECIPIENT:0:20}...)" >&2
  exit 1
fi

# Resolve payload
if command -v jq >/dev/null; then
  PAYLOAD_REL=$(jq -r --arg id "$ID" '.[] | select(.id==$id) | .payload_path' "$CATALOG")
  TITLE=$(jq -r --arg id "$ID" '.[] | select(.id==$id) | .title' "$CATALOG")
else
  # crude fallback
  PAYLOAD_REL=$(grep -A5 "\"id\": \"$ID\"" "$CATALOG" | grep payload_path | head -1 | cut -d'"' -f4)
  TITLE="$ID"
fi

if [[ -z "$PAYLOAD_REL" || "$PAYLOAD_REL" == "null" ]]; then
  echo "ERROR: catalog id not found: $ID" >&2
  exit 1
fi

PAYLOAD="${ROOT}/${PAYLOAD_REL}"
if [[ ! -f "$PAYLOAD" ]]; then
  echo "ERROR: payload missing: $PAYLOAD" >&2
  exit 1
fi

echo "════════════════════════════════════════" >&2
echo " TRV Digital Vending — Seller Delivery" >&2
echo " Item     : $TITLE ($ID)" >&2
echo " Recipient: $RECIPIENT" >&2
echo " Block    : $BLOCK_SIZE" >&2
echo "════════════════════════════════════════" >&2

# 1. Encrypt to buyer
TMP_CT=$(mktemp)
trap 'rm -f "$TMP_CT"' EXIT

cat "$PAYLOAD" | $TRV_BIN encrypt "$RECIPIENT" > "$TMP_CT"
echo "[encrypt] age ciphertext ready ($(wc -c < "$TMP_CT") bytes)" >&2

# 2. Frame-stream Soliton LT
echo "[stream] Robust Soliton LT frames (TRVL1.) → stdout" >&2
$TRV_BIN frame-stream "$BLOCK_SIZE" 0 < "$TMP_CT"

echo "[done] Buyer runs: frame-peel < frames.txt | decrypt <their-identity>" >&2
