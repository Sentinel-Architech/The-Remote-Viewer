# Biometrics, PAD, and spoofing vectors

**Status:** Design posture (not an implementation claim)  
**Audience:** Builders and reviewers of The Remote Viewer / Sentinel  
**Updated:** 2026-07-27  
**Related:** `docs/public/POSTURE.md`, `docs/security/threat-model.md`, `docs/security/secrets.md`, `docs/security/auth-bound-keys.md`, `docs/locked/10-Threat-Model-Key-Loss.md`

---

## One-line rule

Biometrics are an **optional local unlock** for on-device key use.  
They are **not** identity, **not** recovery, and **not** a substitute for destroy = restart.

**Spoofing does not change that rule.** Even perfect anti-spoof would not justify biometrics as root of trust or as a recovery path.

For **how keys must bind to auth** (Keystore, StrongBox, timeouts), see `docs/security/auth-bound-keys.md`.

---

## What biometrics are on Android

Android authenticators (Gatekeeper for knowledge factors; biometric subsystems for fingerprint/face) issue authentication state into the Keystore path. Cryptographic keys can be bound so operations require successful user authentication.

| Layer | Role |
|-------|------|
| Knowledge factor (PIN / password / pattern) | Primary unlock; rate-limited via secure element policy on supported devices |
| Class 3 (Strong) biometric | Convenience unlock; can gate hardware-backed key use when bound correctly |
| Class 2 / 1 | Convenience only — do not treat as strong crypto gate |
| TEE / StrongBox | Where key material and auth-bound policy should live |

On GrapheneOS (preferred edge for TRV):

- Fingerprint attempt budget is tightened (e.g. 5 total attempts vs more permissive stock loops).
- Optional **fingerprint + second-factor PIN** preserves a strong primary passphrase while keeping usability.
- Secure element rate limiting and related hardware features remain the backbone for brute-force resistance.
- Duress PIN/password is a separate coercion control — not a biometric feature.

**Implication:** Prefer a high-entropy knowledge factor as the root of local trust. Use Class 3 biometrics only as an optional gate for *using* keys that already exist on-device.

---

## Attack families (where the spoof lands)

| Family | Where it hits | TRV exposure |
|--------|----------------|--------------|
| **Presentation** | Real sensor sees an artifact (print, mask, mold, replay screen) | Physical access, unattended device, coercion-adjacent |
| **Injection** | Synthetic/replay frames enter the software capture path (virtual camera, hooks, emulator) | Mostly **remote** selfie/KYC products — avoid as load-bearing for TRV |
| **Process / policy** | Live biometric under force; hostile enrollment; unlocked session abuse | Coercion, social engineering, malware after unlock |

PAD (ISO/IEC 30107) targets **presentation**. It does **not** certify resistance to **injection**. Separate industry work (e.g. CEN/TS 18099; ISO/IEC 25456 in progress) addresses injection assurance for remote verify pipelines.

---

## Spoofing vectors by modality

### Fingerprint

| Vector | Mechanism | Notes |
|--------|-----------|--------|
| Latent lift + mold | Print from glass/device → gelatin, silicone, latex, conductive mixes | Classic low–medium skill |
| Photo-to-mold | High-res ridge photo → etch/print mold → cast | Medium |
| 3D-printed mold | Geometry of ridges → mold → cast | Medium |
| Direct PAI materials | Play-Doh, wood glue, latex films, etc. | Success varies by optical / capacitive / ultrasonic sensor |
| Sensor–TEE path abuse (e.g. BrutePrint-class) | Hardware between sensor and trusted path; mass template tries; attempt-limit logic bugs | Physical access; historically hours on vulnerable Android stacks |

### Face

| Vector | Mechanism | Notes |
|--------|-----------|--------|
| 2D print / phone screen | Photo of enrolled user | Still defeats weak face unlock on many devices |
| Video replay | Recording aimed at front camera | Beats systems without depth/challenge |
| 2.5D / contoured artifacts | Depth-ish paper/felt masks | Mid sophistication |
| Silicone / urethane / resin masks | Wearable 3D face | High-end presentation; PAD Level 2/3 lab targets |
| 3D-printed head/mask | Full geometry | Demonstrated against some phone face systems historically |
| Deepfake / face-swap / animated still | AI motion from public photos | Dominates **remote** ID fraud; often delivered via **injection** |
| Morph | Blend of identities at enroll or match | Enrollment integrity / gallery problem |

