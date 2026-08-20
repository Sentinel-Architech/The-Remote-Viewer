import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useViewer } from "@/components/viewer-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cpu, Globe, IdCard, Landmark, MessageSquare, Palette, QrCode, ScrollText, Shield, ShieldAlert } from "lucide-react";
import { setFederated } from "@/lib/trv/sentinel-ai";
import { toast } from "sonner";

export const Route = createFileRoute("/hub/settings")({ component: SettingsPage });

function SettingsPage() {
  const { profile, setProfile } = useViewer();
  const [vpn, setVpn] = useState(true);
  const [telemetryLocal, setTelemetryLocal] = useState(true);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Node settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Native TRV security, Sentinel Shield, and Means of Evidence. Nothing
          here phones home a corporate identity unless you chose a bridge.
        </p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Identity lock</h2>
        <div className="mt-2">
          <Badge variant={profile?.nativeSecurity ? "native" : "warn"}>
            {profile?.nativeSecurity ? "Native TRV email + password" : "Bridged Google / X"}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Strongly encouraged: native TRV credentials. Bridged logins are a
          migration ramp, not the lock. They cannot satisfy native security.
        </p>
        {!profile?.nativeSecurity && (
          <Button asChild className="mt-3">
            <Link to="/login">Bind native TRV lock</Link>
          </Button>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Sentinel VPN (hub tunnel)</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Native to this hub, not your operating system. Web apps cannot install
          a system VPN. Enabling this routes Shield fetches through TRV, blocks
          private IPs, and keeps M-o-E ciphertext on-device.
        </p>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Hub tunnel
          <Switch checked={vpn} onCheckedChange={setVpn} />
        </label>
        <Button asChild variant="secondary" className="mt-4">
          <Link to="/hub/browser">
            <Shield className="size-4" /> Open Shield browser
          </Link>
        </Button>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Means of Evidence</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Camera, microphone, and telemetry are yours. Encrypted locally. The
          Sentinel Security OS requires a sealed trail to keep this node free of
          corporate eyes — it does not upload the payload.
        </p>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Keep telemetry on-device
          <Switch checked={telemetryLocal} onCheckedChange={setTelemetryLocal} />
        </label>
        <p className="mt-3 text-xs text-muted-foreground">
          Hands-free (bottom left) is voice automation for Viewers who cannot
          touch the device. Skip to main content is the first tab stop. Signal
          theme is high contrast. Native browser (Shield) keeps Network comms
          live so talk does not require sitting on Friends or on one device.
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Hydra & federated lessons</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Public mesh identity is a chain address. Federated learning is opt-in:
          identity-stripped attack patterns only — never your evidence, never
          your coordinates.
        </p>
        {profile?.hydraAddress ? (
          <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{profile.hydraAddress}</p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Address minted on first Sentinel watch or Hydra filing.</p>
        )}
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Share federated lessons (anonymous)
          <Switch
            checked={profile?.federatedOptIn ?? false}
            onCheckedChange={async (v) => {
              const p = await setFederated({ data: v });
              if (p) setProfile(p);
              toast.success(v ? "Federated lessons on" : "Federated lessons off");
            }}
          />
        </label>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/hub/hydra">
            <ShieldAlert className="size-4" /> Open Hydra
          </Link>
        </Button>
        <Button asChild className="mt-2" variant="secondary">
          <Link to="/hub/citizen">
            <IdCard className="size-4" /> US Citizen lock
          </Link>
        </Button>
        <Button asChild className="mt-2" variant="secondary">
          <Link to="/hub/os">
            <Cpu className="size-4" /> Sentinel OS
          </Link>
        </Button>
        <Button asChild className="mt-2" variant="secondary">
          <Link to="/compliance">Operating ledger</Link>
        </Button>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Viewer wallet</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Default unlock is a PIN you set. Seed stays on this device. Stripe is
          an optional USD rail. Phantom is optional. Open the lock icon (left
          rail) to create or unlock.
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">SaaS edition</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We The People and Company share this OS. Neither edition phones home.
          Convert USD-backed funds to TRV and subscribe from Billing. A company
          owner cannot unlock a seat wallet.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/hub/billing">
              <Landmark className="size-4" /> Open billing
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/covenant">Covenant</Link>
          </Button>
        </div>
      </section>

      <section className="md:hidden">
        <h2 className="font-display text-xl">More</h2>
        <div className="mt-3 grid gap-2">
          <Button asChild variant="secondary">
            <Link to="/hub/billing">
              <Landmark className="size-4" /> Billing
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/hub/hydra">
              <ShieldAlert className="size-4" /> Hydra
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/hub/forum">
              <MessageSquare className="size-4" /> Forum
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/hub/gateway">
              <ScrollText className="size-4" /> Gateway
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/hub/browser">
              <Globe className="size-4" /> Shield
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/hub/profile">
              <QrCode className="size-4" /> Profile
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
