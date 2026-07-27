# Public posture — transparency without secrets

**Project:** The Remote Viewer / Sentinel direction  
**Repo:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer  
**Audience:** Decentralized, crypto, encrypted, and zero-trust builders  
**Updated:** July 27, 2026

---

## Principle

**Architecture can be transparent. Secrets cannot.**

We publish goals, constraints, limitations, and scaffold code so the community can critique shape and honesty. We never publish material that grants control of a user’s identity or vault.

---

## Transparent by default

- Product rules: local-first, zero-trust, no platform custody  
- **Destroy = Restart** — loss of key material means square one  
- Stack direction: GrapheneOS-friendly mobile edge, local `did:key`, optional P2P  
- **Install-anywhere / no device blacklist** — sideload, Obtainium, store; capability tiers (`docs/public/INSTALL.md`)  
- **Release hygiene** so Obtainium and sideload stay viable (`docs/public/RELEASE-HYGIENE.md`)  
- Honest status tables (scaffold vs implemented)  
- Known engineering hazards (e.g. React Native CSPRNG / `getRandomValues`)  
- Biometrics as **optional local unlock only** — not recovery, not network identity (`docs/security/biometrics.md`)  
- Security *process* docs that don’t embed live secrets (signing policy, secrets policy, threat model)  

## Never publish

| Class | Examples |
|-------|----------|
| Key material | Seeds, mnemonics, private keys, raw SecureStore dumps |
| Env / cloud | `.env`, API tokens, deploy keypairs |
| Impersonation aids | Session tokens, recovery codes we don’t productize |
| False guarantees | “We can restore your identity” |

If it lands in git by mistake: **rotate**, remove, treat history as burned for that secret. See `docs/security/secrets.md`.

---

## Trust signals we aim for

1. **Status matches reality** — scaffold is labeled scaffold  
2. **Non-goals are explicit** — custody and recovery theater are out  
3. **Mobile crypto is documented** — RN does not magically have Web Crypto  
4. **Auth honesty** — biometrics unlock local keys; they do not resurrect burned identity  
5. **Install honesty** — no Play Integrity hostage for core use; no OEM-only club; Obtainium first-class  
6. **Community invite is specific** — local-key builders, not generic hype  
7. **Repo link is stable** — https://github.com/Sentinel-Archetecht/The-Remote-Viewer  

---

## What good external input looks like

- Patterns for on-device key UX without lying about loss  
- Expo / RN CSPRNG and secure-storage battle stories  
- GrapheneOS deployment constraints  
- P2P designs that don’t reintroduce a custodial hub  
- Honest biometric / PAD residual risk (presentation vs injection)  
- Edge and signal-tier participation without fake vault claims  
- Release/Obtainium packaging feedback  

## What we will decline as a default path

- Mandatory cloud backup framed as zero-trust  
- KYC-as-core-protocol without a separate, explicit plane  
- Security marketing ahead of implementation  
- App-level cloud “liveness” as a substitute for on-device keys  
- Device blacklists or Integrity-only install gates  

---

## Relationship to private work

Some design and security detail may remain in private branches or unshared notes until it is safe and accurate to publish. **Public silence on a topic is not a claim of secrecy for its own sake**—it is often “not ready to state without misleading.”

When in doubt: publish the **constraint**, not the **key**.

---

## Related public-facing notes

| Doc | Role |
|-----|------|
| `docs/public/INSTALL.md` | Install-anywhere, tiers, Obtainium |
| `docs/public/RELEASE-HYGIENE.md` | APK / signature / Obtainium publish rules |
| `docs/distribution/obtainium-config.example.json` | Config template |
| `docs/security/biometrics.md` | Biometrics + PAD posture |
| `docs/security/threat-model.md` | System threat model (draft) |
| `docs/security/secrets.md` | Secrets policy |
| `SECURITY.md` | Reporting |

---

## Contact

- Security: `SECURITY.md`  
- Social (build-in-public): project operator’s X handle as published by the operator  
- Code: https://github.com/Sentinel-Archetecht/The-Remote-Viewer  
