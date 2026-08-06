#!/data/data/com.termux/files/usr/bin/bash
# One front door for TRV on-device interaction
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
export LLAMA_CLI="${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}"
# Default context 4096 (was 2048). Override: LLAMA_ARGS="-n 128 -c 8192 -t 4"
export LLAMA_ARGS="${LLAMA_ARGS:--n 128 -c 4096 -t 4}"

cmd="${1:-help}"
shift || true

case "$cmd" in
  talk|ask)
    tag="general"
    if [[ "${1:-}" =~ ^(general|code|moe|stub)$ ]]; then
      tag="$1"
      shift
    fi
    q="${*:-}"
    if [[ -z "$q" ]]; then
      echo "Usage: trv talk [general|code|moe] <question>"
      exit 1
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
  help|-h|--help|*)
    cat <<EOF
TRV — one command

  trv talk <question>           RAG + general model (if chunks exist)
  trv talk code <question>     code model
  trv talk moe <question>      sparse MoE model
  trv pulse                    defense integrity
  trv sync                     git pull + defense check
  trv ui                       localhost console
  trv optical [message]        optical e2e
  trv seed                     seed + ingest TRV docs for RAG
  trv ingest                   re-chunk rag/docs

Default LLM context: 4096 (set LLAMA_ARGS to change)
EOF
    ;;
esac
