# Threat model (condensed)

## Assets

- Viewer keys / entitlement  
- Creator payouts integrity (BPS)  
- Private reports and discrete safety notices  
- Network availability under node quorum  

## Adversaries

| Adversary | Primary risk | Control |
|-----------|--------------|---------|
| Platform rent-seeker | Fee extraction | Contract + policy **0%** platform |
| Store gatekeeper | Kill switch | PWA + sideload; store not sole path |
| SIM swap | Account takeover via SMS | Destroy/recovery prefers **out-of-band** patterns; no SMS as sole root of trust long-term |
| Deepfake abuse | Impersonation | Non-distinguishable likeness banned; report/mute |
| CSAM actor | Harm | Real Integrity path; no theater |
| Sybil free tier | Signal abuse | [ABUSE-LIMITS](ABUSE-LIMITS.md) |
| Honest-but-curious host | Metadata | Minimize; prefer on-device |

## Non-goals

- Perfect anonymity against global passive adversary  
- Supporting every legacy phone forever  
- Mainnet before Phase 0/1 evidence  

## SIM swap note

Phone numbers help **human recovery/destroy** flows; they are **not** the long-term root key. Chain + device keystore outrank SMS OTP.
