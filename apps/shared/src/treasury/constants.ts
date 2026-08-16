/**
 * Treasury constants aligned with docs/locked/14 and 15.
 * Creator address published by originator decision 2026-08-16.
 * Split locked at exact 50/50. Zero simulation.
 */

/** Public Community Pool (Solana mainnet). */
export const COMMUNITY_POOL_ADDRESS =
  "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt" as const;

/** Creator receive address (originator-published 2026-08-16). */
export const CREATOR_ADDRESS =
  "9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG" as const;

export const TREASURY_CHAIN = "solana" as const;

/** Locked split of net shop proceeds after identity discounts. */
export const CREATOR_ROYALTY_PERCENT = 50 as const;
export const COMMUNITY_POOL_PERCENT = 50 as const;

/** Voluntary pool tips are not subject to creator cut. */
export const VOLUNTARY_POOL_TIP_CREATOR_PERCENT = 0 as const;
export const VOLUNTARY_POOL_TIP_POOL_PERCENT = 100 as const;
