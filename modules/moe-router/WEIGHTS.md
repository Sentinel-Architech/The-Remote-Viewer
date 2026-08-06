# Real weights (Stage B)

Local GGUF only. No cloud inference API as the core path.

## Phone-sized defaults (Pixel-class / Termux)

| Model | Quant | ~Size | Role |
|-------|-------|-------|------|
| TinyLlama 1.1B Chat | Q4_K_M | ~670 MB | `general` |
| Second copy or other GGUF | Q4_K_M | varies | `code` / specialist tag |

Start with **one** small GGUF. Larger (2B–4B) only if RAM allows.

## 1. Directory

```bash
mkdir -p $HOME/.local/share/remote-viewer/models
```

## 2. Download weights

```bash
cd $HOME/The-Remote-Viewer
bash modules/moe-router/fetch-weights.sh
```

Or manual (TheBloke TinyLlama Q4_K_M):

```bash
cd $HOME/.local/share/remote-viewer/models
curl -L -o general.gguf \
  "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
# optional second specialist file
cp general.gguf code.gguf   # replace later with a code-tuned GGUF if you want
```

## 3. Build or install llama.cpp on Termux

```bash
pkg update
pkg install git cmake clang make wget curl -y

cd $HOME
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j$(nproc) --target llama-cli

export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
# persist: echo 'export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli' >> ~/.bashrc
```

Some Termux installs ship `llama-cli` via pkg — if `command -v llama-cli` works, use that.

## 4. Run through TRV router

```bash
cd $HOME/The-Remote-Viewer
export LLAMA_CLI=${LLAMA_CLI:-$HOME/llama.cpp/build/bin/llama-cli}

bash modules/moe-router/list-models.sh
bash modules/moe-router/run-model.sh general "Say hello in one sentence."
bash modules/moe-router/run-model.sh code "Write a bash one-liner to list gguf files."
```

## 5. Honest limits

- Phone CPU is slow; keep context small (`LLAMA_ARGS='-n 64 -c 512 -t 4'`).
- OOM → smaller quant or smaller model.
- Stage C sparse MoE (Mixtral-class) is a different weight architecture — not this GGUF pair.
- Weights stay under your `$HOME`; do not commit GGUF files to git.
