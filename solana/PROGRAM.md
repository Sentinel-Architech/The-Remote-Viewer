# trv_governance — instruction index (SCAFFOLD)

**Not audited. Not mainnet.** Scaffold program id in `declare_id!` / `Anchor.toml` — replace via `anchor keys list` before deploy.

**Toolchain:** Anchor 0.30.1 · Solana 1.18.x · Rust 1.79 (see CI / `rust-toolchain.toml`).

## VALUE split constants (in program)

| Constant | bps | Meaning |
|----------|-----|--------|
| `DIGITAL_CREATOR_BPS` | 9500 | Non-NFT creator share |
| `DIGITAL_POOL_BPS` | 500 | Community pool |
| `NFT_CREATOR_BPS` | 9000 | TRV-minted NFT creator |
| `NFT_POOL_BPS` | 1000 | Community pool |

Platform fee: **0%**. Pool spend path: see `docs/POOL-GOVERNANCE.md` (not fully ix'd yet).

## Config
| Ix | Auth |
|----|------|
| `initialize(threshold)` | payer = authority |
| `transfer_authority(new)` | current authority |
| `set_proposal_threshold(u64)` | authority |
| `set_vote_mint(Pubkey)` | authority |

## Nodes & access
| Ix | Notes |
|----|-------|
| `register_node` | permanent operator PDA |
| `deactivate_node` | operator only |
| `grant_subscription(expires_at)` | authority; payment off-chain |
| `refresh_entitlement` | `unlimited_comms` = active node ∨ unexpired sub |

## Governance
| Ix | Notes |
|----|-------|
| `propose([u8;32])` | authority |
| `cancel_proposal` | authority; blocks vote/execute |
| `vote(weight)` | any signer once (VoteRecord) |
| `vote_with_token` | weight = SPL amount |
| `execute_if_threshold` | authority; yes ≥ threshold |

## Build host (not Termux)
```bash
cd solana && npm install && anchor build && anchor test
# then: anchor keys list → replace declare_id! + Anchor.toml
```
