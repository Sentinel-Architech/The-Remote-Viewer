#!/usr/bin/env bash
# memo-to-sku.sh — map Solana memo string → catalog id (from catalog.json)
# Usage: memo-to-sku.sh "TRV-Posture-Lite"
# Exit 0 + prints id; exit 1 if unknown.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CATALOG="${ROOT}/catalog.json"
MEMO="${1:-}"

if [[ -z "$MEMO" ]]; then
  echo "Usage: $0 \"<memo string>\"" >&2
  exit 1
fi

if [[ ! -f "$CATALOG" ]]; then
  echo "ERROR: catalog.json missing at $CATALOG" >&2
  exit 1
fi

# Match if catalog memo appears as substring of the on-chain memo (Phantom may prefix)
ID=$(jq -r --arg m "$MEMO" '
  .[] | select(.memo != null and .memo != "" and ($m | contains(.memo))) | .id
' "$CATALOG" | head -1)

if [[ -z "$ID" || "$ID" == "null" ]]; then
  echo "UNKNOWN" >&2
  exit 1
fi

echo "$ID"
exit 0
