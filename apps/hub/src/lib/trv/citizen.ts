export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
] as const;

export const STATE_ID_TYPES = [
  { id: "state_dl", label: "State driver's license" },
  { id: "state_id", label: "State ID card" },
] as const;

export const FEDERAL_ID_TYPES = [
  { id: "us_passport", label: "US passport" },
  { id: "military", label: "US military / CAC" },
] as const;

export const ID_TYPES = [...STATE_ID_TYPES, ...FEDERAL_ID_TYPES] as const;

export const CITIZEN_SHOP_RATE = 0.85;
export const CITIZEN_PLAN_RATE = 0.9;

/** Dual-document seal: id_type must be "state_*+federal_*". */
export function isDualCitizenSeal(idType: string | null | undefined): boolean {
  if (!idType || !idType.includes("+")) return false;
  const [statePart, fedPart] = idType.split("+");
  return Boolean(statePart?.startsWith("state_")) && (fedPart === "us_passport" || fedPart === "military");
}

export function shopPrice(credits: number, citizen: boolean): number {
  return citizen ? Math.max(1, Math.round(credits * CITIZEN_SHOP_RATE)) : credits;
}

export function planCredits(credits: number, citizen: boolean): number {
  return citizen ? Math.max(0, Math.round(credits * CITIZEN_PLAN_RATE)) : credits;
}

export async function citizenHash(parts: {
  stateType: string;
  state: string;
  stateLast4: string;
  fedType: string;
  fedLast4: string;
  yob: string;
}): Promise<string> {
  if (!parts.stateType.startsWith("state_")) {
    throw new Error("State driver's license or state ID is required");
  }
  if (parts.fedType !== "us_passport" && parts.fedType !== "military") {
    throw new Error("US passport or military / CAC is required");
  }
  if (parts.stateLast4.length < 4 || parts.fedLast4.length < 4 || parts.yob.length !== 4) {
    throw new Error("Both documents and birth year are required");
  }
  const raw = [
    "v2",
    parts.stateType,
    parts.state,
    parts.stateLast4.toUpperCase(),
    parts.fedType,
    parts.fedLast4.toUpperCase(),
    parts.yob,
  ].join("|");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function motionScore(frames: ImageData[]): number {
  if (frames.length < 4) return 0;
  let acc = 0;
  let n = 0;
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1]!.data;
    const b = frames[i]!.data;
    let diff = 0;
    const step = 16 * 4;
    for (let p = 0; p < a.length; p += step) {
      diff += Math.abs(a[p]! - b[p]!);
    }
    acc += diff / (a.length / step);
    n += 1;
  }
  return Math.min(100, Math.round(acc / n / 2));
}
