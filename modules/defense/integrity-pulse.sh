#!/data/data/com.termux/files/usr/bin/bash
# Local integrity pulse for TRV node (Hydra scaffold)
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
BASE="${HOME}/.local/share/remote-viewer"
LOG="${BASE}/defense.log"
mkdir -p "$BASE"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

FAIL=0

log "integrity-pulse start"

# 1. Repo present
if [[ ! -d "$ROOT/.git" ]]; then
  log "FAIL: repo root missing $ROOT"
  FAIL=1
else
  log "OK: repo root"
fi

# 2. Critical modules exist
for p in \
  optical-airgap/scripts/e2e-age-lt.sh \
  modules/moe-router/run-model.sh \
  modules/contribution/verify.sh \
  modules/data-sovereignty/minimize-check.sh
do
  if [[ -f "$ROOT/$p" ]]; then
    log "OK: $p"
  else
    log "FAIL: missing $p"
    FAIL=1
  fi
done

# 3. Vault identity mode (if present)
if [[ -f "$HOME/vault-identity.txt" ]]; then
  MODE=$(stat -c '%a' "$HOME/vault-identity.txt" 2>/dev/null || stat -f '%Lp' "$HOME/vault-identity.txt" 2>/dev/null || echo '?')
  if [[ "$MODE" == "600" || "$MODE" == "400" ]]; then
    log "OK: vault-identity mode $MODE"
  else
    log "FAIL: vault-identity mode $MODE (want 600/400)"
    FAIL=1
  fi
else
  log "WARN: no vault-identity.txt (ok if unused)"
fi

if [[ -d "$BASE/identity" ]]; then
  DMODE=$(stat -c '%a' "$BASE/identity" 2>/dev/null || stat -f '%OLp' "$BASE/identity" 2>/dev/null || echo '?')
  if [[ "$DMODE" == "700" || "$DMODE" == "0700" ]]; then
    log "OK: identity dir mode $DMODE"
  else
    log "FAIL: identity dir mode $DMODE (want 700)"
    FAIL=1
  fi
fi

# 4. GGUF slots (optional)
for m in general.gguf code.gguf; do
  if [[ -f "$BASE/models/$m" ]]; then
    log "OK: model $m present"
  else
    log "WARN: model $m missing"
  fi
done

# 5. Tracked dirty (informational — not always FAIL)
if [[ -d "$ROOT/.git" ]]; then
  DIRTY=$(git -C "$ROOT" status --porcelain | grep -v '^??' || true)
  if [[ -n "$DIRTY" ]]; then
    log "WARN: tracked files modified"
  else
    log "OK: no tracked modifications"
  fi
fi

if [[ "$FAIL" -eq 0 ]]; then
  log "integrity-pulse RESULT=PASS"
  echo "RESULT: PASS"
  exit 0
fi
log "integrity-pulse RESULT=FAIL"
echo "RESULT: FAIL"
exit 1
