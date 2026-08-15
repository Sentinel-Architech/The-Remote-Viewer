# Entitlement client

**Scaffold.** [PROTOCOL §4](../../docs/PROTOCOL.md) — not PROVEN on-chain.

Source of truth when live: Solana `trv_governance` entitlement PDA.

| Path | unlimited_comms |
|------|-----------------|
| Active yearly ($96 policy) | true until expiry |
| Active permanent node | true while active |
| Free | false · weaker signal |

`read.ts` returns `source: "unknown"` until IDL + program id exist. **Do not invent success.**

See [REALITY.md](../../docs/REALITY.md) Not PROVEN table.
