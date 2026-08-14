#!/usr/bin/env bash
# TRV validator beacon emitter — local, offline
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

  --validator   Public identity string
  --key         OpenSSL ed25519 private key PEM (or TRV_BEACON_KEY)
  --epoch       Recognition epoch (default 1)
  --once        Emit once (default)
  --loop        Emit every TRV_BEACON_INTERVAL seconds

Keypair:
  openssl genpkey -algorithm ed25519 -out \$HOME/trv-beacon/validator.pem
  openssl pkey -in \$HOME/trv-beacon/validator.pem -pubout -out \$HOME/trv-beacon/validator.pub
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
    return 0
  fi
  if [[ ! -f "$KEY_FILE" ]]; then
    echo "error: key file not found: $KEY_FILE" >&2
    exit 1
  fi
  if ! command -v openssl >/dev/null 2>&1; then
    echo "error: openssl not found (pkg install openssl)" >&2
    exit 1
  fi

  local tmp
  tmp=$(mktemp)
  printf '%s' "$body" > "$tmp"
  # ed25519 requires a seekable input (no pipes) on many OpenSSL builds
  local sig
  if ! sig=$(openssl pkeyutl -sign -inkey "$KEY_FILE" -in "$tmp" 2>/dev/null | openssl base64 -A); then
    rm -f "$tmp"
    echo "error: openssl pkeyutl -sign failed" >&2
    exit 1
  fi
  rm -f "$tmp"
  if [[ -z "$sig" ]]; then
    echo "error: empty signature (openssl sign produced no output)" >&2
    exit 1
  fi
  printf '%s' "$sig"
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
