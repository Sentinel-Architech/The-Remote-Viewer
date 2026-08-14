#!/usr/bin/env bash
# Build a published validator list for the current epoch from local material.
# See docs/public/VALIDATOR-LIST.md
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"
PUB="${TRV_BEACON_PUBKEY:-$BEACON_DIR/validator.pub}"
OUT="${1:-$BEACON_DIR/validator-list.json}"
EPOCH="${TRV_BEACON_EPOCH:-1}"
ID="${TRV_VALIDATOR_ID:-}"
WEIGHT="${TRV_VALIDATOR_WEIGHT:-1}"

usage() {
  cat <<EOF
Usage: TRV_VALIDATOR_ID='age1…' bash modules/beacon/make-list.sh [outfile]

Reads:
  \$HOME/trv-beacon/validator.pub   (or TRV_BEACON_PUBKEY)

Writes JSON list (default: \$HOME/trv-beacon/validator-list.json)

Bootstrap rule:
  n=1 → threshold 1-of-1 (originator bootstrap only)
  n>=3 → operators should republish with m-of-n (e.g. 2-of-3)
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ -z "$ID" ]]; then
  echo "error: set TRV_VALIDATOR_ID to your public validator id (e.g. age1…)" >&2
  exit 1
fi

if [[ ! -f "$PUB" ]]; then
  echo "error: pubkey not found: $PUB" >&2
  echo "generate with: openssl genpkey -algorithm ed25519 ... (see modules/beacon/README.md)" >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "error: openssl required" >&2
  exit 1
fi

# PEM as single-line escaped for JSON
PEM=$(cat "$PUB" | awk 'BEGIN{ORS="\\n"} {print}' | sed 's/\\n$/\n/' | tr -d '\r')
# Actually build with python or pure bash carefully
PEM_RAW=$(cat "$PUB")
PEM_JSON=$(printf '%s' "$PEM_RAW" | openssl base64 -A)  # transport-safe; also store sha256 of file

SHA=$(sha256sum "$PUB" | awk '{print $1}')
PUBLISHED=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Bootstrap threshold
N=1
M=1

mkdir -p "$(dirname "$OUT")"

cat > "$OUT" <<EOF
{
  "epoch": ${EPOCH},
  "published_at": "${PUBLISHED}",
  "threshold": { "type": "m-of-n", "m": ${M}, "n": ${N} },
  "notes": "Bootstrap list. Single validator = Stage 0 equivalent in practice. Raise n and m when additional validators publish. See docs/public/VALIDATOR-LIST.md",
  "validators": [
    {
      "id": "${ID}",
      "pubkey_pem_sha256": "${SHA}",
      "pubkey_pem_b64": "${PEM_JSON}",
      "transports": ["optical", "file"],
      "weight": ${WEIGHT}
    }
  ]
}
EOF

echo "==> wrote $OUT"
echo "    epoch=$EPOCH id=$ID threshold=${M}-of-${N}"
echo "    pubkey_sha256=$SHA"
echo
echo "Verify beacon against this list's key:"
echo "  bash modules/beacon/check.sh --from \$HOME/trv-beacon/latest --pubkey $PUB"
echo
echo "When more validators exist, republish with m-of-n (e.g. 2-of-3) and include all entries."
