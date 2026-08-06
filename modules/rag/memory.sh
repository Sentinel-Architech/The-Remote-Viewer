#!/data/data/com.termux/files/usr/bin/bash
# Append / read conversation memory (user statements only by default)
set -euo pipefail
MEM_DIR="${HOME}/.local/share/remote-viewer/memory"
MEM="${MEM_DIR}/session.txt"
mkdir -p "$MEM_DIR"

cmd="${1:-}"
shift || true
case "$cmd" in
  add)
    line="$*"
    [[ -z "$line" ]] && exit 0
    # skip pure commands
    [[ "$line" == /* ]] && exit 0
    printf '%s\n' "$(date -Iseconds 2>/dev/null || date) | $line" >> "$MEM"
    # keep last ~200 lines
    if [[ -f "$MEM" ]]; then
      tail -n 200 "$MEM" > "${MEM}.tmp" && mv "${MEM}.tmp" "$MEM"
    fi
    ;;
  dump)
    if [[ -f "$MEM" ]]; then tail -n "${1:-40}" "$MEM"; else echo "(empty memory)"; fi
    ;;
  clear)
    : > "$MEM"
    echo "[memory cleared]"
    ;;
  *)
    echo "Usage: $0 add|dump|clear"
    exit 1
    ;;
esac
