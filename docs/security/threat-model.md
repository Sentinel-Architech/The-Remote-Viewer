# System Threat Model — The Remote Viewer / Sentinel Protocol

**Status:** Draft — July 27, 2026  
**Scope:** End-to-end system (device, P2P, presence auth, edge learning, chain, supply chain)  
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
| **Presence / MFA** | Bluetooth LE beacons, proximity / co-location checks; optional ESP32 edge hardware |
| **P2P** | libp2p (or equivalent), noise/encryption, DHT discovery, relay |
| **Edge AI** | On-device models; optional federated updates (gradients / LoRA deltas only) |
| **Chain** | Governance / storage / identity contracts; TRV token utility |
| **Storage** | User-controlled IPFS/Arweave pins; no platform custody of plaintext vault content |
| **Dev / supply** | GitHub private repo, ESP-IDF, Rust/JS deps, Termux packages |

**Out of scope for this doc:** third-party wallet key recovery; national SIGINT against all of GrapheneOS/hardware vendors as a class (noted as residual).

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

**Design stance vs ADV-6 (platform side):** architecture must not create secrets the operator can hand over to restore a user’s vault or keys. User coercion is a residual human risk, not solved by software alone.

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
                              └───────────────────────────┘
```

**Rule:** Anything outside the device TCB is untrusted until verified (signatures, pinning, E2E session keys, contract addresses).

---

## 6. Attack surfaces and mitigations

### 6.1 Device compromise (ADV-1, ADV-2)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Stolen phone, locked | GrapheneOS, strong lock, hardware-backed keys, remote wipe via user tools | Weak PIN; lab extraction |
| Stolen phone, unlocked | Re-auth for export / high-value ops; short session lifetime | Coercion; brief unlock window |
| Malicious APK / sideload | Prefer known sources; GrapheneOS hardening; no raw keys in logs | User installs malware anyway |
| Cloud backup of secrets | Forbid unencrypted key/vault backup to vendor cloud | User overrides via OS settings |

### 6.2 Presence / BLE MFA (ADV-1, ADV-5)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Beacon replay | Nonces, timestamps, short validity window | Clock skew; delayed relay |
| RSSI spoof / amplifier | Multi-factor (proximity + human confirm + device bind); never BLE-alone for full auth | Determined RF attacker |
| Fake co-location | Correlate multiple signals; rate-limit auth elevation | Lab-grade RF |

**Policy:** BLE proximity is a *factor*, not sole authenticator for vault unlock or key export.

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
| Contract bug | Minimize privileged roles; timelock; audits before mainnet; upgrade path governed |
| Governance capture | Quorum, delay, clear proposal types; avoid admin god-key in production |
| Economic griefing | Rate limits, deposits, explicit fee design (e.g. Ghost Tax) documented as policy |

### 6.8 Supply chain & repo (ADV-7)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Dependency confusion / malicious crate/npm | Lockfiles; pin versions; review new deps |
| Compromised CI token | Least-privilege tokens; no production keys in CI |
| Insider push | Branch protection; PR review when second pair of eyes exists; signed commits optional |

### 6.9 Legal / operator pressure (ADV-6)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Demand to produce user keys | **Impossible by design** if no platform keys (locked) | Operator lying / future backdoor — resisted by locked docs |
| Demand for logs / metadata | Minimize collection; retention schedules in locked docs | Compulsory process on what *does* exist |

---

## 7. Offline surface (what must still work)

When chain, DHT, and internet are unavailable, the **minimum viable sovereign surface** is:

1. Unlock local vault with user secrets (device-bound)  
2. Read/write local journals and credentials  
3. Burn / Destroy = Restart local path  
4. Optional: local-only AI inference on already-present model  
5. Optional: BLE presence between user’s own devices if radios up  

**Must not require network:** vault open, burn, local identity display.  
**May degrade:** messaging, FL, governance voting, mint/transfer.

If offline behavior is not testable, it is not a real guarantee.

---

## 8. Identity recovery (summary)

| Situation | Outcome |
|-----------|---------|
| User has working recovery (export / shares / hardware) | User restores; platform is not custodian |
| User lost all keys and recovery | Identity path ended; new path = square one |
| User confirmed burn | Path ended; recovery must not resurrect that path |
| Platform asked to “reset account” | **Refuse by architecture** |

Full detail: `docs/locked/10-Threat-Model-Key-Loss.md`.

---

## 9. Security properties we claim (and do not claim)

### We aim to provide

- Confidentiality of vault and message payloads against network attackers when E2E is correctly used  
- Integrity of identity path bound to user-held keys  
- Non-custodial operation: platform cannot restore burned or key-lost paths  
- Honest failure: loss without recovery is final  

### We do **not** claim

- Immunity to a fully compromised client OS/kernel  
- Resistance to all nation-state capabilities against a single targeted device  
- Metadata anonymity on public P2P/IP networks without additional anonymity layers  
- That steganography alone hides keys from a skilled forensic analyst  
- That BLE proximity is unforgeable under lab RF conditions  

---

## 10. Priority backlog (engineering)

Ordered by leverage for a solo / small-team build:

1. **Key & vault UX honesty** — recovery offer, loss/burn copy, no fake “reset”  
2. **Re-auth gates** — export, recovery display, burn confirm  
3. **P2E message path** — one vertical slice: identity key → E2E message → verify  
4. **BLE as factor only** — presence never sole unlock for vault  
5. **Model/firmware pinning** — hashes in release notes; signed ESP32 images  
6. **FL opt-in + signed updates** — default off until aggregation policy exists  
7. **Contract threat review** before any mainnet token or governance  

---

## 11. Related documents

| Doc | Role |
|-----|------|
| `docs/locked/10-Threat-Model-Key-Loss.md` | Locked key-loss / recovery non-negotiables |
| `docs/locked/02-Vault-Principles.md` | Burn / Vault philosophy |
| `docs/locked/03-Destroy-Equals-Restart.md` | Finality rule |
| `docs/locked/09-Wallet-Architecture.md` | Wallet boundaries |
| `docs/locked/11-Legal-Hold-Data-Minimization.md` | Retention / legal hold |
| `docs/concepts/attack-detection.md` | Detection concepts |
| `docs/concepts/presence-based.md` | BLE / presence design |
| `docs/concepts/edge-federated-learning.md` | FL sketch |
| `SECURITY.md` | Reporting / project security posture |

---

## 12. Maintenance

- Update this file when a new surface ships (new radio, new chain, new FL path).  
- Do not mark mitigations “done” without a test or review note.  
- Locked docs win on conflict with this draft.

---

*Draft for Phase 0 guardrails. Promote sections to `docs/locked/` only after explicit lock decision.*
