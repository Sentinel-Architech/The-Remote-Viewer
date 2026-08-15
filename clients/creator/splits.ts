/** Locked BPS — keep in sync with program constants when on-chain */
export const DIGITAL_CREATOR_BPS = 9500; // 95%
export const DIGITAL_POOL_BPS = 500; // 5%
export const NFT_CREATOR_BPS = 9000; // 90%
export const NFT_POOL_BPS = 1000; // 10%
export const PLATFORM_BPS = 0;

export type SplitKind = "digital" | "nft_primary";

export function splitAmount(
  kind: SplitKind,
  gross: bigint
): { creator: bigint; pool: bigint; platform: bigint } {
  const creatorBps = kind === "digital" ? DIGITAL_CREATOR_BPS : NFT_CREATOR_BPS;
  const poolBps = kind === "digital" ? DIGITAL_POOL_BPS : NFT_POOL_BPS;
  const creator = (gross * BigInt(creatorBps)) / 10000n;
  const pool = (gross * BigInt(poolBps)) / 10000n;
  const platform = 0n;
  // remainder dust to pool to avoid platform skim
  const allocated = creator + pool + platform;
  const dust = gross - allocated;
  return { creator, pool: pool + dust, platform };
}
