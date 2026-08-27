import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Shield, Timer, Wallet } from "lucide-react";
import { PublicChrome } from "@/components/public-chrome";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { breadcrumbJsonLd, pageHead, softwareJsonLd } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";

const STEPS = [
  {
    n: "01",
    icon: Shield,
    title: "Native lock",
    body: "Email plus password. 18+ and OFAC on the same screen. No sales engineer. Google and X are bridges only.",
  },
  {
    n: "02",
    icon: Timer,
    title: "First watch",
    body: "Land one intercept on Command, then claim TRV. That is the product. Briefing, wallet, and Gateway wait.",
  },
  {
    n: "03",
    icon: KeyRound,
    title: "Come back tomorrow",
    body: "Claim the watch every UTC day. Missed days decay Sentinel health. Retention is duty, not a newsletter.",
  },
  {
    n: "04",
    icon: Wallet,
    title: "Wallet when you need it",
    body: "PIN-sealed Ed25519 on this device, optional Phantom. Stripe is a rail, never identity. Skip this until you have stood watch.",
  },
];

export const Route = createFileRoute("/dapp")({
  head: () =>
    pageHead({
      title: "Self-serve DApp",
      description:
        "Onboard The Remote Viewer Network without a ticket: native lock, 2-day Verified trial, device wallet, daily watch. Stripe is a rail. Sentinel does not leave this DApp.",
      path: "/dapp",
    }),
  component: DappPage,
});

function DappPage() {
  return (
    <PublicChrome>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: NETWORK_NAME, path: "/" },
          { name: "Self-serve DApp", path: "/dapp" },
        ])}
      />
      <JsonLd data={softwareJsonLd()} />
      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-accent">Self-serve DApp</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
          Sign in. Intercept. Claim. Come back tomorrow.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Check in daily to defend The Sentinel and earn TRV. First session is sixty seconds.
          The 12-station briefing is optional after that first watch — not a wall in front of it.
        </p>
        <ol className="mt-10 space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.n} className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
                <p className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <Icon className="size-3.5 text-accent" />
                  {step.n}
                </p>
                <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/login">
              Stand watch
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/pricing">See the catalog</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Lost device, lost seed — export when you create the wallet. We cannot reset a PIN from
          the cloud because the PIN never left the device. Read the{" "}
          <Link to="/covenant" className="text-accent underline-offset-4 hover:underline">
            covenant
          </Link>
          .
        </p>
      </article>
    </PublicChrome>
  );
}
