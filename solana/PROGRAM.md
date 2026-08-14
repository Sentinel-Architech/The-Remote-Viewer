# trv_governance — instruction index (SCAFFOLD)

**Not audited. Not mainnet. Placeholder program id.**

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

## Build host
```bash
cd solana && yarn && anchor build && anchor test
# then: anchor keys list → replace declare_id! + Anchor.toml
```
