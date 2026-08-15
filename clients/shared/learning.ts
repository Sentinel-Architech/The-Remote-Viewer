/**
 * L0/L1 local learning — SCAFFOLD.
 * Persist only on device. Wipe with Destroy = Restart.
 */

export type ToneProfile = {
  formality: "plain" | "balanced" | "formal";
  warmth: "low" | "medium" | "high";
  verbosity: "short" | "normal" | "detailed";
  /** Opt-in leans — never pressure */
  faithInterest: boolean;
  politicsInterest: boolean;
};

export type LearningPrefs = {
  version: 1;
  tone: ToneProfile;
  language: "en" | "es" | "en+es";
  wakeEnabled: boolean;
  liveSearchEnabled: boolean;
  /** Contribute anonymous conduct signals to IA of IA */
  conductOptIn: boolean;
  updatedAt: number;
};

export const DEFAULT_LEARNING: LearningPrefs = {
  version: 1,
  tone: {
    formality: "balanced",
    warmth: "medium",
    verbosity: "normal",
    faithInterest: false,
    politicsInterest: false,
  },
  language: "en",
  wakeEnabled: true,
  liveSearchEnabled: true,
  conductOptIn: false,
  updatedAt: 0,
};

export function clearLearning(): LearningPrefs {
  return { ...DEFAULT_LEARNING, updatedAt: Date.now() };
}

export function touch(prefs: LearningPrefs, patch: Partial<LearningPrefs>): LearningPrefs {
  return { ...prefs, ...patch, version: 1, updatedAt: Date.now() };
}
