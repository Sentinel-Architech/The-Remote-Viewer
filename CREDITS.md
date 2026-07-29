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
  - Fast build tool and dev server
- **React** - [facebook/react](https://github.com/facebook/react) - MIT License
  - UI library for web scaffold
- **TypeScript** - [microsoft/TypeScript](https://github.com/microsoft/TypeScript) - Apache 2.0 License
  - Type safety across codebase
- **@vitejs/plugin-react** - MIT License
  - React plugin for Vite

### Mobile Client
- **Expo** - [expo/expo](https://github.com/expo/expo) - MIT License
  - Cross-platform React Native development framework
- **React Native** - [facebook/react-native](https://github.com/facebook/react-native) - MIT License
  - Mobile app framework
- **Expo Go** - MIT License
  - Development and testing client

### Desktop
- **Rust** - [rust-lang/rust](https://github.com/rust-lang/rust) - MIT/Apache 2.0 Dual License
  - Systems programming language
- **Cargo** - Rust's package manager (included with rustup)

### CI/CD & Security
- **GitHub Actions** - [actions](https://github.com/actions)
  - Workflow automation
- **Gitleaks** - [gitleaks/gitleaks-action](https://github.com/gitleaks/gitleaks-action)
  - Secret scanning for CI

---

## Design & Architecture Inspiration

### Zero-Trust & Security Concepts
- General principles inspired by the decentralized identity and zero-trust security communities
- No specific code attribution, but conceptual debt to discussions in:
  - W3C DIDs (Decentralized Identifiers)
  - OpenID for Verifiable Credentials (OpenID4VC)
  - GrapheneOS hardening documentation

### Local-First Design
- Inspired by local-first software principles and discussions in the indie developer community
- Building on patterns from projects emphasizing user data sovereignty

---

## Community & Standards

- **Apache 2.0 License** - Chosen to align with grok-build and promote open collaboration
- **GitHub Community** - For documentation templates and best practices

---

## How to Contribute with Attribution

If you use code or patterns from The Remote Viewer in your own projects:

1. Link back to this repository: https://github.com/Sentinel-Archetecht/The-Remote-Viewer
2. Mention the Apache 2.0 license
3. Note any specific components you adapted (e.g., "adapted from TRV's desktop orchestrator")
4. Include this file or a summary in your project's credits

Example:
```
# Credits

This project uses code patterns from:
- The Remote Viewer (https://github.com/Sentinel-Archetecht/The-Remote-Viewer) - Apache 2.0
  - Adapted desktop orchestrator structure
```

---

## Questions or Corrections?

If you notice missing attributions or have questions about licensing and credit, please:
- Open an issue: [Issues](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues)
- See our [SECURITY.md](SECURITY.md) for responsible disclosure
- Contact: See repository contact info

---

**Last updated:** July 2026  
**License:** This credits file is part of The Remote Viewer, licensed under Apache 2.0
