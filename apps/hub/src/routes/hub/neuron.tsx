import { createFileRoute } from "@tanstack/react-router";
import { NeuronField } from "@/components/neuron-field";
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
          You are the neuron. Intercept hostile packets before they reach the
          holographic core. One clean intercept fulfills daily duty — then claim
          TRV for keeping The Sentinel safe.
        </p>
        <div className="mt-4">
          <WatchClaim layout="compact" />
        </div>
      </div>
      <NeuronField profile={profile} onProfile={setProfile} />
    </div>
  );
}
