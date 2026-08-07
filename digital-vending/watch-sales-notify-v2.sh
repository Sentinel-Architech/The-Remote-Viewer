#!/usr/bin/env bash
# watch-sales-notify-v2.sh — Level 2.5 + circuit + soft-retry + multi-RPC failover
set -euo pipefail

# Trim whitespace / CR from address (Termux paste often adds junk)
SALES_ADDRESS="${SALES_ADDRESS:-}"
SALES_ADDRESS="$(printf '%s' "$SALES_ADDRESS" | tr -d '[:space:]')"
if [[ -z "$SALES_ADDRESS" ]]; then
  echo "ERROR: set SALES_ADDRESS to your Solana receive address" >&2
  exit 1
fi

_DEFAULT_RPCS="https://api.mainnet-beta.solana.com"
if [[ -n "${SOLANA_RPC_URLS:-}" ]]; then
  IFS=',' read -r -a RPC_LIST <<< "$SOLANA_RPC_URLS"
elif [[ -n "${SOLANA_RPC_URL:-}" ]]; then
  RPC_LIST=("$SOLANA_RPC_URL")
else
  IFS=',' read -r -a RPC_LIST <<< "$_DEFAULT_RPCS"
fi
for i in "${!RPC_LIST[@]}"; do RPC_LIST[$i]=$(echo "${RPC_LIST[$i]}" | xargs); done
RPC_INDEX=0
RPC="${RPC_LIST[$RPC_INDEX]}"
RPC_COUNT=${#RPC_LIST[@]}

DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
STATE_FILE="${STATE_FILE:-$DELIVER_DIR/last-sig}"
POLL_SECONDS="${POLL_SECONDS:-45}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
MAX_TRANSIENT_RETRIES="${MAX_TRANSIENT_RETRIES:-3}"
BACKOFF_BASE_SECONDS="${BACKOFF_BASE_SECONDS:-30}"
BACKOFF_MAX_SECONDS="${BACKOFF_MAX_SECONDS:-1800}"
CIRCUIT_FAILURE_THRESHOLD="${CIRCUIT_FAILURE_THRESHOLD:-5}"
CIRCUIT_COOLDOWN_SECONDS="${CIRCUIT_COOLDOWN_SECONDS:-120}"
RPC_RETRIES="${RPC_RETRIES:-3}"
RPC_RETRY_DELAY_SEC="${RPC_RETRY_DELAY_SEC:-2}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT}/dist"
VENDING_DIR="${ROOT}/digital-vending"
RETRY_STATE="${DELIVER_DIR}/.retry-state"
CIRCUIT_FILE="${DELIVER_DIR}/.circuit-rpc"

mkdir -p "$DELIVER_DIR"
touch "$RETRY_STATE"

echo "════════════════════════════════════════"
echo " TRV Sales Watcher (Level 2.5 — failover)"
echo " Address : $SALES_ADDRESS"
echo " AddrLen : $(printf '%s' "$SALES_ADDRESS" | wc -c | tr -d ' ')"
echo " RPC     : $RPC  ($((RPC_INDEX+1))/$RPC_COUNT endpoints)"
echo " Discord : ${DISCORD_WEBHOOK:+configured}${DISCORD_WEBHOOK:-not set}"
echo " Deliver : $DELIVER_DIR"
echo " State   : $STATE_FILE"
echo " Vending : $VENDING_DIR"
echo "════════════════════════════════════════"

# Build JSON the same way as the known-good curl test
build_sigs_payload() {
  jq -n --arg a "$SALES_ADDRESS" \
    '{jsonrpc:"2.0",id:1,method:"getSignaturesForAddress",params:[$a,{limit:8}]}'
}

echo "[self-test] RPC getSignaturesForAddress..."
_st_payload=$(build_sigs_payload)
_st_body=$(curl -sS --max-time 20 "$RPC" -X POST -H "Content-Type: application/json" -d "$_st_payload" || true)
if echo "$_st_body" | jq -e '.result != null' >/dev/null 2>&1; then
  echo "[self-test] OK"
elif echo "$_st_body" | jq -e '.error' >/dev/null 2>&1; then
  echo "[self-test] FAIL: $(echo "$_st_body" | jq -r '.error.message // .error')" >&2
  echo "[self-test] payload: $_st_payload" >&2
  echo "ERROR: fix SALES_ADDRESS or RPC before watching" >&2
  exit 1
else
  echo "[self-test] FAIL: empty/non-JSON response" >&2
  echo "$_st_body" >&2
  exit 1
fi
echo "Ctrl+C to stop"
echo

circuit_read() {
  if [[ ! -f "$CIRCUIT_FILE" ]]; then echo "closed 0 0"; return; fi
  local state failures opened_at
  state=$(grep -E '^state=' "$CIRCUIT_FILE" 2>/dev/null | cut -d= -f2 || echo closed)
  failures=$(grep -E '^failures=' "$CIRCUIT_FILE" 2>/dev/null | cut -d= -f2 || echo 0)
  opened_at=$(grep -E '^opened_at=' "$CIRCUIT_FILE" 2>/dev/null | cut -d= -f2 || echo 0)
  echo "${state:-closed} ${failures:-0} ${opened_at:-0}"
}
circuit_write() {
  cat > "$CIRCUIT_FILE" << EOF
state=$1
failures=$2
opened_at=$3
updated=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
}
circuit_allow() {
  local now state failures opened_at; now=$(date +%s)
  read -r state failures opened_at <<< "$(circuit_read)"
  case "$state" in
    closed) return 0 ;;
    open)
      if [[ $((now - opened_at)) -ge $CIRCUIT_COOLDOWN_SECONDS ]]; then
        circuit_write "half-open" "$failures" "$opened_at"
        echo "[circuit] RPC half-open — allowing probe" >&2; return 0
      fi
      echo "[circuit] RPC OPEN — skipping poll ($((CIRCUIT_COOLDOWN_SECONDS - (now - opened_at)))s left)" >&2
      return 1 ;;
    half-open) return 0 ;;
    *) return 0 ;;
  esac
}
circuit_success() {
  local state failures opened_at; read -r state failures opened_at <<< "$(circuit_read)"
  [[ "$state" != "closed" ]] && echo "[circuit] RPC recovered → closed" >&2
  circuit_write "closed" 0 0
}
rotate_rpc() {
  if [[ $RPC_COUNT -le 1 ]]; then
    echo "[rpc-failover] only one endpoint configured — no rotation" >&2
    return 1
  fi
  RPC_INDEX=$(( (RPC_INDEX + 1) % RPC_COUNT ))
  RPC="${RPC_LIST[$RPC_INDEX]}"
  echo "[rpc-failover] switched → [$RPC_INDEX] $RPC" >&2
  circuit_write "closed" 0 0
  return 0
}
circuit_failure() {
  local now state failures opened_at; now=$(date +%s)
  read -r state failures opened_at <<< "$(circuit_read)"
  failures=$((failures + 1))
  if [[ "$state" == "half-open" ]]; then
    echo "[circuit] RPC probe failed → open (cooldown ${CIRCUIT_COOLDOWN_SECONDS}s)" >&2
    circuit_write "open" "$failures" "$now"
    rotate_rpc || true
    return
  fi
  if [[ "$failures" -ge "$CIRCUIT_FAILURE_THRESHOLD" ]]; then
    echo "[circuit] RPC OPEN after $failures consecutive failures (cooldown ${CIRCUIT_COOLDOWN_SECONDS}s)" >&2
    circuit_write "open" "$failures" "$now"
    rotate_rpc || true
  else
    circuit_write "closed" "$failures" 0
    echo "[circuit] RPC failure count $failures/$CIRCUIT_FAILURE_THRESHOLD" >&2
  fi
}

