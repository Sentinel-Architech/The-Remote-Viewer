# Threat Model: Key Loss (Locked)

**Status:** Locked — July 25, 2026  
**Phase:** 0 — Foundation & Guardrails  
**Scope:** Loss, compromise, and unrecoverability of cryptographic keys in the Hybrid wallet architecture  
**Depends on:** `01-Identity-Layer.md`, `03-Destroy-Equals-Restart.md`, `06-Identity-Technical-Stack.md`, `09-Wallet-Architecture.md`

---

## 1. Purpose

This document defines how The Remote Viewer treats **key loss** as a security and sovereignty event.

Keys are the root of control over the internal TRV wallet identity path. Losing them without a user-configured recovery method is treated as **equivalent in effect to a permanent end of that identity path** — the same outcome as a deliberate burn, but without intentional confirmation of Destroy = Restart.

The goal is honesty: the system must not pretend that lost keys can be restored by the platform, and must not create a backdoor recovery path that would violate Destroy = Restart or the ban on platform-held recovery keys.

---

## 2. Assets in Scope

| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| Device-bound private keys | Keys generated for DIDs / holder binding in the internal TRV wallet | Critical |
| Hardware-backed keys | Keys in Secure Enclave, StrongBox, TPM, or external hardware wallet | Critical |
| Credential material | VCs / attestations whose use depends on those keys | High |
| Encrypted exports / backups | User-created encrypted backups of keys or wallet state | Critical if they contain key material |
| Recovery shares | Optional Shamir or social-recovery fragments configured by the user | Critical |
| Platform-side recognition | Membership tier, Founding Sovereign flag, discount eligibility tied to the identity path | High (authorization state, not key material) |

**Out of scope for this document:** keys that exist only inside third-party external wallets (EUDI, etc.). TRV does not control those keys; their loss is governed by those wallets’ own models.

---

## 3. Adversaries and Conditions

| Actor / Condition | Goal or effect |
|-------------------|----------------|
| Accidental user loss | Device destroyed, factory reset, forgotten passphrase, discarded hardware |
| Device thief | Obtain device and attempt to use or extract keys |
| Malware on device | Exfiltrate key material or encrypted backups |
| Coercive actor | Force user to reveal recovery material or unlock device |
| Malicious insider / compromised TRV server | Attempt to reconstruct user keys or force “recovery” |
| Legal process | Compel platform to produce keys or enable access |

TRV’s design response to the last two is structural: **the platform must not possess keys or platform-held recovery secrets that could satisfy such a demand for key restoration.**

---

## 4. Core Security Properties

1. **No platform recovery keys**  
   TRV servers and operators must not hold secrets that can restore an internal-wallet identity path after key loss or burn.

2. **Loss without recovery = path ended**  
   If the user loses all copies of their keys and has no user-configured recovery method that still works, that identity path is permanently unusable. This is not “account recovery”; it is cryptographic finality.

3. **Recovery is user-chosen only**  
   Optional recovery (encrypted offline backup, social recovery, Shamir shares, hardware backup) is configured and held by the user. TRV may assist with UX and client-side cryptography; it must not become the custodian of the recovery root.

4. **Burn remains absolute**  
   A confirmed Destroy = Restart must not be reversible via any recovery path. Recovery mechanisms must be designed so they cannot resurrect a burned path (e.g. recovery material is invalidated or bound such that burn clears recoverable state for that path).

5. **Honest UX**  
   The product must state clearly that key loss without recovery ends the TRV identity path, and that this is intentional.

---

## 5. Threat Scenarios and Mitigations

### 5.1 Device lost or destroyed; no backup

| | |
|--|--|
| **Impact** | Internal wallet keys and held credentials become inaccessible. Platform cannot restore them. |
| **Mitigation** | Pre-loss: prompt optional encrypted export / recovery setup. Post-loss: treat path as ended; user may create a new identity path (square one). No “reset password” equivalent for keys. |
| **Residual risk** | User did not configure recovery. Accepted as user sovereignty trade-off. |

### 5.2 Device stolen; screen lock intact

| | |
|--|--|
| **Impact** | Thief has hardware but not unlock. |
| **Mitigation** | Rely on OS screen lock, secure enclave, rate limiting. Encourage strong device auth. Remote OS wipe (user’s own Apple/Google/etc. tools) is outside TRV but compatible. |
| **Residual risk** | Weak device PIN; advanced extraction. Hardware-backed keys reduce extractability. |

### 5.3 Device stolen; unlocked or lock bypassed

| | |
|--|--|
| **Impact** | Attacker may use keys while device remains unlocked; may attempt export if UX allows without re-auth. |
| **Mitigation** | Require re-authentication for export, high-value presentation, and recovery-share display. Minimize lifetime of unlocked key use. Prefer hardware-backed keys that do not export raw private keys. |
| **Residual risk** | Coercion or brief unlocked access. Cannot be fully eliminated on a general-purpose device. |

### 5.4 Malware / clipboard / backup scraping

