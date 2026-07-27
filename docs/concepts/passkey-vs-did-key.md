# Passkeys vs local `did:key`

**Status:** Decision memo (not locked)  
**Updated:** 2026-07-27

---

## Comparison

| Dimension | Platform passkey (WebAuthn/FIDO) | Local `did:key` (TRV scaffold) |
|-----------|----------------------------------|--------------------------------|
| Key storage | Platform authenticator / hardware | App + SecureStore → Keystore path |
| UX | System biometric / PIN | App-defined |
| Multi-device | Ecosystem sync (tension with no-recovery) | Explicitly single-device unless user exports |
| Identity model | Relying-party scoped credentials | Portable DID string, app-defined graph |
| Sovereignty narrative | Platform-mediated | Matches locked local-first docs |
| Implementation cost | Lower for “login” | Higher for full stack |

## Recommendation (Phase 0–1)

1. **Keep `did:key` as the sovereign identity plane** for TRV (aligns with locked identity / destroy = restart).  
2. **Optionally** use platform auth-bound keys / passkey-style primitives only as **device unlock of local wrappers**, not as the public identity.  
3. Do **not** replace destroy = restart with platform credential sync recovery.  
4. Revisit if a specific RP or OS API becomes mandatory for a payment edge — still split planes.

## Non-decision

This memo does not lock library choices or mainnet identity contracts.
