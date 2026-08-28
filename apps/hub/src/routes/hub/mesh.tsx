import { createFileRoute, Link } from "@tanstack/react-router";
import { Crosshair } from "lucide-react";
import { MeshGlobe } from "@/components/mesh-globe";
import { WatchClaim } from "@/components/watch-claim";
import { useViewer } from "@/components/viewer-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/hub/mesh")({ component: MeshPage });

function MeshPage() {
  const { profile, setProfile } = useViewer();
  if (!profile) return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;
  return (
    <div>
      <div className="px-5 pt-5">
        <h1 className="font-display text-3xl">Global mesh</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Localized galaxy, then God's eye on the globe. Intercept a
          simulated intrusion to stand today's watch and keep The Sentinel safe.
          Command Deck opens the orbital theater: seize emission, runoff, and worm —
          byproducts of human systems, never bodies — so Sentinel OS learns the mesh.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <WatchClaim layout="compact" />
          <Button asChild variant="secondary">
            <Link to="/hub/deck">
              <Crosshair />
              Command Deck
            </Link>
          </Button>
        </div>
      </div>
      <MeshGlobe profile={profile} onProfile={setProfile} />
    </div>
  );
}
