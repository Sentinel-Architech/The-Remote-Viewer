# The Sentinel — Enhanced Intelligence Core (MoE)

**Status:** Stage A + B SCAFFOLD · C–D DESIGN  
**Name:** The Sentinel — Enhanced Intelligence  
**Core constraint:** Minimum **Mixture-of-Experts (MoE)** at the intelligence core.

## Requirement

1. Expert specialization  
2. Local gating / routing  
3. Sparse activation where feasible  
4. Local-first (GrapheneOS + Termux)

## Implementation ladder

| Stage | Meaning | Status |
|-------|---------|--------|
| A | Specialist processes + local router | **SCAFFOLD** `modules/moe-router/` experts |
| B | Multiple local models/adapters selected by router | **SCAFFOLD** `models.json` + select/run |
| C | True sparse MoE weights on-device | **DESIGN** |
| D | Recursive IA of IA over expert set | **DESIGN** |

## Non-goals

Cloud experts as default · centralized model custody · replacing age/optical with model magic

## Acceptance

- Stage A: ≥2 process experts, fail closed  
- Stage B: ≥2 model registry entries, select by tag, no network  
- Stage C: only when sparse MoE actually runs on target hardware  
