import { useMemo, useState } from "react";
import {
  INTENT_LINE,
  passkeySignInRequest,
  prepareIntent,
  type PasskeySignInRequest,
} from "@/lib/trv/intent-bar";

type IntentBarProps = {
  initialWant?: string;
};

export function IntentBar({ initialWant = "" }: IntentBarProps) {
  const [want, setWant] = useState(initialWant);
  const [passkey, setPasskey] = useState<PasskeySignInRequest | null>(null);
  const [passkeyNote, setPasskeyNote] = useState("Passkey sign-in has not completed.");
  const prepared = useMemo(() => prepareIntent(want), [want]);

  async function onPasskey() {
    setPasskey(null);
    if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
      setPasskeyNote("This browser has no passkey API. A seed phrase is not offered.");
      return;
    }
    const request = passkeySignInRequest(
      window.location.hostname,
      crypto.getRandomValues(new Uint8Array(32)),
    );
    setPasskey(request);
    try {
      const challenge = hexToBytes(request.challengeHex);
      await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60_000,
          userVerification: "required",
          rpId: request.rpId,
        },
      });
      setPasskeyNote("The authenticator returned a credential. It was not used to sign the intent.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "The passkey ceremony stopped.";
      setPasskeyNote(`${message} The intent stays unsigned.`);
    }
  }

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
      <div className="space-y-2">
        <button
          type="button"
          className="rounded-md border border-border px-3 py-2 text-sm"
          onClick={() => void onPasskey()}
        >
          Sign in with a passkey
        </button>
        <p className="text-sm text-muted-foreground">{passkeyNote}</p>
        {passkey ? (
          <p className="break-all text-xs text-muted-foreground">
            Passkey challenge {passkey.challengeHex}. Seed phrase accepted: {String(passkey.seedPhraseAccepted)}.
            Google: {String(passkey.google)}.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
