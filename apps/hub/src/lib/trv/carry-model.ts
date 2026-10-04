import { fullWeightLowerBoundBytes, phoneMimoRefusal } from "./mimo-capacity";
import { isCarrySeat, seatLabel, type ViewerSeat } from "./viewer-seat";

/** Architect-stated size of MiniMind Max2 max2-nano. Not a file measured in this repo. */
export const MINIMIND_NAME = "MiniMind Max2" as const;
export const MINIMIND_VARIANT = "max2-nano" as const;
export const MINIMIND_LICENSE = "Apache-2.0" as const;
export const MINIMIND_PUBLISHED_BYTES = 247 * 1024 * 1024;

/** A carry seat can hold the stated MiniMind file. The MiMo floor cannot. */
export const CARRY_SAFE_BYTES = 512 * 1024 * 1024;

/** A wearable process that maps the stated MiniMind file is not treated as safe. */
export const WEARABLE_SAFE_BYTES = 48 * 1024 * 1024;

export type CarryModelPlan = {
  seat: ViewerSeat;
  model: "MiMo-V2.6-Pro" | "MiniMind Max2";
  variant: "max2-nano" | null;
  fits: boolean;
  loaded: false;
  inferenceRan: false;
  fetched: false;
  crashed: false;
  paidHost: false;
  sendsViewerData: false;
  googleAutoHost: false;
  reason: string;
};

function minimindFits(seat: ViewerSeat): boolean {
  if (seat === "wearable") return MINIMIND_PUBLISHED_BYTES <= WEARABLE_SAFE_BYTES;
  if (seat === "stationary") return false;
  return MINIMIND_PUBLISHED_BYTES <= CARRY_SAFE_BYTES && MINIMIND_PUBLISHED_BYTES < fullWeightLowerBoundBytes();
}

/**
 * Choose the model for this seat. Missing local bytes never count as a run.
 * A file at or above the MiMo floor is refused on every carry seat.
 */
export function carryModelPlan(seat: ViewerSeat, localBytes: number | null): CarryModelPlan {
  const common = {
    seat,
    loaded: false as const,
    inferenceRan: false as const,
    fetched: false as const,
    crashed: false as const,
    paidHost: false as const,
    sendsViewerData: false as const,
    googleAutoHost: false as const,
  };

  if (!isCarrySeat(seat)) {
    return {
      ...common,
      model: "MiMo-V2.6-Pro",
      variant: null,
      fits: true,
      reason:
        "MiMo-V2.6-Pro is the model on a stationary computer you own. It runs only from a copy in this repo. If those weights are not in the repo, it does not load and does not run.",
    };
  }

  const label = seatLabel(seat);
  const mimo = phoneMimoRefusal(label);
  const tooBig = localBytes != null && (localBytes >= fullWeightLowerBoundBytes() || localBytes > CARRY_SAFE_BYTES);
  if (tooBig) {
    return {
      ...common,
      model: MINIMIND_NAME,
      variant: MINIMIND_VARIANT,
      fits: false,
      reason: `${mimo.reason} A file that large was not loaded. MiniMind Max2 was not run in its place.`,
    };
  }

  const fits = minimindFits(seat);
  if (!fits) {
    return {
      ...common,
      model: MINIMIND_NAME,
      variant: MINIMIND_VARIANT,
      fits: false,
      reason: `MiniMind Max2 (${MINIMIND_VARIANT}) is about 247 MB. It does not fit on this ${label}, so it was not loaded and did not run. ${mimo.reason}`,
    };
  }

  const auto =
    seat === "android-auto"
      ? " This install does not attach a Google car service. "
      : " ";
  if (localBytes == null || localBytes < 1) {
    return {
      ...common,
      model: MINIMIND_NAME,
      variant: MINIMIND_VARIANT,
      fits: true,
      reason: `MiniMind Max2 (${MINIMIND_VARIANT}, ${MINIMIND_LICENSE}) is the model for this ${label}.${auto}The weights are not on this device. Nothing was fetched. The model did not run. The app did not crash. This ${label} does not pay. ${mimo.reason}`,
    };
  }

  return {
    ...common,
    model: MINIMIND_NAME,
    variant: MINIMIND_VARIANT,
    fits: true,
    reason: `Read ${localBytes} local bytes named for MiniMind Max2. The network was not executed. This is not MiMo-V2.6-Pro. Nothing left the device. This ${label} does not pay.`,
  };
}
