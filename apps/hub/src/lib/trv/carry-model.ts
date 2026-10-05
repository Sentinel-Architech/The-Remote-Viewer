import { fullWeightLowerBoundBytes, phoneMimoRefusal } from "./mimo-capacity";
import { SHIPPED_MODEL_LICENSE, SHIPPED_MODEL_NAME, SHIPPED_WEIGHT_BYTES } from "./minimind2-small";
import { isCarrySeat, seatLabel, type ViewerSeat } from "./viewer-seat";

/** A carry seat can hold the shipped MiniMind2-Small file. The MiMo floor cannot. */
export const CARRY_SAFE_BYTES = 512 * 1024 * 1024;

/** A wearable process that maps the shipped file is not treated as safe. */
export const WEARABLE_SAFE_BYTES = 48 * 1024 * 1024;

export { SHIPPED_WEIGHT_BYTES };

export type CarryModelPlan = {
  seat: ViewerSeat;
  model: typeof SHIPPED_MODEL_NAME;
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

/**
 * The weights that ship for a phone and a desktop are MiniMind2-Small.
 * Missing local bytes never count as a run. A file at or above the MiMo floor is refused.
 */
export function carryModelPlan(seat: ViewerSeat, localBytes: number | null): CarryModelPlan {
  const common = {
    seat,
    model: SHIPPED_MODEL_NAME,
    loaded: false as const,
    inferenceRan: false as const,
    fetched: false as const,
    crashed: false as const,
    paidHost: false as const,
    sendsViewerData: false as const,
    googleAutoHost: false as const,
  };
  const label = seatLabel(seat);
  const mimo = phoneMimoRefusal(label);
  const tooBig = localBytes != null && (localBytes >= fullWeightLowerBoundBytes() || localBytes > CARRY_SAFE_BYTES);
  if (tooBig) {
    return {
      ...common,
      fits: false,
      reason: `${mimo.reason} A file that large was not loaded. MiniMind2-Small was not run in its place. MiniMind Max2 weights are not in this repo and did not run.`,
    };
  }

  const budget = seat === "wearable" ? WEARABLE_SAFE_BYTES : CARRY_SAFE_BYTES;
  const fits = SHIPPED_WEIGHT_BYTES <= budget && SHIPPED_WEIGHT_BYTES < fullWeightLowerBoundBytes();
  if (!fits) {
    return {
      ...common,
      fits: false,
      reason: `MiniMind2-Small is ${SHIPPED_WEIGHT_BYTES} bytes. It does not fit on this ${label}, so it was not loaded and did not run. A fit check is not a run. ${mimo.reason}`,
    };
  }

  const auto = seat === "android-auto" ? " This install does not attach an outside car host." : "";
  const pay = isCarrySeat(seat) ? ` This ${label} does not pay.` : "";
  if (localBytes == null || localBytes < 1) {
    return {
      ...common,
      fits: true,
      reason: `MiniMind2-Small (${SHIPPED_MODEL_LICENSE}) is the weight that ships for this ${label}.${auto} This check did not measure the file. The model did not run. A fit check is not a run. MiMo-V2.6-Pro weights are not in this repo and did not run. MiniMind Max2 weights are not in this repo and did not run.${pay}`,
    };
  }

  return {
    ...common,
    fits: true,
    reason: `Measured ${localBytes} local bytes of MiniMind2-Small. The model was not executed. A fit check is not a run.${auto}${pay}`,
  };
}
