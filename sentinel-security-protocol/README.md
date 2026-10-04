# Sentinel Security Protocol

**100% Native Stack · Systemwide Network Security · Mixture-of-Experts Backbone**

The Sentinel Security Protocol is the exclusive systemwide security layer for The Remote Viewer network.  
It is local-first, open-source, and fully operational without any external cloud or blockchain dependency.

## Core Principle

A **Mixture of Experts (MoE)** architecture forms the backbone. Multiple specialized native experts evaluate threats, posture, integrity, and network behavior in parallel. A lightweight native router selects and combines their outputs to produce a unified security decision.

No single model or service is trusted. Consensus and specialization provide resilience.

## Design Rules (Non-Negotiable)

1. 100% native stack – TypeScript / Rust / on-device inference only.
2. Runs in-process with no required cloud call. This package does not create an air gap.
3. A caller may pass an optical status string. Ed25519 identity remains a local input. This package does not perform an optical transfer.
4. No mandatory external API, cloud model, or chain.
5. Systemwide: every node, Command Deck, and Hub instance participates under the same protocol.

## Experts (Initial Set)

| Expert | Responsibility | Native Implementation |
|--------|----------------|-----------------------|
| IntegrityExpert | Scores a supplied optical status | Does not call integrity-pulse and does not open an air gap |
| IdentityExpert | Ed25519 / citizen registration validity | NativeIdentityProvider + local vault |
| PostureExpert | Node posture & configuration drift | Local policy evaluation |
| NetworkExpert | Mesh / traffic anomaly signals | Local event stream analysis |
| ThreatExpert | Pattern & behavioral threat scoring | Lightweight native rules + optional local model |

A native **Router** aggregates expert outputs into a single SecurityDecision.

## Directory Layout

```
sentinel-security-protocol/
├── README.md                 (this file)
├── src/
│   ├── index.ts              # Protocol entry + systemwide enforcement
│   ├── router.ts             # MoE router
│   ├── experts/
│   │   ├── integrity.ts
│   │   ├── identity.ts
│   │   ├── posture.ts
│   │   ├── network.ts
│   │   └── threat.ts
│   ├── types.ts
│   └── enforcement.ts        # Systemwide policy application
├── package.json
└── tsconfig.json
```

## Status

Skeleton landed. Experts and router are being made fully operational under the native-stack rule of law.
