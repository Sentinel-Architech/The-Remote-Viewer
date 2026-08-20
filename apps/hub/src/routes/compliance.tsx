import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { FluidRipple } from "@/components/fluid-ripple";
import { Button } from "@/components/ui/button";
import { EO_LEDGER, NCMEC_NAME, NCMEC_TIP, STATUTE_GAPS } from "@/lib/trv/compliance";

export const Route = createFileRoute("/compliance")({ component: CompliancePage });

function CompliancePage() {
  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="absolute inset-0 opacity-20">
        <FluidRipple viscosity={0.4} waveStrength={0.18} colorMap="neural" vortex={0.5} />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 md:px-8">
        <Link to="/" className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
          The Remote Viewer Network
        </Link>
        <p className="mt-10 flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-accent">
          <Shield className="size-3.5" /> Operating ledger
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight">Orders that actually bind this hub</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          A browser node cannot “fully comply with every executive order of the
          last three years.” Most of them are tariffs, personnel, or energy.
          Sentinel maps the orders that govern speech, AI, children, bulk US
          data, foreign-adversary apps, fintech rails, and criminal misuse.
          This is an operating ledger — not a legal opinion, not a DHS stamp.
        </p>
        <ol className="mt-10 space-y-5">
          {EO_LEDGER.map((eo) => (
            <li key={eo.id} className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
              <p className="font-mono text-[11px] text-muted-foreground">{eo.date}</p>
              <h2 className="mt-1 font-display text-2xl">{eo.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-fg">{eo.does}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{eo.cannot}</p>
            </li>
          ))}
        </ol>
        <h2 className="mt-12 font-display text-3xl">Statute we will not skip</h2>
        <div className="mt-5 space-y-4">
          {STATUTE_GAPS.map((s) => (
            <section key={s.id} className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
              <h3 className="font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild>
            <a href={NCMEC_TIP} target="_blank" rel="noreferrer">
              {NCMEC_NAME}
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/covenant">Covenant</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/login">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
