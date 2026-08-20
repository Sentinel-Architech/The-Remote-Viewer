import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { COLOR_MAPS, FluidRipple, type ColorMap } from "@/components/fluid-ripple";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { NETWORK_NAME, NETWORK_SHORT, NETWORK_TAG } from "@/lib/trv/network";
import { Shield, Waves, Building2, Users } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { isPending } = useCurrentUserState();
  const [viscosity, setViscosity] = useState(0.22);
  const [waveStrength, setWaveStrength] = useState(0.55);
  const [vortex, setVortex] = useState(1.4);
  const [colorMap, setColorMap] = useState<ColorMap>("neural");
  const api = useRef<{ clear: () => void } | null>(null);
  const maps = useMemo(() => COLOR_MAPS, []);

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-bg text-fg">
      {/* honeypot canaries — scanners follow. not a real admin. */}
      {/* /api/lure/.env  /api/lure/wp-login.php  /api/lure/wallet/export */}
      <div className="absolute inset-0">
        <FluidRipple
          viscosity={viscosity}
          waveStrength={waveStrength}
          colorMap={colorMap}
          vortex={vortex}
          onReady={(a) => {
            api.current = a;
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/50 via-transparent to-bg/80" />

      <header className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 md:px-8 md:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Waves className="size-4 shrink-0 text-accent" />
          <span className="truncate text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground sm:text-xs">
            {NETWORK_SHORT}
            <span className="hidden sm:inline"> · Network</span>
          </span>
        </div>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isPending ? (
            <div className="h-11 w-24 animate-pulse rounded-[var(--radius-sm)] bg-elevated" />
          ) : (
            <>
              <SignedOut>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/company">Company</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/compliance">Orders</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/pricing">Pricing</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/login">Register</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/company">Company</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/hub">Open hub</Link>
                </Button>
              </SignedIn>
            </>
          )}
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pb-28 pt-8 text-center md:px-6 md:pt-16">
        <p className="mb-4 text-[11px] font-medium tracking-[0.28em] uppercase text-accent">
          {NETWORK_SHORT} · consenting honeypot
        </p>
        <h1 className="font-display text-4xl leading-[1.05] text-fg md:text-6xl">
          The Remote Viewer Network
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {NETWORK_TAG} Remote Viewers must check in daily to defend The Sentinel
          and earn TRV rewards for keeping the system safe. You arm the pot.
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
              } catch {
                /* ignore */
              }
            }}
          >
            <Link to="/login">
              <Shield className="size-4" />
              Native TRV register
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link to="/login" search={{ tab: "signin" } as never}>
              Sign in
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid w-full max-w-lg gap-3 text-left sm:grid-cols-2">
          <Link
            to="/login"
            className="rounded-[var(--radius-lg)] border border-border bg-card/80 p-4"
            onClick={() => {
              try {
                localStorage.setItem("trv-edition", "people");
              } catch {
                /* ignore */
              }
            }}
          >
            <Users className="size-4 text-accent" />
            <p className="mt-2 font-display text-lg">We The People</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Individual node. Your lock, your pot.</p>
          </Link>
          <Link
            to="/company"
            className="rounded-[var(--radius-lg)] border border-border bg-card/80 p-4"
            onClick={() => {
              try {
                localStorage.setItem("trv-edition", "company");
              } catch {
                /* ignore */
              }
            }}
          >
            <Building2 className="size-4 text-accent" />
            <p className="mt-2 font-display text-lg">Company</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Same OS. Seats, not a backdoor.</p>
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Surface</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Viscosity {viscosity.toFixed(2)}</Label>
              <Slider className="mt-2" min={0.05} max={0.6} step={0.01} value={[viscosity]} onValueChange={(v) => setViscosity(v[0] ?? 0.22)} />
            </div>
            <div>
              <Label>Wave {waveStrength.toFixed(2)}</Label>
              <Slider className="mt-2" min={0.1} max={1} step={0.01} value={[waveStrength]} onValueChange={(v) => setWaveStrength(v[0] ?? 0.55)} />
            </div>
            <div>
              <Label>Vortex {vortex.toFixed(1)}</Label>
              <Slider className="mt-2" min={0} max={3} step={0.1} value={[vortex]} onValueChange={(v) => setVortex(v[0] ?? 1.4)} />
            </div>
            <div>
              <Label>Color</Label>
              <div className="mt-2 flex flex-wrap gap-1">
                {maps.map((m) => (
                  <Button key={m} type="button" size="sm" variant={colorMap === m ? "default" : "secondary"} onClick={() => setColorMap(m)}>
                    {m}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Button type="button" variant="outline" className="mt-4" onClick={() => api.current?.clear()}>
            Clear surface
          </Button>
        </div>
      </section>
    </main>
  );
}
