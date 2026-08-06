#!/data/data/com.termux/files/usr/bin/bash
# One front door for TRV on-device interaction
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
export LLAMA_ARGS="${LLAMA_ARGS:--n 128 -c 4096 -t 4}"

cmd="${1:-chat}"
shift || true

case "$cmd" in
  chat|c)
    exec bash "$ROOT/scripts/chat.sh"
    ;;
  talk|ask)
    tag="general"
    if [[ "${1:-}" =~ ^(general|code|moe|stub)$ ]]; then
      tag="$1"
      shift
    fi
    q="${*:-}"
    if [[ -z "$q" ]]; then
      exec bash "$ROOT/scripts/chat.sh"
    fi
    if [[ -d "$HOME/.local/share/remote-viewer/rag/chunks" ]] && \
       [[ -n "$(ls -A "$HOME/.local/share/remote-viewer/rag/chunks" 2>/dev/null || true)" ]]; then
      exec bash "$ROOT/modules/rag/ask.sh" "$tag" "$q"
    else
      exec bash "$ROOT/modules/moe-router/run-model.sh" "$tag" "$q"
    fi
    ;;
  pulse)
    exec bash "$ROOT/modules/defense/integrity-pulse.sh"
    ;;
  sync)
    DEFENSE_AFTER_SYNC=1 exec bash "$ROOT/scripts/git-sync.sh" TheRemoteViewer
    ;;
  ui)
    exec bash "$ROOT/apps/ui/serve-ui.sh"
    ;;
  optical|e2e)
    msg="${*:-secret viewer message}"
    exec bash "$ROOT/optical-airgap/scripts/e2e-age-lt.sh" "$msg"
    ;;
  ingest)
    exec bash "$ROOT/modules/rag/ingest.sh"
    ;;
  seed)
    exec bash "$ROOT/modules/rag/seed-trv-docs.sh"
    ;;
  help|-h|--help)
    cat <<EOF
TRV

  trv              # same as trv chat — just ask questions
  trv chat         # interactive loop
  trv talk <q>     # one-shot question
  trv pulse | sync | ui | optical | seed | ingest
EOF
    ;;
  *)
    # bare words → treat as a one-shot question
    if [[ -n "$cmd" ]]; then
      set -- "$cmd" "$@"
      q="$*"
      if [[ -d "$HOME/.local/share/remote-viewer/rag/chunks" ]] && \
         [[ -n "$(ls -A "$HOME/.local/share/remote-viewer/rag/chunks" 2>/dev/null || true)" ]]; then
        exec bash "$ROOT/modules/rag/ask.sh" general "$q"
      else
        exec bash "$ROOT/modules/moe-router/run-model.sh" general "$q"
      fi
    fi
    exec bash "$ROOT/scripts/chat.sh"
    ;;
esac
