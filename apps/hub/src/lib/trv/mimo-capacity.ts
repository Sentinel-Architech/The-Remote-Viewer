/**
 * Published MiMo-V2.6-Pro expert-weight lower bound.
 * Fields from the public config: 70 layers, 1 dense, hidden 6144,
 * 384 routed experts, moe intermediate 2048, 3 matrices, 4-bit store.
 * This is not a downloaded file size.
 */
export const MIMO_LAYERS = 70;
export const MIMO_DENSE_LAYERS = 1;
export const MIMO_HIDDEN = 6144;
export const MIMO_ROUTED_EXPERTS = 384;
export const MIMO_EXPERT_INTERMEDIATE = 2048;
export const MIMO_MATRICES_PER_EXPERT = 3;
export const MIMO_BITS_PER_WEIGHT = 4;

export function fullWeightLowerBoundBytes(): number {
  const moeLayers = MIMO_LAYERS - MIMO_DENSE_LAYERS;
  const params =
    MIMO_HIDDEN * MIMO_EXPERT_INTERMEDIATE * MIMO_MATRICES_PER_EXPERT * MIMO_ROUTED_EXPERTS * moeLayers;
  return (params * MIMO_BITS_PER_WEIGHT) / 8;
}

export function phoneMimoRefusal(seatLabelText = "phone"): {
  model: "MiMo-V2.6-Pro";
  loaded: false;
  inferenceRan: false;
  fetched: false;
  sendsViewerData: false;
  paidHost: false;
  reason: string;
} {
  const gib = fullWeightLowerBoundBytes() / 1024 ** 3;
  return {
    model: "MiMo-V2.6-Pro",
    loaded: false,
    inferenceRan: false,
    fetched: false,
    sendsViewerData: false,
    paidHost: false,
    reason: `The full MiMo-V2.6-Pro weights are about ${gib.toFixed(0)} GiB at the published 4-bit expert floor. They do not run on this ${seatLabelText}. Nothing was fetched. No paid host is used. Nothing leaves the device.`,
  };
}
