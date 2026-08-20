import type { Tier } from "./tiers";
import type { BillingInterval, Edition } from "./saas";

export type ViewerProfile = {
  userId: string;
  handle: string;
  displayName: string;
  bio: string;
  manifesto: string;
  tier: Tier | string;
  nativeSecurity: boolean;
  verifiedAt: string | null;
  neuronStage: number;
  xp: number;
  sentinelHealth: number;
  sentinelAutonomy: number;
  pulseRadius: number;
  autoIntercept: number;
  extraNeurons: number;
  credits: number;
  referralHandle: string | null;
  createdAt: string;
  edition: Edition;
  planId: string;
  planRenewsAt: string | null;
  orgId: number | null;
  billingInterval: BillingInterval;
  walletPubkey: string | null;
  phantomPubkey: string | null;
  solMicro: number;
  trialUntil: string | null;
  paidTrialUntil: string | null;
  paidTrialPlan: string | null;
  paidTrialUsed: boolean;
  orgName: string | null;
  orgSeats: number;
  isPublic: boolean;
  radiusOptIn: boolean;
  watchRadiusMi: number;
  shopFrame: string | null;
  shopTitle: string | null;
  shopChrome: string | null;
  hydraAddress: string | null;
  federatedOptIn: boolean;
  citizenAt: string | null;
  idType: string | null;
  idState: string | null;
  ageOk: boolean;
  ofacOk: boolean;
  tutorialAt: string | null;
  lastSkillAuditAt: string | null;
  lastSkillAuditScore: number | null;
  uiTheme: string | null;
  honeypotArmed?: boolean;
  lastWatchOn?: string | null;
  watchStreak?: number;
  avatarData: string | null;
  coverData: string | null;
  locationLabel: string;
  craft: string;
  website: string;
  statusLine: string;
  links: ProfileLink[];
  liveNow: boolean;
  liveTitle: string | null;
};

export type ProfileLink = {
  label: string;
  url: string;
};

export type PublicViewer = {
  handle: string;
  displayName: string;
  bio: string;
  manifesto: string;
  tier: string;
  nativeSecurity: boolean;
  neuronStage: number;
  avatarData: string | null;
  coverData: string | null;
  locationLabel: string;
  craft: string;
  website: string;
  statusLine: string;
  links: ProfileLink[];
  shopFrame: string | null;
  shopTitle: string | null;
  shopChrome: string | null;
  uiTheme: string | null;
  liveNow: boolean;
  liveTitle: string | null;
  citizenSealed: boolean;
};

export type PublicViewerCard = {
  handle: string;
  displayName: string;
  bio: string;
  craft: string;
  locationLabel: string;
  statusLine: string;
  avatarData: string | null;
  liveNow: boolean;
  liveTitle: string | null;
  neuronStage: number;
  tier: string;
};

export type ViewerDoc = {
  id: number;
  title: string;
  kind: string;
  mime: string;
  body: string;
  bytes: number;
  createdAt: string;
};

export type ShopPurchase = {
  itemId: string;
  name: string;
  creditsPaid: number;
  createdAt: string;
};

export type WatchStatus = {
  day: string;
  claimed: boolean;
  defended: boolean;
  intercepts: number;
  streak: number;
  nextStreak: number;
  nextCredits: number;
  health: number;
  missedDays: number;
  decayDamage: number;
  secondsLeft: number;
};

export type NftRow = {
  id: number;
  userId: string;
  handle?: string;
  title: string;
  kind: string;
  imageData: string;
  listed: boolean;
  priceCredits: number;
  minted: boolean;
  createdAt: string;
  inspirationData?: string | null;
  bundlePrice?: number;
  mediaRef?: string | null;
  durationSec?: number;
};

export type SaleRow = {
  id: number;
  nftId: number;
  amount: number;
  fee: number;
  createdAt: string;
  title?: string;
};

export type ForumPost = {
  id: number;
  userId: string;
  handle: string;
  displayName: string;
  title: string;
  body: string;
  nftId: number | null;
  nftImage?: string | null;
  createdAt: string;
  rating: string;
  priceCredits: number;
  sealed: boolean;
  mediaKind?: string;
  mediaRef?: string | null;
  durationSec?: number;
};

export type DefenseRow = {
  id: number;
  attackType: string;
  outcome: string;
  xpGain: number;
  createdAt: string;
};

export type MoeRow = {
  id: number;
  kind: string;
  summary: string;
  createdAt: string;
};

export type MigrationRow = {
  id: number;
  sourcePlatform: string;
  content: string;
  createdAt: string;
};

export type InvoiceRow = {
  id: number;
  planId: string;
  usdCents: number;
  credits: number;
  kind: string;
  memo: string;
  createdAt: string;
};

export type OrgSnapshot = {
  id: number;
  name: string;
  slug: string;
  planId: string;
  seats: number;
  ownerId: string;
  members: { userId: string; handle: string; displayName: string; role: string }[];
};
