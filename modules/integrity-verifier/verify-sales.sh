#!/usr/bin/env bash
# Integrity Verifier — sales.log integrity check (offline)
# Locked role: docs/locked/17-Validator-Node-First-Role.md
# Never opens buyer keys or decrypts frames.
set -euo pipefail

DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
LOG="${1:-${SALES_LOG:-$DELIVER_DIR/sales.log}}"
EMPTY_SHA="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

echo "=== Integrity Verifier: sales.log ==="
echo "LOG=$LOG"

if [[ ! -f "$LOG" ]]; then
  echo "RESULT: empty (no sales.log)"
  echo "SALES_OK=1"
  echo "SALES_LINES=0"
  echo "SALES_FAILS=0"
  exit 0
fi

N=0
FAILS=0
HASHED=0

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" ]] && continue
  N=$((N + 1))

  # Expect tab-separated fields from log-sale.sh
  # TS  id=...  [note]  [frames=...]  [sha256=...]  [bytes=...]
  SHA=""
  BYTES=""
  FRAMES=""

  if printf '%s' "$line" | grep -q $'\tsha256='; then
    SHA=$(printf '%s' "$line" | sed -n 's/.*sha256=\([a-fA-F0-9]*\).*/\1/p')
  fi
  if printf '%s' "$line" | grep -q $'\tbytes='; then
    BYTES=$(printf '%s' "$line" | sed -n 's/.*bytes=\([0-9]*\).*/\1/p')
  fi
  if printf '%s' "$line" | grep -q $'\tframes='; then
    FRAMES=$(printf '%s' "$line" | sed -n 's/.*frames=\([^\t]*\).*/\1/p')
  fi

  # Lines without frames are allowed (manual notes) — skip hash checks
  if [[ -z "$FRAMES" && -z "$SHA" ]]; then
    continue
  fi

  HASHED=$((HASHED + 1))

  if [[ -z "$SHA" ]]; then
    echo "FAIL line $N: frames present but sha256 missing"
    FAILS=$((FAILS + 1))
    continue
  fi

  if [[ "$SHA" == "$EMPTY_SHA" ]]; then
    echo "FAIL line $N: empty-file sha256"
    FAILS=$((FAILS + 1))
    continue
  fi

  if [[ -n "$BYTES" ]] && [[ "$BYTES" -eq 0 ]]; then
    echo "FAIL line $N: bytes=0"
    FAILS=$((FAILS + 1))
    continue
  fi

  # If the frames file still exists locally, re-hash and compare
  if [[ -n "$FRAMES" ]]; then
    CANDIDATE="${DELIVER_DIR}/${FRAMES}"
    if [[ -f "$CANDIDATE" ]]; then
      if command -v sha256sum >/dev/null 2>&1; then
        GOT=$(sha256sum "$CANDIDATE" | awk '{print $1}')
      elif command -v shasum >/dev/null 2>&1; then
        GOT=$(shasum -a 256 "$CANDIDATE" | awk '{print $1}')
      else
        GOT=""
      fi
      if [[ -n "$GOT" && "$GOT" != "$SHA" ]]; then
        echo "FAIL line $N: on-disk sha256 mismatch for $FRAMES"
        FAILS=$((FAILS + 1))
      fi
    fi
  fi
done < "$LOG"

if [[ "$FAILS" -eq 0 ]]; then
  echo "RESULT: OK ($N lines, $HASHED hashed entries)"
  echo "SALES_OK=1"
  echo "SALES_LINES=$N"
  echo "SALES_FAILS=0"
  exit 0
fi

echo "RESULT: FAIL ($FAILS problems in $N lines)"
echo "SALES_OK=0"
echo "SALES_LINES=$N"
echo "SALES_FAILS=$FAILS"
exit 1
