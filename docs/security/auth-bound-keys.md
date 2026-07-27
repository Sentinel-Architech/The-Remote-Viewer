# Auth-bound keys (Android Keystore policy)

**Status:** Design posture — implement when mobile identity leaves scaffold  
**Updated:** 2026-07-27  
**Related:** `docs/security/biometrics.md`, `docs/security/threat-model.md`

---

## Problem

`BiometricPrompt` / `expo-local-authentication` alone is a **UI gate**.  
A compromised app process after unlock can still use material sitting in SecureStore unless **cryptographic operations require AuthTokens**.

## Policy (TRV)

| Setting | TRV default |
|---------|-------------|
| Hardware backing | Prefer **StrongBox** when available; else TEE-backed Keystore |
| User auth required | **Yes** for high-impact keys |
| Auth types | `AUTH_BIOMETRIC_STRONG` **or** `AUTH_DEVICE_CREDENTIAL` |
| Validity window | **0** (per-operation) for export / burn / recovery display / presence sign of high value |
| Validity window | Short (e.g. 30–120s) only for low-impact session crypto if needed |
| `invalidatedByBiometricEnrollment` | **true** for vault/identity-wrapping keys |

## Operation tiers (see also threat model)

| Tier | Examples | Auth |
|------|----------|------|
| T0 Public | Display truncated DID, scaffold UI | None |
| T1 Local read | Open non-secret journal metadata | Optional |
| T2 Key use | Sign presence, decrypt vault body | Strong biometric **or** device credential; prefer per-op |
| T3 Irreversible | Destroy identity, export recovery material | Per-op auth + explicit confirm UI |

## Expo reality

- `expo-secure-store` + `expo-local-authentication` ≈ convenience unlock of stored blobs.  
- Full Keystore auth-binding and StrongBox flags typically need a **dev client / prebuild** and native modules.  
- Scaffold may store hex in SecureStore; production path should **wrap** secrets with auth-bound Keystore keys.

## Non-goals

- Biometric-only keys with no device-credential fallback  
- Claiming StrongBox on devices that lack it  
- Treating prompt success as proof of remote identity  
