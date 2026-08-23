import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Bug,
  Brain,
  CircleUser,
  Cpu,
  Film,
  Fingerprint,
  Gauge,
  Gift,
  Globe,
  KeyRound,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Palette,
  Radio,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
  Wand2,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { VortexTransition } from "./vortex-transition";
import { MoeDock } from "./moe-dock";
import { WalletDock } from "./viewer-wallet";
import { SentinelDock } from "./sentinel-dock";
import { ViewerThemeRoot } from "./viewer-theme";
import { SkipLink } from "./skip-link";
import { VoiceHelm } from "./voice-helm";
import { AgeGate } from "./age-gate";
import { ViewerBriefing } from "./viewer-briefing";
import { useViewer } from "./viewer-context";
import { LiveBadge, ViewerMark } from "./viewer-mark";
import { NETWORK_NAME, NETWORK_SHORT } from "@/lib/trv/network";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "./ui/sheet";
import { Button } from "./ui/button";
import { claimWatch } from "@/lib/trv/server";
import { toast } from "sonner";
import { TrialStrip } from "./trial-strip";

const NAV = [
  { to: "/hub", label: "Command", icon: LayoutDashboard },
  { to: "/hub/node", label: "Node", icon: Fingerprint },
  { to: "/hub/neuron", label: "Defend", icon: Brain },
  { to: "/hub/mesh", label: "Mesh", icon: Globe },
  { to: "/hub/shop", label: "Rewards", icon: Gift },
  { to: "/hub/os", label: "OS", icon: Cpu },
  { to: "/hub/audit", label: "Audit", icon: Gauge },
  { to: "/hub/live", label: "Live", icon: Radio },
  { to: "/hub/clips", label: "Clips", icon: Film },
  { to: "/hub/friends", label: "Friends", icon: Users },
  { to: "/hub/hydra", label: "Hydra", icon: ShieldAlert },
  { to: "/hub/forum", label: "Forum", icon: MessageSquare },
  { to: "/hub/create", label: "Studio", icon: Wand2 },
  { to: "/hub/market", label: "Market", icon: Store },
  { to: "/hub/honeypot", label: "Honeypot", icon: Bug },
  { to: "/hub/billing", label: "Billing", icon: Landmark },
  { to: "/hub/gateway", label: "Gateway", icon: ScrollText },
  { to: "/hub/browser", label: "Browser", icon: Shield },
  { to: "/hub/theme", label: "Theme", icon: Palette },
  { to: "/hub/profile", label: "Profile", icon: CircleUser },
  { to: "/hub/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = [
  { to: "/hub", label: "Home", icon: LayoutDashboard },
  { to: "/hub/neuron", label: "Defend", icon: Brain },
  { to: "/hub/mesh", label: "Mesh", icon: Globe },
  { to: "/hub/shop", label: "Rewards", icon: Gift },
] as const;

function DutyStrip() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { watch, setProfile, refreshWatch } = useViewer();
  const [busy, setBusy] = useState(false);
  const onField =
    pathname === "/hub" ||
    pathname === "/hub/" ||
    pathname.startsWith("/hub/neuron") ||
    pathname.startsWith("/hub/mesh") ||
    pathname.startsWith("/hub/honeypot");
  if (!watch || watch.claimed || onField) return null;

  return (
    <div className="sticky top-[3.25rem] z-10 border-b border-warn/30 bg-card/95 px-3 py-2 backdrop-blur-sm md:top-0 md:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <Shield className="size-4 shrink-0 text-warn" />
        <p className="min-w-0 flex-1 text-sm text-fg">
          {watch.defended
            ? `Duty ready · claim ${watch.nextCredits} TRV for keeping The Sentinel safe`
            : `Daily duty · defend The Sentinel · ${watch.nextCredits} TRV on claim`}
        </p>
        {watch.defended ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const p = await claimWatch();
                if (p) setProfile(p);
                await refreshWatch();
                toast.success(`Watch claimed · ${watch.nextCredits} TRV`);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Watch failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Claim {watch.nextCredits} TRV
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link to="/hub/neuron">Stand watch</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function HubShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useViewer();
  const company = profile?.edition === "company";
  const brand = company ? profile.orgName || "Company cell" : "We The People";
  const [more, setMore] = useState(false);
  const lockBriefing = Boolean(profile && profile.ageOk && profile.ofacOk && !profile.tutorialAt);

  return (
    <ViewerThemeRoot>
    <div className="min-h-dvh overflow-x-clip bg-bg text-fg">
      <div inert={lockBriefing || undefined}>
      <SkipLink />
      <VortexTransition />
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col overflow-y-auto border-r border-border px-3 py-5 md:flex">
          <Link to="/" className="mb-1 px-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            {NETWORK_NAME}
          </Link>
          <p className="mb-6 px-2 text-[10px] uppercase tracking-wide text-accent">{brand}</p>
          {profile ? (
            <Link to="/hub/profile" className="mb-4 flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-elevated/60">
              <ViewerMark name={profile.displayName || profile.handle} src={profile.avatarData} live={profile.liveNow} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm">{profile.displayName || profile.handle}</span>
                <span className="block truncate font-mono text-[10px] text-muted-foreground">@{profile.handle}</span>
              </span>
            </Link>
          ) : null}
          {profile?.liveNow ? (
            <Link to="/hub/live" className="mb-3 px-2">
              <LiveBadge title={profile.liveTitle} />
            </Link>
          ) : null}
          <nav className="flex flex-1 flex-col gap-0.5">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm",
                    active ? "bg-elevated text-fg" : "text-muted-foreground hover:bg-elevated/60 hover:text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {item.to === "/hub/profile" && profile?.liveNow ? (
                    <Radio className="ml-auto size-3 text-ok trv-live-dot" aria-label="Live" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-border pt-4">
            <UserButton />
          </div>
        </aside>

        <main
          id="hub-main"
          tabIndex={-1}
          className="min-w-0 flex-1 pb-[calc(7.25rem+env(safe-area-inset-bottom))] outline-none md:pb-0"
        >
          <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-bg/95 px-3 py-2 backdrop-blur-sm md:hidden">
            <Link to="/hub/profile" className="flex min-w-0 items-center gap-2">
              {profile ? (
                <ViewerMark name={profile.displayName || profile.handle} src={profile.avatarData} live={profile.liveNow} size="sm" />
              ) : null}
              <span className="min-w-0 truncate text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                {company ? "Company" : NETWORK_SHORT}
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] text-muted-foreground"
                aria-label="Wallet"
                onClick={() => window.dispatchEvent(new Event("trv-open-wallet"))}
              >
                <KeyRound className="size-4" />
              </button>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] text-muted-foreground"
                aria-label="Means of Evidence"
                onClick={() => window.dispatchEvent(new Event("trv-open-moe"))}
              >
                <ShieldCheck className="size-4" />
              </button>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] text-muted-foreground"
                aria-label="Speak to Sentinel"
                onClick={() => window.dispatchEvent(new Event("trv-open-sentinel"))}
              >
                <Mic className="size-4" />
              </button>
              <UserButton />
            </div>
          </header>
          <TrialStrip />
          <DutyStrip />
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] md:hidden">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.to === "/hub" ? pathname === "/hub" || pathname === "/hub/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px]",
                active ? "text-fg" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          className={cn(
            "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px]",
            more || (pathname.startsWith("/hub/") && !MOBILE_NAV.some((n) => n.to !== "/hub" && pathname.startsWith(n.to)) && pathname !== "/hub" && pathname !== "/hub/")
              ? "text-fg"
              : "text-muted-foreground",
          )}
          onClick={() => setMore(true)}
        >
          <Box className="size-4" />
          More
        </button>
      </nav>

      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom">
          <h2 className="font-display text-xl">Hub</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMore(false)}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border border-border bg-elevated px-2 py-3 text-center text-[11px]"
                >
                  <Icon className="size-4" />
                  {item.label}
                  {item.to === "/hub/profile" && profile?.liveNow ? (
                    <Radio className="size-3 text-ok trv-live-dot" aria-label="Live" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <MoeDock />
      <WalletDock />
      <SentinelDock />
      <VoiceHelm />
      </div>
      <AgeGate />
      <ViewerBriefing />
    </div>
    </ViewerThemeRoot>
  );
}
