import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/trv/seo";
import { Shield } from "lucide-react";
import { FluidRipple } from "@/components/fluid-ripple";
import { Button } from "@/components/ui/button";
import { COVENANT } from "@/lib/trv/covenant";
import { NETWORK_NAME } from "@/lib/trv/network";

export const Route = createFileRoute("/covenant")({
  head: () =>
    pageHead({
      title: "Covenant",
      description: "Zero-backdoor covenant for The Remote Viewer Network. Native lock, self-serve DApp, 2-day outside trial, daily watch.",
      path: "/covenant",
    }),
  component: CovenantPage });

function CovenantPage() {
  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="absolute inset-0 opacity-25">
        <FluidRipple viscosity={0.4} waveStrength={0.22} colorMap="neural" vortex={0.6} />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 md:px-8">
        <Link to="/" className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
          {NETWORK_NAME}
        </Link>
        <p className="mt-10 flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-accent">
          <Shield className="size-3.5" /> Zero-backdoor covenant
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          One Network. Sentinel harnessed here. Nothing hidden.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Security here is operational: native lock, on-device wallets, local
          M-o-E, hub Shield, handshake for methods. Scale is tenancy — We The
          People as individuals, Company as seated orgs — on the same schema.
          What we cannot claim: a magically unauditable “no bugs forever.” What
          we refuse: a vendor key, a second secret binary, selling the handshake,
          or a hidden category ban (that would be a backdoor, and it would be
          visible in the source).
        </p>
        <ol className="mt-10 space-y-6">
          {COVENANT.map((article, i) => (
            <li key={article.id} className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-display text-2xl">{article.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/login">We The People · register</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/company">Company edition</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
