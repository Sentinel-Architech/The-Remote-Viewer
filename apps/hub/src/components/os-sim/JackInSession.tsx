import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { addLesson } from "@/lib/trv/edge";
import { logDefense, saveProgress } from "@/lib/trv/server";
import { pingWatch } from "@/lib/trv/watch-events";
import { setOsSimHooks } from "@/os-sim/hub-bridge";
import { autoHealCount } from "@/os-sim/save";
import { useGameStore } from "@/os-sim/store";
import { CATALOG_TOTAL } from "@/os-sim/catalog";
import { useViewer } from "@/components/viewer-context";
import { GameApp } from "./GameApp";
import { JackSession } from "./session-context";

export function JackInSession({ onClose }: { onClose: () => void }) {
  const { profile, setProfile, refreshWatch } = useViewer();
  const lastPhase = useRef(useGameStore.getState().phase);

  useEffect(() => {
    setOsSimHooks({
      onDefense: (e) => {
        void logDefense({
          data: { attackType: e.attackType, outcome: e.outcome, xpGain: e.xpGain },
        }).then(() => pingWatch());
      },
      onCatalog: (e) => {
        void addLesson({
          at: new Date().toISOString(),
          agent: "mesh",
          dir: "h2m",
          pattern: `Jack-in catalog ${e.name}`,
          counsel: "Signature written into SENTINEL OS. Autonomy rises with the catalog.",
        });
        toast.success(`${e.name} written into OS memory.`);
      },
    });
    return () => setOsSimHooks({});
  }, []);

  useEffect(() => {
    const unsub = useGameStore.subscribe((s) => {
      const prev = lastPhase.current;
      lastPhase.current = s.phase;
      if (prev === "playing" && (s.phase === "debrief" || s.phase === "collapse") && profile) {
        const auto = autoHealCount(s.knowledge);
        const autonomy = Math.round((auto / CATALOG_TOTAL) * 100);
        const health = Math.max(0, Math.min(100, Math.round(s.hud.integrity)));
        void saveProgress({
          data: {
            xp: profile.xp + (s.phase === "debrief" ? 40 : 8),
            sentinelHealth: health,
            sentinelAutonomy: autonomy,
            pulseRadius: profile.pulseRadius,
            autoIntercept: profile.autoIntercept,
            extraNeurons: profile.extraNeurons,
          },
        }).then((p) => {
          if (p) setProfile(p);
          void refreshWatch();
        });
      }
    });
    return unsub;
  }, [profile, setProfile, refreshWatch]);

  return (
    <JackSession.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-[80] bg-bg">
        <GameApp />
      </div>
    </JackSession.Provider>
  );
}
