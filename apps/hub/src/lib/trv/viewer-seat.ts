/** Where a Remote Viewer is sitting. A carry seat is not a stationary computer. */

export type ViewerSeat = "stationary" | "phone" | "tablet" | "foldable" | "wearable" | "android-auto";

const CARRY: readonly ViewerSeat[] = ["phone", "tablet", "foldable", "wearable", "android-auto"];

export function viewerSeatFromUserAgent(ua: string): ViewerSeat {
  const s = ua.toLowerCase();
  if (/android\s*auto|androidauto|automotive/.test(s)) return "android-auto";
  if (/wearable|wear\s*os|\bwatch\b/.test(s)) return "wearable";
  if (/foldable|\bfold\b|galaxy z|surface duo/.test(s)) return "foldable";
  if (/ipad|tablet|playbook|kindle|silk/.test(s)) return "tablet";
  if (/android|iphone|ipod|mobile|phone/.test(s)) return "phone";
  return "stationary";
}

export function isCarrySeat(seat: ViewerSeat): boolean {
  return CARRY.includes(seat);
}

export function seatLabel(seat: ViewerSeat): string {
  switch (seat) {
    case "stationary":
      return "stationary computer";
    case "phone":
      return "phone";
    case "tablet":
      return "tablet";
    case "foldable":
      return "foldable";
    case "wearable":
      return "wearable";
    case "android-auto":
      return "Android Auto";
    default: {
      const neverSeat: never = seat;
      return neverSeat;
    }
  }
}

export function assertCarryDeviceDoesNotPay(ua: string): void {
  const seat = viewerSeatFromUserAgent(ua);
  if (!isCarrySeat(seat)) return;
  throw new Error(
    `A ${seatLabel(seat)} does not pay. The on-device weights that ship are MiniMind2-Small.`,
  );
}
