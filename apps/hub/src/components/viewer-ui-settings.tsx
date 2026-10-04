"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveUiTheme } from "@/lib/trv/server";
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  applyTheme,
  parseTheme,
  type Density,
  type ExclusiveLookId,
  type ThemePresetId,
  type ViewerTheme,
} from "@/lib/trv/themes";
import {
  EXCLUSIVE_LOOK_NOTE,
  UI_EXPERT,
  clampThemeToPlan,
  exclusiveLookOpen,
  grokUiControls,
} from "@/lib/trv/grok-ui";
import { IN_APP_TOKEN_NAME } from "@/lib/trv/viewer-locks";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export function ViewerUiSettings({
  planId,
  saved,
  onSaved,
}: {
  planId: string;
  saved: string | null | undefined;
  onSaved: (raw: string) => void;
}) {
  const open = new Set(grokUiControls(planId));
  const [theme, setTheme] = useState<ViewerTheme>(() => clampThemeToPlan(parseTheme(saved), planId));

  function preview(next: ViewerTheme) {
    const clamped = clampThemeToPlan(next, planId);
    setTheme(clamped);
    applyTheme(clamped);
    localStorage.setItem("trv-theme", JSON.stringify(clamped));
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <h2 className="font-display text-xl">Your UI</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {UI_EXPERT} is the mix of experts for this UI. Free stays the plain settings: field, accent, corners, and density. Higher paid tiers open more through {UI_EXPERT}. No other model is called. No price is added here.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`h-20 rounded-[var(--radius-md)] border px-3 text-left text-sm ${theme.preset === id ? "border-accent" : "border-border"}`}
            style={{ background: THEME_PRESETS[id].card, color: THEME_PRESETS[id].fg }}
            onClick={() => preview({ ...theme, preset: id, accent: THEME_PRESETS[id].accent })}
          >
            {THEME_PRESETS[id].label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
              <Button key={d} type="button" size="sm" variant={theme.density === d ? "default" : "secondary"} onClick={() => preview({ ...theme, density: d })}>
                {d}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {open.has("type") ? (
        <div className="mt-4">
          <Label htmlFor="type">Type {theme.typeScale ?? 100}</Label>
          <input id="type" type="range" min={90} max={120} className="mt-3 w-full" value={theme.typeScale ?? 100} onChange={(e) => preview({ ...theme, typeScale: Number(e.target.value) })} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">Type scale opens on Verified and above, through {UI_EXPERT}.</p>
      )}
      {open.has("motion") ? (
        <div className="mt-4">
          <Label htmlFor="motion">Motion {theme.motion ?? 0}</Label>
          <input id="motion" type="range" min={0} max={100} className="mt-3 w-full" value={theme.motion ?? 0} onChange={(e) => preview({ ...theme, motion: Number(e.target.value) })} />
        </div>
      ) : null}
      {open.has("exclusive") ? (
        <div className="mt-4">
          <Label>Exclusive look</Label>
          <p className="mt-1 text-xs text-muted-foreground">{EXCLUSIVE_LOOK_NOTE}</p>
          <div className="mt-2 flex gap-2">
            {(["prism", "iris"] as ExclusiveLookId[]).map((look) => (
              <Button
                key={look}
                type="button"
                size="sm"
                variant={theme.exclusiveLook === look ? "default" : "secondary"}
                disabled={!exclusiveLookOpen(planId, look)}
                onClick={() => preview({ ...theme, exclusiveLook: look })}
              >
                {look}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{IN_APP_TOKEN_NAME} amount is not set.</p>
        </div>
      ) : null}
      {open.has("rhythm") ? (
        <div className="mt-4">
          <Label htmlFor="rhythm">Rhythm {theme.rhythm ?? 0}</Label>
          <input id="rhythm" type="range" min={0} max={24} className="mt-3 w-full" value={theme.rhythm ?? 0} onChange={(e) => preview({ ...theme, rhythm: Number(e.target.value) })} />
        </div>
      ) : null}
      {open.has("crest") ? (
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Crest
          <input type="checkbox" checked={Boolean(theme.crest)} onChange={(e) => preview({ ...theme, crest: e.target.checked })} />
        </label>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            const clamped = clampThemeToPlan(theme, planId);
            const raw = JSON.stringify(clamped);
            localStorage.setItem("trv-theme", raw);
            const profile = await saveUiTheme({ data: raw });
            if (profile?.uiTheme) onSaved(profile.uiTheme);
            toast.success("UI sealed to this node");
          }}
        >
          Save to this node
        </Button>
        <Button variant="secondary" onClick={() => preview(DEFAULT_THEME)}>
          Reset plain
        </Button>
      </div>
    </section>
  );
}
