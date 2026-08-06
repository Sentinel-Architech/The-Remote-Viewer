#!/usr/bin/env bash
# Local unlock / setup — NOT cloud login
# Optional passphrase-wrapped age key using age -p
set -euo pipefail

ID_DIR="${HOME}/.local/share/remote-viewer/identity"
KEY="${ID_DIR}/identity.agekey"
WRAPPED="${ID_DIR}/identity.agekey.pass"

mkdir -p "$ID_DIR"
chmod 700 "$ID_DIR"

usage() {
  echo "Usage: $0 [--setup | --unlock | --status]"
  echo "  Local passphrase gate only. No network. No TRV account."
}

cmd="${1:---status}"

case "$cmd" in
  -h|--help) usage; exit 0 ;;
  --status)
    echo "Identity dir: $ID_DIR"
    [[ -f "$KEY" ]] && echo "Plain key file: present (mode $(stat -c '%a' "$KEY" 2>/dev/null || echo '?'))" || echo "Plain key file: absent"
    [[ -f "$WRAPPED" ]] && echo "Passphrase-wrapped: present" || echo "Passphrase-wrapped: absent"
    exit 0
    ;;
  --setup)
    if ! command -v age-keygen >/dev/null 2>&1; then
      echo "FAIL: install age (age-keygen)" >&2
      exit 1
    fi
    if [[ ! -f "$KEY" ]]; then
      age-keygen -o "$KEY"
      chmod 600 "$KEY"
      echo "Created $KEY"
    fi
    echo "Optional: wrap with passphrase (age -p). Leave blank to skip."
    if command -v age >/dev/null 2>&1; then
      read -r -p "Wrap key with passphrase now? [y/N] " w || true
      if [[ "${w:-}" =~ ^[Yy]$ ]]; then
        age -p -o "$WRAPPED" < "$KEY"
        chmod 600 "$WRAPPED"
        echo "Wrapped → $WRAPPED"
        echo "Remove plain key yourself if you only want wrapped: rm $KEY"
      fi
    fi
    echo "Public recipient:"
    age-keygen -y "$KEY" 2>/dev/null || true
    ;;
  --unlock)
    if [[ -f "$WRAPPED" ]] && command -v age >/dev/null 2>&1; then
      echo "Decrypting wrapped key to session file (not printed)…"
      TMP="${ID_DIR}/.session-identity"
      age -d -o "$TMP" "$WRAPPED"
      chmod 600 "$TMP"
      echo "Session key: $TMP"
      echo "Export for tools: export TRV_IDENTITY=$TMP"
    elif [[ -f "$KEY" ]]; then
      echo "Plain key already available: $KEY"
      echo "export TRV_IDENTITY=$KEY"
    else
      echo "FAIL: no identity — run $0 --setup" >&2
      exit 1
    fi
    ;;
  *) usage; exit 1 ;;
esac
