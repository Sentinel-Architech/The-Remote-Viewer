import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { NETWORK_NAME, NETWORK_SHORT, NETWORK_TAG } from "@/lib/trv/network";
import { Shield, Building2, Users, BookOpen, Wallet, Timer } from "lucide-react";
import { JOURNAL } from "@/lib/trv/journal";
import { pageHead, SEO_DEFAULT_DESC, orgJsonLd, webSiteJsonLd, softwareJsonLd } from "@/lib/trv/seo";
import { JsonLd } from "@/components/json-ld";
import { PAID_TRIAL_HOURS } from "@/lib/trv/trial";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: NETWORK_NAME,
      description: SEO_DEFAULT_DESC,
      path: "/",
    }),
  component: Landing,
});

function Landing() {
  const { isPending } = useCurrentUserState();

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-black text-white">
      <JsonLd data={orgJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareJsonLd()} />

      {/* Full-page eye background */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/gateway-eye.jpg"
          alt=""
          className="h-full w-full object-cover object-center"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_70%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 md:px-8 md:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[11px] font-medium tracking-[0.18em] uppercase text-white/60 sm:text-xs">
            {NETWORK_SHORT}
            <span className="hidden sm:inline"> · Network</span>
          </span>
        </div>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isPending ? (
            <div className="h-11 w-24 animate-pulse rounded-[var(--radius-sm)] bg-white/10" />
          ) : (
            <>
              <SignedOut>
                <Button asChild variant="ghost" size="sm" className="hidden text-white/80 hover:text-white md:inline-flex">
                  <Link to="/journal">Journal</Link>
                </Button>
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
            </>
          )}
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-16 text-center md:px-6 md:pt-24">
        <p className="mb-4 text-[11px] font-medium tracking-[0.28em] uppercase text-accent">
          {NETWORK_SHORT} · self-serve DApp
        </p>
        <h1 className="font-display text-4xl leading-[1.05] text-white md:text-6xl">
          The Remote Viewer Network
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
          {NETWORK_TAG} Remote Viewers must check in daily to defend The Sentinel
          and earn TRV rewards for keeping the system safe. Outside viewership
          tries Verified for {PAID_TRIAL_HOURS} hours — self-serve, no card.
          Native lock first.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              try {
                localStorage.setItem("trv-edition", "people");
                localStorage.setItem("trv-paid-trial", "verified");
              } catch {
                /* ignore */
              }
            }}
          >
            <Link to="/login" search={{ trial: "verified" } as never}>
              <Shield className="size-4" />
              Try Verified · 2 days
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link to="/login" search={{ tab: "signin" } as never}>
              Sign in
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid w-full max-w-lg gap-3 text-left sm:grid-cols-2">
          <Link
            to="/login"
            search={{ trial: "verified" } as never}
            className="rounded-[var(--radius-lg)] border border-white/15 bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => {
              try {
                localStorage.setItem("trv-edition", "people");
                localStorage.setItem("trv-paid-trial", "verified");
              } catch {
                /* ignore */
              }
            }}
          >
            <Users className="size-4 text-accent" />
            <p className="mt-2 font-display text-lg text-white">We The People</p>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Individual node. {PAID_TRIAL_HOURS}h Verified trial. Your lock, your pot.
            </p>
          </Link>
          <Link
            to="/company"
            className="rounded-[var(--radius-lg)] border border-white/15 bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => {
              try {
                localStorage.setItem("trv-edition", "company");
              } catch {
                /* ignore */
              }
            }}
          >
            <Building2 className="size-4 text-accent" />
            <p className="mt-2 font-display text-lg text-white">Company</p>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Same OS. Seats, not a backdoor.
            </p>
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-12">
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-[var(--radius-xl)] border border-white/10 bg-black/55 p-4 text-left backdrop-blur-sm">
            <Timer className="size-4 text-accent" />
            <h2 className="mt-2 font-display text-lg text-white">2-day paid trial</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Outside Viewers get Verified for {PAID_TRIAL_HOURS} hours. One shot. Handshake still required.
            </p>
          </article>
          <article className="rounded-[var(--radius-xl)] border border-white/10 bg-black/55 p-4 text-left backdrop-blur-sm">
            <Wallet className="size-4 text-accent" />
            <h2 className="mt-2 font-display text-lg text-white">Self-serve DApp</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Native lock, device PIN wallet, optional Phantom. No ticket. Stripe is a rail.
            </p>
            <Link to="/dapp" className="mt-2 inline-block text-xs text-accent underline-offset-4 hover:underline">
              Walk the four steps
            </Link>
          </article>
          <article className="rounded-[var(--radius-xl)] border border-white/10 bg-black/55 p-4 text-left backdrop-blur-sm">
            <BookOpen className="size-4 text-accent" />
            <h2 className="mt-2 font-display text-lg text-white">Organic journal</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Gateway 1983, daily watch, public Viewer cards. Crawlable, RSS, sitemap.
            </p>
            <Link to="/journal" className="mt-2 inline-block text-xs text-accent underline-offset-4 hover:underline">
              Read the record
            </Link>
          </article>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-[var(--radius-xl)] border border-white/10 bg-black/55 p-5 text-left backdrop-blur-sm">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">From the journal</p>
          <ul className="mt-4 space-y-3">
            {JOURNAL.slice(0, 4).map((a) => (
              <li key={a.slug}>
                <Link to="/journal/$slug" params={{ slug: a.slug }} className="block hover:text-accent">
                  <span className="font-display text-lg text-white">{a.title}</span>
                  <span className="mt-1 block text-xs text-white/60">{a.dek}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
