#!/usr/bin/env bash
# Require a validator to be on the published list and currently active (fresh signed beacon).
# See docs/public/BEACON.md and docs/public/VALIDATOR-LIST.md
set -euo pipefail

LIST="${TRV_VALIDATOR_LIST:-}"
BEACON="${TRV_BEACON_FILE:-$HOME/trv-beacon/latest}"
MAX_AGE="${TRV_BEACON_MAX_AGE:-1800}"
REPO_ROOT="${TRV_REPO_ROOT:-}"

usage() {
  cat <<EOF
Usage: bash modules/beacon/require-active.sh [--list <json>] [--beacon <file>]

Exit 0 if the beacon's validator id is in the list and check.sh passes (fresh + ed25519).
Exit 1 otherwise.

Env:
  TRV_VALIDATOR_LIST   path to validator-list JSON (or --list)
  TRV_BEACON_FILE      path to latest beacon (default: \$HOME/trv-beacon/latest)
  TRV_BEACON_MAX_AGE   seconds (default 1800)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --list) LIST="$2"; shift 2 ;;
    --beacon) BEACON="$2"; shift 2 ;;
    -h|--help) usage; exit 2 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

# Default list: repo public epoch-1 if present
if [[ -z "$LIST" ]]; then
  if [[ -n "$REPO_ROOT" && -f "$REPO_ROOT/docs/public/validator-list-epoch-1.json" ]]; then
    LIST="$REPO_ROOT/docs/public/validator-list-epoch-1.json"
  elif [[ -f "docs/public/validator-list-epoch-1.json" ]]; then
    LIST="docs/public/validator-list-epoch-1.json"
  elif [[ -f "$HOME/The-Remote-Viewer/docs/public/validator-list-epoch-1.json" ]]; then
    LIST="$HOME/The-Remote-Viewer/docs/public/validator-list-epoch-1.json"
  elif [[ -f "$HOME/trv-beacon/validator-list.json" ]]; then
    LIST="$HOME/trv-beacon/validator-list.json"
  fi
fi

if [[ -z "$LIST" || ! -f "$LIST" ]]; then
  echo "FAIL: no validator list found (set TRV_VALIDATOR_LIST)"
  exit 1
fi

if [[ ! -f "$BEACON" ]]; then
  echo "FAIL: no beacon file at $BEACON (run emit.sh first)"
  exit 1
fi

ID=$(grep -E '^validator=' "$BEACON" | head -1 | sed 's/^validator=//')
EPOCH=$(grep -E '^epoch=' "$BEACON" | head -1 | sed 's/^epoch=//')

if [[ -z "$ID" ]]; then
  echo "FAIL: beacon missing validator="
  exit 1
fi

# Membership: id must appear in list
if ! grep -q "\"id\": \"$ID\"" "$LIST"; then
  echo "FAIL: validator id not in list: $ID"
  echo "      list=$LIST"
  exit 1
fi

# Extract pubkey: prefer local validator.pub if sha matches, else decode b64 from list
PUB="${TRV_BEACON_PUBKEY:-$HOME/trv-beacon/validator.pub}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

if [[ ! -f "$PUB" ]]; then
  # Decode pubkey_pem_b64 from list for this id (best-effort with grep/sed)
  B64=$(grep -A6 "\"id\": \"$ID\"" "$LIST" | grep pubkey_pem_b64 | head -1 | sed 's/.*"pubkey_pem_b64": "//;s/".*//')
  if [[ -z "$B64" ]]; then
    echo "FAIL: no local pubkey and could not extract pubkey_pem_b64 from list"
    exit 1
  fi
  printf '%s' "$B64" | openssl base64 -d -A > "$TMP/pub.pem" 2>/dev/null || {
    echo "FAIL: could not decode pubkey_pem_b64"
    exit 1
  }
  PUB="$TMP/pub.pem"
fi

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
CHECK="$ROOT/modules/beacon/check.sh"
if [[ ! -f "$CHECK" ]]; then
  CHECK="$(dirname "$0")/check.sh"
fi

if ! bash "$CHECK" --from "$BEACON" --pubkey "$PUB" --max-age "$MAX_AGE"; then
  echo "FAIL: beacon check failed (stale or bad signature)"
  exit 1
fi

echo "OK: active validator id=$ID epoch=${EPOCH:-?} list=$LIST"
exit 0