| | |
|--|--|
| **Impact** | Encrypted or plaintext key material leaves the device. |
| **Mitigation** | Never write raw private keys to app logs, screenshots, or unencrypted files. Encrypted exports only, with user-chosen passphrase (or equivalent) not stored by TRV. Avoid putting secrets in OS cloud backups where controllable. |
| **Residual risk** | Compromised device is hostile; limit blast radius, do not claim malware immunity. |

### 5.5 User forgets export passphrase / loses recovery shares

| | |
|--|--|
| **Impact** | Backup exists but is unusable → same as no backup. |
| **Mitigation** | Clear warnings at setup: “If you lose this passphrase / these shares, TRV cannot recover your keys.” Optional dual methods (e.g. hardware + encrypted file) left to user. |
| **Residual risk** | User error. Accepted. |

### 5.6 Social recovery collusion or lost sharers

| | |
|--|--|
| **Impact** | Threshold of trustees collude, or enough shares are lost. |
| **Mitigation** | If social recovery is offered: user picks threshold and trustees; TRV does not hold a master share. Document collusion and availability risks. Prefer this as optional advanced feature, not default. |
| **Residual risk** | Social and availability failures inherent to the model. |

### 5.7 Platform pressure to “just restore the account”

| | |
|--|--|
| **Impact** | Business, support, or legal pressure to implement server-side recovery. |
| **Mitigation** | Architecture forbids platform recovery keys. Support policy: key loss without user recovery = new identity path only. Locked documents (this file + Destroy = Restart) are the reference. |
| **Residual risk** | Policy drift over time — resisted by locked non-negotiables. |

### 5.8 Key loss vs deliberate burn confusion

| | |
|--|--|
| **Impact** | User believes lost keys can be restored “like a burned account.” |
| **Mitigation** | UX language: loss without recovery ends the path; burn is the *intentional* same class of finality, with confirmation and Vault rules. Do not offer “undo burn” or “undo loss” via platform. |
| **Residual risk** | Misunderstanding; mitigated by repeated, plain copy. |

---

## 6. Required Product Behaviors

1. **On first wallet creation**  
   Offer optional recovery setup (encrypted export and/or other user-held methods). Do not block use if declined, but warn of consequences.

2. **No “forgot keys” server flow**  
   There is no email/SMS/platform challenge that restores internal-wallet private keys.

3. **Re-auth for dangerous operations**  
   Export, display of recovery material, and high-value presentations require fresh user authentication where the platform allows.

4. **Burn invalidates recovery for that path**  
   After confirmed Destroy = Restart, recovery material must not restore the burned path’s platform recognition or TRV-issued attestations. Implementation must enforce this (e.g. path-specific epoch, revocation, or deletion of recoverable TRV state).

5. **New path after loss**  
   User may always create a new internal identity path. It starts at square one: no Founding status, no prior membership continuity, no restored Vault for the old path.

6. **External wallets**  
   Document that keys in external wallets are outside this threat model; losing an EUDI wallet is not solved by TRV.

---

## 7. What TRV Explicitly Does Not Promise

- Restoration of private keys after loss when the user has no working recovery method  
- Platform-held escrow of keys “just in case”  
- Continuity of Founding Sovereign or membership status across a lost-key new path  
- Immunity to a fully compromised client device  
- Control over third-party wallet key recovery  

---

## 8. Relationship to Destroy = Restart

| Event | Intentional? | Identity path outcome | Platform recovery? |
|-------|--------------|----------------------|--------------------|
| Confirmed burn | Yes | Ended (square one if user returns) | No |
| Key loss, no recovery | No | Effectively ended | No |
| Key loss, valid user recovery | No | Restored by **user** recovery only | No |

Deliberate burn is the sovereign *choice* of the same finality that key loss forces. The threat model exists so that neither case creates a platform backdoor.

---

## 9. Acceptance Criteria (Phase 0 / early implementation)

- [ ] Written UX strings for: first-run recovery offer, decline warning, loss-without-recovery explanation, burn vs loss distinction  
- [ ] Architecture review confirms no server-side private key or master recovery key store  
- [ ] Internal wallet design includes optional encrypted export path (implementation may land in Phase 3; design in Phase 0–1)  
- [ ] Burn design includes invalidation of path recovery so burned paths cannot be quietly restored  
- [ ] Support / policy doc states key loss without user recovery ⇒ new path only  

---

## 10. Related Threats (Deferred Detail)

Detailed models for **phishing / malicious verifiers** and **residual data after burn** are companion Phase 0 items. They share the same non-negotiables (no platform key custody, absolute burn, minimal residual data) but are specified in separate locked documents when written.

---

## 11. Final Statement

Keys are the boundary of sovereignty in the internal wallet.

If the user holds them (and any recovery they chose), the path lives.  
If they do not, the path is over — and The Remote Viewer will not pretend otherwise.

**No platform key. No silent resurrection. Loss without recovery ends the path.**
