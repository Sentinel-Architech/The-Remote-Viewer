import { createFileRoute } from "@tanstack/react-router";
import { NeuralSpace } from "@/components/neural-space";
import { WatchClaim } from "@/components/watch-claim";
import { useViewer } from "@/components/viewer-context";

export const Route = createFileRoute("/hub/neuron")({ component: NeuronPage });

function NeuronPage() {
  const { profile, setProfile } = useViewer();
  if (!profile) return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;
  return (
    <div>
      <div className="px-5 pt-5">
        <h1 className="font-display text-3xl">Watchful Neuron</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          You are inside the brain. Hostile signals travel neural pathways toward
          the core. Tilt or drag to look. Discover the correct response — the
          tissue lights up and the Sentinel self-heals.
        </p>
        <div className="mt-4">
          <WatchClaim layout="compact" />
        </div>
      </div>
      <NeuralSpace profile={profile} onProfile={setProfile} />
    </div>
  );
}
