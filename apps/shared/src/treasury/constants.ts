/**
 * Treasury constants aligned with docs/locked/14 and 15.
 * Creator address published by originator decision 2026-08-16.
 * Public TRV_POOL identity revised 2026-08-31: X Money @Archtecht.
 * Split locked at exact 50/50. Zero simulation.
 */

/** Public TRV_POOL — X Money handle. This is the human receive rail. */
export const TRV_POOL_HANDLE = "@Archtecht" as const;
export const TRV_POOL_X_URL = "https://x.com/Archtecht" as const;
export const TRV_POOL = TRV_POOL_HANDLE;

/**
 * Legacy Solana Community Pool pubkey.
 * On-chain sink only for existing SOL split code (PublicKey requires base58).
 * Not the public pool identity. Do not show this as TRV_POOL in UI.
 */
export const COMMUNITY_POOL_ADDRESS =
  "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt" as const;

/** Creator receive address (originator-published 2026-08-16). */
export const CREATOR_ADDRESS =
  "9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG" as const;

export const TREASURY_CHAIN = "solana" as const;
export const TREASURY_PUBLIC_RAIL = "x_money" as const;

/** Locked split of net shop proceeds after identity discounts. */
export const CREATOR_ROYALTY_PERCENT = 50 as const;
export const COMMUNITY_POOL_PERCENT = 50 as const;

/** Voluntary pool tips are not subject to creator cut. */
export const VOLUNTARY_POOL_TIP_CREATOR_PERCENT = 0 as const;
export const VOLUNTARY_POOL_TIP_POOL_PERCENT = 100 as const;
