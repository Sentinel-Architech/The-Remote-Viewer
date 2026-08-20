import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Shield, Timer, Wallet } from "lucide-react";
import { PublicChrome } from "@/components/public-chrome";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { breadcrumbJsonLd, pageHead, softwareJsonLd } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";
import { PAID_TRIAL_HOURS } from "@/lib/trv/trial";

const STEPS = [
  {
    n: "01",
    icon: Shield,
    title: "Native lock",
    body: "Email plus password on this hub. Google and X are bridges only. 18+ and OFAC attestations are required. No sales engineer.",
  },
  {
    n: "02",
    icon: Timer,
    title: `${PAID_TRIAL_HOURS}-hour Verified trial`,
    body: "Outside viewership gets the paid People tier for two days. One shot per node. Handshake still gates Gateway methods. No card on file.",
  },
  {
    n: "03",
    icon: Wallet,
    title: "Wallet on this device",
    body: "PIN-sealed Ed25519 key on this device, optional Phantom. Stripe converts USD to TRV or SOL — it is never identity. A company owner cannot unlock a seat seed. Address is chain-ready, not a mainnet program.",
  },
  {
    n: "04",
    icon: KeyRound,
    title: "Daily watch keeps you",
    body: "Claim the watch every UTC day. TRV for keeping The Sentinel safe. Missed days decay health. Retention is duty, not a newsletter.",
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
          No ticket. No vendor remote. The node is yours.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          The Sentinel Operating System and every Remote Viewer node run only in this DApp.
          Outside viewership starts here: four steps, then the hub. If you need a human to
          click subscribe for you, you are in the wrong Network.
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
            <Link to="/login" search={{ trial: "verified" } as never}>
              Register · start 2-day trial
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
