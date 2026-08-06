# MoE Stage C — Sparse MoE weights

**Phone path:** TinyMixtral-4x248M-MoE Q4_K_M (~0.5 GB)  
**Fetch:** `bash modules/moe-router/fetch-moe-weights.sh`

Real MoE architecture (4 experts × ~248M), not a dense model with a fake tag.

## Prove on device

```bash
bash modules/moe-router/fetch-moe-weights.sh
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
export LLAMA_ARGS="-n 64 -c 512 -t 4"
bash modules/moe-router/run-model.sh moe "Say hello in one short sentence."
```

**PROVEN** only when load + generation complete without OOM. Then record:

```bash
bash modules/contribution/record.sh verification 1 "moe stage C tinymixtral gen ok"
```

and update `docs/REALITY.md`.

## Larger sparse MoE

OLMoE-1B-7B (~4 GB Q4) is a stronger sparse MoE but heavy for many phones. Mixtral 8×7B is not a Pixel default.
