#!/usr/bin/env bash
# watch-sales-notify-v2.sh — Level 2.5 automation + exponential backoff
# Polls Solana → detects payment + memo → prepares ZIP + age/LT frames
# + automatic retry of PENDING deliveries when recipient drop files appear.
#
# Retry logic:
#   - Every poll cycle scans $DELIVER_DIR for *.PENDING markers
#   - If matching <prefix>.recipient now exists → re-run auto-deliver
#   - Transient encrypt failures (exit 3) are retried up to MAX_TRANSIENT_RETRIES
#     with exponential backoff: base * 2^(attempt-1), capped at BACKOFF_MAX
#   - Permanent missing recipient stays PENDING until drop file appears (no backoff burn)
#
# Drop file method:
#   echo "age1..." > $DELIVER_DIR/<sig-prefix>.recipient
#
# Requirements: curl, jq
# Env: SOLANA_RPC_URL, DISCORD_WEBHOOK, SALES_ADDRESS, DELIVER_DIR,
#      POLL_SECONDS, MAX_TRANSIENT_RETRIES (default 3),
#      BACKOFF_BASE_SECONDS (default 30), BACKOFF_MAX_SECONDS (default 1800)

set -euo pipefail

SALES_ADDRESS="${SALES_ADDRESS:-HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv}"
RPC="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
STATE_FILE="${STATE_FILE:-/tmp/trv-sales-last-sig}"
POLL_SECONDS="${POLL_SECONDS:-45}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
MAX_TRANSIENT_RETRIES="${MAX_TRANSIENT_RETRIES:-3}"
BACKOFF_BASE_SECONDS="${BACKOFF_BASE_SECONDS:-30}"
BACKOFF_MAX_SECONDS="${BACKOFF_MAX_SECONDS:-1800}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
DIST_DIR="${ROOT}/dist"
VENDING_DIR="${ROOT}/digital-vending"
RETRY_STATE="${DELIVER_DIR}/.retry-state"

mkdir -p "$DELIVER_DIR"
touch "$RETRY_STATE"

echo "════════════════════════════════════════"
echo " TRV Sales Watcher (Level 2.5 — backoff)"
echo " Address : $SALES_ADDRESS"
echo " RPC     : $RPC"
echo " Discord : ${DISCORD_WEBHOOK:+configured}${DISCORD_WEBHOOK:-not set}"
echo " Deliver : $DELIVER_DIR"
echo " Vending : $VENDING_DIR"
echo " Retries : max=$MAX_TRANSIENT_RETRIES  backoff base=${BACKOFF_BASE_SECONDS}s max=${BACKOFF_MAX_SECONDS}s"
echo "════════════════════════════════════════"
echo "Ctrl+C to stop"
echo

map_memo_to_id() {
  local memo="$1"
  if [[ "$memo" == *"TRV-Posture-Lite"* ]]; then
    echo "trv-posture-lite"
  elif [[ "$memo" == *"TRV-Posture-Pack"* ]]; then
    echo "trv-posture-pack"
  elif [[ "$memo" == *"SENTINEL-ZK-01"* ]]; then
    echo "sentinel-skill-zk-01"
  else
    echo ""
  fi
}

# Retry state format: key=count:next_attempt_unix
get_retry_state() {
  local key="$1"
  local line
  line=$(grep -E "^${key}=" "$RETRY_STATE" 2>/dev/null | tail -1 || true)
  if [[ -z "$line" ]]; then
    echo "0:0"
    return
  fi
  echo "${line#*=}"
}

set_retry_state() {
  local key="$1"
  local count="$2"
  local next_ts="$3"
  grep -v -E "^${key}=" "$RETRY_STATE" > "${RETRY_STATE}.tmp" 2>/dev/null || true
  mv "${RETRY_STATE}.tmp" "$RETRY_STATE"
  echo "${key}=${count}:${next_ts}" >> "$RETRY_STATE"
}

clear_retry_state() {
  local key="$1"
  grep -v -E "^${key}=" "$RETRY_STATE" > "${RETRY_STATE}.tmp" 2>/dev/null || true
  mv "${RETRY_STATE}.tmp" "$RETRY_STATE"
}

# delay = base * 2^(attempt-1), capped
backoff_delay() {
  local attempt="$1"
  local delay=$BACKOFF_BASE_SECONDS
  local i=1
  while [[ $i -lt $attempt ]]; do
    delay=$((delay * 2))
    i=$((i + 1))
    if [[ $delay -ge $BACKOFF_MAX_SECONDS ]]; then
      delay=$BACKOFF_MAX_SECONDS
      break
    fi
  done
  echo "$delay"
}

