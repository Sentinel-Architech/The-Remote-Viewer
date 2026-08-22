import { Button } from "@/components/ui/button";
import { getEngine } from "@/os-sim/engine-api";
import { useGameStore } from "@/os-sim/store";
import { useJackSession } from "./session-context";

export function PauseMenu() {
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const { onClose } = useJackSession();

  const apply = (partial: Partial<typeof settings>) => {
    setSettings(partial);
    getEngine()?.applySettings();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/55 p-4">
      <div className="chrome-motion hud-enter w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="font-mono text-xs tracking-[0.18em] text-accent">LINK SUSPENDED</p>
        <h2 className="mt-1 text-xl font-semibold">Paused</h2>
        <div className="mt-5 flex flex-col gap-4">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Audio</span>
            <button
              type="button"
              className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 font-mono text-xs text-fg"
              onClick={() => apply({ muted: !settings.muted })}
            >
              {settings.muted ? "Muted" : "Live"}
            </button>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="flex justify-between">
              Volume
              <span className="font-mono tabular text-muted">{Math.round(settings.master * 100)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.master}
              onChange={(e) => apply({ master: Number(e.target.value) })}
              className="accent-accent"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Camera shake</span>
            <button
              type="button"
              className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 font-mono text-xs text-fg"
              onClick={() => apply({ shake: !settings.shake })}
            >
              {settings.shake ? "On" : "Off"}
            </button>
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Button className="h-11 w-full" onClick={() => getEngine()?.resume()}>
            Resume
          </Button>
          <Button
            variant="secondary"
            className="h-11 w-full"
            onClick={() => {
              useGameStore.getState().setPhase("briefing");
              document.exitPointerLock?.();
            }}
          >
            End watch
          </Button>
          {onClose ? (
            <Button
              variant="secondary"
              className="h-11 w-full"
              onClick={() => {
                document.exitPointerLock?.();
                onClose();
              }}
            >
              Return to hub
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
