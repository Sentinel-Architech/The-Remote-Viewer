# Verification — Credentials, Citations, DOIs

One place for reviewers and CI to check professional claims and academic citations before a specialist skill merges.

**Local-first where possible. Crossref only for DOI existence/metadata.**  
**Works for contributors and reviewers on any iOS or Android device, anywhere — not limited to one phone or OS.**

---

## Global mobile access (iOS + Android)

Anyone on **iPhone, iPad, or any Android phone/tablet** can participate. You do not need GrapheneOS or Termux to verify a citation or contribute a skill.

### Path A — Browser only (every device)

No install. Works offline for reading skills; needs network only to resolve DOIs.

1. Open the skill file on GitHub (mobile browser or GitHub app).
2. For each DOI, open:
   ```text
   https://doi.org/<doi>
   ```
   or
   ```text
   https://api.crossref.org/works/<doi>
   ```
3. **Resolves + title matches claim** → OK.  
   **404 / not found** → treat as hallucinated; strip it.  
   **Wrong paper** → fix or remove.

Credential links (state boards, ORCID, university pages) open the same way in any mobile browser worldwide.

### Path B — Python script (when you have a shell)

Same script, same behavior, on whatever device can run Python 3:

| Environment | Typical setup |
|-------------|----------------|
| **Android** | Termux, or any Linux-on-Android environment |
| **iOS** | a-Shell, iSH, or SSH to a machine you control |
| **Laptop / CI** | System Python 3 |

```bash
cd grok/verification
python verify_dois.py --mailto you@example.com --file ../skills/<domain>/SKILL.md
```

Crossref is a global public API. No region lock. Use a real `mailto` from any country for the polite pool.

### Path C — Contribute from the phone

1. Edit or create `grok/skills/<domain>/SKILL.md` via GitHub mobile (web or app), or clone with a mobile git client.
2. Open a PR on branch `TheRemoteViewer`.
3. Paste public credential links and DOIs in the PR body.
4. Reviewers (on any device) use Path A or B to verify.

Skills are plain markdown. No App Store or Play Store dependency for contribution or citation checks.

### What stays local vs what needs network

| Task | Network? | Device |
|------|----------|--------|
| Read skill / router rules | No (once cloned or viewed) | Any |
| Resolve DOI / open credential link | Yes (Crossref or board site) | Any browser |
| Run `verify_dois.py` | Yes (Crossref) | Any with Python 3 |
| On-device specialist answers (llama.cpp) | No | Device that runs the model |

Verification is intentionally usable from a normal phone browser so professionals and reviewers are not locked to one stack.

---

## What this package covers

1. **Professional credentials** — public lookup, not KYC
2. **Academic citations** — existence + claim match
3. **Hallucinated DOIs** — resolve or reject
4. **Crossref access** — polite pool, rate limits
5. **Resilience** — exponential backoff + circuit breaker

---

## 1. Professional credentials (reviewer checklist)

Contributor should provide in the PR (public links only):

- Name / professional name
- Domain + approximate experience
- Credential type + issuer
- Public verification link (state board, AMS, Nursys, university directory, ORCID, etc.)

| Outcome | Action |
|---------|--------|
| Public credential confirms claim | Merge; note “credential cross-checked” in PR |
| Plausible, no independent confirm | Merge as `community` / unverified-professional |
| No public signal | Ask for link or decline professional framing |

Never store license scans, SSNs, or private documents in the repo.

Common public checks (open in any mobile browser):

| Domain | Where to look |
|--------|----------------|
| Meteorology | AMS directory, NWS/NOAA, university pages |
| Geology | State PG board, AIPG, survey staff lists |
| Special education | State teacher license lookup, district directory |
| Nursing | State board / Nursys |
| Engineering | State PE lookup, NCEES where public |
| Research | ORCID, Google Scholar, institutional profile |

Boards and directories outside the US work the same way: use the official public registry for that country or profession.

---

## 2. Academic citations

For each material claim that cites a paper:

