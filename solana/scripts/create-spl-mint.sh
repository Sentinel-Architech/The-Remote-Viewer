#!/usr/bin/env bash
# TRV SPL mint helper — SCAFFOLD. Requires solana CLI + spl-token.
# Usage: ./scripts/create-spl-mint.sh
set -euo pipefail

KEYDIR="${KEYDIR:-./.keys}"
mkdir -p "$KEYDIR"

if [[ ! -f "$KEYDIR/mint-authority.json" ]]; then
  solana-keygen new --no-bip39-passphrase -o "$KEYDIR/mint-authority.json" --force
fi

echo "Creating token mint (9 decimals)..."
MINT=$(spl-token create-token --decimals 9 --mint-authority "$KEYDIR/mint-authority.json" | awk '/Creating token/ {print $3}')
echo "MINT=$MINT"

echo "Creating token account for default wallet..."
ACCT=$(spl-token create-account "$MINT" | awk '/Creating account/ {print $3}')
echo "TOKEN_ACCOUNT=$ACCT"

echo "Minting 100 tokens..."
spl-token mint "$MINT" 100 "$ACCT" --mint-authority "$KEYDIR/mint-authority.json"

echo "Done. Save MINT address; authority key is in $KEYDIR/mint-authority.json — protect it."
