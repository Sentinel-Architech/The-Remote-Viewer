# Reality — 2026-08-14 (currency pass)

See also root `STATUS.md`.

## Required that operators often miss

1. **GitHub SSH key must be registered on the account** (Pixel key exists; login/password reset may be required first).
2. **Solana program id is a placeholder** until `anchor keys list` on a build host — required before real deploy.
3. **Anchor build needs x86_64 Linux/macOS or CI** — not Termux.
4. **Mint authority key is root of power** for SPL/TRVV — lose it or leak it and issuance is compromised.
5. **Path B founders = 0** — no external legitimacy from “community multisig” yet.
6. **Audit before mainnet** — green tests ≠ safe money.
7. **Anvil state is ephemeral** without `--state` — addresses die on restart.
8. **Mobile runtime parked** — repo code ≠ running DApp on GrapheneOS.

## Track A Solana

Program scaffold + CI + tests checked in. Not on devnet.

## EVM parallel

Hardened and tested on Pixel; CI workflow present; not Track A.
