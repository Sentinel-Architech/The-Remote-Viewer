#!/data/data/com.termux/files/usr/bin/bash
# Local minimization check — flag patterns that violate locked Class A / log rules

set -euo pipefail

BASE="${HOME}/.local/share/remote-viewer"
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
ISSUES=0

echo "=== Data Minimization Check (local) ==="
echo "Time: $(date -Iseconds)"
echo

# 1. Secrets that must never appear in logs
if [[ -d "$BASE" ]]; then
  if grep -R -l -E 'AGE-SECRET-KEY-|BEGIN (RSA |OPENSSH |EC )?PRIVATE' "$BASE" 2>/dev/null; then
    echo "FAIL: Secret material found under $BASE"
    ISSUES=$((ISSUES + 1))
  else
    echo "OK: No private key patterns under $BASE"
  fi
else
  echo "OK: No local share dir yet"
fi

# 2. Identity dir permissions
if [[ -d "$BASE/identity" ]]; then
  MODE=$(stat -c '%a' "$BASE/identity" 2>/dev/null || stat -f '%OLp' "$BASE/identity" 2>/dev/null || echo '?')
  if [[ "$MODE" != "700" && "$MODE" != "0700" ]]; then
    echo "WARN: identity dir mode is $MODE (prefer 700)"
    ISSUES=$((ISSUES + 1))
  else
    echo "OK: identity dir mode $MODE"
  fi
  if [[ -f "$BASE/identity/identity.agekey" ]]; then
    FMODE=$(stat -c '%a' "$BASE/identity/identity.agekey" 2>/dev/null || stat -f '%OLp' "$BASE/identity/identity.agekey" 2>/dev/null || echo '?')
    if [[ "$FMODE" != "600" && "$FMODE" != "0600" ]]; then
      echo "WARN: identity.agekey mode $FMODE (prefer 600)"
      ISSUES=$((ISSUES + 1))
    else
      echo "OK: identity.agekey mode $FMODE"
    fi
  fi
fi

# 3. Repo hygiene: no committed secrets in working tree (best-effort)
if [[ -d "$ROOT/.git" ]]; then
  if git -C "$ROOT" grep -I -E 'AGE-SECRET-KEY-' 2>/dev/null | head -5; then
    echo "FAIL: AGE-SECRET-KEY pattern in git-tracked content"
    ISSUES=$((ISSUES + 1))
  else
    echo "OK: no AGE-SECRET-KEY in tracked files (sample check)"
  fi
fi

echo
if [[ "$ISSUES" -eq 0 ]]; then
  echo "Result: PASS ($ISSUES issues)"
  exit 0
else
  echo "Result: ATTENTION ($ISSUES issue(s))"
  exit 1
fi
