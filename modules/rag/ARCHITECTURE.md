# RAG architecture (TRV on-device)

```text
  User question
       │
       ▼
  ┌─────────────┐
  │ 1. Memory   │  session.txt (what you already said)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ 2. Retrieve │  keyword score over chunks/ (+ ability boost)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ 3. Pack     │  plain words, length-capped context block
  └──────┬──────┘
         │
    ┌────┴────┐
    ▼         ▼
 extract    generate
 (strict)   (llama.cpp + rules)
```

## Stages

| Stage | Script | Role |
|-------|--------|------|
| Ingest | `ingest.sh` / `seed-trv-docs.sh` | Docs → chunks |
| Memory | `memory.sh` | Append/dump user turns |
| Retrieve | `retrieve.sh` | Top chunks as **plain text** |
| Extract | `ask-strict.sh` | Answer = notes only |
| Generate | `ask.sh` | Notes + memory + model |
| Chat | `scripts/chat.sh` | Front door |

## Indexing methods (this node)

- **Now:** lexical keyword counts + ability boost  
- **Not yet:** embeddings / HNSW / hybrid RRF  
- **Fit for phone:** lexical is intentional  

## Trust

- **Notes** = durable facts you wrote  
- **Memory** = recent things you said in chat  
- **Model** = fluent layer; can still err on world knowledge  
