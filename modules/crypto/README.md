# Crypto Module — Posture & Primary Sources

**Status:** DESIGN guidance + library selection. Not a from-scratch PQC implementation.

## Proven today

| Capability | Implementation | Notes |
|------------|----------------|-------|
| Local secret encryption | **age** (X25519 + ChaCha20-Poly1305) | Used in optical-airgap; Destroy = Restart |
| Optical transport integrity | Robust Soliton LT + framing | Sentinel Standard |

## Post-quantum standards (NIST — use these, do not invent)

Primary sources (final FIPS, Aug 2024):

| Standard | Algorithm | Role |
|----------|-----------|------|
| [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final) | **ML-KEM** (formerly Kyber) | Key encapsulation |
| [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final) | **ML-DSA** (formerly Dilithium) | Primary signatures |
| [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final) | **SLH-DSA** (formerly SPHINCS+) | Backup / hash-based signatures |

NIST statement: these *can and should be put into use now* for migration planning.  
Overview: https://www.nist.gov/pqcrypto

**TRV rule:** Integrate maintained open implementations (e.g. liboqs, pqcrypto crates) when a concrete need exists. Do **not** reimplement lattice/hash PQC in this repo as original math.

## Media sanitization (Destroy = Restart alignment)

- [NIST SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final) — Guidelines for Media Sanitization (Sep 2025)
- Cryptographic erase is recognized when keys are properly destroyed and data was encrypted under those keys.
- Local `modules/data-sovereignty/destroy-restart.sh` implements user-controlled path wipe consistent with “what is not retained cannot be produced.”

## Explicit non-goals (this module)

- Homomorphic encryption production stack
- Custom ZK-STARK / Bulletproofs prover from first principles
- Centralized KMS or escrow

Former root notes on those topics are historical only (git history).

## When to expand code here

1. Concrete threat requires PQC hybrid KEM/signature alongside age
2. A maintained library is vendored or depended with reproducible builds
3. Interop test vectors from NIST CAVP / reference implementations pass on-device

Until then, **age + optical path remains the real crypto surface.**
