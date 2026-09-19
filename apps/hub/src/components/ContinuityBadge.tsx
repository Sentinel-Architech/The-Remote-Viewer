"use client";

/**
 * ContinuityBadge
 * Signals that the Sentinel is designed to keep GitHub and The Remote Viewer
 * continuously updated in open source so the system stays ahead.
 * Purely presentational and native – no external calls.
 */

import React from "react";

export function ContinuityBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-zinc-600 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-300"
      title="The Sentinel keeps GitHub and The Remote Viewer updated in open source at all times to stay ahead"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>Open-source continuity active</span>
    </div>
  );
}
