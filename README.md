# The Remote Viewer

**Local-first · Zero-trust · On-device identity · No platform custody · Install-anywhere**

Repository: [github.com/Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer)

The Remote Viewer (TRV) is a sovereign, local-first stack oriented toward **encrypted, zero-trust** use: identity and sensitive material stay on the user’s device. The companion direction is **Sentinel**—active defense and governance concepts built on the same constraints.

We optimize for people in the **decentralized, crypto, encrypted, and zero-trust** communities who reject “trust us with your keys.”

---

## Trust posture (read this first)

| Transparent (public) | Never public |
|----------------------|--------------|
| Goals, non-goals, architecture direction | Private keys, seeds, mnemonics |
| Known limitations and honest status | `.env`, API tokens, wallet keypairs |
| Scaffold code and design docs meant to be shared | Anything that enables custody or impersonation |
| “Destroy = Restart” as a product rule | Fake recovery that implies we can restore you |
| Install-anywhere / no device blacklist | Play Integrity as a gate for core use |

**Secrets stay off git.** See `.gitignore` and `docs/security/secrets.md`.

**Scaffold ≠ secure.** Mobile and web clients are structural foundations. They do **not** yet justify security claims. Locked principles live under `docs/locked/` and govern real implementation.

---

## Install (policy)

- **No device blacklist** — capability tiers, not exclusion  
- **Sideload and store both valid** — store is never the only door  
- **Obtainium + GitHub Releases** — first-class Android update path without a store  
- **Play Integrity / SafetyNet not required** for core TRV  

Full policy: [`docs/public/INSTALL.md`](docs/public/INSTALL.md)  
Release discipline: [`docs/public/RELEASE-HYGIENE.md`](docs/public/RELEASE-HYGIENE.md)  
Obtainium config template: [`docs/distribution/obtainium-config.example.json`](docs/distribution/obtainium-config.example.json)

### Obtainium (when APKs are on Releases)

1. Install [Obtainium](https://github.com/ImranR98/Obtainium).  
2. Add app → `https://github.com/Sentinel-Archetecht/The-Remote-Viewer`  
3. Prefer **Latest** stable; filter APK by ABI if multiple assets exist.  

Until a release attaches an APK, Obtainium will not offer an install asset—that matches current scaffold status.

---

## What we are building toward

- **On-device identity** (e.g. local `did:key`) — no issuer required for the base key  
- **Zero-trust defaults** — verify, minimize, don’t centralize custody  
- **Destroy = Restart** — lose the key material, start from square one; no platform recovery theater  
- **GrapheneOS-friendly** mobile path — hardened device as the preferred edge, not a requirement  
- **Optional P2P** later — not a mandatory cloud backend for identity  
- **Tiered participation** — full client, edge MCU, signal bearer (including pager-class roles), human offline ceremony  

## What we are not building

- Hosted key custody or “we can reset your vault”  
- Tracking-first analytics identity  
- KYC-by-default as a core protocol requirement  
- Security claims ahead of implementation  
- Device or OEM blacklists for install  

---

## Current status (July 2026)

| Component | Status | Notes |
|-----------|--------|--------|
| Web client | Scaffold | Vite + React + TypeScript |
| Mobile client | Scaffold | Expo + React Native; local identity experiments |
| Shared packages | Early | Types / treasury placeholders |
| Locked design docs | In tree | `docs/locked/` — product rules |
| Security notes | Draft | `docs/security/` — threat model, secrets, signing, biometrics |
| Public install policy | Documented | Obtainium + install-anywhere |
| Core protocol / P2P | Early / partial | Not production |
| Public APK on Releases | Not yet | Hygiene docs ready for first ship |

Honest engineering note (mobile): React Native does not provide `crypto.getRandomValues` by default. Local key generation must use a CSPRNG polyfill (`expo-crypto` / `react-native-get-random-values`) or equivalent. This is a known RN ecosystem issue, not a “feature.”

---

## Quick start (scaffold only)

```bash
# Web
cd apps/web && npm install && npm run dev

# Mobile (prefer LAN on device; tunnel often breaks on Termux)
cd apps/mobile && npm install
npx expo start --host lan
```

Match **Expo SDK** to **Expo Go**. Do not use `npm audit fix --force` casually—it can jump major Expo versions and break the client.

---

## For decentralized / crypto / zero-trust builders

If you care about **local keys**, **no custody**, and **honest loss semantics**, this repo is meant to be legible:

**https://github.com/Sentinel-Archetecht/The-Remote-Viewer**

Useful critique:

- On-device identity UX that doesn’t lie about recovery  
- RN/Expo CSPRNG and secure storage patterns  
- GrapheneOS / hardened-Android deployment constraints  
- P2P and presence designs that don’t re-centralize trust  
- Install/update paths without Integrity hostage-taking  

Not useful as a first contribution:

- “Just add cloud backup” as the default  
- Custody or custodial recovery framed as zero-trust  

Public posture: [`docs/public/POSTURE.md`](docs/public/POSTURE.md)

---

## Security contact

See [`SECURITY.md`](SECURITY.md). Do not file secrets in issues.

---

## License

See the `License` file in the repository root.
