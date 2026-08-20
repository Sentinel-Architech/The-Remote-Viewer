import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FluidRipple } from "@/components/fluid-ripple";
import { getPublicReferrer } from "@/lib/trv/server";
import { REFERRAL_NEW_CREDITS, REFERRAL_TRIAL_DAYS } from "@/lib/trv/ads";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/r/$handle")({ component: ReferralLanding });

function ReferralLanding() {
  const { handle } = Route.useParams();
  const [name, setName] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("trv-ref", handle);
    } catch {
      /* ignore */
    }
    void getPublicReferrer({ data: handle }).then((r) => {
      if (!r) setMissing(true);
      else setName(r.displayName || r.handle);
    });
  }, [handle]);

  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="absolute inset-0 opacity-40">
        <FluidRipple viscosity={0.26} waveStrength={0.4} colorMap="neural" vortex={1.6} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16">
        <p className="text-[11px] tracking-[0.24em] uppercase text-accent">Referral trial</p>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          {missing ? "Unknown Viewer" : `${name ?? handle} invited you`}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Register with a native TRV lock and you receive {REFERRAL_TRIAL_DAYS} days
          ad-free plus {REFERRAL_NEW_CREDITS} TRV. Gateway methods still need the
          robot handshake — the trial never skips that.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/login">Claim trial · native register</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/v/$handle" params={{ handle }}>
              View their node
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
