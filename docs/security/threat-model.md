# Threat Model — Proven Surfaces

**Status:** Public  
**Last aligned:** 2026-08-13  
**Scope:** Currently PROVEN / OPERATIONAL / DEMONSTRATED components only  
**Companion documents:**  
- `docs/locked/10-Threat-Model-Key-Loss.md` (locked — key loss & Destroy = Restart)  
- `docs/security/running-system-threat-model.md` (draft — future P2P / ESP32 surfaces)

**Rule:** No marketing. Residual risks are stated plainly.

---

## 1. Assets in Scope

| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| Local age identity (secret key) | Device-held; never leaves the device | Critical |
| Optical air-gap frames / `.trvl` | age ciphertext framed with Soliton LT | High |
| Sales log + Integrity Verifier attestations | Local hash-chained records | High |
| Hydra seal / baseline | Integrity of critical scripts and state | High |
| Path B attestation & founding-member JSON | Recognition artifacts | High (authorization) |
| Public age1… recipient + tx signature | Buyer-supplied delivery information | Medium |
| Local operator UI / mobile client state | On-device only | Medium–High |

**Out of scope for this document:** future P2P gossip, ESP32 OTA, chain settlement, and any surface still marked SCAFFOLD or NOT STARTED.

---

## 2. Adversaries

- Network observer (payment memos are public on Solana)
- Malicious or compromised seller (in the current manual delivery path)
- Attacker who obtains a copy of a `.trvl` file or optical frames
- Local malware or physical access to an unlocked device
- Originator (or future validators) acting outside the stated recognition rules
- Environmental / physical channel attacker (camera, lighting, shoulder-surfing of QR frames)

---

## 3. Threats and Current Mitigations

### 3.1 Optical Channel Exposure or Capture
**Threat:** Attacker photographs or records QR / optical frames in transit.  
**Mitigation:** Payload is age-encrypted to the buyer’s public key. Capture of frames without the corresponding private key yields only ciphertext.  
**Residual risk:** Side-channel leakage of metadata (timing, number of frames, approximate size). Environmental factors (lighting, motion, camera quality) can cause delivery failure or force fallback to file transfer.

### 3.2 Manual Public-Key Delivery Channel
**Threat:** Buyer must currently communicate the `age1…` public key + transaction signature to the seller (human channel).  
**Mitigation:** Only the public recipient is sent; private key never leaves the buyer device. Seller never holds buyer identity.  
**Residual risk:** Human channel can be phished, delayed, or social-engineered. This is the largest remaining operational friction and residual trust surface.

### 3.3 Compromised or Malicious Seller
**Threat:** Seller delivers incorrect, empty, or malicious payload.  
**Mitigation:** Integrity Verifier + empty-frame refusal; buyer decrypts only with their own age identity; Hydra quarantine can block delivery on integrity failure.  
**Residual risk:** Seller can still refuse delivery or delay. No on-chain automatic delivery yet (by design).

### 3.4 Originator-Gated Path B Recognition
**Threat:** Recognition and Founding issuance currently require originator verification.  
**Mitigation:** Checklist and attestation format are public; verification is offline and inspectable. Counts are published (external finishers = 0).  
**Residual risk:** Centralization of trust at the recognition layer until multi-validator weight is live. This is explicitly acknowledged.

### 3.5 Local Device Compromise
**Threat:** Malware or physical access to an unlocked device.  
**Mitigation:** Keys are device-held; Destroy = Restart is absolute; Hydra provides local integrity monitoring and quarantine.  
**Residual risk:** A fully compromised host OS or unlocked device is outside the trust boundary. The system does not claim malware immunity.

### 3.6 Solana Memo Observation
**Threat:** Payment memos and amounts are publicly visible on-chain.  
**Mitigation:** Memo is only a signal; delivery remains age-encrypted and zero-custody. No platform holds buyer identity.  
**Residual risk:** Linkability of purchases to a Solana address. Accepted as the cost of the current public payment rail.

---

## 4. Explicit Non-Goals (Current Phase)

- Protection against a fully compromised host OS or physical attacker with prolonged unlocked access.
- Automatic, trustless delivery without any human or originator step.
- Anonymity against a global observer of the Solana payment rail.
- Multi-validator Path B recognition (still originator-verified).
- Resistance to nation-state physical or optical surveillance of the delivery channel.

---

## 5. Residual Risks Summary (Honest)

| Residual Risk | Severity | Status |
|---------------|----------|--------|
| Manual public-key delivery channel | Medium–High | Accepted; primary UX friction |
| Originator-gated Path B recognition | Medium | Explicitly acknowledged; multi-validator path not yet live |
| Optical environmental variance | Medium | Quantify on reference hardware |
| Solana memo linkability | Low–Medium | Accepted for current payment rail |
| Fully compromised local device | High (by definition) | Outside trust boundary |

---

## 6. Required Engineering / Documentation Follow-ups

1. Quantify optical throughput and failure modes on the reference GrapheneOS device and publish numbers in `docs/REPRODUCE.md`.
2. Reduce or eliminate the manual public-key channel (guided in-app flow + pure optical path).
3. Move Path B recognition toward multi-validator weight while preserving offline attestations.
4. Keep this document updated whenever a new surface moves from SCAFFOLD → PROVEN.

---

## 7. Relationship to Other Documents

- Key loss and Destroy = Restart remain absolute and are governed by the locked model.
- This document does not override any locked non-negotiable.
- Future P2P / ESP32 / chain-settlement threats belong in the running-system draft until those surfaces are proven.

**Final statement**  
The system is designed so that the buyer’s private key never leaves their device and that loss of that key ends the path. The remaining residual risks are operational (manual channel, originator recognition, physical optical conditions) rather than cryptographic. They are stated here so they can be reduced deliberately rather than ignored.
