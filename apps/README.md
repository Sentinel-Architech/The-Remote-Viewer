# Client Applications (Scaffold Only)

**Status:** Scaffold / foundation only  
**Date:** July 25, 2026

This directory contains the **starting structure** for web and mobile clients of The Remote Viewer.

## Critical Notice

**This is not a secure, production-ready DApp.**

- No selective disclosure (SD-JWT / BBS+) is implemented.
- No OpenID4VCI / OpenID4VP flows are implemented.
- No hardware-backed keys, Bitstring Status List, or burn/destroy logic is implemented.
- No claim is made that identity, Vault, or membership security is active.

All real security behavior is defined in the locked documents under [`docs/locked/`](../docs/locked/).  
Implementation must follow the [Implementation Roadmap](../docs/locked/07-Implementation-Roadmap.md) and especially the [Phase 2 Privacy Technical Design](../docs/locked/08-Phase2-Privacy-Technical-Design.md).

## Structure

```
apps/
├── web/          # Web client scaffold (Vite + React + TypeScript)
├── mobile/       # Mobile client scaffold (Expo + React Native + TypeScript)
└── shared/       # Shared types, constants, and interfaces only
```

## Relationship to Locked Principles

| Locked Document | How this scaffold respects it |
|-----------------|--------------------------------|
| Identity Layer | Modules are named and separated so identity can be added without central personal data stores |
| Vault Principles | No Vault access code exists; boundary is documented |
| Destroy = Restart | No identity state is persisted in a way that pretends to be burn-capable yet |
| Implementation Roadmap | Folder layout follows Phase 0 → Phase 1 readiness |
| Phase 2 Privacy Design | Privacy modules are placeholders only; real crypto comes later |

## Next Real Work

See `docs/locked/07-Implementation-Roadmap.md` Phase 0 and Phase 1.
