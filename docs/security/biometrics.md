# Biometrics, PAD, and spoofing vectors

**Status:** Design posture (not an implementation claim)  
**Audience:** Builders and reviewers of The Remote Viewer / Sentinel  
**Updated:** 2026-07-27  
**Related:** `docs/public/POSTURE.md`, `docs/security/threat-model.md`, `docs/security/secrets.md`, `docs/locked/10-Threat-Model-Key-Loss.md`

---

## One-line rule

Biometrics are an **optional local unlock** for on-device key use.  
They are **not** identity, **not** recovery, and **not** a substitute for destroy = restart.

**Spoofing does not change that rule.** Even perfect anti-spoof would not justify biometrics as root of trust or as a recovery path.

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

PAD (ISO/IEC 30107) targets **presentation**. It does **not** certify resistance to **injection**. Separate industry work (e.g. CEN/TS 18099) addresses injection assurance for remote verify pipelines.

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

### Non-sensor process vectors (easy to underweight)

| Vector | Why it matters |
|--------|----------------|
| **Coercion** | Live biometric under threat — PAD “succeeds”; knowledge factor + duress policy matter |
| **Hostile enrollment** | Attacker enrolls their own print/face while device is unlocked or supervised |
| **Unconscious / unattended use** | Biometric unlock without conscious consent |
| **Compromised OS / HAL** | Spoof or bypass below the app; app-level liveness never runs |
| **Post-unlock malware** | Session already open; biometric gate skipped |
| **Public biometric leakage** | Social photos → face spoofs; latents on shared surfaces |

---

## Presentation attack detection (PAD)

### Definition

**PAD** (liveness / anti-spoof) tries to reject presentation artifacts at the capture device.

| Standard | Purpose |
|----------|---------|
| ISO/IEC 30107-1 | Framework and terms |
| ISO/IEC 30107-3 | Testing and reporting |
| ISO/IEC 30107-4 | Profile for **mobile** devices with **local** biometric recognition |

### Metrics (for reading claims)

- **APCER** — attack presentations accepted as live (security failure)
- **BPCER** — real presentations rejected (usability failure)

Lab results are only meaningful with stated attack species, device, and local vs cloud-assisted evaluation.

### TRV stance on PAD

| Context | Stance |
|---------|--------|
| OS Class 3 fingerprint / face on Pixel + GrapheneOS | **Inherit** OEM + platform PAD; do not reimplement for system unlock |
| App-level selfie “liveness” SDKs (often cloud) | **Avoid** as load-bearing identity |
| Spatial / depth / LiDAR experiments | **Session presence** research only; document presentation + injection residuals |
| Public claims | No implied PAD/IAD lab certification unless independently obtained |

---

## Threat residuals (honest)

| Adversary / event | Biometrics + PAD help? |
|-------------------|-------------------------|
| Casual theft / shoulder surfing | Yes (faster lock, less PIN entry) |
| Physical attacker with time and sensor access | Limited — molds, path abuse, weak face unlock |
| Coercion (ADV-6) | Poor — live biometric under force |
| Malware after unlock (ADV-2) | No |
| Remote deepfake / injection rings | N/A if TRV refuses remote selfie as root of trust |
| Lost key material (destroy = restart) | No — cannot restore identity |

---

## Implementation posture (when mobile identity is real)

1. Generate and store `did:key` (or successor) **on-device only**.
2. Bind sensitive key use to **user authentication** (Class 3 biometric **or** device credential), preferably per-use or short timeout for high-impact ops (export, burn confirm, recovery display).
3. Always offer **device credential fallback**.
4. Never enroll biometrics as the only path to create or “recover” identity.
5. **Enrollment hygiene:** only enroll biometrics when the user intentionally controls the device; surface OS settings rather than silent enrollment in-app.
6. UX copy: “Unlock local identity” — not “Sign in with fingerprint to the network.”
7. Expo/RN: `expo-local-authentication` for prompts; hardware-backed storage for material; plan native Keystore auth-binding when SecureStore limits are insufficient.
8. GrapheneOS users: document strong primary lock + optional biometric; respect tightened attempt limits; document optional FP+PIN and duress separately.
9. Do not ship cloud PAD/IAD SDKs as core identity.

---

## Non-goals

- Biometrics as network identity
- Cloud liveness as a substitute for local keys
- Recovery of destroyed key material via face or fingerprint
- Claims of “unspoofable” biometrics
- Security marketing that outruns the scaffold
- Treating ISO 30107 as proof against injection or coercion

---

## Public sentences (reuse freely)

> Biometrics on The Remote Viewer are an **optional local unlock** for on-device keys. They are not identity, not recovery, and not a substitute for destroy = restart.

> Spoofing vectors include physical artifacts, replay, deepfakes, and pipeline injection. TRV assumes presentation risk on local sensors and rejects remote biometric proofing as a root of trust; knowledge factors and key destruction remain authoritative.

> Presentation attack detection belongs primarily at the **sensor and OS** for local unlock. App-level selfie liveness is not a substitute for on-device keys.

---

## References (orientation)

- Android authentication model (Gatekeeper, biometrics, Keystore AuthTokens)
- GrapheneOS: two-factor fingerprint unlock, tightened fingerprint attempts, SE rate limiting, duress PIN
- ISO/IEC 30107 series (PAD); mobile profile 30107-4
- Presentation vs injection attack literature; injection assurance work (e.g. CEN/TS 18099)
- Historical mobile fingerprint path attacks (e.g. BrutePrint-class research) as residual risk, not as a product claim about current Pixel+GrapheneOS

This document states **constraints**. It does not claim a finished biometric product.
