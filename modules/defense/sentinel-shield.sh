#!/bin/sh
# Sentinel shield gate. Calls modules/defense/POLICY.md. Not a separate protocol.
# Admits a viewer surface action. Refuses vault, seal, and proof ownership by the viewer.
set -eu
path="${1:-}"
action="${2:-}"
if [ -z "$path" ] || [ -z "$action" ]; then
  echo "usage: sentinel-shield.sh <viewer-path> <action>" >&2
  exit 2
fi
if [ "${HYDRA_GATE:-1}" = "0" ]; then
  echo "FAIL quarantine: hydra gate is emergency-off" >&2
  exit 1
fi
case "$path" in
  apps/hub/*|apps/command-deck/*|apps/ui/*|web/*) ;;
  *) echo "FAIL: shield admits only a viewer surface path" >&2; exit 1 ;;
esac
case "$action" in
  read-status|render) ;;
  game)
    case "$path" in
      apps/hub/src/os-sim/*|apps/command-deck/src/lib/native-game.ts) ;;
      *) echo "FAIL: game action outside native game paths" >&2; exit 1 ;;
    esac
    ;;
  vault-key|seal|proof)
    echo "FAIL: viewer cannot own $action" >&2
    exit 1
    ;;
  *) echo "FAIL: shield rejected $action" >&2; exit 1 ;;
esac
echo "admitted sentinel-shield $path $action"
