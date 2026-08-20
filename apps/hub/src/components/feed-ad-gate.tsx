import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useViewer } from "./viewer-context";
import { FEED_AD_SEC, FEED_WATCH_SEC, isAdFree, trialRemaining } from "@/lib/trv/ads";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const ADS = [
  "Robot handshake unseals Gateway methods. Documents stay free.",
  "Native mint in Studio. Sentinel plan is 0% platform fee.",
  "Share your referral. Friends get a seven-day ad-free trial.",
  "Stripe is a USD rail. Your wallet PIN is the lock.",
];

export function FeedAdGate({ children }: { children: ReactNode }) {
  const { profile } = useViewer();
  const gpc =
    typeof navigator !== "undefined" &&
    Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
  const free = isAdFree(profile) || gpc;
  const trial = trialRemaining(profile?.trialUntil ?? null);
  const [watch, setWatch] = useState(0);
  const [adLeft, setAdLeft] = useState(0);
  const [copy, setCopy] = useState(ADS[0]);

  useEffect(() => {
    if (free) return;
    const id = window.setInterval(() => {
      setAdLeft((left) => {
        if (left > 0) return left - 1;
        setWatch((w) => {
          if (w + 1 >= FEED_WATCH_SEC) {
            setCopy(ADS[Math.floor(Math.random() * ADS.length)] ?? ADS[0]);
            setAdLeft(FEED_AD_SEC);
            return 0;
          }
          return w + 1;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [free]);

  return (
    <div className="relative">
      {children}
      {!free && adLeft > 0 ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/85 px-5">
          <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-6 text-center">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Unverified feed</p>
            <h2 className="mt-2 font-display text-2xl">30-second native ad</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            <p className="mt-5 font-mono text-4xl tabular-nums">{adLeft}s</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Then {FEED_WATCH_SEC / 60}:{String(FEED_WATCH_SEC % 60).padStart(2, "0")} of feed. Handshake removes ads.
            </p>
            <Button asChild className="mt-5">
              <Link to="/hub/gateway">Begin handshake</Link>
            </Button>
          </div>
        </div>
      ) : null}
      {!free && adLeft === 0 ? (
        <p className="px-5 pb-2 text-[11px] text-muted-foreground md:px-8">
          Unverified · ad in {Math.max(0, FEED_WATCH_SEC - watch)}s
          {trial ? ` · trial ${trial}` : ""}
        </p>
      ) : null}
      {free && trial && !profile?.verifiedAt ? (
        <div className="px-5 pt-4 md:px-8">
          <Badge variant="native">Referral trial · {trial} ad-free</Badge>
        </div>
      ) : null}
    </div>
  );
}
