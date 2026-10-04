import type { ExclusiveLookId, ViewerTheme } from "./themes";

/** Free MIT weights. Xiaomi is not paid. The copy that runs is owned by TRV. */
export const UI_MODEL_NAME = "MiMo-V2.6-Pro" as const;
export const MIMO_WEIGHTS_REPO = "XiaomiMiMo/MiMo-V2.6-Pro-RL" as const;
export const MIMO_LICENSE = "MIT" as const;
export const XIAOMI_PAID = false as const;

/** Paid model that already lives in a social app. Alphabet and Meta models are not listed. */
export const PAID_MODEL_IN_SOCIAL = { x: "Grok" } as const;

export const UI_EXPERT_RULE =
  "This build is native and open source. Higher paid tiers open more of these controls. MiMo-V2.6-Pro runs only from a copy in this repo, on a stationary computer that has those weights. A phone, tablet, foldable, wearable, or Android Auto does not run those weights. MiniMind Max2 is the smaller open model for a carry device only when it fits. If it does not fit, or the weights are not on the device, it does not run. Nothing is fetched. Xiaomi is not paid and receives no viewer data. A paid model is allowed only inside a social app you already use outside TRV. This screen does not send your UI there. Telemetry beyond native GPS is not collected.";

const CLOSED_MODEL = /grok|openai|\bgpt\b|anthropic|claude|google|gemini|alphabet|\bmeta\b|facebook/i;
const THIRD_PARTY = /^https?:/i;

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

export function assertClosedModelRefused(name: string): void {
  if (name !== UI_MODEL_NAME || CLOSED_MODEL.test(name)) {
    throw new Error("A closed model is not the mix of experts. The weights are MiMo-V2.6-Pro.");
  }
}

export function resolveUiExpert(outsideApps: readonly string[]): {
  trvModel: typeof UI_MODEL_NAME;
  xiaomiPaid: false;
  sendsViewerData: false;
  paidModel: "Grok" | null;
  paidModelApp: "x" | null;
} {
  let paidModel: "Grok" | null = null;
  let paidModelApp: "x" | null = null;
  for (const raw of outsideApps) {
    const app = raw.trim().toLowerCase();
    if (app === "x") {
      paidModel = PAID_MODEL_IN_SOCIAL.x;
      paidModelApp = "x";
      break;
    }
  }
  return {
    trvModel: UI_MODEL_NAME,
    xiaomiPaid: false,
    sendsViewerData: false,
    paidModel,
    paidModelApp,
  };
}

/** A TRV-owned filesystem copy only. A URL would leave the device. */
export function assertMimoLocal(source: string): void {
  const path = source.trim();
  if (!path || THIRD_PARTY.test(path) || /xiaomi\.com|huggingface\.co|hf\.co/i.test(path)) {
    throw new Error("MiMo-V2.6-Pro runs only from a TRV-owned copy. Viewer data is not sent to Xiaomi or any third party. Xiaomi is not paid.");
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

export function uiControls(planId: string): UiControl[] {
  assertClosedModelRefused(UI_MODEL_NAME);
  if (XIAOMI_PAID) {
    throw new Error("Xiaomi is not paid.");
  }
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
  const open = new Set(uiControls(planId));
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
  return uiControls(planId).includes("exclusive") && paid;
}

export const EXCLUSIVE_LOOK_NOTE =
  "TRV Token🍃 can mark an exclusive look. The amount is not set. The look opens from the paid tier. MiMo-V2.6-Pro does not run unless a TRV-owned weight copy is on this box. Xiaomi is not paid. No price is invented.";