retry_pending() {
  local pending now
  now=$(date +%s)
  shopt -s nullglob
  for pending in "$DELIVER_DIR"/*.PENDING; do
    [[ -f "$pending" ]] || continue

    local base prefix catalog_id key recip_file
    base=$(basename "$pending" .PENDING)
    prefix="${base%%_*}"
    catalog_id="${base#*_}"
    key="${prefix}_${catalog_id}"
    recip_file="$DELIVER_DIR/${prefix}.recipient"

    if [[ ! -f "$recip_file" ]]; then
      continue
    fi

    local state count next_ts
    state=$(get_retry_state "$key")
    count="${state%%:*}"
    next_ts="${state##*:}"
    count=${count:-0}
    next_ts=${next_ts:-0}

    if [[ "$count" -ge "$MAX_TRANSIENT_RETRIES" ]]; then
      echo "  [retry] $key exhausted ($count/$MAX_TRANSIENT_RETRIES) — manual intervention"
      continue
    fi

    if [[ "$next_ts" -gt 0 && "$now" -lt "$next_ts" ]]; then
      local wait=$((next_ts - now))
      echo "  [retry] $key in backoff — next attempt in ${wait}s"
      continue
    fi

    echo "  [retry] $key ready (attempt $((count+1))) — recipient present"
    local real_sig
    real_sig=$(grep -E '^sig=' "$pending" 2>/dev/null | cut -d= -f2- || echo "${prefix}000000000000")

    set +e
    "$VENDING_DIR/auto-deliver.sh" "$catalog_id" "$real_sig"
    rc=$?
    set -e

    case $rc in
      0)
        echo "  [retry] SUCCESS — frames ready for $key"
        clear_retry_state "$key"
        ;;
      2)
        echo "  [retry] still PENDING (recipient invalid) for $key"
        ;;
      3|4)
        count=$((count + 1))
        local delay next
        delay=$(backoff_delay "$count")
        next=$((now + delay))
        set_retry_state "$key" "$count" "$next"
        echo "  [retry] FAILED (exit $rc) — attempt $count/$MAX_TRANSIENT_RETRIES, backoff ${delay}s"
        if [[ "$count" -ge "$MAX_TRANSIENT_RETRIES" ]]; then
          echo "  [retry] giving up on $key"
          echo "EXHAUSTED after $count transient failures at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$pending"
        fi
        ;;
      *)
        echo "  [retry] unexpected exit $rc for $key"
        ;;
    esac
  done
  shopt -u nullglob
}

prepare_delivery() {
  local memo="$1"
  local sig="$2"
  local pack=""
  local zip_src=""
  local zip_name=""
  local catalog_id=""

  catalog_id=$(map_memo_to_id "$memo")

  if [[ "$memo" == *"TRV-Posture-Lite"* ]]; then
    pack="Lite"
    zip_name="trv-posture-lite.zip"
    zip_src="${DIST_DIR}/trv-posture-lite.zip"
  elif [[ "$memo" == *"TRV-Posture-Pack"* ]]; then
    pack="Pack"
    zip_name="trv-posture-pack.zip"
    zip_src="${DIST_DIR}/trv-posture-pack.zip"
  else
    echo "  [prepare] Unknown memo — skipping ZIP"
  fi

  local dest=""
  if [[ -n "$zip_name" ]]; then
    dest="${DELIVER_DIR}/${sig:0:12}_${zip_name}"
    if [[ -f "$zip_src" ]]; then
      cp -f "$zip_src" "$dest"
      echo "  [prepare] Copied $zip_name → $dest"
    else
      echo "  [prepare] WARNING: $zip_src not found"
      dest="(ZIP missing)"
    fi
  fi

  if [[ -n "$catalog_id" && -x "$VENDING_DIR/auto-deliver.sh" ]]; then
    echo "  [prepare] Attempting age+LT delivery for $catalog_id"
    set +e
    "$VENDING_DIR/auto-deliver.sh" "$catalog_id" "$sig"
    rc=$?
    set -e
    case $rc in
      0) echo "  [prepare] age+LT frames ready" ;;
      2) echo "  [prepare] PENDING — age recipient missing. Drop file needed." ;;
      3) echo "  [prepare] FAILED — encrypt/stream error (see log in deliver dir)"
         now=$(date +%s)
         delay=$(backoff_delay 1)
         set_retry_state "${sig:0:12}_${catalog_id}" 1 $((now + delay))
         ;;
      4) echo "  [prepare] FAILED — catalog/payload problem" ;;
      *) echo "  [prepare] auto-deliver exited $rc" ;;
    esac
  fi

  if [[ -n "$pack" && ! -f "${DELIVER_DIR}/${sig:0:12}_${catalog_id}_dm.txt" ]]; then
    local dm_file="${DELIVER_DIR}/${sig:0:12}_dm.txt"
    cat > "$dm_file" << EOF
Thanks for the payment.

Here’s your TRV Posture ${pack}.

(Attach the file: ${dest})

Sig verified: ${sig}

If you provided an age1 recipient, encrypted frames are preferred.
Place the age1 key in ${DELIVER_DIR}/${sig:0:12}.recipient and the watcher will auto-retry with backoff.
EOF
    echo "  [prepare] Classic DM written to $dm_file"
  fi
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
    zip_hint="File: trv-posture-lite.zip + optional age/LT frames"
  elif [[ "$memo" == *"TRV-Posture-Pack"* ]]; then
    pack_hint="**TRV Posture Pack** (25 USDC)"
    zip_hint="File: trv-posture-pack.zip + optional age/LT frames"
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
                "For age/LT: drop age1 key into <sig-prefix>.recipient — watcher auto-retries with backoff.")}')

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
  retry_pending

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
