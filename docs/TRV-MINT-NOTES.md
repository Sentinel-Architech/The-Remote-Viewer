# TRV mint — design notes (not a launch)

**Not legal advice. Not a promise of value.**  
Root [TOKENOMICS.md](../TOKENOMICS.md) currently specifies **$AR** (Access & Resonance) as utility/contribution-reward — **0% corporate allocation**, no yield marketing, no investment framing.

You asked to **mint TRV**. Treat “TRV” as either:

| Path | Meaning | Fit |
|------|---------|-----|
| **A. Rename/align** | TRV ticker = the same utility token described as $AR | Docs + branding only |
| **B. SPL on Solana** | Mint an SPL token; vending already watches Solana memos | Matches existing sales watcher |
| **C. Local ledger** | On-device contribution credits (TOKENOMICS “Local AR ledger”) | Strongest sovereignty; no public mint |
| **D. Separate payment rail** | Keep USDC/XMR for sales; TRV = governance/access only | Least regulatory surface for *sales* |

## Hard constraints (from your own tokenomics)

- No corporate pre-mine / VC allocation  
- No admin freeze of user funds as a product feature  
- No interest, yield, or “profit from others’ efforts” marketing  
- Rewards only for verifiable work if any emission exists  
- Optical + Vault path stays independent of any chain  

## Vending today (does not require TRV mint)

Catalog prices are **USDC / XMR / manual**. Delivery is **age + TRVL** either way. Minting TRV is **optional** for the chute to work.

## If you choose SPL (path B) — technical outline only

1. Create mint (fixed supply or capped) with **revoked mint authority** after initial distribution rules you accept legally.  
2. Store mint address in repo **docs only** — never seller private keys.  
3. Optional: accept TRV **or** USDC in catalog; watcher matches memo + mint.  
4. Delivery unchanged: buyer still provides `age1…`; frames still local.  

## Recommended order

1. Keep vending shipping on USDC/manual (harden checklist).  
2. Decide A vs B vs C in writing (one paragraph in TOKENOMICS).  
3. Counsel before any public sale of a new token.  
4. Only then wire catalog `price` + watcher to a mint address.  

## Explicit non-goals here

- Guaranteeing price, liquidity, or listings  
- Building a CEX  
- Putting mint authority in the optical air-gap code path  
