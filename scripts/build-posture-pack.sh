#!/usr/bin/env bash
# build-posture-pack.sh — assemble TRV pack ZIPs from public/locked docs
# Usage (repo root):
#   ./scripts/build-posture-pack.sh           # both
#   ./scripts/build-posture-pack.sh lite      # Lite only
#   ./scripts/build-posture-pack.sh full      # full only
#
# Output under dist/ (gitignored):
#   trv-posture-lite-YYYYMMDD.zip + trv-posture-lite.zip
#   trv-posture-pack-YYYYMMDD.zip + trv-posture-pack.zip

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%d)"
OUT_DIR="${ROOT}/dist"
MODE="${1:-both}"

mkdir -p "$OUT_DIR"

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

secret_scan() {
  local archive="$1"
  if command -v zipgrep >/dev/null 2>&1 && [[ "$archive" == *.zip ]]; then
    if zipgrep -Eiq 'BEGIN (OPENSSH |RSA |EC )?PRIVATE KEY|mnemonic|seed phrase' "$archive" 2>/dev/null; then
      echo "ERROR: pack appears to contain secret-like material — abort" >&2
      rm -f "$archive"
      exit 1
    fi
  fi
}

make_zip() {
  local stage="$1" zip_path="$2" latest="$3"
  rm -f "$zip_path" "$latest"
  (
    cd "$stage"
    if command -v zip >/dev/null 2>&1; then
      zip -r -q "$zip_path" .
    else
      echo "zip not found; writing .tar.gz instead" >&2
      local tar_path="${zip_path%.zip}.tar.gz"
      tar -czf "$tar_path" .
      zip_path="$tar_path"
      latest="${latest%.zip}.tar.gz"
    fi
  )
  cp -f "$zip_path" "$latest" 2>/dev/null || true
  secret_scan "$zip_path"
  echo "Built: $zip_path"
  ls -la "$zip_path"
}

build_lite() {
  local stage="${OUT_DIR}/.pack-stage-lite"
  rm -rf "$stage"
  mkdir -p "$stage/01-posture" "$stage/02-core-rules"

  cat > "$stage/00-START-HERE.md" << 'EOF'
# TRV Posture Lite

Impulse pack — core posture only. Price target: 9 USDC (whole ZIP, not per file).

## Reading order

1. `01-posture/POSTURE.md`
2. `02-core-rules/03-Destroy-Equals-Restart.md`

Upgrade: **TRV Posture Pack** (19 USDC) for full install + security + Obtainium notes.

Repo: https://github.com/Sentinel-Archetecht/The-Remote-Viewer
EOF

  copy_req "docs/public/POSTURE.md" "$stage/01-posture/POSTURE.md"
  copy_req "docs/locked/03-Destroy-Equals-Restart.md" "$stage/02-core-rules/03-Destroy-Equals-Restart.md"

  {
    echo "pack: TRV Posture Lite"
    echo "price_target: 9 USDC"
    echo "built_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "git_commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  } > "$stage/BUILD.txt"

  make_zip "$stage" \
    "${OUT_DIR}/trv-posture-lite-${STAMP}.zip" \
    "${OUT_DIR}/trv-posture-lite.zip"
  rm -rf "$stage"
}

build_full() {
  local stage="${OUT_DIR}/.pack-stage-full"
  rm -rf "$stage"
  mkdir -p "$stage/01-posture" "$stage/02-install" "$stage/03-core-rules" \
           "$stage/04-security" "$stage/05-distribution"

  cat > "$stage/00-START-HERE.md" << 'EOF'
# TRV Posture Pack

Full ordered map for builders. Price target: 19 USDC (whole ZIP, not per file).

## Reading order

1. `01-posture/POSTURE.md`
2. `03-core-rules/03-Destroy-Equals-Restart.md`
3. `02-install/INSTALL.md`
4. `02-install/RELEASE-HYGIENE.md`
5. `04-security/SECURITY.md`
6. `04-security/running-system-threat-model.md`
7. `05-distribution/` — Obtainium templates

Lite (9 USDC) is posture-only. This pack is the full bridge.

Repo: https://github.com/Sentinel-Archetecht/The-Remote-Viewer
EOF

  copy_req "docs/public/POSTURE.md" "$stage/01-posture/POSTURE.md"
  copy_req "docs/public/INSTALL.md" "$stage/02-install/INSTALL.md"
  copy_opt "docs/public/RELEASE-HYGIENE.md" "$stage/02-install/RELEASE-HYGIENE.md"
  copy_req "docs/locked/03-Destroy-Equals-Restart.md" "$stage/03-core-rules/03-Destroy-Equals-Restart.md"
  copy_req "SECURITY.md" "$stage/04-security/SECURITY.md"
  copy_opt "docs/security/running-system-threat-model.md" "$stage/04-security/running-system-threat-model.md"
  copy_opt "docs/distribution/obtainium-config.example.json" "$stage/05-distribution/obtainium-config.example.json"
  copy_opt "docs/distribution/obtainium-catalog.example.json" "$stage/05-distribution/obtainium-catalog.example.json"

  {
    echo "pack: TRV Posture Pack"
    echo "price_target: 19 USDC"
    echo "built_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "git_commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  } > "$stage/BUILD.txt"

  make_zip "$stage" \
    "${OUT_DIR}/trv-posture-pack-${STAMP}.zip" \
    "${OUT_DIR}/trv-posture-pack.zip"
  rm -rf "$stage"
}

case "$MODE" in
  lite) build_lite ;;
  full|pack) build_full ;;
  both)
    build_lite
    build_full
    ;;
  *)
    echo "Usage: $0 [lite|full|both]" >&2
    exit 1
    ;;
esac

echo "Done. Artifacts in $OUT_DIR"
