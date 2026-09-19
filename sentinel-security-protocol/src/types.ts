/**
 * Sentinel Security Protocol – Native MoE Types
 * 100% native stack. No external model or cloud dependency required.
 */

export type ExpertName =
  | "integrity"
  | "identity"
  | "posture"
  | "network"
  | "threat";

export type SecurityLevel = "secure" | "elevated" | "critical" | "unknown";

export type OperatingMode = "individual" | "enhanced" | "whole-network";

export interface ExpertInput {
  /** Optional context from Hub, Command Deck, or node */
  nodeId?: string;
  handle?: string | null;
  opticalStatus?: string | null;
  localEvents?: unknown[];
  timestamp?: string;
}

export interface ExpertOutput {
  expert: ExpertName;
  score: number; // 0.0 – 1.0 (1.0 = fully healthy / low risk)
  level: SecurityLevel;
  reasons: string[];
  evidence?: Record<string, unknown>;
  timestamp: string;
}

export interface SecurityDecision {
  overallScore: number;
  overallLevel: SecurityLevel;
  expertOutputs: ExpertOutput[];
  recommendation: "allow" | "monitor" | "restrict" | "isolate";
  systemwide: true; // always true – protocol is exclusive systemwide
  nativeStack: true;
  generatedAt: string;
}

export interface Expert {
  name: ExpertName;
  evaluate(input: ExpertInput): Promise<ExpertOutput>;
}
