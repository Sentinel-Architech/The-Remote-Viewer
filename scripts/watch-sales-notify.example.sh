#!/usr/bin/env bash
# watch-sales-notify.example.sh — Level 1 automation stub
#
# Polls Solana for recent signatures on the sales address and prints new ones.
# Does NOT send ZIPs. You still deliver manually (or pipe this into Telegram/Discord later).
#
# Requirements: curl, jq
# Optional: SOLANA_RPC_URL (default public mainnet — rate limits apply; prefer Helius/your RPC)
#
# Usage:
#   cp scripts/watch-sales-notify.example.sh scripts/watch-sales-notify.sh
#   chmod +x scripts/watch-sales-notify.sh
#   ./scripts/watch-sales-notify.sh
#
# For production notify: use a Helius webhook → Discord/Telegram instead of polling.

set -euo pipefail

SALES_ADDRESS="${SALES_ADDRESS:-HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv}"
RPC="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
STATE_FILE="${STATE_FILE:-/tmp/trv-sales-last-sig}"
POLL_SECONDS="${POLL_SECONDS:-60}"

echo "Watching $SALES_ADDRESS"
echo "RPC $RPC"
echo "Ctrl+C to stop"

while true; do
  payload=$(jq -n \
    --arg addr "$SALES_ADDRESS" \
    '{jsonrpc:"2.0",id:1,method:"getSignaturesForAddress",params:[$addr,{limit:5}]}')

  resp=$(curl -sS "$RPC" -X POST -H 'Content-Type: application/json' -d "$payload" || true)
  newest=$(echo "$resp" | jq -r '.result[0].signature // empty')

  if [[ -n "$newest" ]]; then
    last=""
    [[ -f "$STATE_FILE" ]] && last=$(cat "$STATE_FILE")
    if [[ "$newest" != "$last" ]]; then
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) NEW activity — latest sig: $newest"
      echo "  Explorer: https://solscan.io/tx/$newest"
      echo "  Check amount + memo, then DM the matching ZIP from your shop folder."
      echo "$newest" > "$STATE_FILE"
      # Optional: curl a Discord webhook here with the sig URL
    fi
  fi

  sleep "$POLL_SECONDS"
done
