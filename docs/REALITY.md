# Reality — 2026-08-14

## Parked

**Mobile Expo runtime on GrapheneOS/Termux** — parked. Expo Go no-go; web path incomplete on-device. Source of truth remains `apps/mobile` on branch `TheRemoteViewer`. Resume with laptop or sideloaded **dev client**, not Play Store.

## Active scaffold

| Area | Status |
|------|--------|
| Locked values 15–21 | **LOCKED** |
| Mobile client code | **SCAFFOLD** in repo |
| **contracts/GovernanceCoordinator.sol** | **SCAFFOLD** — OZ overrides included |
| Path B external founding members | **0** |

## Compile contracts (when ready)

```bash
cd contracts && forge install OpenZeppelin/openzeppelin-contracts --no-commit && forge build
```
