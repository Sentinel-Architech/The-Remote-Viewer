# Security Policy

## Project Purpose

This repository contains The Remote Viewer / Sentinel Security Protocol — local-first, zero-custody, optical air-gap systems and related scaffolds. Design prioritizes user-held keys and no centralized backdoors.

## Supported Versions

| Version / Branch | Supported |
|------------------|-----------|
| TheRemoteViewer | Yes (active) |
| Other | Limited (research) |

## Reporting a Vulnerability

**Do not open public issues for active key/fund risk.**

1. Open a **private GitHub Security Advisory** on this repository, **or**
2. Contact the maintainer through an encrypted channel.

Include: description, reproduce steps, affected component, impact. **Never send seed phrases or private keys.**

Acknowledgment target: 72 hours. High-severity mitigation plan target: 14 days.

## Scope

**In scope:**
- Cryptographic tooling (age, optical air-gap, key handling)
- Hydra / defense modules
- `solana/programs/trv_governance` and related scripts
- Edge / local model handling that touches private data
- Integrity of safety **reporting** pipelines (when implemented)

**Out of scope:**
- Social engineering of individual Viewers
- Physical attacks on personal hardware
- Already-disclosed third-party dependency issues
- Theoretical attacks with no practical path

## CSAM / child exploitation

**Not a bug-bounty category.** Use in-product **Integrity report** when live, NCMEC CyberTipline (US), and law enforcement. See `docs/locked/SAFETY.md`.

## Principles

- No expectation of centralized trust for Viewer vaults
- Repo logging ≠ visibility into encrypted runtime state of private deployments
- Coordinated disclosure preferred before public write-ups

## Contact

Private GitHub Security Advisories or maintainer encrypted channels listed with the project.
