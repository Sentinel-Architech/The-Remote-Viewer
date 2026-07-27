# System Threat Model — The Remote Viewer / Sentinel Protocol

**Status:** Draft — July 27, 2026  
**Scope:** End-to-end system (device, P2P, presence auth, edge learning, chain, supply chain, GENIUS-aligned payments)  
**Complements (does not replace):** `docs/locked/10-Threat-Model-Key-Loss.md`  
**Depends on:** Vault Principles, Destroy = Restart, Identity Layer, Wallet Architecture

---

## 1. Purpose

This document states **what we protect**, **who we expect to attack**, **where the system can be hit**, and **what we do about it** — including residual risk we accept.

It is intentionally blunt. Marketing language (“beyond military grade”) is not a control. Controls are mechanisms, policy, and honest limits.

**Non-negotiables already locked elsewhere:**

- No platform-held recovery keys  
- Destroy = Restart is absolute  
- Key loss without user recovery ends the identity path  

See `docs/locked/10-Threat-Model-Key-Loss.md` for the full key-loss model.

---

## 2. System under consideration

| Layer | Components (current / planned) |
|-------|--------------------------------|
| **Client device** | Pixel 7 + GrapheneOS + Termux; optional desktop/web clients |
| **Local secrets** | Device-bound keys, optional steganographic vault (“Sentinel’s Sword”), encrypted local stores |
| **Presence / MFA** | Bluetooth LE beacons, proximity / co-location checks; optional ESP32 edge hardware; optional OS biometrics as *local unlock gate only* (see `docs/security/biometrics.md`) |
| **P2P** | libp2p (or equivalent), noise/encryption, DHT discovery, relay |
| **Edge AI** | On-device models; optional federated updates (gradients / LoRA deltas only) |
| **Chain** | Governance / storage / identity contracts; TRV token utility |
| **Payments / stable value** | Optional settlement via GENIUS-aligned permitted payment stablecoins (PPSI); TRV utility separate from payment stablecoin claims |
| **Compliance hooks** | “Ghost Tax” and related fees for unverified / high-anonymity paths; local-first monitoring design (no platform key custody) |
| **Storage** | User-controlled IPFS/Arweave pins; no platform custody of plaintext vault content |
| **Dev / supply** | GitHub private repo, ESP-IDF, Rust/JS deps, Termux packages |

**Out of scope for this doc:** third-party wallet key recovery; national SIGINT against all of GrapheneOS/hardware vendors as a class (noted as residual).

**Regulatory note:** References to the Guiding and Establishing National Innovation for U.S. Stablecoins Act (**GENIUS Act**) describe *design intent and threat-relevant constraints*. This file is not legal advice and does not assert that any particular deployment is licensed, registered, or compliant.

---

## 3. Assets

| ID | Asset | CIA priority | Notes |
|----|-------|--------------|-------|
| A1 | Private keys / recovery material | C: critical | Root of identity; see locked key-loss model |
| A2 | Vault contents (journals, credentials, health notes) | C: critical | User-burnable; platform must not retain restore capability |
| A3 | Session / presence auth state | I + A: high | BLE proximity must not be trivial to spoof into full auth |
| A4 | P2P message confidentiality & authenticity | C + I: high | E2E; metadata still leaks to network observers |
| A5 | Local learning data & model personalization | C: high | Must stay on-device; FL only shares non-raw updates |
| A6 | On-chain identity / membership / governance rights | I: high | Tied to keys; burn ends path |
| A7 | Device integrity (GrapheneOS, verified boot) | I: high | Foundation for everything above |
| A8 | Source code & build pipeline | I: high | Supply-chain integrity |
| A9 | ESP32 firmware & channel to phone | I + C: medium–high | Scoped role; compromise should not equal full key extract |
| A10 | Reputation / POSE-style signals | I: medium | Gameable; must not become a social credit score |
| A11 | Payment / stablecoin settlement path | C + I: high | If used: reserves, issuer trust, and user balances are in scope |
| A12 | Compliance posture & audit artifacts | I: high | Ability to show GENIUS-oriented controls without holding user keys |
| A13 | Ghost Tax / fee policy integrity | I: medium | Misconfiguration or evasion undermines stated Section 9-style incentives |

