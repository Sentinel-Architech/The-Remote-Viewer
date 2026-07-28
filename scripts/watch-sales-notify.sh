#!/usr/bin/env bash
# watch-sales-notify.sh — Level 1 automation
#
# Polls Solana for new signatures on the sales address.
# Fetches transaction details, attempts to extract memo + amount,
# and sends a Discord webhook notification (if configured).
#
# You still deliver the ZIP manually. This just alerts you instantly.
#
# Requirements: curl, jq
# Optional env:
#   SOLANA_RPC_URL     (default: public mainnet — rate limited; use Helius)
#   DISCORD_WEBHOOK    (required for Discord alerts)
#   SALES_ADDRESS      (default: your published address)
#   STATE_FILE         (default: /tmp/trv-sales-last-sig)
#   POLL_SECONDS       (default: 45)
#
# Usage:
#   export DISCORD_WEBHOOK="https://discord.com/api/webhooks/..."
#   ./scripts/watch-sales-notify.sh
#
# Better production option: Helius webhook → Discord (no polling).

set -euo pipefail

SALES_ADDRESS="${SALES_ADDRESS:-HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv}"
RPC="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
STATE_FILE="${STATE_FILE:-/tmp/trv-sales-last-sig}"
POLL_SECONDS="${POLL_SECONDS:-45}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"

echo "════════════════════════════════════════"
echo " TRV Sales Watcher (Level 1)"
echo " Address : $SALES_ADDRESS"
echo " RPC     : $RPC"
echo " Discord : ${DISCORD_WEBHOOK:+configured}${DISCORD_WEBHOOK:-not set}"
echo "════════════════════════════════════════"
echo "Ctrl+C to stop"
echo

notify_discord() {
  local sig="$1"
  local memo="$2"
  local amount="$3"
  local explorer="https://solscan.io/tx/${sig}"

  if [[ -z "$DISCORD_WEBHOOK" ]]; then
    return 0
  fi

  local pack_hint="Unknown / check memo"
  if [[ "$memo" == *"TRV-Posture-Lite"* ]]; then
    pack_hint="**TRV Posture Lite** (11 USDC)"
  elif [[ "$memo" == *"TRV-Posture-Pack"* ]]; then
    pack_hint="**TRV Posture Pack** (25 USDC)"
  fi

  local content
  content=$(jq -n \
    --arg sig "$sig" \
    --arg memo "$memo" \
    --arg amount "$amount" \
    --arg pack "$pack_hint" \
    --arg explorer "$explorer" \
    '{content: ("**New TRV Sale Detected**\n" +
                "Pack: " + $pack + "\n" +
                "Amount: " + $amount + "\n" +
                "Memo: `" + $memo + "`\n" +
                "Sig: `" + $sig + "`\n" +
                $explorer)}')

  curl -sS -X POST -H "Content-Type: application/json" \
    -d "$content" "$DISCORD_WEBHOOK" >/dev/null || true
}

get_tx_details() {
  local sig="$1"
  local payload
  payload=$(jq -n \
    --arg sig "$sig" \
    '{jsonrpc:"2.0",id:1,method:"getTransaction",params:[$sig,{encoding:"jsonParsed",maxSupportedTransactionVersion:0}]}')

  local resp
  resp=$(curl -sS "$RPC" -X POST -H 'Content-Type: application/json' -d "$payload" || true)

  # Try to extract memo from logMessages
  local memo
  memo=$(echo "$resp" | jq -r '
    .result.meta.logMessages // [] |
    map(select(test("Memo"; "i"))) |
    .[0] // empty' 2>/dev/null || true)

  # Clean common formats: "Program log: Memo (len X): \"text\"" or "[len] text"
  if [[ -n "$memo" ]]; then
    memo=$(echo "$memo" | sed -E 's/.*Memo[^:]*: *//; s/^\[[0-9]+\] *//; s/^"//; s/"$//; s/\\"/"/g')
  else
    memo="(no memo found)"
  fi

  # Try token amount (USDC is 6 decimals). Look at postTokenBalances for our address.
  local amount
  amount=$(echo "$resp" | jq -r --arg addr "$SALES_ADDRESS" '
    (.result.meta.postTokenBalances // [])[] |
    select(.owner == $addr) |
    (.uiTokenAmount.uiAmountString // .uiTokenAmount.amount // empty)' 2>/dev/null | head -1 || true)

  if [[ -z "$amount" || "$amount" == "null" ]]; then
    amount="(check explorer)"
  else
    amount="${amount} USDC"
  fi

  echo "$memo|$amount"
}

while true; do
  payload=$(jq -n \
    --arg addr "$SALES_ADDRESS" \
    '{jsonrpc:"2.0",id:1,method:"getSignaturesForAddress",params:[$addr,{limit:8}]}')

  resp=$(curl -sS "$RPC" -X POST -H 'Content-Type: application/json' -d "$payload" || true)
  newest=$(echo "$resp" | jq -r '.result[0].signature // empty')

  if [[ -n "$newest" ]]; then
    last=""
    [[ -f "$STATE_FILE" ]] && last=$(cat "$STATE_FILE")

    if [[ "$newest" != "$last" ]]; then
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)  NEW activity detected"
      echo "  Signature : $newest"
      echo "  Explorer  : https://solscan.io/tx/$newest"

      details=$(get_tx_details "$newest")
      memo="${details%%|*}"
      amount="${details#*|}"

      echo "  Memo      : $memo"
      echo "  Amount    : $amount"
      echo

      notify_discord "$newest" "$memo" "$amount"

      echo "$newest" > "$STATE_FILE"
    fi
  fi

  sleep "$POLL_SECONDS"
done
