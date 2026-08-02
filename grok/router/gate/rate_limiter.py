#!/usr/bin/env python3
"""
Rate Limiter — local, zero-trust.

Hard caps per viewer and global. No external services.
State is kept in memory for the process lifetime (Termux-friendly).
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Deque


class RateLimiter:
    def __init__(
        self,
        per_viewer_limit: int = 20,
        per_viewer_window: float = 60.0,
        global_limit: int = 60,
        global_window: float = 60.0,
    ):
        self.per_viewer_limit = per_viewer_limit
        self.per_viewer_window = per_viewer_window
        self.global_limit = global_limit
        self.global_window = global_window

        self._viewer_hits: dict[str, Deque[float]] = defaultdict(deque)
        self._global_hits: Deque[float] = deque()

    def _prune(self, hits: Deque[float], window: float, now: float) -> None:
        while hits and now - hits[0] > window:
            hits.popleft()

    def allow(self, viewer_id: str) -> bool:
        """Return True if the request is allowed under current limits."""
        now = time.monotonic()

        # Global check
        self._prune(self._global_hits, self.global_window, now)
        if len(self._global_hits) >= self.global_limit:
            return False

        # Per-viewer check
        viewer_hits = self._viewer_hits[viewer_id]
        self._prune(viewer_hits, self.per_viewer_window, now)
        if len(viewer_hits) >= self.per_viewer_limit:
            return False

        # Record the hit
        self._global_hits.append(now)
        viewer_hits.append(now)
        return True

    def remaining(self, viewer_id: str) -> dict[str, int]:
        """Diagnostic helper."""
        now = time.monotonic()
        self._prune(self._global_hits, self.global_window, now)
        viewer_hits = self._viewer_hits[viewer_id]
        self._prune(viewer_hits, self.per_viewer_window, now)
        return {
            "viewer_remaining": max(0, self.per_viewer_limit - len(viewer_hits)),
            "global_remaining": max(0, self.global_limit - len(self._global_hits)),
        }


# Module-level default instance
default_limiter = RateLimiter()
