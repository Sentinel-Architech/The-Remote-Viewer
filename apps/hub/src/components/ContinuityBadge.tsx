"use client";

/**
 * ContinuityBadge
 * Signals that the Sentinel keeps GitHub and The Remote Viewer
 * updated in open source so the system stays ahead.
 */

export function ContinuityBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
      title="The Sentinel keeps GitHub and The Remote Viewer updated in open source at all times to stay ahead"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
      <span>Open-source continuity active</span>
    </div>
  );
}
