/** Native TRV SaaS catalog. People and Company share one ledger — no processor backdoor. */

export const USD_TO_TRV = 10;

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
    tagline: "Paid access after handshake. Outside Viewers try it for 2 days, self-serve.",
    usdMonth: 9,
    seats: 1,
    feeRate: 0.05,
    features: [
      "Everything in Initiate",
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
    tagline: "Localized galaxy. Reduced fee. Sentinel learns faster.",
    usdMonth: 29,
    seats: 1,
    feeRate: 0.03,
    features: [
      "Everything in Verified",
      "God's-eye mesh + R&D",
      "Live camera / mic duration you choose",
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
    tagline: "Air-gapped contract. Unlimited seats. 0% mint. We The People terms, company scale.",
    usdMonth: 2400,
    seats: 100,
    feeRate: 0,
    features: [
      "100 seats (expand by invoice)",
      "0% native mint fee",
      "Air-gapped hub language",
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
  const months = interval === "year" ? 10 : 1;
  return Math.round(usd * months * USD_TO_TRV);
}

export function planPriceUsd(plan: SaasPlan, interval: BillingInterval): number {
  return interval === "year" ? plan.usdMonth * 10 : plan.usdMonth;
}

export function planFeeRate(planId: string): number {
  return planById(planId).feeRate;
}

/** SaaS plan can only *lower* the fee. Game rank never raises it above a paid plan. Citizen lock knocks 2 points off remaining fees. */
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
