#!/usr/bin/env bash
# Community Pool — public gross volume from Solana memo transfers
# No custody. Anyone can re-run this against public RPC.
set -euo pipefail

SALES_ADDRESS="${SALES_ADDRESS:-HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv}"
RPC="${SOLANA_RPC_URL:-https://solana-rpc.publicnode.com}"
USDC_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

echo "=== Community Pool — Gross (public) ==="
echo "sales_address: $SALES_ADDRESS"
echo "rpc: $RPC"
echo "note: gross only · no custody · net not protocol-defined"
echo

# Prefer solana CLI if present; otherwise fall back to a simple curl note
if command -v solana >/dev/null 2>&1; then
  echo "Using solana CLI…"
  # Recent signatures (last 20) — operator can raise limit as needed
  solana transaction-history "$SALES_ADDRESS" --limit 20 --url "$RPC" 2>/dev/null || {
    echo "solana CLI available but history query failed. Check RPC or network."
    echo "Manual check: any Solana explorer → address $SALES_ADDRESS"
    exit 0
  }
  echo
  echo "Filter the above for USDC transfers whose memo contains TRV-Posture-Lite or TRV-Posture-Pack."
  echo "Sum those amounts for current observable gross."
else
  echo "solana CLI not found on PATH."
  echo "Gross is still fully public. Use any Solana explorer:"
  echo "  https://solscan.io/account/$SALES_ADDRESS"
  echo "  or https://explorer.solana.com/address/$SALES_ADDRESS"
  echo
  echo "Look for USDC ($USDC_MINT) transfers with memos:"
  echo "  TRV-Posture-Lite  (11 USDC)"
  echo "  TRV-Posture-Pack  (25 USDC)"
  echo
  echo "Sum of those transfers = current COMMUNITY POOL gross (public, independently verifiable)."
fi

echo
echo "Net is not calculated by protocol (operator costs remain private)."
echo "No project-controlled pool wallet exists."
exit 0