1. **Exists?** DOI (or PMID/arXiv) resolves.
2. **Metadata match?** Title, authors, year align with the claim.
3. **Supports claim?** Abstract/relevant section actually says what the skill asserts.
4. **Status?** Not retracted; preprint vs peer-reviewed labeled if it matters.

Prefer official guidelines (CDC, AMS, state code, ILCOR, national meteorological services, etc.) when they exist; use papers as support, not as a substitute for the governing standard.

---

## 3. Hallucinated DOIs — the only reliable test

```text
https://doi.org/<doi>
https://api.crossref.org/works/<doi>?mailto=you@example.com
```

| Result | Meaning |
|--------|--------|
| Resolves + metadata matches | Accept |
| 404 / DOI not found | Hallucinated or wrong — strip |
| Resolves but wrong paper | Invalid for this claim — strip or fix |

Shape checks (`10.xxxx/...`) are filters only. **Resolution is mandatory.**  
Works in Safari, Chrome, Firefox, or in-app browsers on iOS and Android.

---

## 4. Crossref rate limits (polite pool)

| Pool | How | Single DOI | List/query | Concurrency |
|------|-----|------------|------------|-------------|
| Public | No ID | 5/sec | 1/sec | 1 |
| **Polite** | `mailto=` email | **10/sec** | 3/sec | 3–5 |
| Plus | Paid token | 150/sec | higher | — |

Always use polite pool when scripting:

```bash
curl "https://api.crossref.org/works/10.1038/nature12373?mailto=you@example.com"
```

HTTP **429** → back off. Cache results. Sequential checks for PR review are fine from any region.

---

## 5. Resilience: backoff + circuit breaker

**Exponential backoff** (per call):

```text
delay = min(cap, base * 2^attempt) + jitter
```

Typical: base 1s, cap 60s, jitter up to 25%.

- **404** → do not retry (DOI missing is a final answer).
- **429 / 5xx** → retry with backoff.

**Circuit breaker** (whole service):

```text
CLOSED → normal
OPEN   → fail fast after sustained failures (e.g. 5× 429/5xx)
HALF_OPEN → few probes after cooldown (30–60s)
```

- 404 does **not** count as breaker failure.
- Backoff retries a struggling call; breaker stops calling a struggling service.

Use both for batch/CI. Backoff alone is enough for a few manual DOI checks. Browser-only Path A does not need a breaker — you resolve one DOI at a time by hand.

---

## 6. Tool: `verify_dois.py` — usage examples

Requires Python 3 (Android Termux, iOS a-Shell/iSH, laptop, or CI).  
Browser-only users: use Path A above instead.

### Check a single known DOI

```bash
cd grok/verification
python verify_dois.py --mailto you@example.com 10.1038/nature12373
```

Example output:

```text
OK        10.1038/nature12373 — A safe operating space for humanity

Summary: 1 OK, 0 bad, 0 skipped, 1 total
```

### Check several DOIs at once

```bash
python verify_dois.py --mailto you@example.com \
  10.1038/nature12373 \
  10.1103/PhysRevLett.116.061102 \
  10.9999/fake.doi.hallucinated
```

Example output:

```text
OK        10.1038/nature12373 — A safe operating space for humanity
OK        10.1103/PhysRevLett.116.061102 — Observation of Gravitational Waves from a Binary Black Hole Merger
MISSING   10.9999/fake.doi.hallucinated (DOI not found (404))

Summary: 2 OK, 1 bad, 0 skipped, 3 total
```

Exit code is `1` if any DOI is MISSING or ERROR (useful for CI).

### Scan a skill file (extract + resolve)

```bash
python verify_dois.py --mailto you@example.com --file ../skills/first-aid/SKILL.md
python verify_dois.py --mailto you@example.com -f ../skills/physics/SKILL.md
```

### No mailto (still works; public pool, stricter limits)

```bash
python verify_dois.py 10.1038/nature12373
```

Prefer `--mailto` so Crossref can place you in the polite pool.

### Tune the circuit breaker

