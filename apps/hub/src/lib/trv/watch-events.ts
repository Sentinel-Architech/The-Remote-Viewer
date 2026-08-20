/** Fired after a landed intercept so the daily duty card can flip to “claim”. */
export const WATCH_REFRESH = "trv-watch-refresh";

export function pingWatch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WATCH_REFRESH));
}
