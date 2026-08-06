# Concepts → Reality Status

Last updated: **2026-08-06** (RAG BM25 + vectors + chat memory)

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
| Defense / Hydra integrity pulse | **SCAFFOLD** (PASS on reference node) |
| Contribution ledger | **SCAFFOLD** (verify OK on reference node) |
| Termux reminders | **SCAFFOLD** |
| UI `127.0.0.1` | **SCAFFOLD** |
| Chain settlement / live DePIN | **NOT STARTED** |

## Reference environment

GrapheneOS + Termux, branch `TheRemoteViewer`, 2026-08-06.
