# Authority & keys (Track A)

**SCAFFOLD.** No production keys in git. No mainnet claims.

## Roles

| Role | Powers | Rule |
|------|--------|------|
| **Program upgrade authority** | Replace program binary | Multisig before mainnet; never a single laptop forever |
| **Config authority** | `transfer_authority`, threshold, vote mint, `grant_subscription`, propose/cancel/execute | Start as deployer; plan transfer to multisig / DAO |
| **CI / build host** | Compile only | No mainnet private keys |
| **Pixel operator** | Client, read source, EVM tests | **No** Solana program keygen for mainnet |

## Rules

1. **Never commit** keypairs, seed phrases, or `.json` wallets.
2. Scaffold `declare_id!` is a **placeholder** until `anchor keys list` on a dedicated build host.
3. Devnet keys ≠ mainnet keys.
4. Before mainnet: **2-of-3 or better** multisig (or hardware + policy) for upgrade + config authority.
5. Path B founders remain **0** — authority is operational, not a token allocation story.

## Rotation

- Lost authority key without transfer path = frozen privileged ix.
- Practice `transfer_authority` on **devnet** before any real value.

## Phone

Do not generate or store program upgrade keys on GrapheneOS Termux for production.
