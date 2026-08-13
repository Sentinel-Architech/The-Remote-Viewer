# Concepts → Reality Status

Last updated: **2026-08-13** (Path B recognition loop + pool gross + validated-node counts + optional tips + prior mobile UI / Hydra / vending / verifier)

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
| Mobile Shop (TRV credits / Solana / NFT mint / Aurora Borealis) | **DEMONSTRATED** | Credits balance, wallet connect, tiered mint, skin redeem/wear, field claim AR on-device 2026-08-13 |

## Transparency surfaces (requested)

| Concept | Status |
|---------|--------|
| Local console UI (Path B / Pool / Nodes cards) | **PROVEN** | `apps/ui` — copy-to-Termux; 127.0.0.1 only |
| Community Pool gross visibility | **OPERATIONAL** | `modules/pool/gross.sh` — public Solana memo volume; no custody; net not protocol-defined |
| Validated-node count (per identity path) | **OPERATIONAL** | `modules/nodes/count.sh` |
| Optional public tip publish + collect | **OPERATIONAL** | `modules/nodes/publish-tip.sh` + `collect-tips.sh` — no central registry |

## RAG & chat

| Concept | Status |
|---------|--------|
| Chunk ingest + seed docs | **SCAFFOLD** (exercised on reference node) |
| BM25 ranker (`modules/rag/bm25.py`) | **SCAFFOLD** (exercised) |
| TF-IDF vector index + hybrid retrieve | **SCAFFOLD** (exercised; 12 vectors on ref node) |
| Session memory (`memory.sh`) | **SCAFFOLD** |
| `scripts/chat.sh` front door | **SCAFFOLD** |
| Neural llama.cpp embeddings | **OPTIONAL** (falls back to TF-IDF) |

## Ops & sovereignty

| Concept | Status |
|---------|--------|
| Defense / Hydra multi-head | **PROVEN** | seal + contribution + sales verifier + quarantine gate; PASS on GrapheneOS/Termux 2026-08-07 |
| Contribution ledger | **PROVEN** | verify OK + verifier weight on reference node |
| Local operator UI `127.0.0.1` | **PROVEN** | `apps/ui` console — copy-to-Termux commands; Hydra/vending/verifier/Path B/Pool/Nodes heads; no shell exec in browser |
| Mobile client UI (Hub / Profile / Shop / Talk) | **DEMONSTRATED** | Full navigation, quick post, private message, linked social, wallet, NFT, Aurora skins, field claim on-device 2026-08-13 |
| Termux reminders | **SCAFFOLD** |
| Chain settlement / live DePIN | **NOT STARTED** |

## Current counts (honest)

| Metric | Value |
|--------|------:|
| Path B Founding Members (external) | 0 |
| Validated nodes (distinct identity paths, observed) | originator-scale |
| Community Pool gross | public Solana memo volume (re-derive via `modules/pool/gross.sh`) |

## Reference environment

GrapheneOS + Termux + mobile client, branch `TheRemoteViewer`, status as of 2026-08-13.
