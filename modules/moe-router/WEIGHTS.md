# Real weights

| File | Model | Stage |
|------|-------|-------|
| `general.gguf` | TinyLlama 1.1B Q4_K_M | B dense **PROVEN** |
| `code.gguf` | Qwen2.5-Coder-0.5B Q4_K_M | B dense **PROVEN** |
| `moe.gguf` | TinyMixtral-4x248M-MoE Q4_K_M | C sparse — prove on device |

```bash
bash modules/moe-router/fetch-weights.sh          # B
FORCE_CODE=1 bash modules/moe-router/fetch-weights.sh
bash modules/moe-router/fetch-moe-weights.sh      # C
```
