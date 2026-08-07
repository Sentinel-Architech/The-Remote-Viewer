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

# Bind catalog .memo before piping $m — otherwise jq evaluates .memo on the string.
# Match if catalog memo is a substring of the on-chain memo (Phantom may prefix).
ID=$(jq -r --arg m "$MEMO" '
  .[]
  | .memo as $cat
  | select($cat != null and $cat != "" and ($m | contains($cat)))
  | .id
' "$CATALOG" | head -1)

if [[ -z "$ID" || "$ID" == "null" ]]; then
  echo "UNKNOWN" >&2
  exit 1
fi

echo "$ID"
exit 0
