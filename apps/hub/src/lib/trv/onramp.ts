/** USD on-ramp rates. Stripe is a rail — never identity. */

export const USD_TO_SOL_MICRO = 5_000; // 0.005 SOL per USD on the preview/live ledger rate
export const SOL_MICROS = 1_000_000;

export function usdToSolMicro(usd: number): number {
  return Math.round(usd * USD_TO_SOL_MICRO);
}

export function formatSol(micro: number): string {
  return (micro / SOL_MICROS).toFixed(4);
}

export type OnrampDest = "trv" | "sol";
