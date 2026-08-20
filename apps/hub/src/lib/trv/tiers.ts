export const TIERS = ["initiate", "verified", "node", "sentinel"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABEL: Record<Tier, string> = {
  initiate: "Initiate",
  verified: "Verified Viewer",
  node: "Remote Node",
  sentinel: "Sentinel",
};

export const TIER_COPY: Record<Tier, string> = {
  initiate: "Documents and sources. Methods sealed. Platform fee on native mints.",
  verified: "Robot handshake complete. Gateway methods unlocked.",
  node: "Localized galaxy access. Reduced mint fee.",
  sentinel: "Highest tier. Native mint and sale fees are zero.",
};

/** Platform fee on TRV-native NFT sales. Sentinel (highest) is free. */
export function platformFeeRate(tier: string): number {
  switch (tier) {
    case "sentinel":
      return 0;
    case "node":
      return 0.03;
    case "verified":
      return 0.05;
    default:
      return 0.08;
  }
}

export function feeAmount(price: number, tier: string): number {
  return Math.round(price * platformFeeRate(tier));
}

export const STAGE_LABEL = [
  "Watchful Neuron",
  "Remote Node",
  "Localized Galaxy",
  "Global Mesh",
] as const;

export function stageFromXp(xp: number): number {
  if (xp >= 2400) return 3;
  if (xp >= 1200) return 2;
  if (xp >= 400) return 1;
  return 0;
}

export function tierFromProgress(xp: number, verified: boolean): Tier {
  const stage = stageFromXp(xp);
  if (stage >= 3 && verified) return "sentinel";
  if (stage >= 2 && verified) return "node";
  if (verified) return "verified";
  return "initiate";
}

export function isTier(value: string): value is Tier {
  return (TIERS as readonly string[]).includes(value);
}
