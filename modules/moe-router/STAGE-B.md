# MoE Stage B — Local models / adapters

**Status:** SCAFFOLD  
**Requirement:** Multiple local models or adapters selectable by the router.

## What Stage B is

| Stage | Meaning |
|-------|--------|
| A | Specialist **processes** + tag router |
| **B** | Specialist **models/adapters** on disk + select/run |
| C | True sparse MoE weights (e.g. Mixtral-class) on-device |
| D | Recursive IA-of-IA over expert set |

Stage B does **not** claim neural sparse MoE. It claims: more than one local model path can be registered and selected without network.

## Layout

| File | Role |
|------|------|
| `models.json` | Registry: id, tags, backend, path, notes |
| `list-models.sh` | Show registered models |
| `select-model.sh` | Tag → model id + path (fail closed) |
| `run-model.sh` | Invoke backend if present; else dry-run |

## Backends (local only)

| Backend | Binary | Notes |
|---------|--------|-------|
| `llama.cpp` | `llama-cli` / `main` on `PATH` or `LLAMA_CLI` | GGUF models |
| `stub` | none | Prints selection only — for wiring tests |

Set `TRV_MODELS=/path/to/models.json` to override registry.

## Not in Stage B

- Cloud API experts as core
- Automatic model download from the router
- Claiming Stage C performance
