#!/usr/bin/env bash
# Local integrity pulse for TRV node (Hydra) — multi-head
# Heads: structure · seal · contribution · sales/verifier · alert · quarantine · adaptive incident
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
BASE="${HOME}/.local/share/remote-viewer"
DEF="${BASE}/defense"
LOG="${BASE}/defense.log"
FLAG_Q="${DEF}/QUARANTINE"
FLAG_PASS="${DEF}/LAST_PASS"
mkdir -p "$BASE" "$DEF"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

FAIL=0
WARN=0

notify_fail() {
  local msg="$*"
  if command -v termux-notification >/dev/null 2>&1; then
    termux-notification -t "TRV Hydra FAIL" -c "$msg" --priority high 2>/dev/null || true
  fi
  if command -v termux-toast >/dev/null 2>&1; then
    termux-toast "Hydra FAIL: $msg" 2>/dev/null || true
  fi
}

log "integrity-pulse start (Hydra multi-head)"

# --- Head 1: structure ---
if [[ ! -d "$ROOT/.git" ]]; then
  log "FAIL: repo root missing $ROOT"
  FAIL=1
else
  log "OK: repo root"
fi

for p in \
  optical-airgap/scripts/e2e-age-lt.sh \
  modules/moe-router/run-model.sh \
  modules/contribution/verify.sh \
  modules/defense/integrity-pulse.sh \
  modules/defense/hydra-gate.sh \
  modules/defense/verify-seal.sh \
  modules/integrity-verifier/attest.sh \
  digital-vending/auto-deliver.sh \
  digital-vending/catalog.json
do
  if [[ -f "$ROOT/$p" ]]; then
    log "OK: $p"
  else
    log "FAIL: missing $p"
    FAIL=1
  fi
done

# Vault modes
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

for m in general.gguf code.gguf moe.gguf; do
  if [[ -f "$BASE/models/$m" ]]; then
    log "OK: model $m"
  else
    log "WARN: model $m missing"
    WARN=1
  fi
done

# --- Head 2: hash seal ---
if [[ -f "$DEF/baseline.sha256" ]]; then
  set +e
  seal_out=$(bash "$ROOT/modules/defense/verify-seal.sh" 2>&1)
  seal_rc=$?
  set -e
  if [[ $seal_rc -eq 0 ]]; then
    log "OK: seal matches"
  else
    log "FAIL: seal verify"
    echo "$seal_out" | while read -r line; do log "  $line"; done
    FAIL=1
  fi
else
  log "WARN: no baseline seal (run modules/defense/seal-baseline.sh)"
  WARN=1
fi

# --- Head 3: contribution ---
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

# --- Head 3b/4: integrity verifier + sales (if tooling present) ---
if [[ -f "$ROOT/modules/integrity-verifier/verify-contribution.sh" ]]; then
  set +e
  bash "$ROOT/modules/integrity-verifier/verify-contribution.sh" >/dev/null 2>&1
  vc_rc=$?
  set -e
  if [[ $vc_rc -eq 0 ]]; then
    log "OK: integrity-verifier contribution"
  else
    log "WARN: integrity-verifier contribution rc=$vc_rc"
    WARN=1
  fi
fi

if [[ -f "$ROOT/modules/integrity-verifier/verify-sales.sh" ]]; then
  SALES_LOG="${SALES_LOG:-$HOME/trv-deliver/sales.log}"
  if [[ -f "$SALES_LOG" ]]; then
    set +e
    bash "$ROOT/modules/integrity-verifier/verify-sales.sh" >/dev/null 2>&1
    vs_rc=$?
    set -e
    if [[ $vs_rc -eq 0 ]]; then
      log "OK: integrity-verifier sales.log"
    else
      log "FAIL: sales.log integrity (empty frame or chain)"
      FAIL=1
    fi
  else
    log "WARN: no sales.log yet"
    WARN=1
  fi
fi

# Dirty tree
if [[ -d "$ROOT/.git" ]]; then
  DIRTY=$(git -C "$ROOT" status --porcelain | grep -v '^??' || true)
  if [[ -n "$DIRTY" ]]; then
    log "WARN: tracked files modified"
    WARN=1
  else
    log "OK: no tracked modifications"
  fi
fi

# --- Head 5: quarantine flag + alert + adaptive record ---
if [[ "$FAIL" -eq 0 ]]; then
  rm -f "$FLAG_Q"
  date -u +%Y-%m-%dT%H:%M:%SZ > "$FLAG_PASS"
  log "integrity-pulse RESULT=PASS (warns=$WARN)"
  echo "RESULT: PASS (warns=$WARN)"
  exit 0
fi

# Adaptive learning: record the failure on-device (hash-chained)
# Recorder failure must never prevent quarantine (fail-closed priority)
if [[ -f "$ROOT/modules/defense/record-incident.sh" ]]; then
  bash "$ROOT/modules/defense/record-incident.sh" \
    "integrity_fail" \
    "multi" \
    "FAIL warns=$WARN — full log in defense.log" || true
fi

echo "quarantine=1" > "$FLAG_Q"
echo "at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$FLAG_Q"
echo "warns=$WARN" >> "$FLAG_Q"
log "integrity-pulse RESULT=FAIL (warns=$WARN) — QUARANTINE set"
notify_fail "integrity FAIL — deliver quarantined"
echo "RESULT: FAIL (warns=$WARN)"
exit 1
