export type ThemePresetId = "abyss" | "bone" | "signal" | "ember" | "sage";
export type Density = "compact" | "regular" | "roomy";

export type ViewerTheme = {
  preset: ThemePresetId;
  accent: string;
  radius: number;
  density: Density;
};

export const THEME_PRESETS: Record<
  ThemePresetId,
  { label: string; bg: string; fg: string; card: string; muted: string; accent: string; border: string }
> = {
  abyss: {
    label: "Abyss",
    bg: "#08090b",
    fg: "#ecece8",
    card: "#12141a",
    muted: "#8a8d88",
    accent: "#c5cfc8",
    border: "rgb(236 236 232 / 12%)",
  },
  bone: {
    label: "Bone",
    bg: "#f3f0e7",
    fg: "#1a1814",
    card: "#fffaf0",
    muted: "#6f6a60",
    accent: "#3d4a40",
    border: "rgb(26 24 20 / 12%)",
  },
  signal: {
    label: "Signal",
    bg: "#050505",
    fg: "#f4f4f4",
    card: "#111111",
    muted: "#9a9a9a",
    accent: "#e8e8e8",
    border: "rgb(255 255 255 / 16%)",
  },
  ember: {
    label: "Ember",
    bg: "#120c0a",
    fg: "#f3e6d8",
    card: "#1c1410",
    muted: "#a89078",
    accent: "#d4a574",
    border: "rgb(243 230 216 / 12%)",
  },
  sage: {
    label: "Sage",
    bg: "#0c110e",
    fg: "#e6eee8",
    card: "#141b16",
    muted: "#8aa090",
    accent: "#8fbf9a",
    border: "rgb(230 238 232 / 12%)",
  },
};

export const DEFAULT_THEME: ViewerTheme = {
  preset: "abyss",
  accent: THEME_PRESETS.abyss.accent,
  radius: 12,
  density: "regular",
};

export function parseTheme(raw: string | null | undefined): ViewerTheme {
  if (!raw) return DEFAULT_THEME;
  try {
    const j = JSON.parse(raw) as Partial<ViewerTheme>;
    const preset = (["abyss", "bone", "signal", "ember", "sage"] as const).includes(j.preset as ThemePresetId)
      ? (j.preset as ThemePresetId)
      : "abyss";
    const accent = typeof j.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(j.accent)
      ? j.accent
      : THEME_PRESETS[preset].accent;
    const radius = Math.max(4, Math.min(28, Number(j.radius) || 12));
    const density: Density = j.density === "compact" || j.density === "roomy" ? j.density : "regular";
    return { preset, accent, radius, density };
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme: ViewerTheme) {
  const p = THEME_PRESETS[theme.preset];
  const r = document.documentElement;
  r.style.setProperty("--color-bg", p.bg);
  r.style.setProperty("--color-background", p.bg);
  r.style.setProperty("--color-fg", p.fg);
  r.style.setProperty("--color-foreground", p.fg);
  r.style.setProperty("--color-card", p.card);
  r.style.setProperty("--color-card-foreground", p.fg);
  r.style.setProperty("--color-surface", p.card);
  r.style.setProperty("--color-elevated", p.card);
  r.style.setProperty("--color-popover", p.card);
  r.style.setProperty("--color-popover-foreground", p.fg);
  r.style.setProperty("--color-muted", p.muted);
  r.style.setProperty("--color-muted-foreground", p.muted);
  r.style.setProperty("--color-accent", theme.accent);
  r.style.setProperty("--color-ring", theme.accent);
  r.style.setProperty("--color-primary", p.fg);
  r.style.setProperty("--color-primary-foreground", p.bg);
  r.style.setProperty("--color-secondary", p.card);
  r.style.setProperty("--color-secondary-foreground", p.fg);
  r.style.setProperty("--color-border", p.border);
  r.style.setProperty("--color-input", p.border);
  r.style.setProperty("--radius-md", `${theme.radius}px`);
  r.style.setProperty("--radius-lg", `${theme.radius + 4}px`);
  r.style.setProperty("--radius-xl", `${theme.radius + 12}px`);
  r.dataset.density = theme.density;
  r.style.background = p.bg;
  r.style.color = p.fg;
}
