# The Remote Viewer

**Local-first · Zero-trust · On-device identity · No platform custody · Install-anywhere**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Sentinel-Archetecht.The-Remote-Viewer&left_color=%231a1a1a&right_color=%2300e676&left_text=Visitors)

[![CI](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml)
[![Posture Pack](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml)

Repository: [github.com/Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer)

---

## Two ways in

| Path | Who it’s for |
|------|----------------|
| **[Hobbyist — Start from nothing](#hobbyist--start-from-nothing)** | You have never worked on this kind of project. You just want to get something running and explore. |
| **[Builder — Zero-trust / crypto](#builder--zero-trust--crypto)** | You already care about local keys, no custody, and honest loss semantics. |

**Free stays free.** Optional paid packs: [vending](docs/public/VENDING.md) via **Phantom / Solana**.

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

Open the URL it prints (usually `http://localhost:5173`).  
This is a basic React + Vite shell. It is not a finished product.

### 3. Run the mobile scaffold (optional)

```bash
cd apps/mobile
npm install
npx expo start --host lan
```

Scan the QR code with Expo Go on your phone (same Wi-Fi).  
Again: this is a scaffold, not a secure wallet yet.

### 4. (Optional) Desktop binary

```bash
cd desktop
cargo run
```

Requires Rust installed via rustup.

### What is real right now?

| Piece | Status |
|-------|--------|
| Web client | Scaffold only |
| Mobile client | Scaffold only |
| Desktop orchestrator | Early — can compile and run |
| Design principles | Written and locked under `docs/locked/` |
| Security policy | Real (`SECURITY.md`) |
| CI (secret scan + cargo check) | Working |

### Where to go next as a hobbyist

1. Read `docs/public/POSTURE.md` — short explanation of what we refuse to do.  
2. Skim `docs/locked/03-Destroy-Equals-Restart.md` — the core rule of the project.  
3. Look at `desktop/src/` if you want to see the Rust side.  
4. Open issues or discussions if something is confusing.

You do not need to understand zero-knowledge proofs, DIDs, or GrapheneOS to start. Those come later if you want them.

---

## Builder — Zero-trust / crypto

The Remote Viewer (TRV) is a sovereign, local-first stack oriented toward **encrypted, zero-trust** use: identity and sensitive material stay on the user’s device. The companion direction is **Sentinel**—active defense and governance concepts built on the same constraints.

We optimize for people in the **decentralized, crypto, encrypted, and zero-trust** communities who reject “trust us with your keys.”

### Trust posture (read this first)

| Transparent (public) | Never public |
|----------------------|--------------|
| Goals, non-goals, architecture direction | Private keys, seeds, mnemonics |
| Known limitations and honest status | `.env`, API tokens, wallet keypairs |
| Scaffold code and design docs meant to be shared | Anything that enables custody or impersonation |
| “Destroy = Restart” as a product rule | Fake recovery that implies we can restore you |
| Install-anywhere / no device blacklist | Play Integrity as a gate for core use |

**Secrets stay off git.** See `.gitignore` and `docs/security/secrets.md`.

**Scaffold ≠ secure.** Mobile and web clients are structural foundations. They do **not** yet justify security claims. Locked principles live under `docs/locked/` and govern real implementation.

### Install policy

- **No device blacklist** — capability tiers, not exclusion  
- **Sideload and store both valid** — store is never the only door  
- **Obtainium + GitHub Releases** — first-class Android update path without a store  
- **Play Integrity / SafetyNet not required** for core TRV  

Full policy: [`docs/public/INSTALL.md`](docs/public/INSTALL.md)  
Release discipline: [`docs/public/RELEASE-HYGIENE.md`](docs/public/RELEASE-HYGIENE.md)  
Obtainium config template: [`docs/distribution/obtainium-config.example.json`](docs/distribution/obtainium-config.example.json)

### What we are building toward

- **On-device identity** (e.g. local `did:key`) — no issuer required for the base key  
- **Zero-trust defaults** — verify, minimize, don’t centralize custody  
- **Destroy = Restart** — lose the key material, start from square one; no platform recovery theater  
- **GrapheneOS-friendly** mobile path — hardened device as the preferred edge, not a requirement  
- **Optional P2P** later — not a mandatory cloud backend for identity  
- **Tiered participation** — full client, edge MCU, signal bearer (including pager-class roles), human offline ceremony  

### What we are not building

- Hosted key custody or “we can reset your vault”  
- Tracking-first analytics identity  
- KYC-by-default as a core protocol requirement  
- Security claims ahead of implementation  
- Device or OEM blacklists for install  

### Current status (July 2026)

| Component | Status | Notes |
|-----------|--------|--------|
| Web client | Scaffold | Vite + React + TypeScript |
| Mobile client | Scaffold | Expo + React Native; local identity experiments |
| Shared packages | Early | Types / treasury placeholders |
| Locked design docs | In tree | `docs/locked/` — product rules |
| Security notes | Draft + growing | `docs/security/` — threat model, secrets, biometrics |
| Public install policy | Documented | Obtainium + install-anywhere |
| Core protocol / P2P | Early / partial | Not production |
| Public APK on Releases | Not yet | Hygiene docs ready for first ship |
| CI | Working | Gitleaks + cargo check on every push |

Honest engineering note (mobile): React Native does not provide `crypto.getRandomValues` by default. Local key generation must use a CSPRNG polyfill (`expo-crypto` / `react-native-get-random-values`) or equivalent. This is a known RN ecosystem issue, not a “feature.”

### Quick start (scaffold only)

```bash
# Web
cd apps/web && npm install && npm run dev

# Mobile (prefer LAN on device; tunnel often breaks on Termux)
cd apps/mobile && npm install
npx expo start --host lan

# Desktop
cd desktop && cargo run
```

Match **Expo SDK** to **Expo Go**. Do not use `npm audit fix --force` casually—it can jump major Expo versions and break the client.

### For decentralized / crypto / zero-trust builders

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

## Packs / vending

Hybrid: **hobbyist path free forever**; optional paid ZIPs via **Phantom** (prices are **per pack**, not per file).

| Pack | Price | Link |
|------|-------|------|
| **Posture Lite** | **11 USDC** | [Pay with Phantom](solana:HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv?amount=11&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=The%20Remote%20Viewer&message=Posture%20Lite&memo=TRV-Posture-Lite) |
| **Posture Pack** (full) | **25 USDC** | [Pay with Phantom](solana:HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv?amount=25&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=The%20Remote%20Viewer&message=Posture%20Pack&memo=TRV-Posture-Pack) |

Details (including **Solana fees / Phantom gasless**): [`docs/public/VENDING.md`](docs/public/VENDING.md)

After payment, X DM `@_Archetecht` with the transaction signature → matching ZIP.

Network fees are in **SOL** (usually under a cent). If you’re short SOL, Phantom may offer a **gasless** send that takes a small fee from the token instead — shown in-app before confirm; not a TRV charge.

---

## Security contact

See [`SECURITY.md`](SECURITY.md). Do not file secrets in issues.

---

## License

See the `License` file in the repository root.

### Zero-Knowledge Membership
- Circuit: `protocols/zk_membership.circom`
- Improved version with nullifier, public commitment, and binary path checks
- Depth 20 (~1M leaves)
- Docs: `protocols/zk-membership.md` (or `docs/zk-membership.md`)
- Still early – full proving/verification pipeline coming next
