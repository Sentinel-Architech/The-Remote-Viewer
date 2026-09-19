import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * NetworkExpert
 * Local event-volume and mesh-signal analysis.
 * Fully offline-capable; no external telemetry required.
 */
export const networkExpert: Expert = {
  name: "network",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.78;

    const events = Array.isArray(input.localEvents) ? input.localEvents : [];
    const count = events.length;

    if (count === 0) {
      reasons.push("No local network events - quiet baseline");
      score = 0.82;
    } else if (count <= 5) {
      reasons.push(`Low event volume (${count}) - normal`);
      score = 0.8;
    } else if (count <= 20) {
      reasons.push(`Moderate event volume (${count}) - elevated observation`);
      score = 0.62;
    } else {
      reasons.push(`High event volume (${count}) - potential anomaly`);
      score = 0.38;
    }

    const level =
      score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : score >= 0.3 ? "critical" : "unknown";

    return {
      expert: "network",
      score,
      level,
      reasons,
      evidence: { eventCount: count },
      timestamp: new Date().toISOString(),
    };
  },
};
