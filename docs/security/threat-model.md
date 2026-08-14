# Threat Model — Proven Surfaces

**Status:** Public  
**Last aligned:** 2026-08-13  
**Scope:** Currently PROVEN / OPERATIONAL / DEMONSTRATED components only  
**Companion documents:**  
- `docs/locked/10-Threat-Model-Key-Loss.md` (locked — key loss & Destroy = Restart)  
- `docs/public/BEACON.md` / `VALIDATOR-LIST.md` (validator liveness)  
- `docs/security/running-system-threat-model.md` (draft — future P2P / ESP32 surfaces)

**Rule:** No marketing. Residual risks are stated plainly.

---

## 1. Assets in Scope

| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| Local age identity (secret key) | Device-held; never leaves the device | Critical |
| Validator ed25519 key (`validator.pem`) | Signs beacons; device-held | Critical |
| Optical air-gap frames / `.trvl` | age ciphertext framed with Soliton LT | High |
| Sales log + Integrity Verifier attestations | Local hash-chained records | High |
| Hydra seal / baseline | Integrity of critical scripts and state | High |
| Path B attestation & founding-member JSON | Recognition artifacts | High (authorization) |
| Public age1… recipient + tx signature | Buyer-supplied delivery information | Medium |
| Validator beacon + published list | Liveness + membership for Stage 1+ | Medium–High |
| Local operator UI / mobile client state | On-device only | Medium–High |

**Out of scope for this document:** future P2P gossip, ESP32 OTA, chain settlement, and any surface still marked SCAFFOLD or NOT STARTED.

---

## 2. Adversaries

- Network observer (payment memos are public on Solana)
- Malicious or compromised seller (manual or optical delivery path)
- Attacker who obtains a copy of a `.trvl` file or optical frames
- Local malware or physical access to an unlocked device
- Originator (or future validators) acting outside the stated recognition rules
- Environmental / physical channel attacker (camera, lighting, shoulder-surfing of QR frames)
- Attacker who forges or replays validator beacons

---

## 3. Threats and Current Mitigations

### 3.1 Optical Channel Exposure or Capture
**Threat:** Attacker photographs or records QR / optical frames in transit.  
**Mitigation:** Payload is age-encrypted to the buyer’s public key. Capture of frames without the corresponding private key yields only ciphertext.  
**Residual risk:** Side-channel leakage of metadata (timing, number of frames, approximate size). Environmental factors can cause delivery failure or force fallback to file transfer. Local (non-camera) pipeline is measured on reference hardware; pure camera throughput remains partially unquantified.

### 3.2 Public-Key Delivery Channel
**Threat:** Buyer must get `age1…` + tx signature to the seller.  
**Mitigation:** Only the public recipient is sent; private key never leaves the buyer device. Optical helper (`show-age1.html`) is the preferred path and is proven on reference hardware. Copy-paste and file-drop remain fallbacks.  
**Residual risk:** Any remaining human channel can still be phished or delayed. Optical public-key exchange reduces but does not eliminate social risk if the buyer is tricked into showing a key to the wrong party.

### 3.3 Compromised or Malicious Seller
**Threat:** Seller delivers incorrect, empty, or malicious payload.  
**Mitigation:** Integrity Verifier + empty-frame refusal; buyer decrypts only with their own age identity; Hydra quarantine can block delivery on integrity failure.  
**Residual risk:** Seller can still refuse delivery or delay. No on-chain automatic delivery yet (by design).

### 3.4 Path B Recognition (Stage 0 → Stage 1)
**Threat:** Recognition currently originator-gated; future validators could collude or go silent.  
**Mitigation:** Checklist and attestation format public; multi-validator trajectory and beacon liveness specified (`PATH-B-MULTI-VALIDATOR.md`, `BEACON.md`, `VALIDATOR-LIST.md`). ed25519 beacon sign/verify proven on reference hardware.  
**Residual risk:** Stage 1 list + threshold not yet operationally populated. Until then, originator remains the single live gate (explicitly acknowledged).

### 3.5 Validator Beacon Forgery / Replay / False Liveness
**Threat:** Attacker forges beacons, replays old ones, or claims liveness without a live process.  
**Mitigation:** ed25519 signatures over canonical body; monotonic `seq`; freshness window (default 30 min); binding of `validator=` id to published pubkey (`VALIDATOR-LIST.md`).  
**Residual risk:** Clock skew; compromised validator key (Destroy = Restart applies); list distribution integrity if the list itself is not verified out-of-band.

### 3.6 Local Device Compromise
**Threat:** Malware or physical access to an unlocked device.  
**Mitigation:** Keys are device-held; Destroy = Restart is absolute for age identities and validator keys (`modules/beacon/destroy.sh`); Hydra provides local integrity monitoring.  
**Residual risk:** A fully compromised host OS or unlocked device is outside the trust boundary.

### 3.7 Solana Memo Observation
**Threat:** Payment memos and amounts are publicly visible on-chain.  
**Mitigation:** Memo is only a signal; delivery remains age-encrypted and zero-custody.  
**Residual risk:** Linkability of purchases to a Solana address. Accepted for the current payment rail.

---

## 4. Explicit Non-Goals (Current Phase)

- Protection against a fully compromised host OS or physical attacker with prolonged unlocked access.
- Automatic, trustless delivery without any human step when optical/public-key exchange is unavailable.
- Anonymity against a global observer of the Solana payment rail.
- Populated multi-validator set (Stage 1 design is public; membership not yet live).
- Resistance to nation-state physical or optical surveillance of the delivery channel.

---

## 5. Residual Risks Summary (Honest)

| Residual Risk | Severity | Status |
|---------------|----------|--------|
| Human public-key channel (when optical not used) | Medium | Reduced by show-age1; still present as fallback |
| Originator-gated Path B (Stage 0) | Medium | Explicit; Stage 1 design + beacon crypto proven |
| Beacon key compromise / list integrity | Medium | Destroy path exists; list distribution still operator-published |
| Optical environmental variance (camera) | Medium | Local pipeline measured; camera path deferred |
| Solana memo linkability | Low–Medium | Accepted |
| Fully compromised local device | High (by definition) | Outside trust boundary |

---

## 6. Required Engineering / Documentation Follow-ups

1. Populate and publish first Stage 1 validator list when external validators exist.
2. Wire `check.sh` + list binding into Path B recognition acceptance.
3. Quantify camera optical throughput under two-device conditions when ready.
4. Keep this document updated whenever a new surface moves from SCAFFOLD → PROVEN.

---

## 7. Relationship to Other Documents

- Key loss and Destroy = Restart remain absolute (age + validator keys).
- This document does not override any locked non-negotiable.
- Future P2P / ESP32 / chain-settlement threats belong in the running-system draft until those surfaces are proven.

**Final statement**  
The system is designed so that private keys never leave the holder’s device and that loss of those keys ends the path. Remaining residual risks are operational (list population, human fallback channels, physical optical conditions) rather than gaps in the local cryptographic pipeline. They are stated here so they can be reduced deliberately rather than ignored.
