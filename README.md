# The Remote Viewer

**Local-first · Zero-trust · On-device identity · No platform custody · Install-anywhere**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Sentinel-Archetecht.The-Remote-Viewer&left_color=%231a1a1a&right_color=%2300e676&left_text=Visitors)

[![CI](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml)
[![Posture Pack](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml)

Repository: [github.com/Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer)

---

## Today — 2026-07-30 / 2026-07-31

### Mobile Identity Hardening (earlier)
- Replaced `@noble/ed25519` with **tweetnacl** (pure JS, no WebCrypto dependency)
- Removed all Node `Buffer` usage from the mobile did:key path
- Hardened SecureStore options (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`)
- Added Create → Destroy → Assert Empty smoke test
- Zeroize on destroy
- Honest documentation: Expo Go is exploration-only

### Local Multi-Expert Sentinel (new)
- Successfully compiled and ran `llama.cpp` on Pixel 7 (GrapheneOS + Termux)
- Loaded Qwen2.5-1.5B-Instruct (Q4_K_M) fully on-device
- Built four specialized expert system prompts:
  - Security Expert
  - Protocol Expert
  - Privacy Expert
  - Coordinator
- Created interactive launcher for selecting and querying experts offline
- All inference remains local, offline, and under user control

This continues the core direction: no cloud dependency for reasoning, keys and intelligence stay on the device.

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

### 2. Run the web scaffold

```bash
cd apps/web
npm install
npm run dev
```

### 3. Run the mobile scaffold (optional)

```bash
cd apps/mobile
npm install
npx expo start --host lan
```

### What is real right now?

| Piece | Status |
|-------|--------|
| Web client | Scaffold only |
| Mobile client | Scaffold + local identity experiments |
| Local multi-expert AI (Sentinel) | Working on-device (Pixel 7 / GrapheneOS) |
| Desktop orchestrator | Early — can compile and run |
| Design principles | Written and locked under `docs/locked/` |
| Security policy | Real (`SECURITY.md`) |
| CI (secret scan + cargo check) | Working |

---

## Builder — Zero-trust / crypto

The Remote Viewer (TRV) is a sovereign, local-first stack oriented toward **encrypted, zero-trust** use: identity and sensitive material stay on the user’s device. The companion direction is **Sentinel**—active defense, governance concepts, and local multi-expert AI built on the same constraints.

### Trust posture

| Transparent (public) | Never public |
|----------------------|--------------|
| Goals, non-goals, architecture direction | Private keys, seeds, mnemonics |
| Known limitations and honest status | `.env`, API tokens, wallet keypairs |
| Scaffold code and design docs | Anything that enables custody |
| “Destroy = Restart” as a product rule | Fake recovery theater |
| Install-anywhere / no device blacklist | Play Integrity as a gate |

### Current status (July 2026)

| Component | Status | Notes |
|-----------|--------|--------|
| Web client | Scaffold | Vite + React + TypeScript |
| Mobile client | Scaffold + progress | Expo + React Native; local identity work |
| Local multi-expert AI | Functional | On-device experts (Security / Protocol / Privacy / Coordinator) via llama.cpp on GrapheneOS |
| Shared packages | Early | Types / treasury placeholders |
| Locked design docs | In tree | `docs/locked/` |
| Security notes | Draft + growing | `docs/security/` |
| Core protocol / P2P | Early / partial | Not production |
| CI | Working | Gitleaks + cargo check |

---

## Packs / vending

**Status: early / manual only — not a live store.**

Free path stays free. Optional paid posture materials may be offered later via Phantom / Solana. No live in-app checkout exists yet.

---

## Security contact

See [`SECURITY.md`](SECURITY.md). Do not file secrets in issues.

---

## License

See the `License` file in the repository root.
