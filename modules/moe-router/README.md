# MoE Router

**Stage A:** process experts — `list.sh` · `route.sh` · `experts.json`  
**Stage B:** local models — `list-models.sh` · `select-model.sh` · `run-model.sh` · `models.json`

**Real weights:** [WEIGHTS.md](./WEIGHTS.md) · `fetch-weights.sh`

## Quick — weights on device

```bash
bash modules/moe-router/fetch-weights.sh
# build llama.cpp (see WEIGHTS.md), then:
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
bash modules/moe-router/run-model.sh general "Say hello in one sentence."
```

## Stage A

```bash
bash modules/moe-router/list.sh
bash modules/moe-router/route.sh optical
```

Fail closed. No cloud inference core. Stage C sparse MoE still DESIGN.
