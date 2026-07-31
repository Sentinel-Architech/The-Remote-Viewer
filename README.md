# The Remote Viewer

**Local-first · Zero-trust · On-device identity · No platform custody · Install-anywhere**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Sentinel-Archetecht.The-Remote-Viewer&left_color=%231a1a1a&right_color=%2300e676&left_text=Visitors)

[![CI](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml)
[![Posture Pack](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml)

Repository: [github.com/Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer)

---

## Today — 2026-07-30 (Mobile Identity Hardening)

Heavy focus on making **on-device did:key** actually reliable under real constraints (Expo Go + GrapheneOS / Pixel).

### What landed

- Replaced `@noble/ed25519` with **tweetnacl** (pure JS, no WebCrypto dependency)
- Removed all Node `Buffer` usage from the mobile did:key path
- Hardened SecureStore options:
  - `WHEN_UNLOCKED_THIS_DEVICE_ONLY`
  - Authentication requirements made explicit (disabled only for Expo Go exploration)
- Added Create → Destroy → Assert Empty smoke test button
- Zeroize on destroy
- Honest documentation: Expo Go is exploration-only; production builds stay strict
- Multiple polyfill and import path cleanups
- Dozens of commits of pure mobile crypto reliability work

This is the unglamorous foundation work required for real local-first identity.  
No cloud. No custody. Keys live and die on the device.

The web and desktop sides remain scaffolds. Mobile identity is now significantly more honest under real device constraints.

---

## Two ways in

| Path | Who it’s for |
|------|----------------|
| **[Hobbyist — Start from nothing](#hobbyist--start-from-nothing)** | You have never worked on this kind of project. You just want to get something running and explore. |
| **[Builder — Zero-trust / crypto](#builder--zero-trust--crypto)** | You already care about local keys, no custody, and honest loss semantics. |

**Free stays free.** Optional paid packs may be offered later via Phantom / Solana.  
**There is no live in-app shop checkout yet.** See [Packs / vending](#packs--vending).

---

## Hobbyist — Start from nothing

This project is still early. Most of the mobile and web clients are **scaffolds** (structural placeholders). That is fine. You can still learn the shape of the system and run the pieces that exist.

### What you need

- A computer (Linux, macOS, or Windows with WSL is easiest)
- [Node.js](https://nodejs.org/) (LTS version)
- [Rust](https://rustup.rs/) (only if you want to touch the desktop binary)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
```
