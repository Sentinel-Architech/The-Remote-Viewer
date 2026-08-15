/**
 * TRV device potential — shared by PWA and native Android shell.
 * SCAFFOLD: no native bindings here; pure derivation only.
 */

export type FeatureState = "none" | "denied" | "ready";

export type KeystoreClass =
  | "none"
  | "software"
  | "hardware"
  | "strongbox";

export type BiometricClass = "none" | "weak" | "strong";

export type SignalHint = "weak" | "standard" | "strong";

export type DevicePotential = {
  tier: 0 | 1 | 2 | 3;
  apiLevel: number;
  camera: FeatureState;
  mic: FeatureState;
  keystore: KeystoreClass;
  biometric: BiometricClass;
  localRuntime: boolean;
  signalHint: SignalHint;
  /** Human-readable limits — never claim more than probes allow */
  notes: string[];
};

export type ProbeResult = {
  apiLevel: number;
  hasCameraHardware: boolean;
  cameraPermission: "unknown" | "granted" | "denied";
  hasMicHardware: boolean;
  micPermission: "unknown" | "granted" | "denied";
  keystore: KeystoreClass;
  biometric: BiometricClass;
  localRuntime: boolean;
  /** User or install marked this device as a permanent node host */
  nodeHostOptIn?: boolean;
};

function feature(
  hardware: boolean,
  permission: ProbeResult["cameraPermission"]
): FeatureState {
  if (!hardware) return "none";
  if (permission === "denied") return "denied";
  if (permission === "granted") return "ready";
  return "denied"; // treat unknown as not ready until granted
}

/**
 * Derive tier from real probes. Do not accept a user-selected tier.
 */
export function mapTier(p: ProbeResult): DevicePotential {
  const camera = feature(p.hasCameraHardware, p.cameraPermission);
  const mic = feature(p.hasMicHardware, p.micPermission);
  const notes: string[] = [];

  if (camera !== "ready") notes.push("Camera off — sight features disabled");
  if (mic !== "ready") notes.push("Mic off — voice features disabled");
  if (p.keystore === "none") notes.push("No keystore — cloud-held keys only if ever used");
  if (p.keystore === "software") notes.push("Software keystore — weaker custody");

  let tier: 0 | 1 | 2 | 3 = 0;

  const baselineOk = p.apiLevel >= 26; // modern enough for baseline client
  if (!baselineOk) {
    notes.push("API below 26 — limited support");
  }

  const t1 =
    baselineOk &&
    (camera === "ready" || mic === "ready") &&
    (p.keystore === "hardware" || p.keystore === "strongbox" || p.keystore === "software");

  if (t1) tier = 1;

  // T2: hardened / local runtime (Graphene+Termux class) — detected, not assumed
  if (tier >= 1 && p.localRuntime) {
    tier = 2;
    notes.push("Local runtime present — hardened paths available");
  }

  // T3: explicit node host opt-in (entitlement still verified on-chain)
  if (p.nodeHostOptIn) {
    tier = 3;
    notes.push("Node host opt-in — chain entitlement still required");
  }

  const signalHint: SignalHint =
    tier >= 2 ? "strong" : tier === 1 ? "standard" : "weak";

  return {
    tier,
    apiLevel: p.apiLevel,
    camera,
    mic,
    keystore: p.keystore,
    biometric: p.biometric,
    localRuntime: p.localRuntime,
    signalHint,
    notes,
  };
}
