import {
  COMMUNITY_POOL_ADDRESS,
  COMMUNITY_POOL_PERCENT,
  CREATOR_ADDRESS_ENV,
  CREATOR_ROYALTY_PERCENT,
  TREASURY_CHAIN,
  VOLUNTARY_POOL_TIP_CREATOR_PERCENT,
  VOLUNTARY_POOL_TIP_POOL_PERCENT,
} from "./constants";
import type {
  CreatorRoyaltyConfig,
  NetProceedsInput,
  RoyaltySplit,
  TreasuryRoutePlan,
  TreasuryTransferLeg,
} from "./types";

/**
 * Split net atomic amount with remainder to community pool
 * so creator + pool always equals net (no dust left unassigned).
 */
export function computeRoyaltySplit(input: NetProceedsInput): RoyaltySplit {
  const kind = input.kind ?? "shop_purchase";
  const net = input.netAmountAtomic;
  if (net < 0n) {
    throw new Error("netAmountAtomic must be >= 0");
  }

  if (kind === "voluntary_pool_tip") {
    return {
      creatorAtomic: 0n,
      communityPoolAtomic: net,
      creatorPercent: VOLUNTARY_POOL_TIP_CREATOR_PERCENT,
      communityPoolPercent: VOLUNTARY_POOL_TIP_POOL_PERCENT,
      creatorAddressRequired: false,
    };
  }

  // 10% creator, remainder (90%+) to pool — integer-safe
  const creatorAtomic = (net * BigInt(CREATOR_ROYALTY_PERCENT)) / 100n;
  const communityPoolAtomic = net - creatorAtomic;

  return {
    creatorAtomic,
    communityPoolAtomic,
    creatorPercent: CREATOR_ROYALTY_PERCENT,
    communityPoolPercent: COMMUNITY_POOL_PERCENT,
    creatorAddressRequired: creatorAtomic > 0n,
  };
}

/**
 * Load creator address from environment. Returns null if unset.
 * Never log the full address in production analytics.
 */
export function loadCreatorAddressFromEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined"
    ? process.env
    : {}
): string | null {
  const raw = env[CREATOR_ADDRESS_ENV]?.trim();
  if (!raw) return null;
  // Basic Solana base58 length guard (32–44 chars typical)
  if (raw.length < 32 || raw.length > 44) {
    throw new Error(
      `${CREATOR_ADDRESS_ENV} looks invalid (unexpected length)`
    );
  }
  return raw;
}

export function getCreatorRoyaltyConfig(
  env?: Record<string, string | undefined>
): CreatorRoyaltyConfig {
  return {
    creatorAddress: loadCreatorAddressFromEnv(env),
    communityPoolAddress: COMMUNITY_POOL_ADDRESS,
  };
}

/**
 * Build transfer legs for wallet adapter / versioned transaction construction.
 * Fails closed if creator royalty is due but address is missing.
 */
export function buildTreasuryRoutePlan(
  input: NetProceedsInput,
  config: CreatorRoyaltyConfig = getCreatorRoyaltyConfig()
): TreasuryRoutePlan {
  const splits = computeRoyaltySplit(input);
  const legs: TreasuryTransferLeg[] = [];

  if (splits.creatorAtomic > 0n) {
    if (!config.creatorAddress) {
      throw new Error(
        `Creator royalty of ${splits.creatorAtomic} due but ${CREATOR_ADDRESS_ENV} is not set. Refusing to route.`
      );
    }
    legs.push({
      role: "creator",
      toAddress: config.creatorAddress,
      amountAtomic: splits.creatorAtomic,
      publicDestination: false,
    });
  }

  if (splits.communityPoolAtomic > 0n) {
    legs.push({
      role: "community_pool",
      toAddress: config.communityPoolAddress,
      amountAtomic: splits.communityPoolAtomic,
      publicDestination: true,
    });
  }

  return {
    splits,
    legs,
    chain: TREASURY_CHAIN,
  };
}

/**
 * User-facing disclosure string (does not include creator address).
 */
export function shopTreasuryDisclosure(): string {
  return (
    `Net eligible shop crypto (after discounts) is split ` +
    `${CREATOR_ROYALTY_PERCENT}% creator / ${COMMUNITY_POOL_PERCENT}% Community Pool. ` +
    `TRV never holds your wallet seed. ` +
    `Community Pool: ${COMMUNITY_POOL_ADDRESS}`
  );
}
