# Concepts → Reality Status

Last updated: **2026-08-14** (on-device connection list — Social Layer slice 1; Sovereign Social Layer locked; high-friction Destroy gate; Phase 1 demo VC; mobile did:key; beacon + Path B surfaces)

**Rule:** No marketing. **PROVEN** = ran under user control on device. Scripts in git alone are not PROVEN.

## Enhanced Intelligence — The Sentinel (MoE)

| Stage | Status | Notes |
|-------|--------|-------|
| A Process experts | **SCAFFOLD** | experts.json / route.sh |
| B Dense multi-model | **PROVEN** | TinyLlama + Qwen2.5-Coder on Termux |
| C Sparse MoE weights | **PROVEN** | TinyMixtral-4x248M-MoE load+gen |
| D IA of IA | **DESIGN** | |

## Transport & identity

| Concept | Status |
|---------|--------|
| Optical air-gap (age + Soliton LT) | **PROVEN** |
| Local age identity | **PROVEN** (device-held; not in git) |
| Centralized key assignment | **REJECTED** |
| Mobile Viewer ID (npub) + profile | **DEMONSTRATED** | Create / export / remove / linked social (X) / private message flows on-device 2026-08-13 |
| Mobile did:key (Ed25519) + SecureStore | **DEMONSTRATED** | Hardened options; high-friction typed-DID Destroy gate; Expo Go exploration-only 2026-08-14 |
| Local demo VC (issue / store / list / destroy-with-identity) | **DEMONSTRATED** | Phase 1 first cut; wiped on Destroy 2026-08-14 |
| Sovereign Social Layer (design) | **LOCKED** | `docs/locked/14` — on-device list + optional Nostr publication; social state dies with identity |
| On-device connection list (add / remove / list) | **DEMONSTRATED** | Slice 1; SecureStore; wiped on Destroy; no relays 2026-08-14 |

## Digital vending & first validator role

| Concept | Status |
|---------|--------|
| Path B USDC memo + TRVL deliver | **PROVEN** | Solana memo → local deliver on GrapheneOS/Termux |
| `sales.log` sha256 + empty-frame refuse | **PROVEN** | log-sale + verifier |
| Integrity Verifier (contribution + sales) | **PROVEN** | overall_ok=1 attestation on-device 2026-08-07 |
| Contribution weight from verifier | **PROVEN** | record-weight → events.jsonl |
| Path B Founding + node option (design) | **LOCKED** | `docs/locked/04` + `17` |
| Path B FINISHED checklist (public) | **PUBLISHED** | `docs/public/PATH-B-FINISHED.md` |
| Path B recognition package | **OPERATIONAL** | collect-proof → make-attestation → verify-submission → issue-founding → install-founding |
| Path B builder guide | **PUBLISHED** | `docs/public/PATH-B-BUILDER.md` |
| Public buy page (`buy.html` + QR) | **OPEN** | static storefront |
| Mobile Shop (TRV credits / Solana / NFT mint / Aurora Borealis) | **DEMONSTRATED** | on-device 2026-08-13 |
| Validator beacon (ed25519 signed liveness) | **PROVEN** | |
| Continuous Termux beacon loop | **IMPLEMENTED** | |
| Stage 1 bootstrap validator list + Path B liveness gate | **OPERATIONAL** | 1-of-1 originator |

## Transparency surfaces (requested)

| Concept | Status |
|---------|--------|
| Local console UI (Path B / Pool / Nodes cards) | **PROVEN** | `apps/ui` |
| Community Pool gross visibility | **OPERATIONAL** | |
| Validated-node count (per identity path) | **OPERATIONAL** | |
| Optional public tip publish + collect | **OPERATIONAL** | |

## RAG & chat

| Concept | Status |
|---------|--------|
| Chunk ingest + seed docs | **SCAFFOLD** |
| BM25 ranker | **SCAFFOLD** |
| TF-IDF vector index + hybrid retrieve | **SCAFFOLD** |
| Session memory | **SCAFFOLD** |
| `scripts/chat.sh` front door | **SCAFFOLD** |
| Neural llama.cpp embeddings | **OPTIONAL** |

## Ops & sovereignty

| Concept | Status |
|---------|--------|
| Defense / Hydra multi-head | **PROVEN** | |
| Contribution ledger | **PROVEN** | |
| Local operator UI `127.0.0.1` | **PROVEN** | |
| Mobile client UI (Hub / Profile / Shop / Talk) | **DEMONSTRATED** | |
| Mobile did:key + high-friction Destroy + demo VCs + connections | **DEMONSTRATED** | 2026-08-14 |
| Termux reminders | **SCAFFOLD** |
| Chain settlement / live DePIN | **NOT STARTED** |

## Current counts (honest)

| Metric | Value |
|--------|------:|
| Path B Founding Members (external) | 0 |
| Validated nodes (distinct identity paths, observed) | originator-scale |
| Community Pool gross | public Solana memo volume (re-derive via `modules/pool/gross.sh`) |

## Reference environment

GrapheneOS + Termux + mobile client, branch `TheRemoteViewer`, status as of 2026-08-14.
