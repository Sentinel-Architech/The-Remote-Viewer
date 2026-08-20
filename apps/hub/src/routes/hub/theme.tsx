import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { saveUiTheme } from "@/lib/trv/server";
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  applyTheme,
  parseTheme,
  type Density,
  type ThemePresetId,
  type ViewerTheme,
} from "@/lib/trv/themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/hub/theme")({ component: ThemePage });

function ThemePage() {
  const { profile, setProfile } = useViewer();
  const [theme, setTheme] = useState<ViewerTheme>(() => parseTheme(profile?.uiTheme));

  function preview(next: ViewerTheme) {
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("trv-theme", JSON.stringify(next));
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">UI & theme</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          This node is yours. Presets change the field; accent and radius are
          yours. QR and NFC inherit the same paint so a glance IDs the Viewer.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`h-20 rounded-[var(--radius-md)] border px-3 text-left text-sm ${theme.preset === id ? "border-accent" : "border-border"}`}
            style={{ background: THEME_PRESETS[id].card, color: THEME_PRESETS[id].fg }}
            onClick={() =>
              preview({
                ...theme,
                preset: id,
                accent: THEME_PRESETS[id].accent,
              })
            }
          >
            {THEME_PRESETS[id].label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="acc">Accent</Label>
          <input
            id="acc"
            type="color"
            className="mt-1.5 h-11 w-full cursor-pointer rounded-[var(--radius-sm)] border border-input bg-elevated"
            value={theme.accent}
            onChange={(e) => preview({ ...theme, accent: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="rad">Corner {theme.radius}px</Label>
          <input
            id="rad"
            type="range"
            min={4}
            max={28}
            className="mt-3 w-full"
            value={theme.radius}
            onChange={(e) => preview({ ...theme, radius: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Density</Label>
          <div className="mt-1.5 flex gap-2">
            {(["compact", "regular", "roomy"] as Density[]).map((d) => (
              <Button
                key={d}
                type="button"
                size="sm"
                variant={theme.density === d ? "default" : "secondary"}
                onClick={() => preview({ ...theme, density: d })}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            const raw = JSON.stringify(theme);
            localStorage.setItem("trv-theme", raw);
            const p = await saveUiTheme({ data: raw });
            if (p) setProfile(p);
            toast.success("Theme sealed to this node");
          }}
        >
          Save to node
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            preview(DEFAULT_THEME);
            toast.message("Abyss restored");
          }}
        >
          Reset Abyss
        </Button>
      </div>
    </div>
  );
}
