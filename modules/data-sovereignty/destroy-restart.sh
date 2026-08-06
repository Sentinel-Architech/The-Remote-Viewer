#!/data/data/com.termux/files/usr/bin/bash
# Destroy = Restart — local path wipe
# Implements locked policy: extinguish local identity-path state under user control.
# Does NOT touch optical-airgap source, git, or system packages.

set -euo pipefail

BASE="${HOME}/.local/share/remote-viewer"
CONFIRM="${1:-}"

if [[ "$CONFIRM" != "--confirm" ]]; then
  echo "Destroy = Restart (local)"
  echo "This will remove:"
  echo "  $BASE/identity/"
  echo "  $BASE/contribution/"
  echo "  $BASE/self-heal.log (and related logs)"
  echo "  $BASE/cache/ (if present)"
  echo
  echo "Re-run with --confirm to execute. Keys not held elsewhere are gone."
  exit 1
fi

echo "[$(date -Iseconds)] Destroy = Restart starting" 

for path in identity contribution cache; do
  if [[ -d "$BASE/$path" ]]; then
    rm -rf "$BASE/$path"
    echo "Removed $BASE/$path"
  fi
done

for f in self-heal.log sdr.log; do
  if [[ -f "$BASE/$f" ]]; then
    rm -f "$BASE/$f"
    echo "Removed $BASE/$f"
  fi
done

# Optional: clear temp artifacts in $HOME used by optical e2e
for f in ct.bin ct2.bin trvl.txt; do
  rm -f "$HOME/$f" 2>/dev/null || true
done

echo "[$(date -Iseconds)] Local path state extinguished. Square one."
echo "Generate new identity with: modules/local-identity/keygen.sh"
