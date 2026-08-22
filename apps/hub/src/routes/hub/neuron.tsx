import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Radio } from "lucide-react";
import { NeuralSpace } from "@/components/neural-space";
import { WatchClaim } from "@/components/watch-claim";
import { useViewer } from "@/components/viewer-context";
import { JackInSession } from "@/components/os-sim/JackInSession";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/hub/neuron")({ component: NeuronPage });

function NeuronPage() {
  const { profile, setProfile } = useViewer();
  const [jacked, setJacked] = useState(false);
  if (!profile) return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;
  if (jacked) return <JackInSession onClose={() => setJacked(false)} />;
  return (
    <div>
      <div className="px-5 pt-5">
        <h1 className="font-display text-3xl">Watchful Neuron</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          You are inside the brain. Hostile signals travel neural pathways toward
          the core. Tilt or drag to look. Discover the correct response — the
          tissue lights up and the Sentinel self-heals. Jack in to fly the tissue
          as a guided neuron: scan, name, pulse. Cataloged signatures feed SENTINEL OS.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <WatchClaim layout="compact" />
          <Button onClick={() => setJacked(true)}>
            <Radio />
            Jack into SENTINEL OS
          </Button>
        </div>
      </div>
      <NeuralSpace profile={profile} onProfile={setProfile} />
    </div>
  );
}
