import type { ExclusiveLookId, ViewerTheme } from "./themes";

/** The UI mix of experts is Grok. No other model is added. */
export const UI_EXPERT = "Grok" as const;

const OTHER_MODEL = /google|gemini|alphabet|meta|facebook|openai|anthropic|claude|llama/i;

export type UiControl =
  | "preset"
  | "accent"
  | "radius"
  | "density"
  | "type"
  | "motion"
  | "exclusive"
  | "rhythm"
  | "crest";

const PLAIN: UiControl[] = ["preset", "accent", "radius", "density"];

export function assertGrokExpert(name: string): void {
  if (name !== UI_EXPERT || OTHER_MODEL.test(name)) {
    throw new Error("The UI mix of experts is Grok. No other model is added.");
  }
}

/** Existing paid ladder. Free is 0. No new price is introduced here. */
export function customizationRank(planId: string): number {
  switch (planId) {
    case "verified":
      return 1;
    case "sentinel":
      return 2;
    case "squad":
      return 3;
    case "command":
      return 4;
    case "sovereign":
      return 5;
    default:
      return 0;
  }
}

export function grokUiControls(planId: string): UiControl[] {
  assertGrokExpert(UI_EXPERT);
  const rank = customizationRank(planId);
  const controls: UiControl[] = [...PLAIN];
  if (rank >= 1) controls.push("type");
  if (rank >= 2) controls.push("motion");
  if (rank >= 3) controls.push("exclusive");
  if (rank >= 4) controls.push("rhythm");
  if (rank >= 5) controls.push("crest");
  return controls;
}

export function clampThemeToPlan(theme: ViewerTheme, planId: string): ViewerTheme {
  const open = new Set(grokUiControls(planId));
  return {
    preset: theme.preset,
    accent: theme.accent,
    radius: theme.radius,
    density: theme.density,
    typeScale: open.has("type") ? theme.typeScale : undefined,
    motion: open.has("motion") ? theme.motion : undefined,
    exclusiveLook: open.has("exclusive") ? theme.exclusiveLook ?? null : null,
    rhythm: open.has("rhythm") ? theme.rhythm : undefined,
    crest: open.has("crest") ? Boolean(theme.crest) : false,
  };
}

export function exclusiveLookOpen(planId: string, look: ExclusiveLookId): boolean {
  if (look !== "prism" && look !== "iris") return false;
  const paid =
    planId === "verified" ||
    planId === "sentinel" ||
    planId === "squad" ||
    planId === "command" ||
    planId === "sovereign";
  return grokUiControls(planId).includes("exclusive") && paid;
}

export const EXCLUSIVE_LOOK_NOTE =
  "TRV Token🍃 can mark an exclusive look. The amount is not set. Grok opens the look for this paid tier. No price is invented.";
