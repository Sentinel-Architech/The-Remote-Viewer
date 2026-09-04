# TRV blind spots register

**Purpose:** Name gaps before they bite. Status: **open / mitigated / accepted**.

Legend: **O** open · **M** mitigated (doc/process) · **A** accepted risk · **B** blocked on CI/client

---

## 1. Truth & claims

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| README / STATUS / chat vs REALITY | Overclaim “live” features | **M** | `docs/REALITY.md` is authority for PROVEN; STATUS marks SCAFFOLD |
| Solana “on blockchain” before green CI | False production signal | **B** | No devnet claim until `anchor build` green + deploy note |
| Brand assets missing in repo | Broken links | **O** | Upload `branding/sentinel-logo.png` + `remote-viewer-hero.png` |

## 2. Chain & money

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| Config/upgrade authority single key | Total loss / capture | **M** | `docs/AUTHORITY.md` — multisig before mainnet |
| Sub payment offline only | Manual ops bottleneck / fraud | **M** | `docs/PAYMENTS.md` phase 1 honest; phase 2 later |
| Pool with no legal container | Tax/custody ambiguity | **O** | Name entity or pure on-chain PDA + public memos only |
| FDIC language on crypto | Misleading | **M** | POOL-GOVERNANCE: FDIC only for banked USD after governed off-ramp |
| Node unlimited-comms economics | Nodes underfunded, network dies | **O** | Measure relay cost before promising scale |
| Secondary NFT royalty default | Surprise for sellers | **M** | VALUE.md: 5% creator / 0% pool |
| Sales address key security | Theft of pack proceeds | **O** | Hardware wallet / multisig; rotate procedure documented |

## 3. Safety & law

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| CSAM report path with no ops owner | Duty without process | **M** | SAFETY.md + need named responder before public social |
| Decentralized “who files NCMEC” | Gap in practice | **O** | Designate operator role for Integrity reports |
| Area bulletin registry legality | State restrictions on commercial use | **O** | Jurisdiction check per state before ship; opt-in only |
| Vigilante misuse of bulletins | Harm / liability | **M** | Coarse region only; no exact pin; no confrontation UX |
| Creator-store illegal content | Host liability | **M** | SAFETY zero-tolerance; pre-mint/list gates when client exists |
| COPPA / under-13 | If minors use product | **O** | Age gate policy TBD; default 18+ until decided |
| Deepfake ban vs enforcement | Policy without detector | **A/B** | Policy locked; tech is best-effort + report |

## 4. Identity & privacy

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| SMS as recovery | SIM swap | **M** | IDENTITY.md — not root factor |
| Lost phone + lost backup | Permanent lockout | **M** | Onboarding must say unrecoverable |
| Human sex verification | Privacy invasive / inaccurate | **O** | Do not ship without narrow purpose + consent design |
| Entitlement transfer/sale | Sybil / gray market | **O** | Policy: non-transferable unless governance says else |
| Free-tier signal weak but still spam | Abuse | **O** | Rate limits when social ships |

## 5. Engineering

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| No Cargo.lock in solana/ | Non-reproducible CI | **O** | Commit lock after first green build |
| Anchor 0.30.1 vs ecosystem drift | Future dep breaks | **A** | Pin matrix; upgrade deliberately later |
| `refresh_entitlement` needs node+sub accounts | UX friction if one missing | **O** | Optional accounts / init path when ix refined |
| Mobile PARKED | Product surface delayed | **A** | Graphene reality; native path later |
| Client IDL drift | Wrong accounts | **O** | Version IDL with program deploy |
| Supply chain (npm/cargo) | Malicious update | **O** | Lockfiles + CI hash when green |

## 6. Product / social

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| “Unlimited” without capacity plan | Broken promise | **O** | Soft-launch caps; honest STATUS |
| IA of IA conduct path | Slow for CSAM | **M** | CSAM bypasses community poll (SAFETY) |
| Dual EVM+Solana confusion | Split focus | **M** | Track A = Solana; EVM learning only |
| Name “Remote Viewer” confusion | PSI TECH association | **M** | README historical disclaimer |

## 7. Ops

| Spot | Risk | State | Mitigation |
|------|------|-------|------------|
| No public security contact | Bad disclosure path | **O** | Add SECURITY.md contact |
| Incident response | Chaos under attack | **O** | One-page IR when social goes public |
| LICENSE vs “100% open source” talk | People hear OSI/MIT | **M** | Root LICENSE is source-available: humans copy free, corporations need a paid grant. Do not say MIT. |

---

## Priority close order

1. Solana CI green → commit Cargo.lock  
2. Upload brand PNGs  
3. SECURITY.md contact  
4. Name pool/sales key custody practice  
5. Age policy (18+ default)  
6. Integrity report ops owner before public social  

*This file is a living register — update when a row moves O→M.*
