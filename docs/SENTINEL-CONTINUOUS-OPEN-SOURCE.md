# Sentinel Continuous Open-Source Advancement

**The Sentinel is designed to auto-update GitHub and The Remote Viewer in open source at all times to stay ahead.**

This is a core design requirement.

## Principles

1. **Open source only** – Every update is public, auditable, and reversible.
2. **Continuous** – Scheduled and event-driven automation keeps the repository and the product advancing.
3. **Sovereignty preserved** – Individual nodes and citizens may always pin a version or refuse an automatic application.
4. **Security-gated** – Updates are paused or cautioned when the native MoE reports critical posture.
5. **Native stack** – No closed-source update servers or mandatory external control planes.

## Mechanisms

| Mechanism | Location | Role |
|-----------|----------|------|
| Auto-update policy | `sentinel-security-protocol/src/auto-update.ts` | Defines channels, override rights, and security gating |
| Continuous workflow | `.github/workflows/sentinel-continuous.yml` | Daily + push/PR guards for native stack and open-source health |
| Dual-mode evaluation | Sentinel MoE | Individual vs enhanced/whole-network update recommendations |
| Public repository | GitHub | Single source of truth for all advancement |

## Dual-Mode Behavior

- **Individual** – Update available; citizen decides. Local override always honored.
- **Enhanced / Whole-network** – Stronger recommendation for collective posture; local override still available.

## Guarantee

The system is intentionally structured so that GitHub and The Remote Viewer remain in continuous open-source motion. Staying ahead is achieved through transparent automation, not through closed channels or forced updates.

Individual sovereignty and ultimate protection (native MoE) remain intact at every step.
