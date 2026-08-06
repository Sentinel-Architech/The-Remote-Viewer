#!/data/data/com.termux/files/usr/bin/bash
# Local minimization check — quiet, fail closed on real secret leakage
set -euo pipefail

BASE="${HOME}/.local/share/remote-viewer"
ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
ISSUES=0

echo "=== Data Minimization Check (local) ==="
echo "Time: $(date -Iseconds)"
echo

# 1. Secrets under local share (identity files are expected; content must not be world-readable logs)
if [[ -d "$BASE" ]]; then
  # Look for PEM/OpenSSH private blocks in non-identity paths (logs, exports)
  HIT=$(find "$BASE" -type f ! -path '*/identity/*' ! -name 'vault-identity.txt' ! -name 'identity.agekey' \
    -exec grep -l -E 'AGE-SECRET-KEY-1|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY' {} + 2>/dev/null || true)
  if [[ -n "$HIT" ]]; then
    echo "FAIL: secret material outside identity paths:"
    echo "$HIT"
    ISSUES=$((ISSUES + 1))
  else
    echo "OK: no private key patterns outside identity paths"
  fi
else
  echo "OK: no local share dir yet"
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

# 3. Tracked repo: real secret blobs only (AGE-SECRET-KEY-1...), not doc mentions
if [[ -d "$ROOT/.git" ]]; then
  if git -C "$ROOT" grep -I -E 'AGE-SECRET-KEY-1[A-Za-z0-9]+' 2>/dev/null | head -3 | grep -q .; then
    echo "FAIL: AGE-SECRET-KEY-1 material in git-tracked content"
    ISSUES=$((ISSUES + 1))
  else
    echo "OK: no AGE-SECRET-KEY-1 material in tracked files"
  fi
fi

echo
if [[ "$ISSUES" -eq 0 ]]; then
  echo "Result: PASS (0 issues)"
  exit 0
fi
echo "Result: ATTENTION ($ISSUES issue(s))"
exit 1
