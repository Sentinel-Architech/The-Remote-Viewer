# Running System Threat Model

**Status:** Draft — July 27, 2026  
**Scope:** Live components that currently exist or are scaffolding (P2P gossip, Merkle state, OTA receiver on ESP32, desktop orchestrator)  
**Companion to:** `docs/locked/10-Threat-Model-Key-Loss.md`

This document covers threats against the *running* system, not the key-loss / identity finality model.

---

## 1. Assets

| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| Local Merkle root | Current state hash of the node | High (integrity) |
| P2P gossip messages | ROOT announcements and future state sync | Medium |
| OTA firmware images | Updates pushed to ESP32 edge devices | Critical |
| Local storage (heed/LMDB) | Any persisted packets or state | High |
| Ed25519 public keys in Web of Trust | Trusted peer set | High |
| Secret keys | Device-local only; must never leave memory longer than needed | Critical |

---

## 2. Adversaries

- Network observer on the local LAN / multicast domain
- Malicious peer that joins the gossip group
- Compromised or rogue ESP32 edge node
- Attacker who can supply a malicious OTA payload
- Local malware that can read process memory or storage

---

## 3. Threats and Current Mitigations

### 3.1 P2P Gossip Spoofing / Injection

**Threat:** Attacker sends forged ROOT| messages or future state packets.  
**Current state:** Gossip is unauthenticated multicast. Anyone on the LAN can announce a root.  
**Mitigation (required):**  
- Sign every gossip message with the node’s Ed25519 key.  
- Verify signature against the local Web of Trust before accepting state.  
- Reject unsigned or untrusted messages.

### 3.2 Sybil / Peer Flooding

**Threat:** Attacker spins up many identities to dominate the gossip view.  
**Current state:** No rate limiting or reputation.  
**Mitigation (required):**  
- Rate-limit announcements per public key.  
- Prefer peers that have previously presented valid ZK membership proofs (once wired).  
- Keep the trusted set small and explicit.

### 3.3 OTA Firmware Tampering (ESP32)

**Threat:** Attacker supplies a malicious firmware image over the OTA path.  
**Current state:** `edge-esp32/main/ota_receiver.c` exists; authenticity not yet enforced in the visible scaffold.  
**Mitigation (required):**  
- Sign every OTA image with a long-term release key.  
- Verify signature on device before flashing.  
- Prefer hardware-backed verification where the ESP32 secure boot features allow.  
- Never accept unsigned or self-signed updates in production.

### 3.4 Merkle Root Poisoning

**Threat:** Attacker forces the local tree to accept false leaves or a bad root.  
**Current state:** Insert is local-only; no remote write path yet.  
**Mitigation:** Keep remote state sync behind authenticated, signed channels only. Never auto-merge untrusted roots.

### 3.5 Secret Key Exposure in Memory

**Threat:** Process dump or side-channel recovers the Ed25519 secret key.  
**Current mitigation:** Secret key is generated, used once to provision the public key, then explicitly zeroized.  
**Still required:**  
- Never log or serialize the secret key.  
- Prefer hardware-backed keys (Secure Enclave / StrongBox / TPM) as soon as the mobile/desktop path supports them.

### 3.6 Local Storage Integrity

**Threat:** Attacker modifies the on-disk heed/LMDB store.  
**Current state:** No authenticated encryption of the database.  
**Mitigation (later phase):** Encrypt the storage volume with a key derived from a user secret or hardware root. Until then, treat the host OS as the trust boundary.

---

## 4. Explicit Non-Goals (Current Phase)

- Protection against a fully compromised host OS or physical attacker with the unlocked device.  
- Anonymity against a global network observer (this is not a mixnet yet).  
- Resistance to nation-state traffic analysis on the multicast gossip.

---

## 5. Required Next Engineering Steps

1. Sign and verify all P2P gossip messages.  
2. Add signature verification to the ESP32 OTA receiver.  
3. Wire the ZK membership proof into peer acceptance once the circuit is ready.  
4. Move secret key material to hardware-backed storage on supported platforms.  
5. Add integration tests that attempt to inject unsigned gossip and unsigned OTA images — both must be rejected.

---

## 6. Relationship to Locked Documents

This threat model does **not** change the key-loss or Destroy = Restart rules.  
Those remain absolute. This document only covers the operational attack surface of the running components.
