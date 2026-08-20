import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Timer } from "lucide-react";
import { useViewer } from "@/components/viewer-context";
import { Button } from "@/components/ui/button";
import { formatTrialClock, isPaidTrialActive, msUntil, shouldNagConvert } from "@/lib/trv/trial";

export function TrialStrip() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useViewer();
  const [left, setLeft] = useState(() => msUntil(profile?.paidTrialUntil));

  useEffect(() => {
    setLeft(msUntil(profile?.paidTrialUntil));
    if (!isPaidTrialActive(profile)) return;
    const id = window.setInterval(() => setLeft(msUntil(profile?.paidTrialUntil)), 1000);
    return () => window.clearInterval(id);
  }, [profile?.paidTrialUntil, profile?.planId]);

  if (pathname.startsWith("/hub/billing")) return null;
  if (!isPaidTrialActive(profile) || left <= 0) return null;

  const nag = shouldNagConvert(profile);

  return (
    <div className="border-b border-accent/30 bg-card/95 px-3 py-2 md:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <Timer className="size-4 shrink-0 text-accent" />
        <p className="min-w-0 flex-1 text-sm text-fg">
          {nag
            ? `Verified trial · ${formatTrialClock(left)} left · keep the plan or drop to Initiate`
            : `Outside trial · Verified for ${formatTrialClock(left)} · no card on file`}
        </p>
        <Button asChild size="sm" variant={nag ? "default" : "secondary"}>
          <Link to="/hub/billing">{nag ? "Keep Verified" : "Trial ledger"}</Link>
        </Button>
      </div>
    </div>
  );
}
