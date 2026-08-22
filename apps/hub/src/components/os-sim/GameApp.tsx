import { useEffect, useRef } from "react";
import { useGameStore } from "@/os-sim/store";
import { DebriefScreen } from "./DebriefScreen";
import { HUD } from "./HUD";
import { KnowledgePanel } from "./KnowledgePanel";
import { MobileControls } from "./MobileControls";
import { PauseMenu } from "./PauseMenu";
import { StartScreen } from "./StartScreen";

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let engine: { dispose: () => void } | null = null;
    void import("@/os-sim/engine").then(({ createEngine }) => {
      if (disposed || !canvas) return;
      engine = createEngine(canvas);
    });
    return () => {
      disposed = true;
      engine?.dispose();
    };
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") useGameStore.getState().persist();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full touch-none"
        onContextMenu={(e) => e.preventDefault()}
      />
      {phase === "briefing" && <StartScreen />}
      {(phase === "playing" || phase === "paused") && <HUD />}
      {phase === "playing" && <MobileControls />}
      {phase === "paused" && <PauseMenu />}
      {phase === "debrief" && <DebriefScreen collapsed={false} />}
      {phase === "collapse" && <DebriefScreen collapsed />}
      <KnowledgePanel />
    </div>
  );
}
