"use client";

import { useState } from "react";
import { toast } from "sonner";
import { issueShareCode } from "@/lib/trv/viewer-locks-server";
import { BROADCAST_COPY, IN_APP_TOKEN_NAME, type QrStyle } from "@/lib/trv/viewer-locks";
import { InterestQr } from "./interest-qr";
import { TrvTokenNotice } from "./trv-token-notice";
import { Button } from "./ui/button";

type Issued = {
  code: string;
  handle: string;
  interests: string[];
  style: QrStyle;
  broadcast: boolean;
  expiresAt: string;
  path: string;
};

export function ShareBroadcast({ monthly = false }: { monthly?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<Issued | null>(null);

  async function issue(broadcast: boolean) {
    setBusy(true);
    try {
      const row = await issueShareCode({ data: { broadcast } });
      setIssued({ ...row, style: row.style === "holographic" ? "holographic" : "plain" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code was not created");
    } finally {
      setBusy(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = issued ? `${origin}${issued.path}` : "";

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <h2 className="font-display text-xl">Share code</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {BROADCAST_COPY} Each code dies after 15 minutes. There is no cap on how many you make. A new person who joins inside the window gets a grand view for 15 days, then the free tier, unless they pay an existing tier.
      </p>
      <div className="mt-3">
        <TrvTokenNotice moreThanFree={monthly} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {IN_APP_TOKEN_NAME} is not credited as a number here. The amount is not set.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => void issue(false)}>
          New code
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void issue(true)}>
          Broadcast this code
        </Button>
      </div>
      {issued ? (
        <div className="mt-4 space-y-2">
          <InterestQr value={link} handle={issued.handle} interests={issued.interests} style={issued.style} />
          <p className="font-mono text-xs text-muted-foreground">
            {issued.broadcast ? "Broadcast" : "Code"} {issued.code} · dies {new Date(issued.expiresAt).toLocaleTimeString()} · signed by @{issued.handle}
          </p>
        </div>
      ) : null}
    </section>
  );
}
