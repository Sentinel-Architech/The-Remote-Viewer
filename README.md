# The Remote Viewer

**Local-first • Zero-trust • Sovereign**

The Remote Viewer is a decentralized application focused on true digital sovereignty. It aims to turn your device into a self-contained, high-assurance vault with Faraday-grade isolation, autonomous verification, and no reliance on centralized services.

> **Current Status (July 2026)**  
> This repository is in early development.  
> Web and mobile clients are **scaffolds only** — they are not secure and do not yet implement identity, cryptography, or vault features.  
> Real implementation follows the locked principles and roadmap in [`docs/locked/`](docs/locked/).

## Vision

- No tracking, no backdoors, no data extraction  
- Local-first architecture with optional peer-to-peer networking  
- High-assurance identity using W3C DIDs, Verifiable Credentials, and zero-knowledge proofs  
- Post-quantum cryptography and hardware-backed security primitives  
- User-controlled “Destroy = Restart” recovery model  

## ## What’s Implemented Today

| Component              | Status     | Notes                                      |
|------------------------|------------|--------------------------------------------|
| Mobile Presence Proof  | Working    | First real vertical slice (local only)     |
| Web client             | Scaffold   | Vite + React + TypeScript                  |
| Mobile client          | Scaffold   | Expo + React Native + Presence screen      |
| Core protocol / Identity | Not started | See roadmap                              |
| P2P / Networking       | Not started |                                            |

### Mobile Presence Proof (New)
A local-only presence system that:
- Generates a short-lived signed presence proof
- Shows live countdown
- Includes a one-tap **Destroy Presence** that wipes keys and proof (“Restart from square one”)

Located in `apps/mobile`. Still early and not production-ready.
## Quick Start (Scaffold Only)

```bash
# Web
cd apps/web
npm install
npm run dev

# Mobile
cd apps/mobile
npm install
npm start
