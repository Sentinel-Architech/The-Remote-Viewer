# MoE Stage C — Sparse MoE weights

**Status:** DESIGN / research scaffold  
**Not PROVEN on GrapheneOS + Termux as of 2026-08-06.**

## What Stage C means

| Stage | Meaning |
|-------|--------|
| A | Process experts |
| B | Multiple dense local models (PROVEN — TinyLlama + Qwen2.5-Coder) |
| **C** | **Sparse** MoE: many experts, few active per token (e.g. Mixtral-class) |
| D | Recursive IA-of-IA |

Sparse MoE is a **weight architecture**, not “two GGUFs and a shell router.”

## Phone reality

| Constraint | Implication |
|------------|-------------|
| RAM | 8×7B-class MoE is not a Pixel default workload |
| Storage | Multi-GB GGUF |
| Thermal / battery | Sustained gen may throttle |

Stage C becomes **PROVEN** only when a sparse-MoE GGUF **loads and generates** under user control on the target device, with the event recorded in the contribution ledger and `docs/REALITY.md` updated.

## Acceptance checklist (PROVEN)

1. GGUF is a known sparse MoE architecture (not a dense 1B rename).  
2. `llama.cpp` (or successor) loads it without OOM kill.  
3. At least one generation completes.  
4. Router can select it by tag (`moe` / model id).  
5. REALITY.md flipped with date + device note.  

## Optional slot

Place a file at:

`$HOME/.local/share/remote-viewer/models/moe.gguf`

Register in `models.json` under id `sparse-moe` (see registry). Until the file exists and runs, Stage C stays DESIGN.

## Non-goals

- Cloud MoE APIs as core  
- Claiming Stage C because Stage B works  
- Shipping multi-GB weights in git  
