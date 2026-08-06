#!/data/data/com.termux/files/usr/bin/bash
# Download phone-sized GGUF weights into TRV models dir (local only after download)
set -euo pipefail

MODEL_DIR="${HOME}/.local/share/remote-viewer/models"
mkdir -p "$MODEL_DIR"

GENERAL_URL="https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
GENERAL_OUT="${MODEL_DIR}/general.gguf"

if [[ -f "$GENERAL_OUT" ]] && [[ -s "$GENERAL_OUT" ]]; then
  echo "Already present: $GENERAL_OUT ($(du -h "$GENERAL_OUT" | awk '{print $1}'))"
else
  echo "Downloading TinyLlama 1.1B Q4_K_M (~670MB) → $GENERAL_OUT"
  echo "This is a one-time network fetch from Hugging Face."
  if command -v curl >/dev/null 2>&1; then
    curl -L --fail --progress-bar -o "$GENERAL_OUT.partial" "$GENERAL_URL"
    mv "$GENERAL_OUT.partial" "$GENERAL_OUT"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$GENERAL_OUT.partial" "$GENERAL_URL"
    mv "$GENERAL_OUT.partial" "$GENERAL_OUT"
  else
    echo "FAIL: need curl or wget" >&2
    exit 1
  fi
  echo "Saved: $GENERAL_OUT"
fi

# Second slot: copy until you supply a distinct specialist GGUF
if [[ ! -f "${MODEL_DIR}/code.gguf" ]]; then
  cp "$GENERAL_OUT" "${MODEL_DIR}/code.gguf"
  echo "Seeded code.gguf from general (replace with a code GGUF when ready)"
fi

ls -lh "$MODEL_DIR"
echo
echo "Next: build llama.cpp and:"
echo "  export LLAMA_CLI=\$HOME/llama.cpp/build/bin/llama-cli"
echo "  bash modules/moe-router/run-model.sh general \"Hello\""
