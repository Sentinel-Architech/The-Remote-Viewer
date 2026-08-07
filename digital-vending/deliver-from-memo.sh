#!/usr/bin/env bash
# deliver-from-memo.sh — automate SKU from on-chain memo + deliver
# Usage:
#   deliver-from-memo.sh "<memo>" "<tx-sig>" [age1-recipient] [amount-hint]
#
# amount-hint optional (e.g. 11 or 25) — warns if catalog price digits disagree.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CATALOG="${ROOT}/catalog.json"

MEMO="${1:-}"
SIG="${2:-}"
RECIP="${3:-}"
AMOUNT_HINT="${4:-}"

if [[ -z "$MEMO" || -z "$SIG" ]]; then
  echo "Usage: $0 \"<memo>\" \"<tx-sig>\" [age1-recipient] [amount-hint]" >&2
  echo "  Example: $0 TRV-Posture-Lite 5xyz... age1abc... 11" >&2
  exit 1
fi

ID=$(bash "${ROOT}/memo-to-sku.sh" "$MEMO") || {
  echo "ERROR: memo did not match any catalog SKU" >&2
  echo "  memo was: $MEMO" >&2
  exit 1
}

echo "[sku] memo → $ID"

# Optional amount sanity (digits only from catalog price field)
if [[ -n "$AMOUNT_HINT" && -f "$CATALOG" ]]; then
  EXPECT=$(jq -r --arg id "$ID" '.[] | select(.id==$id) | .price' "$CATALOG" | grep -oE '[0-9]+' | head -1 || true)
  HINT_DIGITS=$(printf '%s' "$AMOUNT_HINT" | grep -oE '[0-9]+' | head -1 || true)
  if [[ -n "$EXPECT" && -n "$HINT_DIGITS" && "$EXPECT" != "$HINT_DIGITS" ]]; then
    echo "[sku] WARNING: amount hint $HINT_DIGITS does not match catalog price digits $EXPECT for $ID" >&2
    echo "[sku] continuing deliver anyway (manual override)" >&2
  elif [[ -n "$EXPECT" && -n "$HINT_DIGITS" ]]; then
    echo "[sku] amount check OK ($HINT_DIGITS matches catalog)"
  fi
fi

if [[ -n "$RECIP" ]]; then
  exec bash "${ROOT}/auto-deliver.sh" "$ID" "$SIG" "$RECIP"
else
  exec bash "${ROOT}/auto-deliver.sh" "$ID" "$SIG"
fi
