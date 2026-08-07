#!/usr/bin/env bash
# seal-baseline.sh — write/update local hash seal of critical TRV paths
# Local only. No network. Output under ~/.local/share/remote-viewer/defense/
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
BASE="${HOME}/.local/share/remote-viewer/defense"
SEAL="${BASE}/baseline.sha256"
mkdir -p "$BASE"

PATHS=(
  optical-airgap/scripts/e2e-age-lt.sh
  modules/moe-router/run-model.sh
  modules/moe-router/list-models.sh
  modules/contribution/verify.sh
  modules/contribution/record.sh
  modules/data-sovereignty/minimize-check.sh
  modules/defense/integrity-pulse.sh
  modules/defense/hydra-gate.sh
  modules/defense/verify-seal.sh
  modules/defense/seal-baseline.sh
  modules/integrity-verifier/verify-contribution.sh
  modules/integrity-verifier/verify-sales.sh
  modules/integrity-verifier/attest.sh
  digital-vending/catalog.json
  digital-vending/memo-to-sku.sh
  digital-vending/auto-deliver.sh
  digital-vending/seller-deliver.sh
  digital-vending/seller-ops.sh
  digital-vending/log-sale.sh
  digital-vending/deliver-from-memo.sh
  scripts/git-sync.sh
)

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

{
  echo "# TRV Hydra baseline — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "# root=$ROOT"
  for p in "${PATHS[@]}"; do
    f="$ROOT/$p"
    if [[ -f "$f" ]]; then
      # path relative + hash
      sum=$(sha256sum "$f" | awk '{print $1}')
      printf '%s  %s\n' "$sum" "$p"
    else
      printf '%s  %s\n' "MISSING" "$p"
    fi
  done
} > "$TMP"

mv "$TMP" "$SEAL"
chmod 600 "$SEAL" 2>/dev/null || true
echo "Wrote seal: $SEAL"
wc -l < "$SEAL" | tr -d ' ' | xargs -I{} echo "entries: {}"