---

## 4. Adversaries

| ID | Adversary | Capability | Motivation |
|----|-----------|------------|------------|
| ADV-1 | Casual thief | Physical device, limited time, no lab | Opportunistic access |
| ADV-2 | Local malware / malicious app | Runs on device if install succeeds | Exfil keys, vault, mic/camera |
| ADV-3 | Network observer | Passive traffic on Wi‑Fi/ISP | Metadata, timing, peer graph |
| ADV-4 | Active network attacker | MITM, rogue AP, malicious relay/peer | Decrypt if E2E fails; inject; eclipse |
| ADV-5 | Malicious peer / Sybil swarm | Many identities, fake presence, poisoned FL updates | Spam, impersonation, model poison |
| ADV-6 | Coercive actor | Physical threat, legal demand on user or operator | Force unlock, demand platform recovery |
| ADV-7 | Compromised maintainer / CI | Push malicious code or deps | Backdoor clients |
| ADV-8 | Contract / economic attacker | Smart-contract bugs, governance capture | Drain, freeze, rewrite rules |
| ADV-9 | Nation-state (limited) | Targeted malware, supply pressure | High value targets only; not “defeat NSA” claim |
| ADV-10 | Illicit-finance abuse of the network | Structured transactions, mixers, mule patterns | Laundering or sanctions evasion via TRV rails |
| ADV-11 | Regulatory / enforcement pressure | Subpoena, exam, enforcement action | Force KYC, logs, or key production |
| ADV-12 | Fraudulent “compliance theater” | Fake PPSI claims, false reserve attestations | Extract deposits or legitimacy |

**Design stance vs ADV-6 / ADV-11 (platform side):** architecture must not create secrets the operator can hand over to restore a user’s vault or keys. Where GENIUS-oriented monitoring is required for a *payment* path, prefer **local / protocol-level signals and PPSI-issued assets** over platform custody of private keys.

---

## 5. Trust boundaries

```
┌─────────────────────────────────────────────────────────┐
│  USER  (intent, passphrase, physical custody)            │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  DEVICE TCB  GrapheneOS verified boot + app sandbox      │
│  Keys in hardware-backed store when available            │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
              │ BLE / USB                 │ IP / P2P
              │                           │
┌─────────────▼──────────┐    ┌───────────▼───────────────┐
│  ESP32 / edge MCU      │    │  Untrusted network         │
│  Limited role only     │    │  Peers, relays, DHT, RPCs  │
└────────────────────────┘    └───────────┬───────────────┘
                                          │
                              ┌───────────▼───────────────┐
                              │  Chain / IPFS (public)     │
                              │  Integrity via crypto;     │
                              │  availability not assured  │
                              └───────────┬───────────────┘
                                          │
                              ┌───────────▼───────────────┐
                              │  Payment edge (optional)   │
                              │  PPSI stablecoin / GENIUS  │
                              │  Issuer + reserves outside │
                              │  TRV key custody boundary  │
                              └───────────────────────────┘
```

**Rule:** Anything outside the device TCB is untrusted until verified (signatures, pinning, E2E session keys, contract addresses). Payment stablecoin **issuer** trust is a separate boundary from TRV identity keys.

---

## 6. Attack surfaces and mitigations

### 6.1 Device compromise (ADV-1, ADV-2)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Stolen phone, locked | GrapheneOS, strong lock, hardware-backed keys, remote wipe via user tools | Weak PIN; lab extraction |
| Stolen phone, unlocked | Re-auth for export / high-value ops; short session lifetime | Coercion; brief unlock window |
| Biometric spoof / presentation attack | Prefer Class 3 OS biometrics; knowledge factor as primary; see `docs/security/biometrics.md` | Physical molds; coercion |
| Malicious APK / sideload | Prefer known sources; GrapheneOS hardening; no raw keys in logs | User installs malware anyway |
| Cloud backup of secrets | Forbid unencrypted key/vault backup to vendor cloud | User overrides via OS settings |

