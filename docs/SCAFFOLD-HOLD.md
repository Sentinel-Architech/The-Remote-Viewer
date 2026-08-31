# Scaffold hold map

**Updated 2026-08-31.** Delete or freeze leftover shells. Do not version-bump Track A.

## Product (keep)

| Path | Status |
|------|--------|
| `apps/hub` | LIVE Viewer Hub |
| `optical-airgap/` | PROVEN |
| `digital-vending/` | PROVEN Path B signal |
| `modules/` | PROVEN local tools |
| `apps/ui` | PROVEN local operator UI |
| `desktop/` | local runtime (no chain) |
| `docs/REALITY.md` | status authority |

## Hold — do not upgrade

| Path | Why |
|------|-----|
| `solana/` | Track A. CI blocked. Not mainnet. No Anchor/Solana product path. |
| `contracts/` | EVM parallel scaffold. Same bound. |
| `apps/web` | Old Vite shell. Superseded by `apps/hub`. |
| `apps/mobile` | PARKED Expo. Not an app-store client. |
| `web/` (repo root) | Duplicate old shell. |
| Injected ETH/SOL wallets | Out of bounds. Local Ed25519 only. |

## Root note dumps

Space-named files at repo root are session notes, not product. They make the tree look like a scrapyard. Continue deleting them on this branch. Do not merge Track A upgrades in the same PR.
