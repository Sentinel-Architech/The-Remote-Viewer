# The Remote Viewer

**Local-first · Zero-trust · On-device identity · No platform custody · Install-anywhere**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Sentinel-Archetecht.The-Remote-Viewer&left_color=%231a1a1a&right_color=%2300e676&left_text=Visitors)

[![CI](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml)
[![Posture Pack](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml)

Repository: [github.com/Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer)

---

## Live Proof — Sentinel LLM (Coordinator Expert)

**Operational on-device. 2026-07-31.**

This is not a slide deck. This is not a mock.

The **Sentinel** intelligence layer is running fully local:

- **Runtime**: `llama.cpp`
- **Model**: `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf`
- **Host**: GrapheneOS + Termux on Pixel 7
- **Role**: Coordinator expert inside The Remote Viewer

The Coordinator is the routing brain of the specialist system:

1. Security  
2. Protocol  
3. Privacy  
4. **Coordinator** (this instance)

It decides which expert answers, enforces domain boundaries, and produces structured zero-trust responses.

Verified live behaviors captured:

- Explains how Sentinel works together with The Remote Viewer (Local Identity Management, On-Device AI, Zero-Trust Architecture, Enhanced Intelligence, Privacy)
- Defines **Destroy = Restart** as the complete wipe-and-reinitialize of any previously trusted state so the device returns to a clean trust baseline
- Articulates why on-device inference beats cloud AI on data privacy, security, latency, network exposure, and user control

No cloud endpoint. No API key. No third-party weights. Prompts never leave the device. Keys and identity stay under user custody.

This is the proof that the Sentinel system is already operational at the edge.

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

*(Continue with existing setup instructions in the repo and docs/locked/ for the full zero-trust path.)*

---

## Core Posture

- Local-first
- Zero-trust
- On-device identity & keys
- No platform custody
- Destroy = Restart
- Specialist experts (Security / Protocol / Privacy / Coordinator)
- Edge AI under user control

See `docs/locked/` and `Sentinel Paradigm` for the full architectural and legal framing.

---

**Digital sovereignty is not a slogan. It is a terminal that never phones home.**