### 6.2 Presence / BLE MFA (ADV-1, ADV-5)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Beacon replay | Nonces, timestamps, short validity window | Clock skew; delayed relay |
| RSSI spoof / amplifier | Multi-factor (proximity + human confirm + device bind); never BLE-alone for full auth | Determined RF attacker |
| Fake co-location | Correlate multiple signals; rate-limit auth elevation | Lab-grade RF |

**Policy:** BLE proximity is a *factor*, not sole authenticator for vault unlock or key export. OS biometrics (if used) are likewise a *local unlock gate*, not network identity — `docs/security/biometrics.md`.

### 6.3 P2P communication (ADV-3, ADV-4, ADV-5)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Eavesdropping | E2E encryption (Noise or equivalent); no plaintext on relays | Metadata (who talks when) |
| Malicious relay | Encrypt end-to-end; treat relay as dumb pipe | Availability DoS |
| Eclipse / peer flooding | Diverse bootstrap; scoring; rate limits | Well-resourced Sybil |
| Impersonation | Identity keys; TOFU or pinned fingerprints for first contact | First-contact social engineering |

### 6.4 Edge learning / federated updates (ADV-5, ADV-7)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Raw data exfil via “training” | Local-only features; share gradients/LoRA only; DP noise where feasible | Membership inference on updates |
| Model poisoning | Signed updates; robust aggregation (e.g. trimmed mean / Krum-class); user opt-in to FL | Adaptive poison |
| Backdoored base model | Hash-pin model artifacts; user-visible model ID | Upstream training poison |

### 6.5 Steganographic / local vault (ADV-1, ADV-2)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| “Hidden in image = safe” myth | Stego is *obfuscation + packaging*, not a substitute for strong encryption + passphrase | Forensic awareness of LSB |
| RAM residue after forge | Explicit wipe of key buffers; minimize lifetime in memory | Compromised kernel |
| Accidental share of carrier image | UX warnings; separate “export” flow with confirm | User error |

### 6.6 ESP32 edge role (ADV-2, ADV-5)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Firmware implant | Signed firmware; flash only from known host; limited capabilities | Physical debug access |
| USB/OTG abuse | Treat host as untrusted until attested; least privilege on phone side | Compromised host |

**Policy:** ESP32 must not hold long-term master identity keys. It is a sensor / MFA helper, not the root of trust.

### 6.7 Smart contracts & token (ADV-8)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Contract bug | Minimize privileged roles; timelock; audits before mainnet; upgrade path governed | Novel exploit class |
| Governance capture | Quorum, delay, clear proposal types; avoid admin god-key in production | Low participation |
| Economic griefing | Rate limits, deposits, explicit fee design (e.g. Ghost Tax) documented as policy | Policy evasion |

### 6.8 Supply chain & repo (ADV-7)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Dependency confusion / malicious crate/npm | Lockfiles; pin versions; review new deps | Zero-day in pinned dep |
| Compromised CI token | Least-privilege tokens; no production keys in CI | Human error |
| Insider push | Branch protection; PR review when second pair of eyes exists; signed commits optional | Solo maintainer periods |

### 6.9 Legal / operator pressure (ADV-6, ADV-11)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Demand to produce user keys | **Impossible by design** if no platform keys (locked) | Operator lying / future backdoor — resisted by locked docs |
| Demand for logs / metadata | Minimize collection; retention schedules in locked docs | Compulsory process on what *does* exist |
| Demand for payment-path records | Keep payment compliance artifacts on the **PPSI / payment edge**, not inside the vault key hierarchy | Scope creep into identity keys |

### 6.10 GENIUS Act / payment & illicit-finance surface (ADV-10, ADV-11, ADV-12)

