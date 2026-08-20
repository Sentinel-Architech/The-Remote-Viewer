import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check, Shield, Users } from "lucide-react";
import { FluidRipple } from "@/components/fluid-ripple";
import { Button } from "@/components/ui/button";
import { COMPANY_PLANS, USD_TO_TRV } from "@/lib/trv/saas";

export const Route = createFileRoute("/company")({ component: CompanyLanding });

function chooseCompany() {
  try {
    localStorage.setItem("trv-edition", "company");
  } catch {
    /* ignore */
  }
}

function CompanyLanding() {
  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="absolute inset-0 opacity-35">
        <FluidRipple viscosity={0.32} waveStrength={0.28} colorMap="abyss" vortex={0.9} />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
            The Remote Viewer Network
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">We The People</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/covenant">Covenant</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login" onClick={chooseCompany}>
                Register cell
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-14 max-w-2xl">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-accent">
            <Building2 className="size-3.5" /> Company edition
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Same Sentinel OS. Seats, not a backdoor.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Company is a tenancy, not a second product with a vendor key. Each
            seat still holds a native TRV lock and a personal wallet PIN. The
            owner can invite handles and pool mesh watch — they cannot decrypt a
            seat. Scale is Postgres + org_id, not a silent fork.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/login" onClick={chooseCompany}>
                Lock a company cell
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/pricing">See Squad · Command · Sovereign</Link>
            </Button>
          </div>
        </section>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {COMPANY_PLANS.map((p) => (
            <li key={p.id} className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
              <h2 className="font-display text-xl">{p.name}</h2>
              <p className="mt-1 font-mono text-2xl tabular-nums">
                ${p.usdMonth}
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.seats} seats · {p.usdMonth * USD_TO_TRV} TRV · {Math.round(p.feeRate * 100)}% mint
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.tagline}</p>
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-[var(--radius-xl)] border border-border bg-card/90 p-6">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Shield className="size-4 text-accent" /> Zero-backdoor scale
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              People and Company share one audited source. A private company
              binary would be the backdoor.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              Isolation is org_id + per-seat credentials. Deploy is Postgres.
              This preview runs the same schema.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              Handshake still required. Stripe is a USD rail. Wallets stay on
              the device behind the Viewer PIN.
            </li>
            <li className="flex gap-2">
              <Users className="mt-0.5 size-4 shrink-0 text-accent" />
              We The People remains a first-class edition — company money does
              not outrank a sovereign node.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
