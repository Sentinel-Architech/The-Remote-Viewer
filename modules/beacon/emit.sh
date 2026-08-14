#!/usr/bin/env bash
# TRV validator beacon emitter — local, offline
# Writes $HOME/trv-beacon/latest (and history)
# See docs/public/BEACON.md
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"
STATE="$BEACON_DIR/state"
LATEST="$BEACON_DIR/latest"
VALIDATOR="${TRV_VALIDATOR_ID:-}"
EPOCH="${TRV_BEACON_EPOCH:-1}"
INTERVAL="${TRV_BEACON_INTERVAL:-300}"
KEY_FILE="${TRV_BEACON_KEY:-}"

usage() {
  cat <<EOF
Usage: bash modules/beacon/emit.sh --validator <id> [--key <ed25519.pem>] [--epoch <n>] [--once|--loop]

  --validator   Public identity string published in the validator list
  --key         Path to OpenSSL ed25519 private key (PEM). Or TRV_BEACON_KEY.
                If omitted → sig=DEV-UNSIGNED (dry-run only).
  --epoch       Recognition epoch (default: 1)
  --once        Emit once and exit (default)
  --loop        Emit every TRV_BEACON_INTERVAL seconds (default 300)

Generate a keypair (once):
  openssl genpkey -algorithm ed25519 -out "\$HOME/trv-beacon/validator.pem"
  openssl pkey -in "\$HOME/trv-beacon/validator.pem" -pubout -out "\$HOME/trv-beacon/validator.pub"

Writes: $LATEST , history.log , state
EOF
}

ONCE=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --validator) VALIDATOR="$2"; shift 2 ;;
    --key) KEY_FILE="$2"; shift 2 ;;
    --epoch) EPOCH="$2"; shift 2 ;;
    --once) ONCE=1; shift ;;
    --loop) ONCE=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$VALIDATOR" ]]; then
  echo "error: set --validator or TRV_VALIDATOR_ID" >&2
  exit 1
fi

mkdir -p "$BEACON_DIR"
chmod 700 "$BEACON_DIR" 2>/dev/null || true

if [[ ! -f "$STATE" ]]; then
  echo "seq=0" > "$STATE"
fi

sign_body() {
  local body="$1"
  if [[ -z "$KEY_FILE" ]]; then
    echo "DEV-UNSIGNED"
    return
  fi
  if [[ ! -f "$KEY_FILE" ]]; then
    echo "error: key file not found: $KEY_FILE" >&2
    exit 1
  fi
  if ! command -v openssl >/dev/null 2>&1; then
    echo "error: openssl not found (pkg install openssl)" >&2
    exit 1
  fi
  # Sign raw body; output base64 (single line)
  printf '%s' "$body" | openssl pkeyutl -sign -inkey "$KEY_FILE" 2>/dev/null | openssl base64 -A
}

emit_one() {
  # shellcheck disable=SC1090
  source "$STATE"
  seq=$(( ${seq:-0} + 1 ))
  ts=$(date +%s)
  echo "seq=$seq" > "$STATE"

  body="TRV-BEACON/1|validator=${VALIDATOR}|seq=${seq}|ts=${ts}|epoch=${EPOCH}"
  sig=$(sign_body "$body")

  {
    echo "TRV-BEACON/1"
    echo "validator=${VALIDATOR}"
    echo "seq=${seq}"
    echo "ts=${ts}"
    echo "epoch=${EPOCH}"
    echo "sig=${sig}"
  } > "$LATEST"

  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) seq=${seq} ts=${ts} epoch=${EPOCH} sig_len=${#sig}" >> "$BEACON_DIR/history.log"

  echo "==> beacon written: $LATEST"
  cat "$LATEST"
  echo
  echo "canonical: $body"
  if [[ "$sig" == "DEV-UNSIGNED" ]]; then
    echo "(sig=DEV-UNSIGNED — pass --key for real ed25519 signature)"
  else
    echo "(sig=ed25519 base64, ${#sig} chars)"
  fi
}

if [[ "$ONCE" -eq 1 ]]; then
  emit_one
  exit 0
fi

echo "==> looping every ${INTERVAL}s (Ctrl+C to stop)"
while true; do
  emit_one
  sleep "$INTERVAL"
done
