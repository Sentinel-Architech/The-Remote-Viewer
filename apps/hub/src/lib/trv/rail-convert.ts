import { IN_APP_TOKEN_NAME } from "./viewer-locks";
import { assertCarryDeviceDoesNotPay, isCarrySeat, type ViewerSeat } from "./viewer-seat";

/** One card unit to one crypto unit to one TRV Token🍃. Bulk quantity is not set. */
export const CONVERTER_RATE = 1 as const;
export const CONVERTER_TX_CAP = 1000 as const;
export const CONVERTER_MONTH_CAP_USD = 9000 as const;
/** One QR share to a new Remote Viewer. The bulk quantity this discounts is not set. */
export const QR_BULK_DISCOUNT = 0.1 as const;
export const BULK_QUANTITY = null;
/**
 * Catalog order is initiate, verified, node, sentinel, squad, command, sovereign.
 * Second-lowest is verified. The next paid tier above it is sentinel, and sentinel is not the highest.
 * Sovereign is the highest. No other extra amount is published.
 */
export const SECOND_LOWEST_TIER = "verified" as const;
export const SECOND_LOWEST_EXTRA = 1200 as const;
export const PAID_ABOVE_SECOND_LOWEST = "sentinel" as const;
export const PAID_ABOVE_EXTRA = 2000 as const;
export const HIGHEST_TIER = "sovereign" as const;

export type ConvertDirection = "card-to-crypto" | "crypto-to-card";

export type ConverterQuote = {
  direction: ConvertDirection;
  cardRail: "stripe";
  cryptoRail: "phantom";
  rate: 1 | null;
  units: number | null;
  shopToken: typeof IN_APP_TOKEN_NAME;
  shopCredit: number | null;
  usd: number | null;
  txCap: 1000;
  monthCapUsd: 9000;
  bulk: boolean;
  bulkDiscount: 0.1 | null;
  bulkQuantity: null;
  tierExtra: number | null;
  tierExtraApplied: boolean;
  openToBankBalance: boolean;
  monthCapApplies: boolean;
  moneyMoved: false;
  completed: boolean;
  reason: string;
};

export type TierTokenExtra = {
  amount: number | null;
  openToBankBalance: boolean;
  monthCapUsd: number | null;
  note: string;
};

/** Extra TRV Token🍃 for a published tier. Other tiers stay unset. */
export function tierTokenExtra(planId: string, bankBalanceUsd: number | null): TierTokenExtra {
  if (planId === SECOND_LOWEST_TIER) {
    return {
      amount: SECOND_LOWEST_EXTRA,
      openToBankBalance: false,
      monthCapUsd: CONVERTER_MONTH_CAP_USD,
      note: "Verified is the second-lowest tier and gets 1200 extra TRV Token🍃. The $9000 monthly cap still applies. No money moved.",
    };
  }
  if (planId === PAID_ABOVE_SECOND_LOWEST) {
    return {
      amount: PAID_ABOVE_EXTRA,
      openToBankBalance: false,
      monthCapUsd: CONVERTER_MONTH_CAP_USD,
      note: "Sentinel is the paid tier above Verified and is not the highest. It gets 2000 extra TRV Token🍃. The $9000 monthly cap still applies. No money moved.",
    };
  }
  if (planId === HIGHEST_TIER) {
    const balance = typeof bankBalanceUsd === "number" && Number.isFinite(bankBalanceUsd) ? Math.max(0, bankBalanceUsd) : null;
    return {
      amount: null,
      openToBankBalance: true,
      monthCapUsd: balance,
      note:
        balance == null
          ? "Sovereign is the highest tier. It is open up to the viewer's available bank balance. That balance is not on this quote, so no extra amount is added and the open ceiling is not used. No money moved."
          : "Sovereign is the highest tier. It is open up to the viewer's available bank balance. No other extra amount is added. The $9000 monthly cap does not replace that balance. No money moved.",
    };
  }
  return {
    amount: null,
    openToBankBalance: false,
    monthCapUsd: CONVERTER_MONTH_CAP_USD,
    note: "No extra TRV Token🍃 amount is published for this tier. The $9000 monthly cap still applies. No money moved.",
  };
}

