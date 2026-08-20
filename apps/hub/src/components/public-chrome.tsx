import { Link } from "@tanstack/react-router";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FluidRipple } from "@/components/fluid-ripple";
import { JsonLd } from "@/components/json-ld";
import { NETWORK_NAME, NETWORK_SHORT } from "@/lib/trv/network";
import { orgJsonLd, webSiteJsonLd } from "@/lib/trv/seo";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

const NAV = [
  { to: "/journal", label: "Journal" },
  { to: "/viewers", label: "Viewers" },
  { to: "/dapp", label: "DApp" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
] as const;

export function PublicChrome({
  children,
  ripple = true,
}: {
  children: React.ReactNode;
  ripple?: boolean;
}) {
  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <JsonLd data={orgJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      {ripple ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <FluidRipple viscosity={0.38} waveStrength={0.16} colorMap="neural" vortex={0.5} />
        </div>
      ) : null}
      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <Waves className="size-4 shrink-0 text-accent" />
            <span className="truncate text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
              {NETWORK_SHORT}
              <span className="hidden sm:inline"> · Network</span>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1">
            {NAV.map((item) => (
              <Button key={item.to} asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to={item.to}>{item.label}</Link>
              </Button>
            ))}
            <SignedOut>
              <Button asChild size="sm">
                <Link to="/login" search={{ trial: "verified" } as never}>
                  2-day trial
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="sm">
                <Link to="/hub">Open hub</Link>
              </Button>
            </SignedIn>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border bg-card/80 px-4 py-8 md:px-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{NETWORK_NAME}</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Self-serve DApp. Daily watch defends The Sentinel. Outside Viewers try Verified for two days.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <li>
              <Link to="/journal" className="text-accent underline-offset-4 hover:underline">
                Journal
              </Link>
            </li>
            <li>
              <Link to="/viewers" className="text-accent underline-offset-4 hover:underline">
                Viewer directory
              </Link>
            </li>
            <li>
              <Link to="/dapp" className="text-accent underline-offset-4 hover:underline">
                Self-serve DApp
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-accent underline-offset-4 hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-accent underline-offset-4 hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/covenant" className="text-accent underline-offset-4 hover:underline">
                Covenant
              </Link>
            </li>
            <li>
              <Link to="/company" className="text-accent underline-offset-4 hover:underline">
                Company
              </Link>
            </li>
            <li>
              <Link to="/compliance" className="text-accent underline-offset-4 hover:underline">
                Orders
              </Link>
            </li>
            <li>
              <a href="/rss.xml" className="text-accent underline-offset-4 hover:underline">
                RSS
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
