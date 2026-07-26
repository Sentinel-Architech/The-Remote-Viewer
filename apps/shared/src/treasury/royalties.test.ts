/**
 * Lightweight assertions for royalty math (run with node --experimental-vm-modules
 * or your test runner). Kept dependency-free for scaffold.
 */
import { computeRoyaltySplit, buildTreasuryRoutePlan } from "./royalties";
import { COMMUNITY_POOL_ADDRESS } from "./constants";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const net = 1_000_000n; // 0.001 SOL in lamports-style units
const split = computeRoyaltySplit({ netAmountAtomic: net });
assert(split.creatorAtomic === 100_000n, "10% creator");
assert(split.communityPoolAtomic === 900_000n, "90% pool");
assert(
  split.creatorAtomic + split.communityPoolAtomic === net,
  "parts sum to net"
);

const tip = computeRoyaltySplit({
  netAmountAtomic: net,
  kind: "voluntary_pool_tip",
});
assert(tip.creatorAtomic === 0n, "tips: no creator");
assert(tip.communityPoolAtomic === net, "tips: all pool");

// Remainder edge: 101 atomic → creator 10, pool 91
const edge = computeRoyaltySplit({ netAmountAtomic: 101n });
assert(edge.creatorAtomic === 10n, "floor 10%");
assert(edge.communityPoolAtomic === 91n, "remainder to pool");

let failed = false;
try {
  buildTreasuryRoutePlan(
    { netAmountAtomic: net },
    { creatorAddress: null, communityPoolAddress: COMMUNITY_POOL_ADDRESS }
  );
} catch {
  failed = true;
}
assert(failed, "must fail closed without creator address");

const plan = buildTreasuryRoutePlan(
  { netAmountAtomic: net },
  {
    creatorAddress: "CreatorAddressPlaceholder1111111111111111111",
    communityPoolAddress: COMMUNITY_POOL_ADDRESS,
  }
);
assert(plan.legs.length === 2, "two legs");
assert(plan.legs[0].role === "creator", "first leg creator");
assert(plan.legs[0].publicDestination === false, "creator not public");
assert(plan.legs[1].toAddress === COMMUNITY_POOL_ADDRESS, "pool address");

console.log("royalties.test.ts: ok");
