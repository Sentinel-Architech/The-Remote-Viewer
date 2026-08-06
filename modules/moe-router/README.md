# MoE Router — Stage A (Local Specialists)

**Status:** SCAFFOLD  
**Scope:** The Sentinel (Enhanced Intelligence) — minimum MoE at core, Stage A only.

Stage A = explicit specialist processes + local router. Not sparse neural MoE weights.

## Rules

- On-device only (GrapheneOS + Termux target)
- No network calls from the router
- No cloud experts as default
- Fail closed if no expert is registered or available
- Keys and Class A data never pass through the router log

## Layout

| File | Purpose |
|------|---------|
| `experts.json` | Registry of local experts (id, command, tags) |
| `route.sh` | Pick expert by tag/intent; print command or run |
| `list.sh` | Show registered experts |
| `register-example.sh` | Example registration helper |

## Usage

```bash
# List
bash modules/moe-router/list.sh

# Route by tag (prints command; does not auto-exec secrets)
bash modules/moe-router/route.sh optical
bash modules/moe-router/route.sh specialist

# Optional: run the resolved command
bash modules/moe-router/route.sh optical --exec
```

Registry path default: `modules/moe-router/experts.json`  
Override: `TRV_EXPERTS=/path/to/experts.json`

## Ladder reminder

| Stage | Meaning |
|-------|---------|
| A (this) | Specialist processes + local router |
| B | Multiple local models/adapters |
| C | Sparse MoE weights on-device |
| D | Recursive IA-of-IA over expert set |

Do not claim B–D until they run on target hardware.
