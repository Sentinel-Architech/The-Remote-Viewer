# Biometrics and presentation attack detection

**Status:** Design posture (not an implementation claim)  
**Audience:** Builders and reviewers of The Remote Viewer / Sentinel  
**Updated:** 2026-07-27  
**Related:** `docs/public/POSTURE.md`, `docs/security/threat-model.md`, `docs/security/secrets.md`

---

## One-line rule

Biometrics are an **optional local unlock** for on-device key use.  
They are **not** identity, **not** recovery, and **not** a substitute for destroy = restart.

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

**Implication:** Prefer a high-entropy knowledge factor as the root of local trust. Use Class 3 biometrics only as an optional gate for *using* keys that already exist on-device.

---

## Presentation attack detection (PAD)

### Definition

A **presentation attack** presents an artifact to the real sensor (printed photo, screen replay, silicone/resin mask, lifted fingerprint film).

**PAD** (often marketed as liveness / anti-spoof) tries to reject those presentations.

Governing standards (industry):

| Standard | Purpose |
|----------|---------|
| ISO/IEC 30107-1 | Framework and terms |
| ISO/IEC 30107-3 | Testing and reporting |
| ISO/IEC 30107-4 | Profile for **mobile** devices with **local** biometric recognition |

### PAD is not injection defense

| Attack | Mechanism | Typical control |
|--------|-----------|-----------------|
| Presentation | Artifact in front of the real camera/sensor | PAD / OEM liveness |
| Injection | Synthetic or replayed frames fed into the capture pipeline (virtual camera, hooks) | Pipeline integrity, attestation, IAD — **not** covered by 30107-3 alone |

Do not cite “ISO 30107 certified” as proof against injection, deepfake-into-API, or compromised OS paths.

### Metrics (for reading vendor claims)

- **APCER** — attack presentations accepted as live (security failure)
- **BPCER** — real presentations rejected (usability failure)

Independent lab results (iBeta, BixeLab, etc.) are only meaningful with stated attack species, device, and whether evaluation was local-only or cloud-assisted.

### TRV stance on PAD

| Context | Stance |
|---------|--------|
| OS Class 3 fingerprint / face on Pixel + GrapheneOS | **Inherit** OEM + platform PAD; do not reimplement in-app for system unlock |
| App-level selfie “liveness” SDKs (often cloud) | **Avoid** as load-bearing identity; conflicts with local-first / no-custody posture |
| Spatial / depth / presence experiments | Treat as **session presence** research, not recovery or sole root of trust |
| Public claims | No implied PAD lab certification unless independently obtained |

---

## Threat residuals (honest)

| Adversary / event | Biometrics + PAD help? |
|-------------------|-------------------------|
| Casual theft / shoulder surfing | Yes (faster lock, less PIN entry) |
| Physical attacker with time and sensor access | Limited — spoof and attempt-limit bypasses exist in the wild history of mobile stacks |
| Coercion | Poor — biometrics are coercible; knowledge factor + duress policy matter more |
| Malware after unlock | No |
| Lost key material (destroy = restart) | No — cannot honestly restore identity |

---

## Implementation posture (when mobile identity is real)

1. Generate and store `did:key` (or successor) **on-device only**.
2. Bind sensitive key use to **user authentication** (Class 3 biometric **or** device credential), preferably per-use or short timeout for high-impact ops.
3. Always offer **device credential fallback**.
4. Never enroll biometrics as the only path to create or “recover” identity.
5. UX copy: “Unlock local identity” — not “Sign in with fingerprint to the network.”
6. Expo/RN: `expo-local-authentication` for prompts; hardware-backed storage for material; plan native Keystore auth-binding when SecureStore limits are insufficient.
7. GrapheneOS users: document strong primary lock + optional biometric; respect tightened attempt limits.

---

## Non-goals

- Biometrics as network identity
- Cloud liveness as a substitute for local keys
- Recovery of destroyed key material via face or fingerprint
- Security marketing that outruns the scaffold

---

## Public sentence (reuse freely)

> Presentation attack detection belongs primarily at the **sensor and OS** for local unlock. The Remote Viewer does not treat app-level selfie liveness as a substitute for on-device keys, knowledge factors, or destroy = restart.

---

## References (orientation)

- Android authentication model (Gatekeeper, biometrics, Keystore AuthTokens)
- GrapheneOS features: two-factor fingerprint unlock, tightened fingerprint attempts, SE rate limiting
- ISO/IEC 30107 series (PAD framework, testing, mobile profile)
- Distinction between presentation attacks and injection attacks in remote biometric verification literature

This document states **constraints**. It does not claim a finished biometric product.
