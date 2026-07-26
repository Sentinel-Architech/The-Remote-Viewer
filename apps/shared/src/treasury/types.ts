export type TreasuryLineKind = "shop_purchase" | "voluntary_pool_tip";

export interface NetProceedsInput {
  /** Net amount after identity discounts, in smallest unit (e.g. lamports) or decimal string handled by caller. */
  netAmountAtomic: bigint;
  kind?: TreasuryLineKind;
}

export interface RoyaltySplit {
  creatorAtomic: bigint;
  communityPoolAtomic: bigint;
  creatorPercent: number;
  communityPoolPercent: number;
  /** True when creator destination must come from private config. */
  creatorAddressRequired: boolean;
}

export interface TreasuryTransferLeg {
  role: "creator" | "community_pool";
  /** Null for creator when address not loaded — caller must fail closed. */
  toAddress: string | null;
  amountAtomic: bigint;
  publicDestination: boolean;
}

export interface TreasuryRoutePlan {
  splits: RoyaltySplit;
  legs: TreasuryTransferLeg[];
  chain: "solana";
}

export interface CreatorRoyaltyConfig {
  /** Private creator Solana address; never commit real value to git. */
  creatorAddress: string | null;
  communityPoolAddress: string;
}
