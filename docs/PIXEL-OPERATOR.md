# Pixel 7 operator (GrapheneOS + Termux)

**Role:** client, reader, EVM test host — **not** a Solana build machine.

## Can do on phone

| Task | Command / note |
|------|----------------|
| Sync | `git fetch origin TheRemoteViewer && git merge origin/TheRemoteViewer --no-edit` |
| Read Track A | `STATUS.md`, `solana/PROGRAM.md`, `solana/programs/trv_governance/src/lib.rs` |
| EVM tests | `cd contracts && forge test` (after `forge install` if libs missing) |
| Anvil local chain | `anvil` then forge script / cast as before |
| Policy | `docs/locked/` |

## Cannot do on phone

- `anchor build` / `anchor test` / SBF deploy
- Generate production Solana program id (`anchor keys list` on build host only)
- Expo Go mobile runtime (parked)

## Auth note

HTTPS pull works with a stored credential or one-time token. Push from phone is optional; GitHub remote is source of truth when pushes come from elsewhere.

## Claims

**SCAFFOLD only.** No audit. No mainnet. No production security guarantees.