The GENIUS Act (U.S. federal framework for **payment stablecoins**) is threat-relevant only where TRV touches **payment stable value**, issuance, or “digital asset service provider”–like behavior. Utility-token governance and pure messaging are not automatically the same regulatory surface — but product language and architecture must not blur them.

#### Threats

| Threat | Mitigation | Residual |
|--------|------------|----------|
| **Illicit use of TRV rails** (ADV-10) | Protocol-level friction for unverified high-risk paths (“Ghost Tax” / tiered anonymity fee); rate limits; optional LiDAR/spatial or POSE-style verification as *user-chosen* elevation — not a hidden social score | Determined laundering via other rails |
| **Section 9–style pressure for “innovative” detection** | Prefer **on-device / protocol signals** and PPSI-side monitoring over platform decryption of E2E content; never satisfy detection by holding user vault keys | Regulators may still demand more data than architecture holds |
| **False claim of GENIUS compliance** (ADV-12) | No public claim of being a PPSI or of “GENIUS-certified” status without actual issuer status, reserves, and counsel review; separate **utility TRV** from **payment stablecoin** in docs and UI | Marketing drift |
| **Reserve / issuer failure** | If settlement uses a PPSI stablecoin: document issuer, redemption path, and that TRV does not re-hypothecate user stablecoin as if TRV were the issuer | Issuer insolvency; bank-run dynamics |
| **Ghost Tax bypass** | Enforce fee policy in consensus or payment gateway logic; treat client-only fees as advisory only | Client forks / alternate UIs |
| **KYC feature creep into vault keys** | Spatial / presence verification must remain separable from key custody; verification attestations must not require exporting master keys | Product pressure to “just store ID on server” |
| **Bankruptcy / priority claims (GENIUS holder protections)** | If TRV ever holds customer payment stablecoins, custody structure must match legal advice; default posture: **do not custody** payment stablecoin reserves on TRV books | Accidental custody via poor UX |

#### Design rules (GENIUS-oriented)

1. **Split planes:** Identity/vault keys ≠ payment stablecoin reserves ≠ TRV utility token.  
2. **No compliance-via-custody:** Monitoring and fee policy must not justify platform recovery keys.  
3. **Honest product copy:** “GENIUS-aligned design” ≠ “licensed PPSI.”  
4. **Ghost Tax is policy, not privacy theater:** Document purpose (friction + resource for higher-risk paths), calculation, and what data it does *not* collect.  
5. **Counsel gate:** Any mainnet payment stablecoin integration, public reserve claim, or “service provider” positioning requires external legal review before launch — treat as a release blocker, not a blog post.

#### Mapping to existing concepts

| Concept | Threat-model role |
|---------|-------------------|
| Ghost Tax | Economic control against anonymous high-risk payment paths; must be enforceable, not cosmetic |
| LiDAR / spatial handshake | Optional verification elevation; local processing preferred; not TRAIGA-prohibited social scoring |
| PPSI stablecoins | External trust boundary for payment settlement |
| TRV token | Utility / governance — do not market as payment stablecoin |

---

## 7. Offline surface (what must still work)

When chain, DHT, and internet are unavailable, the **minimum viable sovereign surface** is:

1. Unlock local vault with user secrets (device-bound)  
2. Read/write local journals and credentials  
3. Burn / Destroy = Restart local path  
4. Optional: local-only AI inference on already-present model  
5. Optional: BLE presence between user’s own devices if radios up  

**Must not require network:** vault open, burn, local identity display.  
**May degrade:** messaging, FL, governance voting, mint/transfer, **GENIUS payment settlement**, Ghost Tax collection (queue or fail closed for payment actions).

If offline behavior is not testable, it is not a real guarantee.

---

## 8. Identity recovery (summary)

| Situation | Outcome |
|-----------|---------|
| User has working recovery (export / shares / hardware) | User restores; platform is not custodian |
| User lost all keys and recovery | Identity path ended; new path = square one |
| User confirmed burn | Path ended; recovery must not resurrect that path |
| Platform asked to “reset account” | **Refuse by architecture** |
| Regulator asks for user private keys | **None to give** if non-custodial design holds |

