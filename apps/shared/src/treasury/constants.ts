/**
 * Treasury constants aligned with docs/locked/14 and 15.
 * Creator address is NEVER hardcoded here — load from env only.
 */

/** Public Community Pool (Solana mainnet). Safe to publish. */
export const COMMUNITY_POOL_ADDRESS =
  "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt" as const;

export const TREASURY_CHAIN = "solana" as const;

/** Locked split of net shop proceeds after identity discounts. */
export const CREATOR_ROYALTY_PERCENT = 10 as const;
export const COMMUNITY_POOL_PERCENT = 90 as const;

/** Env var name for private creator receive address. */
export const CREATOR_ADDRESS_ENV = "TRV_CREATOR_SOLANA_ADDRESS" as const;

/** Voluntary pool tips are not subject to creator cut. */
export const VOLUNTARY_POOL_TIP_CREATOR_PERCENT = 0 as const;
export const VOLUNTARY_POOL_TIP_POOL_PERCENT = 100 as const;
