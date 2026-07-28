#!/usr/bin/env bash
# build-posture-pack.sh — assemble TRV Posture Pack ZIP from public/locked docs
# Usage: from repo root:  ./scripts/build-posture-pack.sh
# Output: dist/trv-posture-pack-YYYYMMDD.zip (+ latest symlink-style copy)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%d)"
OUT_DIR="${ROOT}/dist"
STAGE="${OUT_DIR}/.pack-stage"
ZIP_NAME="trv-posture-pack-${STAMP}.zip"
ZIP_PATH="${OUT_DIR}/${ZIP_NAME}"
LATEST="${OUT_DIR}/trv-posture-pack.zip"

mkdir -p "$OUT_DIR"
rm -rf "$STAGE"
mkdir -p "$STAGE/01-posture" "$STAGE/02-install" "$STAGE/03-core-rules" \
         "$STAGE/04-security" "$STAGE/05-distribution"

# --- Manifest / buyer intro (pack-only) ---
cat > "$STAGE/00-START-HERE.md" << 'EOF'
# TRV Posture Pack

Thank you for supporting The Remote Viewer.

This pack is a **curated reading order** of public project docs. It does not
contain private keys, seeds, or production secrets. Scaffold clients are still
scaffolds — this pack is about **honest posture**, not a finished product claim.

## Reading order

1. `01-posture/POSTURE.md` — what we publish vs what we never publish
2. `03-core-rules/03-Destroy-Equals-Restart.md` — absolute identity rule
3. `02-install/INSTALL.md` — install-anywhere, tiers, Obtainium
4. `02-install/RELEASE-HYGIENE.md` — how releases must stay sideload-safe
5. `04-security/SECURITY.md` — reporting policy
6. `04-security/running-system-threat-model.md` — running-system threats (draft)
7. `05-distribution/` — Obtainium templates (when you ship an APK)

## Free vs pack

Everything here is derived from the public repo. You paid for **ordering +
packaging + support signal**, not for secret protocol material.

Repo: https://github.com/Sentinel-Archetecht/The-Remote-Viewer

Pay / delivery notes: `docs/public/VENDING.md` in the repo.
EOF

# --- Copy sources (fail loudly if missing) ---
copy_req() {
  local src="$1" dest="$2"
  if [[ ! -f "$src" ]]; then
    echo "ERROR: required file missing: $src" >&2
    exit 1
  fi
  cp "$src" "$dest"
}

copy_opt() {
  local src="$1" dest="$2"
  if [[ -f "$src" ]]; then
    cp "$src" "$dest"
  else
    echo "WARN: optional missing: $src"
  fi
}

copy_req "docs/public/POSTURE.md"                    "$STAGE/01-posture/POSTURE.md"
copy_req "docs/public/INSTALL.md"                    "$STAGE/02-install/INSTALL.md"
copy_opt "docs/public/RELEASE-HYGIENE.md"            "$STAGE/02-install/RELEASE-HYGIENE.md"
copy_req "docs/locked/03-Destroy-Equals-Restart.md"  "$STAGE/03-core-rules/03-Destroy-Equals-Restart.md"
copy_req "SECURITY.md"                               "$STAGE/04-security/SECURITY.md"
copy_opt "docs/security/running-system-threat-model.md" "$STAGE/04-security/running-system-threat-model.md"
copy_opt "docs/distribution/obtainium-config.example.json" "$STAGE/05-distribution/obtainium-config.example.json"
copy_opt "docs/distribution/obtainium-catalog.example.json" "$STAGE/05-distribution/obtainium-catalog.example.json"

# --- Version stamp ---
{
  echo "pack: TRV Posture Pack"
  echo "built_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "git_commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  echo "source_repo: https://github.com/Sentinel-Archetecht/The-Remote-Viewer"
} > "$STAGE/BUILD.txt"

# --- Zip ---
rm -f "$ZIP_PATH" "$LATEST"
(
  cd "$STAGE"
  # Portable zip: prefer zip(1); fall back to tar.gz if needed
  if command -v zip >/dev/null 2>&1; then
    zip -r -q "$ZIP_PATH" .
  else
    echo "zip not found; writing .tar.gz instead" >&2
    TAR_PATH="${ZIP_PATH%.zip}.tar.gz"
    tar -czf "$TAR_PATH" .
    ZIP_PATH="$TAR_PATH"
    LATEST="${OUT_DIR}/trv-posture-pack.tar.gz"
  fi
)

cp -f "$ZIP_PATH" "$LATEST" 2>/dev/null || true
rm -rf "$STAGE"

# --- Secrets sanity (no private key patterns in archive) ---
if command -v zipgrep >/dev/null 2>&1 && [[ "$ZIP_PATH" == *.zip ]]; then
  if zipgrep -Eiq 'BEGIN (OPENSSH |RSA |EC )?PRIVATE KEY|mnemonic|seed phrase' "$ZIP_PATH" 2>/dev/null; then
    echo "ERROR: pack appears to contain secret-like material — abort" >&2
    rm -f "$ZIP_PATH" "$LATEST"
    exit 1
  fi
fi

echo "Built: $ZIP_PATH"
echo "Latest: $LATEST"
ls -la "$ZIP_PATH" "$LATEST" 2>/dev/null || ls -la "$ZIP_PATH"