### Voice (if ever considered)

| Vector | Notes |
|--------|--------|
| Replay | Recording of passphrase or free speech |
| Clone / TTS | From short public audio |
| Injection | Same pipeline integrity issues as face |

**Policy:** Voice is a poor sole factor for vault or `did:key` unlock.

### Non-sensor process vectors

| Vector | Why it matters |
|--------|----------------|
| **Coercion** | Live biometric under threat — PAD “succeeds”; knowledge factor + duress policy matter |
| **Hostile enrollment** | Attacker enrolls their own print/face while device is unlocked or supervised |
| **Unconscious / unattended use** | Biometric unlock without conscious consent |
| **Compromised OS / HAL** | Spoof or bypass below the app; app-level liveness never runs |
| **Post-unlock malware** | Session already open; biometric gate skipped |
| **Public biometric leakage** | Social photos → face spoofs; latents on shared surfaces |

**Biology is not rotatable.** Destroy = restart revokes **keys**, not fingerprints or faces. TRV must not store server-side biometric templates.

---

## Presentation attack detection (PAD) and liveness standards

| Standard | Role |
|----------|------|
| ISO/IEC 30107-1/3 | PAD framework + testing/reporting (presentation @ sensor) |
| ISO/IEC 30107-4 | Mobile local biometric PAD profile (incl. FIDO-oriented profile) |
| CEN/TS 18099 | Injection attack detection (EU TS) |
| ISO/IEC 25456 | IAD international standard (in development) |
| NIST SP 800-63B | Auth policy: biometrics not secrets; SHOULD PAD; attempt limits |

Liveness detection ⊆ PAD. Lab “Level 1/2/3” are evaluation protocols — always read species, device, APCER/BPCER.

### TRV stance

| Context | Stance |
|---------|--------|
| OS Class 3 on Pixel + GrapheneOS | Inherit OEM + platform; do not reimplement |
| App-level cloud liveness | Avoid as load-bearing identity |
| Spatial / depth experiments | Session presence research only |
| Public claims | No implied PAD/IAD cert unless independently obtained |

---

## Threat residuals (honest)

| Adversary / event | Biometrics + PAD help? |
|-------------------|-------------------------|
| Casual theft / shoulder surfing | Yes |
| Physical attacker with time | Limited |
| Coercion | Poor |
| Malware after unlock | No — need auth-bound keys |
| Remote injection rings | N/A if no remote selfie root of trust |
| Lost key material | No |

---

## Implementation posture

1. On-device `did:key` only; CSPRNG via `expo-crypto` (not Web Crypto).  
2. Auth-bound Keystore for production wraps — `docs/security/auth-bound-keys.md`.  
3. Device credential fallback always.  
4. Never biometric-only create/recover.  
5. Enrollment hygiene; prefer invalidate-on-new-biometric for wrapping keys.  
6. UX: “Unlock local identity.”  
7. GrapheneOS: strong primary lock, optional FP, optional FP+PIN, duress separate.  

---

## Non-goals

- Biometrics as network identity  
- Cloud liveness as local-key substitute  
- Recovery via face/fingerprint  
- “Unspoofable” claims  
- 30107 as proof against injection or coercion  

---

## Public sentences

> Biometrics on The Remote Viewer are an **optional local unlock** for on-device keys. They are not identity, not recovery, and not a substitute for destroy = restart.

> Spoofing vectors include physical artifacts, replay, deepfakes, and pipeline injection. TRV assumes presentation risk on local sensors and rejects remote biometric proofing as a root of trust.

> Prompting for fingerprint is not the same as **auth-bound Keystore** keys. Production sensitive ops must bind crypto to Class 3 auth or device credential.

---

This document states **constraints**. It does not claim a finished biometric product.
