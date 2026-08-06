# The Sentinel — Enhanced Intelligence Core (MoE)

**Status:** DESIGN requirement (locked intent)  
**Name:** The Sentinel — also called Enhanced Intelligence  
**Core constraint:** Minimum **Mixture-of-Experts (MoE)** at the intelligence core.

---

## 1. Requirement

The Sentinel is not a single monolithic model path. It is an Enhanced Intelligence system whose **core routing and specialization pattern is Mixture-of-Experts**.

Minimum means:

1. **Expert specialization** — distinct capabilities (optical path, local governance, threat posture, domain specialists) are not collapsed into one undifferentiated weights file when a better expert exists.
2. **Gating / routing** — a local router selects which expert(s) handle a request; default is on-device.
3. **Sparse activation where feasible** — prefer activating a subset of experts over always running the full stack.
4. **Local-first** — MoE does not imply cloud experts. GrapheneOS + Termux + llama.cpp (or equivalent) is the primary runtime target.

---

## 2. Relationship to existing modules

| Piece | Role toward MoE |
|-------|------------------|
| `modules/self-heal/supervise-specialist.sh` | Keeps specialist processes alive |
| `grok/router/` (if present) | Early routing surface |
| Optical air-gap | Specialist path for sealed transport |
| Local identity + data-sovereignty | Boundary: experts never exfiltrate Class A data |

MoE is the **intelligence architecture**. Self-heal is process health. Optical is transport. They compose; they are not substitutes.

---

## 3. Implementation ladder (honest)

| Stage | What “MoE” means | Status |
|-------|------------------|--------|
| A | Explicit specialist processes + local router (script/daemon) | SCAFFOLD path exists |
| B | Multiple local models / adapters selected by router | DESIGN |
| C | True sparse MoE weights (e.g. Mixtral-class) on-device via llama.cpp or equivalent | DESIGN — hardware limited |
| D | Recursive “IA of IA” governance over expert set | DESIGN |

Do not claim Stage C or D until it runs on target hardware.

---

## 4. Non-goals

- Cloud-hosted “experts” as the default core  
- Centralized model custody  
- Replacing age/optical security with model magic  

---

## 5. Acceptance for “REALITY”

MoE moves from DESIGN to SCAFFOLD/PROVEN only when:

- A documented router selects among ≥2 real local experts, and  
- Fail-closed behavior is defined when no expert is available, and  
- No expert path requires platform-held keys.

**The Sentinel’s intelligence core is MoE by requirement. Implementation follows the ladder above.**
