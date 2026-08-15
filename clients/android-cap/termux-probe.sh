#!/data/data/com.termux/files/usr/bin/bash
# TRV android-cap — Termux-side probe (PARTIAL for checklist C)
# Not a full Android Keystore instrumentation. Prints JSON-ish facts.

set -euo pipefail

API="unknown"
if command -v getprop >/dev/null 2>&1; then
  API=$(getprop ro.build.version.sdk 2>/dev/null || echo unknown)
fi

MODEL=$(getprop ro.product.model 2>/dev/null || echo unknown)
FINGER=$(getprop ro.build.fingerprint 2>/dev/null || echo unknown)

# Graphene / de-Google hints (heuristic only)
LOCAL_RUNTIME=false
case "$FINGER" in
  *graphene*|*Graphene*) LOCAL_RUNTIME=true ;;
esac
if [ -d "$PREFIX/bin" ] && command -v termux-info >/dev/null 2>&1; then
  # Termux present — operator can mark local runtime
  LOCAL_RUNTIME=true
fi

# Camera / mic: Termux API if installed
CAM="none"
MIC="none"
if command -v termux-camera-info >/dev/null 2>&1; then
  if termux-camera-info >/dev/null 2>&1; then
    CAM="ready_or_present"
  else
    CAM="denied_or_fail"
  fi
fi
if command -v termux-microphone-record >/dev/null 2>&1; then
  MIC="tool_present"
fi

echo "{\"apiLevel\":\"$API\",\"model\":\"$MODEL\",\"localRuntime\":$LOCAL_RUNTIME,\"camera\":\"$CAM\",\"mic\":\"$MIC\",\"keystore\":\"not_probed_in_termux\",\"note\":\"C partial — native Keystore needs Android shell\"}"

echo ""
echo "Map to tier (manual):"
echo "  API>=26 + (cam|mic) + keystore later => T1"
echo "  localRuntime true => T2 candidate"
echo "  nodeHostOptIn is separate (chain)"
