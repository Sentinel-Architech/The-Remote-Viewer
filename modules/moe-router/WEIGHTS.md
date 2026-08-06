# Real weights (Stage B)

| Slot | Model | Quant | ~Size |
|------|-------|-------|-------|
| `general.gguf` | TinyLlama 1.1B Chat | Q4_K_M | ~670 MB |
| `code.gguf` | Qwen2.5-Coder-0.5B Instruct | Q4_K_M | ~400–500 MB |

## Fetch both

```bash
cd $HOME/The-Remote-Viewer
bash modules/moe-router/fetch-weights.sh

# If code.gguf was previously a copy of general:
FORCE_CODE=1 bash modules/moe-router/fetch-weights.sh
```

## llama.cpp

```bash
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
# optional: export LLAMA_ARGS="-n 64 -c 512 -t 4"
```

## Run distinct experts

```bash
bash modules/moe-router/list-models.sh
bash modules/moe-router/run-model.sh general "Say hello in one sentence."
bash modules/moe-router/run-model.sh code "Write a bash one-liner to count lines in a file."
```

`wc -c` on the two GGUFs should differ — that proves multi-model Stage B, not one file twice.
