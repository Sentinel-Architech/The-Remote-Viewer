#!/data/data/com.termux/files/usr/bin/bash
# Download phone-sized GGUF weights (general + distinct code expert)
set -euo pipefail

MODEL_DIR="${HOME}/.local/share/remote-viewer/models"
mkdir -p "$MODEL_DIR"

download() {
  local url="$1" out="$2" label="$3"
  if [[ -f "$out" ]] && [[ -s "$out" ]]; then
    # If code.gguf is identical size to general and label is code, still allow replace via FORCE=1
    echo "Present: $out ($(du -h "$out" | awk '{print $1}')) [$label]"
    return 0
  fi
  echo "Downloading $label → $out"
  if command -v curl >/dev/null 2>&1; then
    curl -L --fail --progress-bar -o "${out}.partial" "$url"
    mv "${out}.partial" "$out"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "${out}.partial" "$url"
    mv "${out}.partial" "$out"
  else
    echo "FAIL: need curl or wget" >&2
    exit 1
  fi
  echo "Saved: $out"
}

GENERAL_URL="https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
CODE_URL="https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-0.5b-instruct-q4_k_m.gguf"

download "$GENERAL_URL" "${MODEL_DIR}/general.gguf" "TinyLlama 1.1B Q4_K_M"

# Distinct code expert (not a copy of general)
if [[ "${FORCE_CODE:-0}" == "1" ]] && [[ -f "${MODEL_DIR}/code.gguf" ]]; then
  rm -f "${MODEL_DIR}/code.gguf"
fi
download "$CODE_URL" "${MODEL_DIR}/code.gguf" "Qwen2.5-Coder-0.5B Instruct Q4_K_M"

ls -lh "$MODEL_DIR"
echo
echo "Verify distinct files:"
wc -c "${MODEL_DIR}/general.gguf" "${MODEL_DIR}/code.gguf" 2>/dev/null || true
echo
echo "  export LLAMA_CLI=\$HOME/llama.cpp/build/bin/llama-cli"
echo "  bash modules/moe-router/run-model.sh general \"Hello\""
echo "  bash modules/moe-router/run-model.sh code \"Write a bash loop\""
echo "If code.gguf was a seeded copy, re-run: FORCE_CODE=1 bash modules/moe-router/fetch-weights.sh"