Full detail: `docs/locked/10-Threat-Model-Key-Loss.md`.

---

## 9. Security properties we claim (and do not claim)

### We aim to provide

- Confidentiality of vault and message payloads against network attackers when E2E is correctly used  
- Integrity of identity path bound to user-held keys  
- Non-custodial operation: platform cannot restore burned or key-lost paths  
- Honest failure: loss without recovery is final  
- Clear separation of **utility TRV** from any **payment stablecoin** path  

### We do **not** claim

- Immunity to a fully compromised client OS/kernel  
- Resistance to all nation-state capabilities against a single targeted device  
- Metadata anonymity on public P2P/IP networks without additional anonymity layers  
- That steganography alone hides keys from a skilled forensic analyst  
- That BLE proximity is unforgeable under lab RF conditions  
- That biometrics or PAD make coercion or physical spoofing impossible (see `docs/security/biometrics.md`)  
- That the project is a licensed PPSI, GENIUS-certified, or approved digital asset service provider  
- That Ghost Tax alone satisfies any particular regulator’s examination  

---

## 10. Priority backlog (engineering)

Ordered by leverage for a solo / small-team build:

1. **Key & vault UX honesty** — recovery offer, loss/burn copy, no fake “reset”  
2. **Re-auth gates** — export, recovery display, burn confirm (knowledge factor and/or Class 3 biometric as *local* gate only)  
3. **P2P message path** — one vertical slice: identity key → E2E message → verify  
4. **BLE as factor only** — presence never sole unlock for vault  
5. **Model/firmware pinning** — hashes in release notes; signed ESP32 images  
6. **FL opt-in + signed updates** — default off until aggregation policy exists  
7. **Contract threat review** before any mainnet token or governance  
8. **GENIUS plane split** — UI/docs language: TRV utility vs payment stablecoin; no accidental custody  
9. **Ghost Tax spec** — formula, enforcement locus (chain vs gateway), data *not* collected  
10. **Legal gate** — counsel review before any public PPSI/reserve/compliance claim  

---

## 11. Related documents

| Doc | Role |
|-----|------|
| `docs/locked/10-Threat-Model-Key-Loss.md` | Locked key-loss / recovery non-negotiables |
| `docs/locked/02-Vault-Principles.md` | Burn / Vault philosophy |
| `docs/locked/03-Destroy-Equals-Restart.md` | Finality rule |
| `docs/locked/09-Wallet-Architecture.md` | Wallet boundaries |
| `docs/locked/11-Legal-Hold-Data-Minimization.md` | Retention / legal hold |
| `docs/security/biometrics.md` | Biometrics as local unlock; PAD vs injection; GrapheneOS notes |
| `docs/security/secrets.md` | What must never live in git |
| `docs/security/signed-commits.md` | Commit signing posture |
| `docs/concepts/legal-gap-analysis.md` | Legal / regulatory gap notes |
| `docs/concepts/sentinel-paradigm.md` | SDE / GENIUS / TRAIGA research framing |
| `docs/concepts/attack-detection.md` | Detection concepts |
| `docs/concepts/presence-based.md` | BLE / presence design |
| `docs/concepts/edge-federated-learning.md` | FL sketch |
| `docs/concepts/tokenomics.md` | TRV utility economics |
| `docs/public/POSTURE.md` | Transparency without secrets |
| `SECURITY.md` | Reporting / project security posture |

---

## 12. Maintenance

- Update this file when a new surface ships (new radio, new chain, new FL path, **payment stablecoin integration**).  
- Do not mark mitigations “done” without a test or review note.  
- Locked docs win on conflict with this draft.  
- GENIUS-related claims in README or marketing must match §6.10 design rules.

---

*Draft for Phase 0 guardrails. Promote sections to `docs/locked/` only after explicit lock decision. Not legal advice.*
