#!/data/data/com.termux/files/usr/bin/bash
# Local AR contribution claim — NOT a token mint, NOT a chain tx
set -euo pipefail

DIR="${HOME}/.local/share/remote-viewer/contribution"
FILE="${DIR}/events.jsonl"
CLAIM_DIR="${DIR}/claims"
mkdir -p "$CLAIM_DIR"

if [[ ! -f "$FILE" ]] || [[ ! -s "$FILE" ]]; then
  echo "FAIL: no events to claim against" >&2
  exit 1
fi

if ! bash "$(dirname "$0")/verify.sh"; then
  echo "FAIL: verify before claim" >&2
  exit 1
fi

LAST=$(tail -n 1 "$FILE")
TIP=$(printf '%s' "$LAST" | sed -n 's/.*"sha":"\([^"]*\)".*/\1/p')
N=$(wc -l < "$FILE" | tr -d ' ')
TS=$(date -Iseconds)
ID=$(date +%Y%m%dT%H%M%S)

# Public recipient if present (safe) — never embed secret
RECIP=""
if [[ -f "$HOME/vault-recipient.txt" ]]; then
  RECIP=$(tr -d '\n\r' < "$HOME/vault-recipient.txt" | head -c 120)
fi

OUT="${CLAIM_DIR}/ar-claim-${ID}.json"
cat > "$OUT" <<EOF
{
  "type": "ar_contribution_claim",
  "version": 1,
  "ts": "$TS",
  "event_count": $N,
  "tip_sha": "$TIP",
  "recipient_hint": "$RECIP",
  "statement": "Local claim of recorded contribution work. Not a security. Not a mint. Not transferable by this file alone.",
  "chain": null,
  "txid": null
}
EOF
chmod 600 "$OUT" 2>/dev/null || true

echo "Claim written: $OUT"
echo "This is a local attestation file only."
echo "No token was minted. No chain transaction was submitted."