# SKU map from catalog.json (single source of truth)
map_memo_to_id() {
  local memo="$1" id
  id=$(bash "$VENDING_DIR/memo-to-sku.sh" "$memo" 2>/dev/null) || id=""
  echo "$id"
}
get_retry_state() {
  local key="$1" line; line=$(grep -E "^${key}=" "$RETRY_STATE" 2>/dev/null | tail -1 || true)
  [[ -z "$line" ]] && { echo "0:0"; return; }; echo "${line#*=}"
}
set_retry_state() {
  local key="$1" count="$2" next_ts="$3"
  grep -v -E "^${key}=" "$RETRY_STATE" > "${RETRY_STATE}.tmp" 2>/dev/null || true
  mv "${RETRY_STATE}.tmp" "$RETRY_STATE"; echo "${key}=${count}:${next_ts}" >> "$RETRY_STATE"
}
clear_retry_state() {
  local key="$1"
  grep -v -E "^${key}=" "$RETRY_STATE" > "${RETRY_STATE}.tmp" 2>/dev/null || true
  mv "${RETRY_STATE}.tmp" "$RETRY_STATE"
}
backoff_delay() {
  local attempt="$1" delay=$BACKOFF_BASE_SECONDS i=1
  while [[ $i -lt $attempt ]]; do
    delay=$((delay * 2)); i=$((i + 1))
    [[ $delay -ge $BACKOFF_MAX_SECONDS ]] && { delay=$BACKOFF_MAX_SECONDS; break; }
  done; echo "$delay"
}

