# The Remote Viewer — Tokenomics & Financial Design
**Sovereign • Corporate-Free • Legally Cautious Edition**  
Version 0.6 — aligned with `docs/VALUE.md` (2026-09-03)

> Not legal advice. Design intent only. Counsel before any token launch.

## Core Principles

1. **Corporate-Free mint** — no VC pre-mine, no company admin mint, no unilateral freeze  
2. **Local-First** — value starts on user device  
3. **Legally Cautious** — no investment promises, no FDIC-on-crypto claims, no yield marketing  
4. **Creator-first commerce** — platform fee **10%** on creator sales (`docs/VALUE.md`, `docs/CREATOR-LIVING.md`)
5. **Humans free to copy source; corporations pay for company use** — root LICENSE

## Network access (not a token)

| Path | Price | Unlimited human comms |
|------|------:|------------------------|
| Free | $0 | Weaker signal |
| Monthly sub | **$10 USD / month** | Yes |
| Yearly sub | **$96 USD / year** | Yes (default) |
| Active permanent node | Ops cost | Yes while active |
| Company grant | **$1,200 USD / year** / org | Written grant |

Sub is **entitlement**, not $AR. See `docs/PAYMENTS.md` → `grant_subscription`.

## Creator store splits (platform = 10%)

| Sale | Creator | Pool | Platform |
|------|---------|------|----------|
| Digital | **80%** | 10% | **10%** |
| NFT primary | **80%** | 10% | **10%** |
| NFT secondary | **5%** royalty to creator | 0% | **0%** |

## AR Token ($AR) — design only, not launched

| Property | Detail |
|----------|--------|
| Role | Utility + governance signal + contribution reward |
| Corporate allocation | **0%** |
| Not | Bank deposit, investment contract, yield product |

Allowed: governance weight, rewarding **verified work** (node, verification).  
Forbidden: profit promises, FDIC language on token balances, passive interest marketing.

## Integrity Verifier (first node role)

Locked: `docs/locked/17-Validator-Node-First-Role.md`  
Tooling: `modules/integrity-verifier/` (PROVEN on-device per REALITY)

- Reward = contribution **weight**, not capital yield  
- No free packs, no custody of buyer keys  

## Digital vending (PROVEN rail)

- USDC memo + age/TRVL delivery — `digital-vending/`  
- Packs stay **paid per item**; Path B does not waive prices  
- Network sub is a **separate** product from catalog packs  

## Governance

Hybrid: token weight (when live) + WoT + time-locks.  
On-chain scaffold: `solana/programs/trv_governance` (not mainnet).

## Explicit non-claims

- No live $AR market  
- No mainnet governance control  
- No “FDIC-backed crypto”  

**Next:** CI green → devnet entitlement → only then money rails at scale.
