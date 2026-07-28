#!/usr/bin/env bash
# watch-sales-notify.sh — Level 1.5 automation
#
# Polls Solana for new signatures on the sales address.
# Fetches transaction details, extracts memo + amount,
# sends Discord webhook, and prepares the correct ZIP
# + ready-to-paste X DM text.
#
# You still send the ZIP (or link) manually. This removes the thinking.
#
# Requirements: curl, jq
# Optional env:
#   SOLANA_RPC_URL     (default: public mainnet — rate limited; use Helius)
#   DISCORD_WEBHOOK    (required for Discord alerts)
#   SALES_ADDRESS      (default: your published address)
#   STATE_FILE         (default: /tmp/trv-sales-last-sig)
#   POLL_SECONDS       (default: 45)
#   DELIVER_DIR        (default: $HOME/trv-deliver)
#
# Usage:
#   export DISCORD_WEBHOOK="https://discord.com/api/webhooks/..."
#   ./scripts/watch-sales-notify.sh

set -euo pipefail

SALES_ADDRESS="${SALES_ADDRESS:-HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv}"
RPC="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
STATE_FILE="${STATE_FILE:-/tmp/trv-sales-last-sig}"
POLL_SECONDS="${POLL_SECONDS:-45}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
DIST_DIR="${ROOT}/dist"

mkdir -p "$DELIVER_DIR"

echo "════════════════════════════════════════"
echo " TRV Sales Watcher (Level 1.5)"
echo " Address : $SALES_ADDRESS"
echo " RPC     : $RPC"
echo " Discord : ${DISCORD_WEBHOOK:+configured}${DISCORD_WEBHOOK:-not set}"
echo " Deliver : $DELIVER_DIR"
echo "════════════════════════════════════════"
echo "Ctrl+C to stop"
echo

prepare_delivery() {
  local memo="$1"
  local sig="$2"
  local pack=""
  local zip_src=""
  local zip_name=""

  if [[ "$memo" == *"TRV-Posture-Lite"* ]]; then
    pack="Lite"
    zip_name="trv-posture-lite.zip"
    zip_src="${DIST_DIR}/trv-posture-lite.zip"
  elif [[ "$memo" == *"TRV-Posture-Pack"* ]]; then
    pack="Pack"
    zip_name="trv-posture-pack.zip"
    zip_src="${DIST_DIR}/trv-posture-pack.zip"
  else
    echo "  [prepare] Unknown memo — skipping ZIP prep"
    return 0
  fi

  local dest="${DELIVER_DIR}/${sig:0:12}_${zip_name}"

  if [[ -f "$zip_src" ]]; then
    cp -f "$zip_src" "$dest"
    echo "  [prepare] Copied $zip_name → $dest"
  else
    echo "  [prepare] WARNING: $zip_src not found. Run ./scripts/build-posture-pack.sh first."
    dest="(ZIP missing — build packs first)"
  fi

  # Write a ready-to-paste DM file
  local dm_file="${DELIVER_DIR}/${sig:0:12}_dm.txt"
  cat > "$dm_file" << EOF
Thanks for the payment.

Here’s your TRV Posture ${pack}.

(Attach the file: ${dest})

Sig verified: ${sig}
EOF

  echo "  [prepare] Ready-to-send DM written to $dm_file"
  echo "  -------- DM PREVIEW --------"
  cat "$dm_file"
  echo "  ----------------------------"
}

notify_discord() {
  local sig="$1"
  local memo="$2"
  local amount="$3"
  local explorer="https://solscan.io/tx/${sig}"

  if [[ -z "$DISCORD_WEBHOOK" ]]; then
    return 0
  fi

  local pack_hint="Unknown / check memo"
  local zip_hint=""
  if [[ "$memo" == *"TRV-Posture-Lite"* ]]; then
    pack_hint="**TRV Posture Lite** (11 USDC)"
    zip_hint="File: trv-posture-lite.zip"
  elif [[ "$memo" == *"TRV-Posture-Pack"* ]]; then
    pack_hint="**TRV Posture Pack** (25 USDC)"
    zip_hint="File: trv-posture-pack.zip"
  fi

  local content
  content=$(jq -n \
    --arg sig "$sig" \
    --arg memo "$memo" \
    --arg amount "$amount" \
    --arg pack "$pack_hint" \
    --arg zip "$zip_hint" \
    --arg explorer "$explorer" \
    --arg deliver "$DELIVER_DIR" \
    '{content: ("**New TRV Sale Detected**\n" +
                "Pack: " + $pack + "\n" +
                "Amount: " + $amount + "\n" +
                "Memo: `" + $memo + "`\n" +
                "Sig: `" + $sig + "`\n" +
                $explorer + "\n\n" +
                "**Delivery prep**\n" +
                $zip + "\n" +
                "Ready files in: `" + $deliver + "`\n" +
                "Open the matching `*_dm.txt` and paste into X DM.")}')

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

  local memo
  memo=$(echo "$resp" | jq -r '
    .result.meta.logMessages // [] |
    map(select(test("Memo"; "i"))) |
    .[0] // empty' 2>/dev/null || true)

  if [[ -n "$memo" ]]; then
    memo=$(echo "$memo" | sed -E 's/.*Memo[^:]*: *//; s/^\[[0-9]+\] *//; s/^"//; s/"$//; s/\\"/"/g')
  else
    memo="(no memo found)"
  fi

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

      prepare_delivery "$memo" "$newest"
      notify_discord "$newest" "$memo" "$amount"

      echo "$newest" > "$STATE_FILE"
    fi
  fi

  sleep "$POLL_SECONDS"
done
