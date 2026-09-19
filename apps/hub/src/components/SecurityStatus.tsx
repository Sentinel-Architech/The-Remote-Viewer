"use client";

/**
 * SecurityStatus – live view of the native MoE Sentinel decision.
 * Dual-mode aware. Fully native.
 */

import React, { useEffect, useState } from "react";
import {
  evaluateHubSecurity,
  enforceHubDecision,
  type SecurityDecision,
  type OperatingMode,
} from "../lib/sentinel";

interface Props {
  handle?: string | null;
  opticalStatus?: string | null;
  mode?: OperatingMode;
  localEventCount?: number;
}

export function SecurityStatus({
  handle = null,
  opticalStatus = null,
  mode = "individual",
  localEventCount = 0,
}: Props) {
  const [decision, setDecision] = useState<SecurityDecision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const d = await evaluateHubSecurity({
        handle,
        opticalStatus,
        mode,
        localEventCount,
      });
      if (!cancelled) {
        setDecision(d);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle, opticalStatus, mode, localEventCount]);

  if (loading) {
    return (
      <div className="rounded border border-zinc-700 bg-zinc-900/50 p-3 text-sm text-zinc-400">
        Evaluating native MoE security…
      </div>
    );
  }

  if (!decision) return null;

  const enforcement = enforceHubDecision(decision, mode);
  const levelColor =
    decision.overallLevel === "secure"
      ? "text-emerald-400"
      : decision.overallLevel === "elevated"
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="rounded border border-zinc-700 bg-zinc-900/60 p-4 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-zinc-200">Sentinel Security</span>
        <span className={`font-mono ${levelColor}`}>{decision.overallLevel}</span>
      </div>
      <div className="space-y-1 text-zinc-400">
        <div>Score: {(decision.overallScore * 100).toFixed(0)}%</div>
        <div>Mode: {mode}</div>
        <div>Recommendation: {decision.recommendation}</div>
        <div>Action: {enforcement.action}</div>
        {decision.expertSummary && (
          <div className="mt-2 rounded bg-zinc-950/60 p-2 font-mono text-xs text-zinc-500">
            {decision.expertSummary.join(" · ")}
          </div>
        )}
        <div className="text-xs text-zinc-500">
          Local override available · Native MoE · Systemwide backbone
        </div>
      </div>
    </div>
  );
}
