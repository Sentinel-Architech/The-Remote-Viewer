#!/usr/bin/env python3
"""
Sentinel DOI verifier — detect missing/hallucinated DOIs via Crossref.

Uses polite pool (mailto), exponential backoff, and a simple circuit breaker.

Usage:
  python verify_dois.py 10.1038/nature12373
  python verify_dois.py --file ../skills/first-aid/SKILL.md
  python verify_dois.py --mailto you@example.com 10.xxxx/yyyy 10.aaaa/bbbb

Exit codes:
  0 — all resolved DOIs OK (or no DOIs found)
  1 — one or more MISSING or hard ERROR
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from enum import Enum, auto
from pathlib import Path
from typing import Iterable

DOI_RE = re.compile(r"\b(10\.\d{4,9}/[-._;()/:A-Z0-9]+)\b", re.IGNORECASE)


class State(Enum):
    CLOSED = auto()
    OPEN = auto()
    HALF_OPEN = auto()


@dataclass
class CircuitBreaker:
    threshold: int = 5
    cooldown: float = 45.0
    state: State = State.CLOSED
    failures: int = 0
    open_until: float = 0.0

    def allow(self) -> bool:
        if self.state == State.OPEN:
            if time.time() >= self.open_until:
                self.state = State.HALF_OPEN
                return True
            return False
        return True

    def success(self) -> None:
        self.failures = 0
        self.state = State.CLOSED

    def failure(self) -> None:
        self.failures += 1
        if self.failures >= self.threshold or self.state == State.HALF_OPEN:
            self.state = State.OPEN
            self.open_until = time.time() + self.cooldown


@dataclass
class Result:
    doi: str
    status: str  # OK | MISSING | ERROR | SKIPPED
    title: str = ""
    detail: str = ""


def extract_dois(text: str) -> list[str]:
    found = DOI_RE.findall(text)
    # normalize trailing punctuation
    cleaned = []
    for d in found:
        d = d.rstrip(".),;]")
        if d not in cleaned:
            cleaned.append(d)
    return cleaned


def fetch_crossref(doi: str, mailto: str, breaker: CircuitBreaker, max_attempts: int = 6) -> Result:
    if not breaker.allow():
        return Result(doi, "SKIPPED", detail="circuit open")

    url = f"https://api.crossref.org/works/{urllib.request.quote(doi)}?mailto={urllib.request.quote(mailto)}"
    headers = {"User-Agent": f"SentinelDOICheck/1.0 (mailto:{mailto})"}
    base, cap = 1.0, 60.0

    for attempt in range(max_attempts):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.load(resp)
            msg = data.get("message") or {}
            title_list = msg.get("title") or []
            title = title_list[0] if title_list else ""
            breaker.success()
            return Result(doi, "OK", title=title)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                # valid "does not exist" — do not trip breaker
                return Result(doi, "MISSING", detail="DOI not found (404)")
            if e.code not in (429, 500, 502, 503, 504):
                breaker.failure()
                return Result(doi, "ERROR", detail=f"HTTP {e.code}")
            # rate limit / server — backoff + count toward breaker
            breaker.failure()
            if breaker.state == State.OPEN:
                return Result(doi, "SKIPPED", detail="circuit open after failures")
        except (TimeoutError, urllib.error.URLError) as e:
            breaker.failure()
            if breaker.state == State.OPEN:
                return Result(doi, "SKIPPED", detail="circuit open after network errors")

        if attempt >= max_attempts - 1:
            break
        delay = min(cap, base * (2 ** attempt))
        delay += random.uniform(0, delay * 0.25)
        time.sleep(delay)

    return Result(doi, "ERROR", detail="exhausted retries")


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify DOIs via Crossref (polite pool)")
    parser.add_argument("dois", nargs="*", help="DOI strings")
    parser.add_argument("--file", "-f", type=Path, help="Extract DOIs from this file")
    parser.add_argument("--mailto", default="sentinel-doi-check@localhost", help="Email for Crossref polite pool")
    parser.add_argument("--threshold", type=int, default=5, help="Circuit breaker failure threshold")
    parser.add_argument("--cooldown", type=float, default=45.0, help="Circuit open cooldown seconds")
    args = parser.parse_args()

    dois: list[str] = list(args.dois)
    if args.file:
        text = args.file.read_text(encoding="utf-8", errors="replace")
        dois.extend(extract_dois(text))

    if not dois:
        print("No DOIs provided or found.")
        return 0

    # unique, preserve order
    seen = set()
    unique = []
    for d in dois:
        if d not in seen:
            seen.add(d)
            unique.append(d)

    breaker = CircuitBreaker(threshold=args.threshold, cooldown=args.cooldown)
    results: list[Result] = []
    for doi in unique:
        r = fetch_crossref(doi, args.mailto, breaker)
        results.append(r)
        title_bit = f" — {r.title[:80]}" if r.title else ""
        detail_bit = f" ({r.detail})" if r.detail else ""
        print(f"{r.status:8}  {r.doi}{title_bit}{detail_bit}")

    bad = sum(1 for r in results if r.status in ("MISSING", "ERROR"))
    ok = sum(1 for r in results if r.status == "OK")
    skipped = sum(1 for r in results if r.status == "SKIPPED")
    print(f"\nSummary: {ok} OK, {bad} bad, {skipped} skipped, {len(results)} total")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
