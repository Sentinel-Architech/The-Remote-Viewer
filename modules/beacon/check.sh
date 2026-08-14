#!/usr/bin/env bash
# TRV validator beacon checker — local, offline
# Format + freshness + optional ed25519 verify
# See docs/public/BEACON.md
set -euo pipefail

MAX_AGE="${TRV_BEACON_MAX_AGE:-1800}"
FROM=""
ALLOW_DEV=0
PUBKEY="${TRV_BEACON_PUBKEY:-}"

usage() {
  cat <<EOF
Usage: bash modules/beacon/check.sh --from <file|-> [--max-age <sec>] [--pubkey <pem>] [--allow-dev]

  --from       Beacon file, or - for stdin
  --max-age    Freshness window seconds (default 1800)
  --pubkey     OpenSSL ed25519 public key PEM (or TRV_BEACON_PUBKEY)
  --allow-dev  Accept sig=DEV-UNSIGNED (dry-run only)

Exit: 0 active | 1 fail | 2 usage
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from) FROM="$2"; shift 2 ;;
    --max-age) MAX_AGE="$2"; shift 2 ;;
    --pubkey) PUBKEY="$2"; shift 2 ;;
    --allow-dev) ALLOW_DEV=1; shift ;;
    -h|--help) usage; exit 2 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$FROM" ]]; then usage; exit 2; fi

if [[ "$FROM" == "-" ]]; then
  RAW=$(cat)
else
  [[ -f "$FROM" ]] || { echo "error: file not found: $FROM" >&2; exit 1; }
  RAW=$(cat "$FROM")
fi

if [[ -z "${RAW//[[:space:]]/}" ]]; then
  echo "FAIL: empty beacon"; exit 1
fi

if ! echo "$RAW" | grep -q '^TRV-BEACON/1'; then
  echo "FAIL: missing TRV-BEACON/1"; exit 1
fi

get_field() {
  echo "$RAW" | grep -E "^${1}=" | head -1 | sed "s/^${1}=//"
}

VALIDATOR=$(get_field validator)
SEQ=$(get_field seq)
TS=$(get_field ts)
EPOCH=$(get_field epoch)
SIG=$(get_field sig)

for f in VALIDATOR SEQ TS EPOCH SIG; do
  if [[ -z "${!f}" ]]; then
    echo "FAIL: missing field"
    exit 1
  fi
done

NOW=$(date +%s)
if ! [[ "$TS" =~ ^[0-9]+$ ]]; then
  echo "FAIL: ts not numeric"; exit 1
fi

AGE=$(( NOW - TS ))
[[ "$AGE" -lt 0 ]] && AGE=0

if [[ "$AGE" -gt "$MAX_AGE" ]]; then
  echo "FAIL: stale (age=${AGE}s max=${MAX_AGE}s)"; exit 1
fi

body="TRV-BEACON/1|validator=${VALIDATOR}|seq=${SEQ}|ts=${TS}|epoch=${EPOCH}"

if [[ "$SIG" == "DEV-UNSIGNED" ]]; then
  if [[ "$ALLOW_DEV" -eq 1 ]]; then
    echo "OK (dev): validator=$VALIDATOR seq=$SEQ age=${AGE}s epoch=$EPOCH"
    exit 0
  fi
  echo "FAIL: sig=DEV-UNSIGNED (not valid without --allow-dev)"
  exit 1
fi

# Real signature path
if [[ -z "$PUBKEY" ]]; then
  echo "FAIL: sig present but no --pubkey / TRV_BEACON_PUBKEY to verify"
  exit 1
fi
if [[ ! -f "$PUBKEY" ]]; then
  echo "FAIL: pubkey file not found: $PUBKEY"
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1; then
  echo "FAIL: openssl not found"; exit 1
fi

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT
printf '%s' "$SIG" | openssl base64 -d -A > "$TMPDIR/sig.bin" 2>/dev/null || {
  echo "FAIL: sig not valid base64"; exit 1
}
printf '%s' "$body" > "$TMPDIR/body"

if openssl pkeyutl -verify -pubin -inkey "$PUBKEY" -sigfile "$TMPDIR/sig.bin" -in "$TMPDIR/body" >/dev/null 2>&1; then
  echo "OK: validator=$VALIDATOR seq=$SEQ age=${AGE}s epoch=$EPOCH sig=ed25519"
  exit 0
fi

echo "FAIL: signature verification failed"
exit 1
