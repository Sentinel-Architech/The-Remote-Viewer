# The Remote Viewer — Tokenomics & Financial Design
**Sovereign • Corporate-Free • Legally Cautious Edition**  
Version 0.3

> Disclaimer: This is not legal advice. This document describes design intent only.  
> Any real-world launch involving tokens or rewards should be reviewed by qualified legal counsel.

## Core Principles

1. **Corporate-Free**
   - No corporate pre-mine
   - No venture capital or investor allocation
   - No company-controlled treasury or admin mint keys
   - No entity can unilaterally change supply or freeze funds

2. **Local-First & Zero-Trust**
   - Value and rewards begin on the user’s own device
   - Minimal reliance on centralized custodians

3. **Legally Cautious Design**
   - $AR is a utility and contribution-reward token
   - It is **not** a bank deposit
   - It is **not** presented as an investment contract
   - No promises of profit from the efforts of others
   - No FDIC insurance claims (FDIC only covers actual bank deposits)
   - No interest, yield, or passive income marketing
   - Rewards are earned only through verifiable work

## AR Token ($AR)

| Property             | Detail                                      |
|----------------------|---------------------------------------------|
| Name                 | AR Token (Access & Resonance)               |
| Type                 | Utility + Governance + Contribution Reward  |
| Supply Model         | Fixed or contribution-capped (no open inflation) |
| Minting              | Only through verified network contribution  |
| Corporate Allocation | 0%                                          |

### Allowed Uses
- Governance signaling
- Rewarding real work (node uptime, state verification, presence, storage)
- Optional unlock of premium local features
- Light staking for governance weight only (no yield promises)

### Explicitly Not Allowed
- Marketing as an investment
- Promising price appreciation
- Offering interest or passive returns
- Presenting balances as FDIC-insured deposits

## First validator role (Integrity Verifier)

Locked design: [`docs/locked/17-Validator-Node-First-Role.md`](docs/locked/17-Validator-Node-First-Role.md)  
Tooling: `modules/integrity-verifier/` (PROVEN on-device 2026-08-07)

- Path B Founding Members only (option)
- Reward = **contribution weight / attestation power only**
- No capital lock, no yield, no mint authority, no free packs
- Weight recorded via `modules/contribution/record.sh` (`kind=verification`)
- False/negligent attestations reduce weight

## DePIN Reward Flywheel

Rewards are given only for measurable contribution:

- Running a reliable edge node
- Providing verifiable presence / coverage
- Correctly verifying Merkle state / sales integrity (Integrity Verifier)
- Providing useful encrypted storage capacity

Anti-Sybil protections:
- Web-of-Trust identity
- Gradual reward unlocking
- Hardware/software attestation where possible
- Verifier anti-Sybil weight (constraint 12 in locked doc 17)

## Governance
Hybrid model:
- Token weight
- Web-of-Trust reputation
- Time-locks on sensitive changes

No single corporate entity can control governance.

## In-App Shop / Digital Vending
- Fully optional
- No behavioral tracking
- Primary rail today: Solana USDC memo (Path B) — packs **paid per item**
- Accepts $AR later (and other privacy-preserving methods)
- Sells software modules or hardware kits only
- Founding status does **not** waive catalog prices

## Sustainability (Non-Extractive)
Possible funding paths that do not sell user data:
- Optional premium features
- Hardware kits
- Enterprise sovereign deployments
- Grants and public-goods funding

---

**Next technical steps**
1. Local AR Token ledger (Rust)
2. Contribution → reward engine (weight already local)
3. Basic governance signaling module
