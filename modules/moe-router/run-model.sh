#!/data/data/com.termux/files/usr/bin/bash
# Stage B/C: select by tag and invoke local backend (or stub)
set -euo pipefail

ROOT="${TRV_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi
TAG="${1:-}"
PROMPT="${2:-}"

if [[ -z "$TAG" ]]; then
  echo "Usage: $0 <tag> [prompt]"
  exit 1
fi

OUT=$(bash "$ROOT/modules/moe-router/select-model.sh" "$TAG") || {
  echo "FAIL: no model for tag '$TAG'" >&2
  exit 2
}

MID=$(printf '%s\n' "$OUT" | sed -n '1p')
BACKEND=$(printf '%s\n' "$OUT" | sed -n '2p')
MPATH=$(printf '%s\n' "$OUT" | sed -n '3p')

echo "model: $MID"
echo "backend: $BACKEND"
echo "path: ${MPATH:-none}"

if [[ "$BACKEND" == "stub" ]]; then
  echo "[stub] selected=$MID tag=$TAG"
  if [[ -n "$PROMPT" ]]; then
    echo "[stub] prompt_len=${#PROMPT} (no weights loaded)"
  fi
  exit 0
fi

if [[ "$BACKEND" == "llama.cpp" ]]; then
  if [[ -z "$MPATH" || ! -f "$MPATH" ]]; then
    echo "FAIL: GGUF missing at $MPATH" >&2
    exit 3
  fi
  CLI="${LLAMA_CLI:-}"
  if [[ -z "$CLI" ]]; then
    if command -v llama-cli >/dev/null 2>&1; then
      CLI=$(command -v llama-cli)
    elif command -v llama-main >/dev/null 2>&1; then
      CLI=$(command -v llama-main)
    else
      echo "FAIL: llama.cpp CLI not found (set LLAMA_CLI)" >&2
      exit 3
    fi
  fi
  if [[ -z "$PROMPT" ]]; then
    echo "Selected only (no prompt). Example: $0 $TAG \"hello\""
    exit 0
  fi
  # Default context 4096 if LLAMA_ARGS unset
  # shellcheck disable=SC2086
  exec "$CLI" -m "$MPATH" -p "$PROMPT" ${LLAMA_ARGS:--n 128 -c 4096 -t 4 --no-display-prompt}
fi

echo "FAIL: unknown backend $BACKEND" >&2
exit 4
