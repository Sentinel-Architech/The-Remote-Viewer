#!/usr/bin/env python3
"""BM25 (Okapi) ranker — pure Python, no deps.

Usage as library:
    from bm25 import BM25
    bm = BM25(list_of_doc_strings)
    scores = bm.score("query text")

CLI:
    python3 bm25.py --dir ~/.local/share/remote-viewer/rag/chunks "what can you do"
"""
from __future__ import annotations

import argparse
import math
import os
import re
from typing import Iterable, List, Sequence, Tuple


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_]{2,}", text.lower())


class BM25:
    """Okapi BM25 with optional ability-query boost hooks left to caller."""

    def __init__(
        self,
        documents: Sequence[str],
        k1: float = 1.5,
        b: float = 0.75,
        eps: float = 0.25,
    ) -> None:
        self.k1 = k1
        self.b = b
        self.eps = eps
        self.docs_tokens: List[List[str]] = [tokenize(d) for d in documents]
        self.doc_len = [len(toks) for toks in self.docs_tokens]
        self.avgdl = (sum(self.doc_len) / len(self.doc_len)) if self.doc_len else 0.0
        self.N = len(self.docs_tokens)

        self.df: dict[str, int] = {}
        self.tf: List[dict[str, int]] = []
        for toks in self.docs_tokens:
            counts: dict[str, int] = {}
            for t in toks:
                counts[t] = counts.get(t, 0) + 1
            self.tf.append(counts)
            for t in counts:
                self.df[t] = self.df.get(t, 0) + 1

        self.idf: dict[str, float] = {}
        for t, n_t in self.df.items():
            # Robertson–Sparck Jones IDF variant common in BM25
            idf = math.log(1.0 + (self.N - n_t + 0.5) / (n_t + 0.5))
            self.idf[t] = max(idf, self.eps)

    def score(self, query: str) -> List[float]:
        q_terms = tokenize(query)
        if not q_terms or self.N == 0:
            return [0.0] * self.N
        scores = [0.0] * self.N
        for i, tf_i in enumerate(self.tf):
            dl = self.doc_len[i] or 1
            denom_base = self.k1 * (1.0 - self.b + self.b * dl / (self.avgdl or 1.0))
            s = 0.0
            for t in q_terms:
                f = tf_i.get(t, 0)
                if f == 0:
                    continue
                idf = self.idf.get(t, self.eps)
                s += idf * (f * (self.k1 + 1.0)) / (f + denom_base)
            scores[i] = s
        return scores

    def top(
        self, query: str, n: int = 5
    ) -> List[Tuple[int, float]]:
        scores = self.score(query)
        ranked = sorted(enumerate(scores), key=lambda x: (-x[1], x[0]))
        return [(i, s) for i, s in ranked[:n] if s > 0]


def load_chunks(directory: str) -> Tuple[List[str], List[str], List[str]]:
    names, paths, texts = [], [], []
    if not os.path.isdir(directory):
        return names, paths, texts
    for name in sorted(os.listdir(directory)):
        if not name.endswith(".chunk"):
            continue
        path = os.path.join(directory, name)
        try:
            text = open(path, encoding="utf-8", errors="ignore").read().strip()
        except OSError:
            continue
        names.append(name)
        paths.append(path)
        texts.append(text)
    return names, paths, texts


def main() -> None:
    ap = argparse.ArgumentParser(description="BM25 over RAG chunks")
    ap.add_argument("query", nargs="+", help="query words")
    ap.add_argument(
        "--dir",
        default=os.path.expanduser("~/.local/share/remote-viewer/rag/chunks"),
    )
    ap.add_argument("-k", type=int, default=6, help="top-k")
    ap.add_argument("--k1", type=float, default=1.5)
    ap.add_argument("-b", type=float, default=0.75)
    ap.add_argument("--plain", action="store_true", help="text only")
    args = ap.parse_args()
    query = " ".join(args.query)
    names, paths, texts = load_chunks(args.dir)
    if not texts:
        print("No chunks.", flush=True)
        return
    bm = BM25(texts, k1=args.k1, b=args.b)
    for i, s in bm.top(query, n=args.k):
        if args.plain:
            print(texts[i][:1500])
            print()
        else:
            print(f"--- bm25={s:.4f} file={names[i]} ---")
            print(texts[i][:1500])
            print()


if __name__ == "__main__":
    main()
