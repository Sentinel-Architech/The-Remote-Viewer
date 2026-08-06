#!/data/data/com.termux/files/usr/bin/bash
# Fetch phone-sized sparse MoE GGUF → moe.gguf (Stage C attempt)
set -euo pipefail

MODEL_DIR="${HOME}/.local/share/remote-viewer/models"
mkdir -p "$MODEL_DIR"
OUT="${MODEL_DIR}/moe.gguf"

# TinyMixtral-4x248M-MoE Q4_K_M — real MoE (4 experts), ~0.5GB
URL="https://huggingface.co/mradermacher/TinyMixtral-4x248M-MoE-GGUF/resolve/main/TinyMixtral-4x248M-MoE.Q4_K_M.gguf"

if [[ -f "$OUT" ]] && [[ -s "$OUT" ]] && [[ "${FORCE_MOE:-0}" != "1" ]]; then
  echo "Already present: $OUT ($(du -h "$OUT" | awk '{print $1}'))"
  echo "Re-download: FORCE_MOE=1 $0"
  exit 0
fi

echo "Downloading TinyMixtral-4x248M-MoE Q4_K_M (sparse MoE, ~0.5GB)"
echo "Source: mradermacher/TinyMixtral-4x248M-MoE-GGUF"
if command -v curl >/dev/null 2>&1; then
  curl -L --fail --progress-bar -o "${OUT}.partial" "$URL"
  mv "${OUT}.partial" "$OUT"
elif command -v wget >/dev/null 2>&1; then
  wget -O "${OUT}.partial" "$URL"
  mv "${OUT}.partial" "$OUT"
else
  echo "FAIL: need curl or wget" >&2
  exit 1
fi

ls -lh "$OUT"
echo
echo "Architecture: TinyMixtral MoE (4x248M experts) — not dense Stage B"
echo "Next:"
echo "  export LLAMA_CLI=\$HOME/llama.cpp/build/bin/llama-cli"
echo "  export LLAMA_ARGS='-n 64 -c 512 -t 4'"
echo "  bash modules/moe-router/run-model.sh moe \"Say hello in one short sentence.\""
echo
echo "If load+gen succeeds on device → Stage C can be marked PROVEN in REALITY.md"
