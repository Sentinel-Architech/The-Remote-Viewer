# TRV_POOL

**Public pool identity:** [@Archtecht](https://x.com/Archtecht) on X Money  
**QR:** X “My code” for Sentinel Architech · @Archtecht  
**Locked docs:** `docs/locked/14-Community-Pool.md`, `docs/locked/15-TRV-Shop-Token-Converter-Treasury.md`

## Decentralization gate (2026-09-01)

X Money **cannot** replace an on-chain pool while remaining decentralized.

| Property | X Money `@Archtecht` | Solana sink |
|----------|----------------------|-------------|
| Custody | Bank claim at Cross River (FDIC). X Payments LLC is not a bank. | User-signed `SystemProgram.transfer` |
| Rails | Visa Direct + partner banks | Solana mainnet |
| Freeze / ban | Platform + bank + license geography (not all US states) | Key control only |
| Public name | **TRV_POOL** | Not the public name |

Therefore option “disable SOL, X Money only” is **rejected** under the project’s own sovereignty rule.

Policy:

1. **Public identity / human checkout** = `@Archtecht` (X Money).
2. **Sovereign settlement** = Solana creator + sink dual-transfer. Not deleted.
3. Do not paste `@Archtecht` into `new PublicKey(...)`.

| Rail | Value | Use |
|------|-------|-----|
| **TRV_POOL** | `@Archtecht` | Public receive, tips, pack notes, Sponsor menu |
| Sovereign SOL sink | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` | `PublicKey()` splits in shop code |
| Sovereign creator | `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG` | 50% of SOL path |
