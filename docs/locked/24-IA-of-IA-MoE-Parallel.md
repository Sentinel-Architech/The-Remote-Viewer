# 24 — IA-of-IA MoE · parallel to Sentinel MoE

**Status:** LOCKED  
**Date:** 2026-08-07  
**Parent:** recursive governance (“IA of IA”) · hybrid parallel brands · Service learning (doc 23)

---

## 1. Dual MoE stacks (strictly parallel)

| Stack | Brand / home | Role |
|-------|----------------|------|
| **Sentinel MoE** | **The Sentinel** (core) | On-device experts (e.g. dense B · sparse C) for local operator integrity, privacy, offline judgment |
| **IA-of-IA MoE** | **The Service / Remote Viewer plane** | Recursive oversight MoE that **learns and expands** to help each Viewer; **does not replace** Sentinel MoE |

```
                    ┌─────────────────────────┐
                    │   IA-of-IA  (MoE layer)  │  Service plane
                    │   education · research  │  network / real-time sources
                    │   · finances accuracy   │
                    └────────────▲────────────┘
                                 │ parallel · no merge into core vault
                    ┌────────────┴────────────┐
                    │   Sentinel MoE          │  Core plane
                    │   local experts B / C   │  device · air-gap capable
                    └─────────────────────────┘
```

**Parallel means:** separate weights, separate routing policy, separate failure domains.  
IA-of-IA may **recommend**; Sentinel MoE may **refuse** on-device. Neither silently overrides the other’s plane.

---

## 2. Mission of IA-of-IA MoE

Keep **education**, **research**, and **finances** as **accurate as globally possible in real time**, for the individual Viewer, under **Service guidelines**.

| Domain | Expert family (illustrative) | Real-time duty |
|--------|------------------------------|----------------|
| **Education** | pedagogy · curriculum · source quality | Prefer primary / current materials; flag outdated claims |
| **Research** | method · citation · replication risk | Prefer verifiable sources; separate claim vs evidence |
| **Finances** | market data · accounting identity · risk language | Prefer live or timestamped figures; never invent balances |

Routing inside IA-of-IA MoE selects experts by **query domain**, not by engagement or politics.

---

## 3. Accuracy rules (non-negotiable)

| Rule | Detail |
|------|--------|
| **Timestamp** | Numeric / market / “current” claims carry time of observation when possible |
| **Source class** | Primary > secondary > opinion; unknowns stated as unknowns |
| **No silent fabrication** | If global real-time feed is unavailable, say so — do not invent |
| **Finance safety** | Not personalized regulated investment advice unless explicitly licensed Service path exists; accuracy ≠ solicitation |
| **Education safety** | Age-appropriate boundaries when the Viewer profile implies them |

---

## 4. Relation to install / Service learning (doc 23)

| Event | Effect |
|-------|--------|
| Viewer installs Remote Viewer | Service learning **enabled** (default) |
| Learning on | IA-of-IA MoE may adapt **routing and explanations** to that Viewer |
| Learning off | Generic experts only; no personal adaptation |
| Sentinel MoE | Unchanged by RV install; still local core |

---

## 5. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **M0** | This lock |
| **M1** | Router scaffold: domain tags `education` · `research` · `finances` · `general` |
| **M2** | Parallel expert prompts / local or hosted heads (no merge into Sentinel GGUF tree) |
| **M3** | Real-time fetch adapters (timestamped) behind IA-of-IA only |
| **M4** | Viewer-visible “as of” stamps on answers in Remote Viewer UI |

Sentinel MoE paths under `modules/moe-router/` remain **core**.  
IA-of-IA paths live under Service / `apps/remote-viewer` or `modules/ia-of-ia/` — **not** inside vault-sealed Sentinel weights.

---

## 6. Non-goals

- Collapsing both MoE stacks into one model file  
- Letting IA-of-IA bypass Hydra / seals  
- Guaranteeing omniscience (only **best available** real-time accuracy)  

---

## Related

- Sentinel MoE: `modules/moe-router/` · REALITY.md  
- `docs/locked/18` · `20` · `23`  
