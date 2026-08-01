# The Remote Viewer

**Local-first · Zero-trust · On-device identity · No platform custody · Install-anywhere**

> "When our technology rewires how information flows, that's when invention begins."
> — **John Squires**, Director of the U.S. Patent and Trademark Office

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Sentinel-Archetecht.The-Remote-Viewer&left_color=%231a1a1a&right_color=%2300e676&left_text=Visitors)

[![CI](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/ci.yml)
[![Posture Pack](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml/badge.svg)](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/actions/workflows/build-posture-pack.yml)

Repository: [github.com/Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer)  
**Working branch for optical air-gap:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)

---

## Live Proof — Optical Air-Gap (age + Soliton LT)

**Operational on-device. 2026-07-31.** GrapheneOS\* + Termux (Pixel-class).

```
plaintext → age encrypt → Robust Soliton LT (TRVL frames) → peel → age decrypt
```

### Done

- [x] Encrypt-first with open-source **age** (Rust CLI + TS path)
- [x] **Robust Soliton** LT fountain (not RaptorQ default) — [Sentinel Standard](optical-airgap/SENTINEL-STANDARD.md)
- [x] TRVL framing + golden degree vectors (TS ↔ Rust interop)
- [x] `trv-optical` CLI: `keygen` · `encrypt` · `decrypt` · `frame-stream` · `frame-peel`
- [x] Full chain on device recovered live plaintext (`secret viewer message`)
- [x] One-shot automation script [`optical-airgap/scripts/e2e-age-lt.sh`](optical-airgap/scripts/e2e-age-lt.sh) (`$HOME` paths for Termux)
- [x] Offline QR sender/receiver HTML (no CDN in core path)
- [x] Gate v2 quality checks · FPS profiles
- [x] Open-source inventory — zero Meta / Google / Microsoft in core — [OPEN-SOURCE.md](optical-airgap/OPEN-SOURCE.md)
- [x] Workspace member so `cargo run` works under repo root
- [x] Install + troubleshooting for Termux — [INSTALL.md](optical-airgap/INSTALL.md)

### Not done / optional

- [ ] Multi-device screen↔camera optical lab (Acer ↔ phone)
- [ ] Optional jsQR vendor drop for browsers without BarcodeDetector
- [ ] `cargo vendor` offline cache (see `optical-airgap/rust/OFFLINE.md`)
- [ ] Acoustic contingency (deferred) — [PHASE2-R6.md](optical-airgap/PHASE2-R6.md)
- [ ] Exact payload-length field in LT (today: zero-pad trim)

\* GrapheneOS: install only from [grapheneos.org](https://grapheneos.org/).

**Start here:** [optical-airgap/README.md](optical-airgap/README.md) · [STATUS.md](optical-airgap/STATUS.md)

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer && git checkout TheRemoteViewer
cd optical-airgap/rust
# requires Vault files from: cargo run --quiet --bin trv-optical -- keygen
bash ../scripts/e2e-age-lt.sh
```

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
| **[Optical air-gap](optical-airgap/README.md)** | age + Soliton LT + TRVL; verified on Termux 2026-07-31. |

**Free stays free.** Optional paid packs may be offered later via Phantom / Solana.  
**There is no live in-app shop checkout yet.**

---

## Hobbyist — Start from nothing

This project is still early. Most of the mobile and web clients are **scaffolds** (structural placeholders). That is fine. You can still learn the shape of the system and run the pieces that exist.

### What you need

- A computer (Linux, macOS, or Windows with WSL is easiest) **or** GrapheneOS + Termux
- [Node.js](https://nodejs.org/) (LTS) for TS golden tests
- [Rust](https://rustup.rs/) for `trv-optical`
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer
```

### 2. Fastest real demo (optical CLI)

See [optical-airgap/INSTALL.md](optical-airgap/INSTALL.md).

---

## Builder — Zero-trust / crypto

- Local-first keys (age) — never commit `AGE-SECRET-KEY-...`
- Destroy = Restart
- No platform custody of identity
- Core path: zero Meta / Google / Microsoft runtime deps
- Spec and posture: `docs/locked/`, `Sentinel Paradigm`, [optical-airgap/SENTINEL-STANDARD.md](optical-airgap/SENTINEL-STANDARD.md)

---

## Core Posture

- Local-first
- Zero-trust
- On-device identity & keys
- No platform custody
- Destroy = Restart
- Specialist experts (Security / Protocol / Privacy / Coordinator)
- Edge AI under user control
- Optical air-gap transport under Sentinel Standard (Soliton LT)

See `docs/locked/` and `Sentinel Paradigm` for the full architectural and legal framing.

---

**Digital sovereignty is not a slogan. It is a terminal that never phones home.**