export function unusedQrBulkDiscounts(newViewerQrShares: number, bulkDiscountsUsed: number): number {
  const shares = Number.isFinite(newViewerQrShares) ? Math.max(0, Math.floor(newViewerQrShares)) : 0;
  const used = Number.isFinite(bulkDiscountsUsed) ? Math.max(0, Math.floor(bulkDiscountsUsed)) : 0;
  return Math.max(0, shares - used);
}

/**
 * Quote a card ↔ crypto conversion into shop TRV Token🍃.
 * Stripe stays the card rail. Phantom stays the Solana rail.
 * No charge is sent. No ledger balance is changed.
 */
export function quoteConverter(input: {
  seat: ViewerSeat;
  userAgent?: string;
  planId: string;
  direction: ConvertDirection;
  units: number;
  bulk: boolean;
  spentThisMonthUsd: number;
  newViewerQrShares: number;
  bulkDiscountsUsed: number;
  bankBalanceUsd?: number | null;
  tierExtraAlreadyCounted?: boolean;
}): ConverterQuote {
  if (input.userAgent) assertCarryDeviceDoesNotPay(input.userAgent);
  if (isCarrySeat(input.seat)) {
    throw new Error("A carry device does not pay. The converter did not run and no money moved.");
  }
  const extra = tierTokenExtra(input.planId, input.bankBalanceUsd ?? null);
  const monthCap = extra.openToBankBalance && extra.monthCapUsd == null ? CONVERTER_MONTH_CAP_USD : (extra.monthCapUsd ?? CONVERTER_MONTH_CAP_USD);
  const monthCapApplies = !(extra.openToBankBalance && extra.monthCapUsd != null);
  const base = {
    direction: input.direction,
    cardRail: "stripe" as const,
    cryptoRail: "phantom" as const,
    shopToken: IN_APP_TOKEN_NAME,
    txCap: CONVERTER_TX_CAP,
    monthCapUsd: monthCapApplies ? CONVERTER_MONTH_CAP_USD : monthCap,
    bulk: input.bulk,
    bulkQuantity: BULK_QUANTITY,
    tierExtra: extra.amount,
    tierExtraApplied: false,
    openToBankBalance: extra.openToBankBalance,
    monthCapApplies,
    moneyMoved: false as const,
  };

  if (input.bulk) {
    const unused = unusedQrBulkDiscounts(input.newViewerQrShares, input.bulkDiscountsUsed);
    const discount = unused > 0 ? QR_BULK_DISCOUNT : null;
    return {
      ...base,
      rate: null,
      units: null,
      shopCredit: null,
      usd: null,
      bulkDiscount: discount,
      completed: false,
      reason:
        unused > 0
          ? "A QR share to a new Remote Viewer gives 10% off one bulk buy. The bulk quantity is not set, so the buy did not run. No money moved. One transaction stays capped at 1000 TRV Token🍃 and a month stays capped at $9000."
          : "Bulk is unset without an unused QR share to a new Remote Viewer. No bulk quantity is published. The buy did not run. No money moved.",
    };
  }

  if (!Number.isInteger(input.units) || input.units < 1) {
    throw new Error("The converter needs a whole number of units. No money moved.");
  }
  if (input.units > CONVERTER_TX_CAP) {
    throw new Error("One converter transaction is capped at 1000 TRV Token🍃. No money moved.");
  }
  const spent = Number.isFinite(input.spentThisMonthUsd) ? Math.max(0, input.spentThisMonthUsd) : 0;
  if (spent + input.units > monthCap) {
    throw new Error(
      monthCapApplies
        ? "Converter spending is capped at $9000 per month. No money moved."
        : "This quote stops at the available bank balance. No money moved.",
    );
  }
  const extraFits =
    extra.amount != null &&
    !input.tierExtraAlreadyCounted &&
    spent + input.units + extra.amount <= monthCap;

  return {
    ...base,
    rate: CONVERTER_RATE,
    units: input.units,
    shopCredit: input.units * CONVERTER_RATE,
    usd: input.units * CONVERTER_RATE,
    bulkDiscount: null,
    tierExtraApplied: extraFits,
    completed: true,
    reason: `${input.units} at 1 to 1 is ${input.units} ${IN_APP_TOKEN_NAME} in the shop. Stripe stays the card rail. Phantom stays the Solana rail. No money moved. ${extra.note}`,
  };
}
