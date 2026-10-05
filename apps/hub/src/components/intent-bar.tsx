import { useMemo, useState } from "react";
import { INTENT_LINE, prepareIntent } from "@/lib/trv/intent-bar";

type IntentBarProps = {
  initialWant?: string;
};

export function IntentBar({ initialWant = "" }: IntentBarProps) {
  const [want, setWant] = useState(initialWant);
  const prepared = useMemo(() => prepareIntent(want), [want]);

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <div>
        <h1 className="font-display text-3xl">Intent</h1>
        <p className="mt-1 text-sm text-muted-foreground">{INTENT_LINE}</p>
      </div>
      <label className="block text-sm" htmlFor="intent-want">
        Tell it what you want
        <textarea
          id="intent-want"
          className="mt-2 min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm"
          value={want}
          onChange={(event) => setWant(event.target.value)}
          placeholder="send 10 USDC to 0x0000000000000000000000000000000000000001 slippage 50 bps"
        />
      </label>
      {prepared.parsed === false ? (
        <p className="text-sm text-muted-foreground">{prepared.reason}</p>
      ) : (
        <div className="space-y-3 text-sm">
          <p>No wallet is connected. This is a simulation.</p>
          <p>
            Gas is paid in {prepared.gas.asset}, the token being moved. You are not asked to buy ETH,
            MATIC, or SOL. No gas amount is quoted. There is no auction, fee split, or partner.
          </p>
          <p>
            Spend stays at {prepared.spend.amount} {prepared.spend.asset}. Slippage stays at{" "}
            {prepared.slippageBps} bps.
          </p>
          <div className="rounded-md border border-border p-3">
            <p className="font-medium">Receipt before signing</p>
            <p className="mt-1">{prepared.receipt.summary}</p>
            <p className="mt-1 break-all text-muted-foreground">Receipt {prepared.receipt.id}</p>
            <p className="mt-1 break-all">
              Shareable link <a href={prepared.sharePath}>{prepared.sharePath}</a>
            </p>
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Account sign-in is the passkey panel. It does not sign this receipt. Email and password remain the fallback. A seed phrase is not accepted.
      </p>
    </section>
  );
}
