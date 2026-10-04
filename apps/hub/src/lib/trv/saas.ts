/** Native TRV SaaS catalog. People and Company share one ledger — no processor backdoor. */

export const USD_TO_TRV = 10;

/** Human comms unlock — VALUE.md / issue #67. Do not quote $96. */
export const HUMAN_COMMS_MONTH_USD = 10;
export const HUMAN_COMMS_YEAR_USD = 50;

export type Edition = "people" | "company";
export type BillingInterval = "month" | "year";

export type SaasPlan = {
  id: string;
  edition: Edition;
  name: string;
  tagline: string;
  usdMonth: number;
  seats: number;
  feeRate: number;
  features: string[];
};

export const PEOPLE_PLANS: SaasPlan[] = [
  {
    id: "initiate",
    edition: "people",
    name: "Initiate",
    tagline: "Documents, sources, and the neuron field. Methods sealed.",
    usdMonth: 0,
    seats: 1,
    feeRate: 0.08,
    features: [
      "Native TRV lock",
      "Watchful Neuron + mesh sim",
      "Gateway documents (free)",
      "Forum + copy-paste migration",
      "8% native mint fee",
    ],
  },
  {
    id: "verified",
    edition: "people",
    name: "Verified",
    tagline: "Unlimited human comms after handshake. $10/mo or $50/year.",
    usdMonth: HUMAN_COMMS_MONTH_USD,
    seats: 1,
    feeRate: 0.05,
    features: [
      "Everything in Initiate",
      "Unlimited human comms",
      "Gateway methods (handshake still required)",
      "QR profile share",
      "48-hour outside trial (once)",
      "5% native mint fee",
    ],
  },
  {
    id: "node",
    edition: "people",
    name: "Remote Node",
    tagline: "Active node unlocks comms with no $10/$50 sub.",
    usdMonth: 0,
    seats: 1,
    feeRate: 0.03,
    features: [
      "Everything in Verified",
      "Comms via active node — no duplicate sub",
      "God's-eye mesh + R&D",
      "3% native mint fee",
    ],
  },
  {
    id: "sentinel",
    edition: "people",
    name: "Sentinel",
    tagline: "Highest People tier. Native mint and sale fees are zero.",
    usdMonth: 79,
    seats: 1,
    feeRate: 0,
    features: [
      "Everything in Remote Node",
      "0% platform fee on native mints",
      "Hydra evidence routing tools",
      "Personal knight Sentinel (unlimited in-hub)",
    ],
  },
];

export const COMPANY_PLANS: SaasPlan[] = [
  {
    id: "squad",
    edition: "company",
    name: "Squad",
    tagline: "A sealed cell. Five seats. Same zero-backdoor covenant.",
    usdMonth: 149,
    seats: 5,
    feeRate: 0.05,
    features: [
      "5 Remote Viewer seats",
      "Shared mesh watch",
      "Zero-backdoor covenant",
      "Native TRV lock required per seat",
      "5% native mint fee",
    ],
  },
  {
    id: "command",
    edition: "company",
    name: "Command",
    tagline: "Twenty-five seats. Dedicated node. R&D pooled.",
    usdMonth: 490,
    seats: 25,
    feeRate: 0.03,
    features: [
      "25 seats",
      "Pooled R&D + defense log",
      "Org QR + invite handles",
      "3% native mint fee",
      "No telemetry off-device",
    ],
  },
  {
    id: "sovereign",
    edition: "company",
    name: "Sovereign",
    tagline: "Company grant scale — not the $50 human SKU. Signed native TRV. Not an air gap.",
    usdMonth: 2400,
    seats: 100,
    feeRate: 0,
    features: [
      "100 seats (expand by invoice)",
      "0% native mint fee",
      "Signed native TRV settlement",
      "Zero corporate SSO required",
      "Signed zero-backdoor covenant",
    ],
  },
];

export const ALL_PLANS: SaasPlan[] = [...PEOPLE_PLANS, ...COMPANY_PLANS];

const BY_ID = Object.fromEntries(ALL_PLANS.map((p) => [p.id, p])) as Record<string, SaasPlan>;

export function planById(id: string | null | undefined): SaasPlan {
  return BY_ID[id ?? ""] ?? PEOPLE_PLANS[0];
}

export function usdToCredits(usd: number, interval: BillingInterval = "month"): number {
  const bill = interval === "year" && usd === HUMAN_COMMS_MONTH_USD ? HUMAN_COMMS_YEAR_USD : interval === "year" ? usd * 10 : usd;
  return Math.round(bill * USD_TO_TRV);
}

export function planPriceUsd(plan: SaasPlan, interval: BillingInterval): number {
  if (interval === "year" && plan.id === "verified") return HUMAN_COMMS_YEAR_USD;
  return interval === "year" ? plan.usdMonth * 10 : plan.usdMonth;
}

export function planFeeRate(planId: string): number {
  return planById(planId).feeRate;
}

export function effectiveFeeRate(planId: string, gameTier: string, citizen = false): number {
  const fromPlan = planFeeRate(planId);
  const fromGame =
    gameTier === "sentinel" ? 0 : gameTier === "node" ? 0.03 : gameTier === "verified" ? 0.05 : 0.08;
  const base = Math.min(fromPlan, fromGame);
  if (citizen && base > 0) return Math.max(0, Math.round((base - 0.02) * 100) / 100);
  return base;
}

export function isCompanyPlan(id: string): boolean {
  return planById(id).edition === "company";
}