retry_pending() {
  local pending now; now=$(date +%s); shopt -s nullglob
  for pending in "$DELIVER_DIR"/*.PENDING; do
    [[ -f "$pending" ]] || continue
    local base prefix catalog_id key recip_file
    base=$(basename "$pending" .PENDING); prefix="${base%%_*}"; catalog_id="${base#*_}"
    key="${prefix}_${catalog_id}"; recip_file="$DELIVER_DIR/${prefix}.recipient"
    [[ ! -f "$recip_file" ]] && continue
    local state count next_ts; state=$(get_retry_state "$key")
    count="${state%%:*}"; next_ts="${state##*:}"; count=${count:-0}; next_ts=${next_ts:-0}
    [[ "$count" -ge "$MAX_TRANSIENT_RETRIES" ]] && { echo "  [retry] $key exhausted — manual intervention"; continue; }
    [[ "$next_ts" -gt 0 && "$now" -lt "$next_ts" ]] && { echo "  [retry] $key in backoff — $((next_ts - now))s"; continue; }
    echo "  [retry] $key ready (attempt $((count+1)))"
    local real_sig; real_sig=$(grep -E '^sig=' "$pending" 2>/dev/null | cut -d= -f2- || echo "${prefix}000000000000")
    set +e; bash "$VENDING_DIR/auto-deliver.sh" "$catalog_id" "$real_sig"; rc=$?; set -e
    case $rc in
      0) echo "  [retry] SUCCESS"; clear_retry_state "$key" ;;
      2) echo "  [retry] still PENDING (recipient)" ;;
      3|4)
        count=$((count + 1)); local delay next; delay=$(backoff_delay "$count"); next=$((now + delay))
        set_retry_state "$key" "$count" "$next"
        echo "  [retry] FAILED rc=$rc attempt $count/$MAX_TRANSIENT_RETRIES backoff ${delay}s"
        [[ "$count" -ge "$MAX_TRANSIENT_RETRIES" ]] && echo "EXHAUSTED at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$pending" ;;
      *) echo "  [retry] unexpected rc=$rc" ;;
    esac
  done; shopt -u nullglob
}

prepare_delivery() {
  local memo="$1" sig="$2" pack="" zip_src="" zip_name="" catalog_id=""
  catalog_id=$(map_memo_to_id "$memo")
  if [[ "$catalog_id" == "trv-posture-lite" ]]; then pack="Lite"; zip_name="trv-posture-lite.zip"; zip_src="${DIST_DIR}/trv-posture-lite.zip"
  elif [[ "$catalog_id" == "trv-posture-pack" ]]; then pack="Pack"; zip_name="trv-posture-pack.zip"; zip_src="${DIST_DIR}/trv-posture-pack.zip"
  elif [[ -z "$catalog_id" ]]; then echo "  [prepare] Unknown memo — skipping SKU deliver"; fi
  local dest=""
  if [[ -n "$zip_name" ]]; then
    dest="${DELIVER_DIR}/${sig:0:12}_${zip_name}"
    if [[ -f "$zip_src" ]]; then cp -f "$zip_src" "$dest"; echo "  [prepare] Copied $zip_name → $dest"
    else echo "  [prepare] WARNING: $zip_src missing"; dest="(ZIP missing)"; fi
  fi
  if [[ -n "$catalog_id" ]]; then
    echo "  [prepare] age+LT for $catalog_id (SKU from catalog.json)"
    set +e; bash "$VENDING_DIR/auto-deliver.sh" "$catalog_id" "$sig"; rc=$?; set -e
    case $rc in
      0) echo "  [prepare] age+LT frames ready" ;;
      2) echo "  [prepare] PENDING — need recipient drop file" ;;
      3) echo "  [prepare] FAILED encrypt/stream"
         now=$(date +%s); delay=$(backoff_delay 1)
         set_retry_state "${sig:0:12}_${catalog_id}" 1 $((now + delay)) ;;
      4) echo "  [prepare] FAILED catalog/payload" ;;
      *) echo "  [prepare] auto-deliver rc=$rc" ;;
    esac
  fi
  if [[ -n "$pack" && ! -f "${DELIVER_DIR}/${sig:0:12}_dm.txt" ]]; then
    cat > "${DELIVER_DIR}/${sig:0:12}_dm.txt" << EOF
Thanks for the payment.

Here's your TRV Posture ${pack}.

Sig verified: ${sig}

For encrypted frames: place age1 key in ${DELIVER_DIR}/${sig:0:12}.recipient — watcher auto-retries.
EOF
    echo "  [prepare] Classic DM written"
  fi
}

notify_discord() {
  local sig="$1" memo="$2" amount="$3"
  [[ -z "$DISCORD_WEBHOOK" ]] && return 0
  local pack_hint="Unknown" zip_hint="" catalog_id
  catalog_id=$(map_memo_to_id "$memo")
  case "$catalog_id" in
    trv-posture-lite) pack_hint="**TRV Posture Lite** (11 USDC)"; zip_hint="age/LT frames" ;;
    trv-posture-pack) pack_hint="**TRV Posture Pack** (25 USDC)"; zip_hint="age/LT frames" ;;
    sentinel-skill-zk-01) pack_hint="**ZK Membership Skill**"; zip_hint="age/LT frames" ;;
  esac
  local content; content=$(jq -n --arg sig "$sig" --arg memo "$memo" --arg amount "$amount" --arg pack "$pack_hint" \
    --arg zip "$zip_hint" --arg explorer "https://solscan.io/tx/${sig}" --arg deliver "$DELIVER_DIR" \
    '{content:("**New TRV Sale**\nPack: "+$pack+"\nAmount: "+$amount+"\nMemo: `"+$memo+"`\nSig: `"+$sig+"`\n"+$explorer+"\n\n"+$zip+"\nReady: `"+$deliver+"`")}')
  curl -sS -X POST -H "Content-Type: application/json" -d "$content" "$DISCORD_WEBHOOK" >/dev/null || true
}

rpc_call() {
  local payload="$1"
  local max_attempts="${RPC_RETRIES:-3}"
  local base_delay="${RPC_RETRY_DELAY_SEC:-2}"
  local attempt=1 last_rc=1
  RPC_RESP=""
  while [[ $attempt -le $max_attempts ]]; do
    local http_code body curl_rc
    set +e
    body=$(curl -sS --max-time 15 -w "\n%{http_code}" "$RPC" \
      -X POST -H "Content-Type: application/json" -d "$payload" 2>/dev/null)
    curl_rc=$?
    set -e
    if [[ $curl_rc -ne 0 ]]; then
      if [[ $curl_rc -eq 28 ]]; then echo "[rpc] attempt $attempt/$max_attempts: timeout after 15s" >&2
      else echo "[rpc] attempt $attempt/$max_attempts: curl failed (rc=$curl_rc)" >&2; fi
      last_rc=1
    else
      http_code=$(echo "$body" | tail -n1)
      RPC_RESP=$(echo "$body" | sed '$d')
      if [[ -z "$RPC_RESP" ]]; then
        echo "[rpc] attempt $attempt/$max_attempts: empty response (HTTP $http_code)" >&2; last_rc=2
      elif [[ "$http_code" != "200" ]]; then
        echo "[rpc] attempt $attempt/$max_attempts: HTTP $http_code" >&2; last_rc=1
      elif ! echo "$RPC_RESP" | jq -e . >/dev/null 2>&1; then
        echo "[rpc] attempt $attempt/$max_attempts: invalid JSON" >&2; last_rc=4
      else
        local err; err=$(echo "$RPC_RESP" | jq -r '.error.message // empty' 2>/dev/null || true)
        if [[ -n "$err" ]]; then
          echo "[rpc] attempt $attempt/$max_attempts: JSON-RPC error: $err" >&2
          last_rc=3
        else
          return 0
        fi
      fi
    fi
    if [[ $attempt -lt $max_attempts ]]; then
      local delay=$((base_delay * (1 << (attempt - 1))))
      [[ $delay -gt 15 ]] && delay=15
      echo "[rpc] retrying in ${delay}s..." >&2
      sleep "$delay"
    fi
    attempt=$((attempt + 1))
  done
  echo "[rpc] all $max_attempts attempts failed (last_rc=$last_rc)" >&2
  return $last_rc
}

get_tx_details() {
  local sig="$1" payload
  payload=$(jq -n --arg sig "$sig" \
    '{jsonrpc:"2.0",id:1,method:"getTransaction",params:[$sig,{encoding:"jsonParsed",maxSupportedTransactionVersion:0}]}')
  local memo="(rpc failed)" amount="(rpc failed)"
  if rpc_call "$payload"; then
    memo=$(echo "$RPC_RESP" | jq -r '.result.meta.logMessages // [] | map(select(test("Memo"; "i"))) | .[0] // empty' 2>/dev/null || true)
    if [[ -n "$memo" ]]; then
      memo=$(echo "$memo" | sed -E 's/.*Memo[^:]*: *//; s/^\[[0-9]+\] *//; s/^"//; s/"$//; s/\\"/"/g')
    else memo="(no memo found)"; fi
    amount=$(echo "$RPC_RESP" | jq -r --arg addr "$SALES_ADDRESS" \
      '(.result.meta.postTokenBalances // [])[] | select(.owner == $addr) | (.uiTokenAmount.uiAmountString // .uiTokenAmount.amount // empty)' 2>/dev/null | head -1 || true)
    if [[ -z "$amount" || "$amount" == "null" ]]; then amount="(check explorer)"
    else amount="${amount} USDC"; fi
  else
    echo "[rpc] get_tx_details failed for $sig — placeholders" >&2
  fi
  echo "$memo|$amount"
}

while true; do
  retry_pending
  if circuit_allow; then
    payload=$(build_sigs_payload)
    if rpc_call "$payload"; then
      circuit_success
      newest=$(echo "$RPC_RESP" | jq -r '.result[0].signature // empty' 2>/dev/null || true)
      if [[ -n "$newest" ]]; then
        last=""; [[ -f "$STATE_FILE" ]] && last=$(cat "$STATE_FILE")
        if [[ "$newest" != "$last" ]]; then
          echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)  NEW activity detected"
          echo "  Signature : $newest"
          echo "  Explorer  : https://solscan.io/tx/$newest"
          set +e; details=$(get_tx_details "$newest"); set -e
          memo="${details%%|*}"; amount="${details#*|}"
          echo "  Memo      : $memo"
          echo "  Amount    : $amount"; echo
          prepare_delivery "$memo" "$newest"
          notify_discord "$newest" "$memo" "$amount"
          echo "$newest" > "$STATE_FILE"
        fi
      fi
    else
      circuit_failure
    fi
  fi
  sleep "$POLL_SECONDS"
done
