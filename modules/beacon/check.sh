#!/usr/bin/env bash
# TRV validator beacon checker — local, offline
# Verifies format + freshness. Signature check is Stage 1 (rejects DEV-UNSIGNED as inactive for production threshold).
# See docs/public/BEACON.md
set -euo pipefail

MAX_AGE="${TRV_BEACON_MAX_AGE:-1800}"  # 30 minutes default
FROM=""
ALLOW_DEV=0

usage() {
  cat <<EOF
Usage: bash modules/beacon/check.sh --from <file|-> [--max-age <seconds>] [--allow-dev]

  --from       Path to beacon file, or - for stdin
  --max-age    Freshness window in seconds (default: 1800 = 30 min)
  --allow-dev  Accept sig=DEV-UNSIGNED (for local UI / dry-run only)

Exit codes:
  0  active (format ok + fresh + signature acceptable)
  1  invalid / stale / missing
  2  usage error
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from) FROM="$2"; shift 2 ;;
    --max-age) MAX_AGE="$2"; shift 2 ;;
    --allow-dev) ALLOW_DEV=1; shift ;;
    -h|--help) usage; exit 2 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$FROM" ]]; then
  usage
  exit 2
fi

if [[ "$FROM" == "-" ]]; then
  RAW=$(cat)
else
  if [[ ! -f "$FROM" ]]; then
    echo "error: file not found: $FROM" >&2
    exit 1
  fi
  RAW=$(cat "$FROM")
fi

if [[ -z "${RAW//[[:space:]]/}" ]]; then
  echo "FAIL: empty beacon"
  exit 1
fi

if ! echo "$RAW" | grep -q '^TRV-BEACON/1'; then
  echo "FAIL: missing TRV-BEACON/1"
  exit 1
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
    echo "FAIL: missing field ${f,,}"
    exit 1
  fi
done

NOW=$(date +%s)
if ! [[ "$TS" =~ ^[0-9]+$ ]]; then
  echo "FAIL: ts not numeric"
  exit 1
fi

AGE=$(( NOW - TS ))
if [[ "$AGE" -lt 0 ]]; then
  AGE=0  # small clock skew tolerance floor
fi

if [[ "$AGE" -gt "$MAX_AGE" ]]; then
  echo "FAIL: stale (age=${AGE}s max=${MAX_AGE}s)"
  exit 1
fi

if [[ "$SIG" == "DEV-UNSIGNED" ]]; then
  if [[ "$ALLOW_DEV" -eq 1 ]]; then
    echo "OK (dev): validator=$VALIDATOR seq=$SEQ age=${AGE}s epoch=$EPOCH sig=DEV-UNSIGNED"
    exit 0
  fi
  echo "FAIL: sig=DEV-UNSIGNED (not valid for production threshold; use --allow-dev for dry-run)"
  exit 1
fi

# Real signature verification lands with Stage 1 key tooling.
# For now, any non-DEV signature string is treated as present but unverified.
echo "OK (sig present, verify TBD): validator=$VALIDATOR seq=$SEQ age=${AGE}s epoch=$EPOCH"
echo "note: cryptographic sig verify not yet wired — wire against published validator list"
exit 0
