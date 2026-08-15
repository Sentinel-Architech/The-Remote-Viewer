/** Locked BPS — match on-chain when trv_governance ships */
export const DIGITAL_CREATOR_BPS = 9500;
export const DIGITAL_POOL_BPS = 500;
export const NFT_CREATOR_BPS = 9000;
export const NFT_POOL_BPS = 1000;
export const NFT_SECONDARY_CREATOR_BPS = 500; // 5% to original creator
export const PLATFORM_BPS = 0;

export type SplitKind = "digital" | "nft_primary" | "nft_secondary";

export function splitAmount(
  kind: SplitKind,
  gross: bigint
): { creator: bigint; pool: bigint; platform: bigint } {
  if (PLATFORM_BPS !== 0) {
    throw new Error("platform BPS must remain 0");
  }
  if (kind === "nft_secondary") {
    const creator = (gross * BigInt(NFT_SECONDARY_CREATOR_BPS)) / 10000n;
    return { creator, pool: 0n, platform: 0n };
  }
  const creatorBps = kind === "digital" ? DIGITAL_CREATOR_BPS : NFT_CREATOR_BPS;
  const poolBps = kind === "digital" ? DIGITAL_POOL_BPS : NFT_POOL_BPS;
  const creator = (gross * BigInt(creatorBps)) / 10000n;
  const pool = (gross * BigInt(poolBps)) / 10000n;
  const platform = 0n;
  const dust = gross - creator - pool - platform;
  return { creator, pool: pool + dust, platform };
}
