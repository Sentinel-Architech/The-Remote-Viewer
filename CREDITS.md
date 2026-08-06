# Credits & Attributions

This project uses components, design patterns, and inspiration from several open-source projects. We are grateful to the communities behind these projects for their work.

---

## Primary Sources

### grok-build
- **Source:** [xai-org/grok-build](https://github.com/xai-org/grok-build)
- **License:** Apache 2.0
- **Used in:** The-Remote-Viewer (desktop TUI harness, agent integration patterns)
- **What we use:** Coding agent harness architecture, terminal UI framework, extensible plugin system, fullscreen mouse-interactive design patterns
- **Attribution:** The Remote Viewer's desktop orchestrator builds on architectural patterns from grok-build's agent harness and TUI implementation.
- **Link:** https://github.com/xai-org/grok-build

---

## Framework & Tooling

### Web Client
- **Vite** - [vitejs/vite](https://github.com/vitejs/vite) - MIT License
- **React** - [facebook/react](https://github.com/facebook/react) - MIT License
- **TypeScript** - [microsoft/TypeScript](https://github.com/microsoft/TypeScript) - Apache 2.0 License
- **@vitejs/plugin-react** - MIT License

### Mobile Client
- **Expo** - [expo/expo](https://github.com/expo/expo) - MIT License
- **React Native** - [facebook/react-native](https://github.com/facebook/react-native) - MIT License

### Desktop
- **Rust** - [rust-lang/rust](https://github.com/rust-lang/rust) - MIT/Apache 2.0 Dual License
- **Cargo** - Rust's package manager (included with rustup)

### CI/CD & Security
- **GitHub Actions** - [actions](https://github.com/actions)
- **Gitleaks** - [gitleaks/gitleaks-action](https://github.com/gitleaks/gitleaks-action)

---

## Design & Architecture Inspiration

### Zero-Trust & Security Concepts
- General principles inspired by the decentralized identity and zero-trust security communities
- Conceptual debt to discussions in:
  - W3C DIDs (Decentralized Identifiers)
  - OpenID for Verifiable Credentials (OpenID4VC)
  - GrapheneOS hardening documentation

### Local-First Design
- Inspired by local-first software principles and discussions in the indie developer community

---

## Licensing Note

This repository itself is distributed under the **Source-Available Master License (Absolute Sovereign Edition)** — see the root `LICENSE` file. Third-party components retain their original licenses as listed above.

---

## How to Contribute with Attribution

If you use code or patterns from The Remote Viewer in your own projects (where permitted by the LICENSE):

1. Link back to this repository: https://github.com/Sentinel-Archetecht/The-Remote-Viewer
2. Respect the root LICENSE terms
3. Note any specific components you adapted
4. Include this file or a summary in your project's credits

---

**Last updated:** August 2026
