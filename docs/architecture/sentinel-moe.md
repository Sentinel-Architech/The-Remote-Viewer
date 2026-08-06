# The Sentinel — Enhanced Intelligence Core (MoE)

**Stage A:** SCAFFOLD · **Stage B:** PROVEN (2026-08-06 dual dense GGUF) · **Stage C–D:** DESIGN

| Stage | Meaning | Status |
|-------|---------|--------|
| A | Specialist processes + local router | SCAFFOLD |
| B | Multiple local dense models/adapters | **PROVEN** |
| C | True sparse MoE weights on-device | DESIGN — see `modules/moe-router/STAGE-C.md` |
| D | Recursive IA of IA | DESIGN |

Core constraint: minimum MoE at the intelligence core. Stage B satisfies multi-expert **routing** with real weights. Stage C is the sparse-activation architecture bar.
