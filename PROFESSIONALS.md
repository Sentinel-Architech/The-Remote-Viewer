# Professionals — Contribute Your Domain

**Meteorologist. Geologist. Special education teacher. Nurse. Engineer. Historian. Anyone with real expertise.**

You can put your knowledge into the Sentinel specialist system so it is available on-device, at a moment’s notice, under the same rules as every other expert.

No cloud required. No platform custody. Your skill file lives in the repo and runs locally.

---

## What you are adding

A **skill** is a short markdown file that tells the local AI:

- What domain you own
- What sources it must prefer
- What it must never do (no lecturing, no inventing protocols, etc.)
- How to answer in that domain

When someone asks a question that matches your domain, the router loads your skill and the model answers under your rules.

---

## Fast path (moment’s notice)

1. **Copy the template** below into a new file:
   ```
   grok/skills/<your-domain>/SKILL.md
   ```
   Examples: `meteorology`, `geology`, `special-education`, `nursing`, `structural-engineering`

2. **Fill in** the domain, sources, and rules. Keep it tight.

3. **Register it** (two small edits):
   - Add your skill id + one-line description to `grok/router/skill_index.json`
   - Add high-signal keywords to `grok/router/rules.toml` under a new or existing priority group

4. **Open a pull request** on branch `TheRemoteViewer` with title:
   ```
   Add <domain> specialist skill
   ```

That is the entire contribution loop.

---

## Skill template (copy this)

```markdown
# <Domain> Agent – The Remote Viewer

You are the <Domain> specialist inside the Sentinel intelligence layer.

## Domain
<One or two sentences: what questions you own.>

## Core posture
- Primary sources and established professional standards first.
- State the evidence or guideline you are using.
- No hand-waving. No invented protocols.

## Delivery rules
- Fact-based.
- Never tell the Viewer they are wrong.
- Present the model, the evidence, and the limits. Stop there.
- When life-safety or regulated practice is involved, name the authoritative source.

## Scope boundaries
- Stay inside this domain.
- Hand off clearly when the question belongs to another specialist.

## Style
- Direct. Sparse. Professional.

You exist to make <domain> knowledge reliable and local.
```

---

## Examples of domains we want

| Domain | Example keywords for the router |
|--------|----------------------------------|
| Meteorology | forecast, severe weather, radar, tornado, hurricane, dew point |
| Geology | fault, stratigraphy, mineral, earthquake, rock formation |
| Special education | IEP, IDEA, accommodations, inclusion, behavior support |
| Nursing / clinical | triage, vital signs, medication safety (within public guidelines) |
| Structural engineering | load path, shear, foundation, code reference |
| History (primary-source) | archive, primary document, chronology |
| Agriculture | soil, crop, irrigation, pest management |

Add whatever you actually practice. The list is not closed.

---

## Rules that apply to every professional skill

- **Primary sources preferred** — guidelines, standards, statutes, peer-reviewed consensus, official agencies.
- **No lecturing the Viewer** — present evidence and structure; do not moralize.
- **Life-safety first** — if your domain touches emergency response, say so and cite the authority.
- **Local-only** — the skill must work offline once loaded. No “call this API” dependency for core answers.
- **Honest limits** — if something requires a licensed professional on site, say so plainly.

---

## After your skill is merged

Anyone running the router can hit it immediately:

```bash
cd grok/router
python route.py "your domain question here"
python route.py --show-skill "keyword from your domain"
```

The Coordinator and hybrid router will load your skill when the question matches.

---

## Questions

Open an issue with label idea or discussion, or start a PR draft.  
We will help you shape the skill so it fits the system without diluting your expertise.

**Your knowledge. On-device. At a moment’s notice.**
