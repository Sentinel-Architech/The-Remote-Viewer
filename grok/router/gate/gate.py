#!/usr/bin/env python3
"""
Interaction Gate — zero-trust front door for The Remote Viewer.

Every inbound request must pass:
  1. Rate limiting
  2. Simple effort / proof-of-work check
  3. Async queue hand-off

Only then does the hybrid router / Coordinator see the request.
"""

from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field
from typing import Any

from .rate_limiter import default_limiter, RateLimiter


@dataclass
class GateConfig:
    min_problem_length: int = 12          # characters — forces a real statement
    require_effort_note: bool = False     # later: require "steps already taken"
    queue_maxsize: int = 100


@dataclass
class QueuedRequest:
    viewer_id: str
    payload: dict[str, Any]
    received_at: float = field(default_factory=time.monotonic)


class InteractionGate:
    def __init__(self, config: GateConfig | None = None, limiter: RateLimiter | None = None):
        self.config = config or GateConfig()
        self.limiter = limiter or default_limiter
        self._queue: deque[QueuedRequest] = deque(maxlen=self.config.queue_maxsize)

    def _effort_ok(self, request: dict[str, Any]) -> bool:
        """Minimal proof-of-work: the request must contain a non-trivial problem statement."""
        text = (request.get("text") or request.get("query") or "").strip()
        if len(text) < self.config.min_problem_length:
            return False
        if self.config.require_effort_note:
            effort = (request.get("effort") or request.get("steps_taken") or "").strip()
            if len(effort) < 8:
                return False
        return True

    def process(self, request: dict[str, Any], viewer_id: str = "local") -> dict[str, Any]:
        """
        Main entry.
        Returns a status dict. If the request is accepted it is queued.
        """
        # 1. Rate limit
        if not self.limiter.allow(viewer_id):
            return {
                "status": "rejected",
                "reason": "rate_limited",
                "remaining": self.limiter.remaining(viewer_id),
            }

        # 2. Effort gate
        if not self._effort_ok(request):
            return {
                "status": "rejected",
                "reason": "insufficient_effort",
                "hint": f"Provide a clear problem statement (min {self.config.min_problem_length} chars).",
            }

        # 3. Enqueue
        if len(self._queue) >= self.config.queue_maxsize:
            return {"status": "rejected", "reason": "queue_full"}

        self._queue.append(QueuedRequest(viewer_id=viewer_id, payload=request))
        return {
            "status": "queued",
            "queue_depth": len(self._queue),
            "remaining": self.limiter.remaining(viewer_id),
        }

    def drain(self, max_items: int = 1) -> list[QueuedRequest]:
        """Pull items from the async queue for processing by the router."""
        items = []
        for _ in range(min(max_items, len(self._queue))):
            items.append(self._queue.popleft())
        return items

    def queue_depth(self) -> int:
        return len(self._queue)


# Module-level default gate
default_gate = InteractionGate()


def process_inbound(request: dict[str, Any], viewer_id: str = "local") -> dict[str, Any]:
    """Convenience wrapper."""
    return default_gate.process(request, viewer_id)
