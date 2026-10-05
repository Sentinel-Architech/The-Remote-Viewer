import { getRequest } from "@tanstack/react-start/server";
import { assertCarryDeviceDoesNotPay } from "./viewer-seat";

/** Refuse a charge when the request user agent is a carry seat. Tests with no request are not treated as a phone. */
export function refuseCarryPaymentFromRequest(): void {
  let ua = "";
  try {
    ua = getRequest().headers.get("user-agent") ?? "";
  } catch {
    return;
  }
  assertCarryDeviceDoesNotPay(ua);
}
