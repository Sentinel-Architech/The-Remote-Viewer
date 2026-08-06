#!/data/data/com.termux/files/usr/bin/bash
# Optical readiness pulse — local only. Does NOT run full e2e every tick.
# Exit 0 = ready, non-zero = not ready. Safe for watchdog supervision.

set -euo pipefail

LOG_DIR="${HOME}/.local/share/remote-viewer"
LOG_FILE="${LOG_DIR}/self-heal.log"
mkdir -p "$LOG_DIR"

log() { echo "[$(date -Iseconds)] optical-pulse: $*" | tee -a "$LOG_FILE"; }

FAIL=0

if [[ ! -f "$HOME/vault-recipient.txt" ]]; then
  log "FAIL: missing $HOME/vault-recipient.txt"
  FAIL=1
fi
if [[ ! -f "$HOME/vault-identity.txt" ]]; then
  log "FAIL: missing $HOME/vault-identity.txt"
  FAIL=1
else
  # mode check only — do not print contents
  MODE=$(stat -c '%a' "$HOME/vault-identity.txt" 2>/dev/null || stat -f '%Lp' "$HOME/vault-identity.txt" 2>/dev/null || echo '?')
  if [[ "$MODE" != "600" && "$MODE" != "400" ]]; then
    log "WARN: vault-identity mode is $MODE (prefer 600)"
  fi
fi

if command -v age-keygen >/dev/null 2>&1 || command -v age >/dev/null 2>&1; then
  :
elif [[ -x "$HOME/The-Remote-Viewer/optical-airgap/rust/target/debug/trv-optical" ]] || \
     [[ -x "$HOME/The-Remote-Viewer/optical-airgap/rust/target/release/trv-optical" ]]; then
  :
else
  log "WARN: no age CLI and no built trv-optical binary in default paths"
fi

if [[ "$FAIL" -eq 0 ]]; then
  log "OK: optical vault present"
  exit 0
fi
exit 1
