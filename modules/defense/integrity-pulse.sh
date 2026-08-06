#!/data/data/com.termux/files/usr/bin/bash
# Local integrity pulse for TRV node (Hydra)
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
BASE="${HOME}/.local/share/remote-viewer"
LOG="${BASE}/defense.log"
mkdir -p "$BASE"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

FAIL=0
WARN=0

log "integrity-pulse start"

# 1. Repo
if [[ ! -d "$ROOT/.git" ]]; then
  log "FAIL: repo root missing $ROOT"
  FAIL=1
else
  log "OK: repo root"
fi

# 2. Critical paths
for p in \
  optical-airgap/scripts/e2e-age-lt.sh \
  modules/moe-router/run-model.sh \
  modules/moe-router/list-models.sh \
  modules/contribution/verify.sh \
  modules/contribution/record.sh \
  modules/data-sovereignty/minimize-check.sh \
  modules/defense/integrity-pulse.sh \
  modules/self-heal/optical-pulse.sh \
  scripts/git-sync.sh
do
  if [[ -f "$ROOT/$p" ]]; then
    log "OK: $p"
  else
    log "FAIL: missing $p"
    FAIL=1
  fi
done

# 3. Vault / identity modes
if [[ -f "$HOME/vault-identity.txt" ]]; then
  MODE=$(stat -c '%a' "$HOME/vault-identity.txt" 2>/dev/null || stat -f '%Lp' "$HOME/vault-identity.txt" 2>/dev/null || echo '?')
  if [[ "$MODE" == "600" || "$MODE" == "400" ]]; then
    log "OK: vault-identity mode $MODE"
  else
    log "FAIL: vault-identity mode $MODE (want 600/400)"
    FAIL=1
  fi
else
  log "WARN: no vault-identity.txt"
  WARN=1
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

# 4. Models (B + C)
for m in general.gguf code.gguf moe.gguf; do
  if [[ -f "$BASE/models/$m" ]]; then
    log "OK: model $m"
  else
    log "WARN: model $m missing"
    WARN=1
  fi
done

# 5. Contribution chain (if events exist)
EV="$BASE/contribution/events.jsonl"
if [[ -f "$EV" ]] && [[ -s "$EV" ]]; then
  if bash "$ROOT/modules/contribution/verify.sh" >/dev/null 2>&1; then
    log "OK: contribution chain verifies"
  else
    log "FAIL: contribution chain verify failed"
    FAIL=1
  fi
else
  log "WARN: no contribution events yet"
  WARN=1
fi

# 6. Tracked dirty
if [[ -d "$ROOT/.git" ]]; then
  DIRTY=$(git -C "$ROOT" status --porcelain | grep -v '^??' || true)
  if [[ -n "$DIRTY" ]]; then
    log "WARN: tracked files modified"
    WARN=1
  else
    log "OK: no tracked modifications"
  fi
fi

if [[ "$FAIL" -eq 0 ]]; then
  log "integrity-pulse RESULT=PASS (warns=$WARN)"
  echo "RESULT: PASS (warns=$WARN)"
  exit 0
fi
log "integrity-pulse RESULT=FAIL (warns=$WARN)"
echo "RESULT: FAIL (warns=$WARN)"
exit 1
