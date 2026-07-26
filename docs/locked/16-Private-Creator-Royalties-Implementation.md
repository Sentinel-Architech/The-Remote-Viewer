# Private Creator Royalties — Implementation (Locked)

**Status:** Locked — July 25, 2026  
**Policy source:** `15-TRV-Shop-Token-Converter-Treasury.md`  
**Code:** `apps/shared/src/treasury/`

---

## Behavior

| Event | Creator | Community Pool |
|-------|---------|----------------|
| Eligible shop purchase (net after discounts) | **10%** | **90%** |
| Voluntary pool tip | **0%** | **100%** |

- Creator destination: `process.env.TRV_CREATOR_SOLANA_ADDRESS` only.  
- If creator royalty &gt; 0 and env is unset → **fail closed** (do not send 100% to pool by accident).  
- Community Pool address is public and constant in code.  
- Integer split: `creator = floor(net * 10 / 100)`, `pool = net - creator` (no unassigned dust).

---

## Module API

- `computeRoyaltySplit({ netAmountAtomic, kind? })`  
- `loadCreatorAddressFromEnv()` / `getCreatorRoyaltyConfig()`  
- `buildTreasuryRoutePlan(input, config?)` → transfer legs for wallet adapter  
- `shopTreasuryDisclosure()` → user copy **without** creator address  

---

## Ops setup

1. Copy `apps/shared/.env.example` → private `.env` (gitignored).  
2. Set `TRV_CREATOR_SOLANA_ADDRESS=<your Phantom creator receive address>`.  
3. Never commit `.env` or seed phrases.  
4. Wire `buildTreasuryRoutePlan` into checkout before constructing the Solana transaction.  

---

## Non-goals (this module)

- Does not sign transactions or hold keys.  
- Does not implement token swap oracles (Token Converter pricing is separate).  
- Does not publish creator address in UI disclosure helpers.

---

## Final Statement

**Private royalty via env. Public pool in source. Fail closed. 10 / 90.**
