# Sentinel Router

Hybrid router for the specialist system.

**Keyword rules first. Classifier second. Fully local.**

## Layout

```
grok/
  router/
    rules.toml          # hard keyword → skill mappings (priority ordered)
    skill_index.json    # skill ids + one-line descriptions for classifier
    route.py            # minimal offline router
    README.md
  skills/
    <skill-id>/SKILL.md
```

## Quick use (Termux / local)

```bash
cd grok/router
python route.py "how do I control severe bleeding"
python route.py "explain quantum entanglement"
python route.py "what is the derivative of x^2"
python route.py --list
python route.py --prompt "some ambiguous question"   # emits classifier prompt for the local model
python route.py --show-skill "cpr steps"
```

## Behavior

1. **Hard rules** (`rules.toml`) are evaluated in priority order.  
   `first_aid` wins over everything else. Life-safety first.
2. If no keyword hits, falls back to `coordinator`.
3. `--prompt` emits the ready-to-send classifier prompt so the 1.5B model can choose when keywords are insufficient.
4. The selected `SKILL.md` is the system-prompt fragment for the real generation call.

## Adding a specialist

1. Create `grok/skills/<id>/SKILL.md`
2. Add entry to `skill_index.json`
3. Optionally add high-signal patterns to `rules.toml` under a new or existing priority group

## Design notes

- Small model friendly: keyword path costs zero tokens.
- Domain boundaries stay hard because only the matched skill(s) are loaded.
- To the average eye the system is one intelligence. The router keeps the experts from contaminating each other.
- No network. No external agent framework required.

## Next (for later sessions)

- Multi-skill return (ordered list) + simple synthesis prompt
- Embeddings fallback if desired
- Direct integration with llama.cpp server or local chat loop
