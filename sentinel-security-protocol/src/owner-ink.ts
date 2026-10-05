/**
 * The owner's ink is a dead man's switch.
 * A photograph is never stored, described, or uploaded.
 */

export const OWNER_INK_ROLE = "dead man's switch" as const;

export const COMMERCIAL_ASPECT_OTA_NOTICE =
  "A commercial may be buying an aspect for its own use." as const;

export const CORPORATE_ASPECT_PROFITS = "community pool" as const;

const REFUSED = "The owner's ink is not stored, described, or uploaded.";

const REFUSED_KEY =
  /image|photo|photograph|picture|pixel|upload|dataurl|base64|blob|tattoo|description|depict/i;

export type OwnerInkNotice = {
  scope: "system-wide";
  channel: "ota";
  text: typeof COMMERCIAL_ASPECT_OTA_NOTICE;
  imageStored: false;
  imageDescribed: false;
  imageUploaded: false;
  corporateAspectProfits: typeof CORPORATE_ASPECT_PROFITS;
};

export type OwnerInkResult = {
  role: typeof OWNER_INK_ROLE;
  tripped: boolean;
  notice: OwnerInkNotice | null;
};

function refuseInkPayload(value: unknown): void {
  if (typeof value === "string" && /^data:image\//i.test(value)) {
    throw new Error(REFUSED);
  }
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    throw new Error(REFUSED);
  }
  if (Array.isArray(value)) {
    for (const entry of value) refuseInkPayload(entry);
    return;
  }
  if (value !== null && typeof value === "object") {
    assertNoInkImage(value as Record<string, unknown>);
  }
}

export function assertNoInkImage(record: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(record)) {
    if (REFUSED_KEY.test(key)) throw new Error(REFUSED);
    refuseInkPayload(value);
  }
}

export function ownerInkSwitch(input: {
  photographRequired: boolean;
  record?: Record<string, unknown>;
}): OwnerInkResult {
  assertNoInkImage(input.record ?? {});
  if (!input.photographRequired) {
    return { role: OWNER_INK_ROLE, tripped: false, notice: null };
  }
  return {
    role: OWNER_INK_ROLE,
    tripped: true,
    notice: {
      scope: "system-wide",
      channel: "ota",
      text: COMMERCIAL_ASPECT_OTA_NOTICE,
      imageStored: false,
      imageDescribed: false,
      imageUploaded: false,
      corporateAspectProfits: CORPORATE_ASPECT_PROFITS,
    },
  };
}

export function routeCorporateAspectProfit(amount: number | null): {
  destination: typeof CORPORATE_ASPECT_PROFITS;
  amount: number | null;
  keptByCommercial: 0;
} {
  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
    throw new Error("A corporate-aspect profit amount has to be a non-negative number or unset.");
  }
  return {
    destination: CORPORATE_ASPECT_PROFITS,
    amount,
    keptByCommercial: 0,
  };
}
