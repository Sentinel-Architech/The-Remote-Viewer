import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Check, Shield, Users } from "lucide-react";
import { FluidRipple } from "@/components/fluid-ripple";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY_PLANS, PEOPLE_PLANS, USD_TO_TRV, type Edition, type SaasPlan } from "@/lib/trv/saas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  const [edition, setEdition] = useState<Edition>("people");
  const plans = edition === "people" ? PEOPLE_PLANS : COMPANY_PLANS;

  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="absolute inset-0 opacity-40">
        <FluidRipple viscosity={0.28} waveStrength={0.35} colorMap="neural" vortex={1.8} />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
            The Remote Viewer Network
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Register</Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase text-accent">SaaS · Native ledger</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Two editions. One covenant. Zero backdoors.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            We The People keep a sovereign node. Companies get seats on the same
            Sentinel OS — never a corporate identity provider, never a telemetry
            phone-home. USD-backed funds convert to native TRV credits. Documents
            stay free. Methods stay behind handshake + plan.
          </p>
        </section>

        <div className="mx-auto mt-8 flex w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-card/80 p-1">
          <button
            type="button"
            onClick={() => setEdition("people")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm",
              edition === "people" ? "bg-elevated text-fg" : "text-muted-foreground",
            )}
          >
            <Users className="size-4" /> We The People
          </button>
          <button
            type="button"
            onClick={() => setEdition("company")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm",
              edition === "company" ? "bg-elevated text-fg" : "text-muted-foreground",
            )}
          >
            <Building2 className="size-4" /> Company
          </button>
        </div>

        <div
          className={cn(
            "mt-8 grid gap-4 md:grid-cols-2",
            edition === "people" ? "xl:grid-cols-4" : "xl:grid-cols-3",
          )}
        >
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} featured={p.id === "sentinel" || p.id === "sovereign"} />
          ))}
        </div>

        <section className="mt-14 grid gap-4 rounded-[var(--radius-xl)] border border-border bg-card/85 p-6 md:grid-cols-3">
          <Covenant
            title="Native lock"
            body="Email + password on this hub. Google and X are migration bridges only."
          />
          <Covenant
            title="No processor backdoor"
            body="Stripe and FDIC-backed convert are optional USD rails. They are never identity. Native lock and wallet PIN stay on this hub."
          />
          <Covenant
            title="Handshake still required"
            body="Paying does not skip the robot handshake. Methods unseal only for verified Viewers."
          />
        </section>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <Shield className="size-3.5" />
          Annual billing is ten months of price.
          <Link to="/covenant" className="text-accent underline-offset-4 hover:underline">
            Read the covenant
          </Link>
        </p>
      </div>
    </main>
  );
}

function PlanCard({ plan, featured }: { plan: SaasPlan; featured?: boolean }) {
  const fee = Math.round(plan.feeRate * 100);
  return (
    <article
      className={cn(
        "flex flex-col rounded-[var(--radius-xl)] border bg-card/90 p-5",
        featured ? "border-accent/40" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-xl">{plan.name}</h2>
        {featured ? <Badge>Flagship</Badge> : null}
      </div>
      <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{plan.tagline}</p>
      <p className="mt-4 font-mono text-3xl tabular-nums">
        {plan.usdMonth === 0 ? "Free" : `$${plan.usdMonth}`}
        {plan.usdMonth > 0 ? <span className="text-sm text-muted-foreground">/mo</span> : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {usdLine(plan)} · {fee}% mint fee
        {plan.seats > 1 ? ` · ${plan.seats} seats` : ""}
      </p>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>
      <Button asChild className="mt-5 w-full" variant={featured ? "default" : "secondary"}>
        <Link to="/hub/billing" search={{ plan: plan.id, edition: plan.edition } as never}>
          {plan.usdMonth === 0 ? "Start free" : "Subscribe"}
        </Link>
      </Button>
    </article>
  );
}

function usdLine(plan: SaasPlan) {
  if (plan.usdMonth === 0) return "0 TRV";
  return `${plan.usdMonth * USD_TO_TRV} TRV / mo`;
}

function Covenant({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