```bash
python verify_dois.py --mailto you@example.com \
  --threshold 3 \
  --cooldown 60 \
  --file ../skills/mathematics/SKILL.md
```

| Flag | Default | Meaning |
|------|---------|--------|
| `--mailto` | `sentinel-doi-check@localhost` | Email for Crossref polite pool |
| `--file` / `-f` | — | Read DOIs from this markdown/text file |
| `--threshold` | `5` | Failures before circuit opens |
| `--cooldown` | `45` | Seconds to stay OPEN before probing again |

### What each status means

| Status | Meaning | Action |
|--------|--------|--------|
| **OK** | DOI resolved; title shown when available | Keep; spot-check claim vs paper |
| **MISSING** | Crossref 404 — no such DOI | Treat as hallucinated/wrong; remove |
| **ERROR** | HTTP/network failure after retries | Retry later or check connectivity |
| **SKIPPED** | Circuit breaker open | Wait for cooldown; re-run batch |

### CI-style one-liner

```bash
cd grok/verification && \
  python verify_dois.py --mailto ci@yourdomain.example --file ../skills/first-aid/SKILL.md
```

Non-zero exit if any DOI failed verification.

---

## 7. Error handling examples

### Hallucinated / unknown DOI (404)

```bash
python verify_dois.py --mailto you@example.com 10.9999/this.does.not.exist
```

```text
MISSING   10.9999/this.does.not.exist (DOI not found (404))

Summary: 0 OK, 1 bad, 0 skipped, 1 total
```

- **No retries** — 404 is final.
- **Circuit breaker not tripped**.
- **Action:** Remove or replace the citation. Exit code `1`.

Same check in a phone browser: open `https://doi.org/10.9999/this.does.not.exist` → not found → strip.

### Rate limited (429) — backoff then recover

Script waits with exponential backoff and retries. If still 429:

```text
ERROR     10.1038/nature12373 (exhausted retries)
```

**Action:** Wait, confirm `--mailto`, re-run. Browser users: try again in a minute.

### Sustained failures — circuit opens

```text
SKIPPED   10.1111/example.six (circuit open after failures)
```

**Action:** Wait `--cooldown` seconds, re-run remaining DOIs.

### Network timeout / offline

**Action:** Check connectivity on the phone (Wi‑Fi/cellular). Re-run when `api.crossref.org` or `doi.org` loads in the browser.

### File missing / no DOIs

```text
No DOIs provided or found.
```

Exit `0` — nothing to verify is not a failure.

### CI pattern

```bash
cd grok/verification || exit 1
python verify_dois.py --mailto ci@yourdomain.example --file ../skills/first-aid/SKILL.md
status=$?
if [ "$status" -ne 0 ]; then
  echo "DOI verification failed — fix MISSING/ERROR entries before merge"
  exit "$status"
fi
```

### Quick decision table

| You see | Means | Do this |
|---------|--------|--------|
| `MISSING` or doi.org 404 | DOI does not exist | Strip or correct citation |
| `ERROR` … exhausted retries | Rate limit or network | Wait, check network, re-run |
| `SKIPPED` … circuit open | Too many recent failures | Wait cooldown, re-run remainder |
| `No DOIs provided or found` | Nothing to check | OK for skills without DOIs |
| Exit code `1` | At least one MISSING or ERROR | Do not merge until clean |

---

## 8. PR reviewer flow (any device)

1. Credential links present? Open them in the phone browser → verified / community / reject framing.
2. Material citations have DOIs or official guideline URLs?
3. Resolve each DOI in the browser **or** run `verify_dois.py` if you have Python.
4. Spot-check that claims match the resolved papers.
5. Merge with appropriate note; no private credential data in git.

---

## 9. What this is not

- Not a licensing authority
- Not a substitute for peer review of the skill’s scientific content
- Not an on-device runtime dependency (verification stays in contributor/CI path)
- Not restricted to one OS, one store, or one country

**Primary sources. Resolvable identifiers. Honest limits. Any iOS or Android, globally.**
