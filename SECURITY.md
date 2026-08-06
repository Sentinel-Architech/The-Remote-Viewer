# Security Policy

## Project Purpose

This repository contains the Sentinel Security Protocol (TRV PROTOCOL) — an end-to-end encrypted, decentralized AI sentinel system designed for defensive research and sovereign operational use. The design prioritizes zero-trust architecture, local-first processing, and cryptographic isolation. No centralized backdoors exist by design.

## Supported Versions

| Version / Branch     | Supported          |
|----------------------|--------------------|
| TheRemoteViewer      | Yes (active)       |
| < 1.0 / other        | Limited (research) |

Only the `TheRemoteViewer` branch receives active security updates. Experimental or research branches are unsupported.

## Reporting a Vulnerability

**Do not open public issues for security vulnerabilities.**

Report privately:

1. Open a private GitHub Security Advisory on this repository, **or**
2. Contact the maintainer directly through an encrypted channel (preferred).

Include:
- Description of the issue
- Steps to reproduce
- Affected components (Hydra, spatial MFA, Edge AI, stablecoin layer, etc.)
- Potential impact

You will receive an acknowledgment within 72 hours. We aim to provide a resolution or mitigation plan within 14 days for confirmed high-severity issues.

## Scope

In scope:
- Cryptographic implementations (E2E encryption, key management, zero-knowledge components)
- Hydra Protocol active defense mechanisms
- LiDAR / spatial MFA and anatomical scanning components
- Edge AI inference and local model handling
- Decentralized governance and DAO-related security
- Any code that processes private data or cryptographic material

Out of scope:
- Social engineering of individual operators
- Physical attacks on personal hardware
- Issues in third-party dependencies that have already been disclosed upstream
- Theoretical attacks with no practical exploit path

## Security Principles

- **No expectation of centralized trust.** All sensitive operations are designed to remain local or cryptographically sealed.
- **Logging and monitoring** apply only to access of this repository and any public research endpoints. They do **not** extend into the encrypted payload or runtime state of deployed sentinel instances.
- Private operational deployments of this protocol are expected to enforce their own logging and audit policies. This repository does not claim visibility into those deployments.
- Research use does not grant license to attempt unauthorized access to live systems running this protocol.

## Disclosure Policy

We follow coordinated disclosure. Public disclosure of a vulnerability before a fix is available is strongly discouraged and may result in permanent ban from collaboration on this project.

## Contact

Maintainer contact is available via private channels listed in the repository or through GitHub Security Advisories.
