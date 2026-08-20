import { createFileRoute, Link } from "@tanstack/react-router";
import { useViewer } from "@/components/viewer-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { STAGE_LABEL, TIER_COPY, TIER_LABEL } from "@/lib/trv/tiers";
import { effectiveFeeRate, planById } from "@/lib/trv/saas";
import { WatchClaim } from "@/components/watch-claim";
import { LiveBadge, ViewerMark } from "@/components/viewer-mark";
import { Brain, Cpu, Globe, Landmark, ScrollText, Shield } from "lucide-react";

export const Route = createFileRoute("/hub/")({ component: Command });

function Command() {
  const { profile } = useViewer();
  if (!profile) {
    return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;
  }
  const fee = Math.round(effectiveFeeRate(profile.planId, profile.tier, Boolean(profile.citizenAt)) * 100);
  const plan = planById(profile.planId);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-wrap items-end gap-4">
        <ViewerMark
          name={profile.displayName || profile.handle}
          src={profile.avatarData}
          live={profile.liveNow}
          size="lg"
        />
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Command</p>
          <h1 className="mt-1 font-display text-3xl">{profile.displayName || profile.handle}</h1>
          {profile.liveNow ? (
            <div className="mt-2">
              <LiveBadge title={profile.liveTitle} />
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant={profile.nativeSecurity ? "native" : "warn"}>
          {profile.nativeSecurity ? "Native TRV lock" : "Bridged identity"}
        </Badge>
        <Badge>{TIER_LABEL[profile.tier as keyof typeof TIER_LABEL] ?? profile.tier}</Badge>
        <Badge variant="muted">{plan.name} plan</Badge>
        <Badge variant="muted">{profile.edition === "company" ? "Company" : "We The People"}</Badge>
        <Badge variant={profile.citizenAt ? "native" : "warn"}>
          {profile.citizenAt ? "US Citizen lock" : "Citizen lock open"}
        </Badge>
        <Badge variant="muted">{STAGE_LABEL[profile.neuronStage]}</Badge>
      </div>

      <WatchClaim />

      {!profile.citizenAt && (
        <Card className="border-warn/40">
          <CardHeader>
            <CardTitle>US Citizen lock required for discounts</CardTitle>
            <CardDescription>
              Photograph a state or federal ID and a live video selfie. Images
              stay on this device. A one-way hash stops the same ID from minting
              fake nodes. Hydra reports stay anonymous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/hub/citizen">Begin Citizen lock</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!profile.nativeSecurity && (
        <Card className="border-warn/40">
          <CardHeader>
            <CardTitle>Native lock missing</CardTitle>
            <CardDescription>
              This session arrived through a corporate bridge. Register a TRV
              password so M-o-E, Shield, and native mint badges stay sovereign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/login">Bind native credentials</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{profile.edition === "company" ? "Company tenancy" : "We The People tenancy"}</CardTitle>
          <CardDescription>
            {profile.edition === "company"
              ? `${profile.orgName || "No cell yet"} · ${profile.orgSeats || plan.seats} seats. Owner cannot unlock a seat wallet. Subscribe a Squad/Command/Sovereign plan to bind the org.`
              : "Individual node. Your lock, your PIN, your ledger. Company is a seated tenancy on the same OS — not a privileged backdoor."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to={profile.edition === "company" ? "/hub/billing" : "/company"}>
              {profile.edition === "company" ? "Seat billing" : "View Company edition"}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/covenant">Zero-backdoor covenant</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentinel OS</CardTitle>
          <CardDescription>
            Super agent over Cipher, Watcher, Privacy, Mesh, Healer — each a
            super in their field. Human trains machine; machine trains human.
            Mosaic only if you send it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/hub/os">
              <Cpu className="size-4" /> Open the OS
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sentinel health</CardTitle>
            <CardDescription>Healed by claimed watches. Damaged by missed days and missed intercepts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profile.sentinelHealth} />
            <p className="mt-2 font-mono text-sm tabular-nums">{profile.sentinelHealth}/100</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Autonomy</CardTitle>
            <CardDescription>The OS copies your defenses in real time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profile.sentinelAutonomy} />
            <p className="mt-2 font-mono text-sm tabular-nums">{profile.sentinelAutonomy}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credits / fee</CardTitle>
            <CardDescription>{TIER_COPY[profile.tier as keyof typeof TIER_COPY]}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg tabular-nums">{profile.credits} TRV</p>
            <p className="text-xs text-muted-foreground">
              Earned by standing daily watch. {fee}% mint fee on {plan.name} · Sentinel / Sovereign is 0%
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/hub/shop">Spend rewards</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/hub/billing">Upgrade plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Button asChild variant="secondary" className="h-auto justify-start py-4">
          <Link to="/hub/neuron">
            <Brain className="size-4" /> Watchful Neuron
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-auto justify-start py-4">
          <Link to="/hub/mesh">
            <Globe className="size-4" /> God's eye mesh
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-auto justify-start py-4">
          <Link to="/hub/gateway">
            <ScrollText className="size-4" /> Gateway Process
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-auto justify-start py-4">
          <Link to="/hub/browser">
            <Shield className="size-4" /> Sentinel Shield
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-auto justify-start py-4">
          <Link to="/hub/billing">
            <Landmark className="size-4" /> Billing
          </Link>
        </Button>
      </div>
    </div>
  );
}
