import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Box,
  BrainCircuit,
  Circle,
  Cylinder,
  Eye,
  Fingerprint,
  Hexagon,
  Globe,
  RotateCcw,
  ScrollText,
  Shield,
  ShieldCheck,
  Trash2,
  Unplug,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";
import { DECK_NAME, NETWORK_SHORT, NETWORK_TAG, THEATER_NEURAL, THEATER_ORBIT, THEATER_ORBIT_TAG } from "@/lib/command-deck/brand";
import { hasInjectedWallet, useIdentity } from "@/lib/command-deck/identity";
import { healTier, isLearned, LEARN_NEED, learnedCount, nextRank, osTitle, rankFor, samplesOf, SIGNATURES, sightTier, sigKey, useProgress } from "@/lib/command-deck/progress";
import { PlaygroundCanvas } from "./scene";
import {
  bindPlaygroundTest,
  KIND_LABEL,
  todayKey,
  usePlayground,
  type ShapeKind,
} from "./store";

const SHAPE_ICONS: Record<ShapeKind, typeof Circle> = {
  sphere: Circle,
  box: Box,
  cylinder: Cylinder,
};

const NEURAL_ICONS: Record<ShapeKind, typeof Circle> = {
  sphere: Circle,
  box: Hexagon,
  cylinder: Cylinder,
};

const SHAPE_KINDS: ShapeKind[] = ["sphere", "box", "cylinder"];

type Panel = "vault" | "briefing" | null;

function Meter({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted uppercase">{label}</span>
        <span className="font-mono text-xs text-foreground tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/12" aria-hidden>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Toolbar() {
  const selected = usePlayground((s) => s.selected);
  const spawn = usePlayground((s) => s.spawn);
  const scatter = usePlayground((s) => s.scatter);
  const clear = usePlayground((s) => s.clear);
  const seed = usePlayground((s) => s.seed);
  const count = usePlayground((s) => s.bodies.length);
  const theater = usePlayground((s) => s.theater);
  const learned = useProgress((s) => s.learned);
  const labels = KIND_LABEL[theater];
  const orbit = theater === "orbit";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(4.25rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-[max(0.85rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-2 rounded-xl bg-card p-2 shadow-[var(--shadow-border)] sm:p-3">
        {SHAPE_KINDS.map((kind) => {
          const Icon = orbit ? SHAPE_ICONS[kind] : NEURAL_ICONS[kind];
          const label = labels[kind];
          return (
            <Button
              key={kind}
              variant={selected === kind ? "selected" : "ghost"}
              aria-label={`Drop ${label}`}
              aria-pressed={selected === kind}
              onClick={() => spawn(kind)}
              className={cn(
                "flex-1 sm:flex-none",
                isLearned(learned, sigKey(theater, kind)) && selected !== kind ? "text-sage" : undefined,
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          );
        })}
        <Button
          variant="solid"
          aria-label={orbit ? "Sweep byproducts onto the mesh" : "Pulse an outbreak into the CSF"}
          onClick={scatter}
          className="flex-1 sm:flex-none"
        >
          <Activity className="size-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">{orbit ? "Sweep" : "Outbreak"}</span>
        </Button>
        <Button variant="ghost" aria-label="Reset the field" onClick={seed} className="ml-auto">
          <RotateCcw className="size-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button variant="ghost" aria-label="Clear all bodies" onClick={clear} disabled={count === 0}>
          <Trash2 className="size-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  );
}

function PhysicsLegend() {
  const discovered = usePlayground((s) => s.discovered);
  const outcome = usePlayground((s) => s.outcome);
  const dismissLegend = usePlayground((s) => s.dismissLegend);
  const gravity = usePlayground((s) => s.gravity);
  const restitution = usePlayground((s) => s.restitution);
  const setGravity = usePlayground((s) => s.setGravity);
  const setRestitution = usePlayground((s) => s.setRestitution);
  const theater = usePlayground((s) => s.theater);
  const orbit = theater === "orbit";

  if (!discovered || !outcome) return null;

  const win = outcome === "win";
  const title = win
    ? orbit
      ? "Mesh clear"
      : "Tissue clear"
    : orbit
      ? "Mesh overwhelmed"
      : "Tissue overwhelmed";

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-3 pt-36 pb-32 sm:pb-24">
      <div
        role="dialog"
        aria-label="Field physics hologram"
        data-outcome={outcome}
        className="hologram hologram-enter pointer-events-auto w-full max-w-md rounded-xl p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-widest text-sage uppercase">Field physics</p>
            <p className="mt-1 font-display text-lg text-foreground">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Discovery logged. Tune {orbit ? "pull" : "gravity"} and bounce.
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Dismiss hologram" onClick={dismissLegend} className="size-11">
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
        <div className="mt-3 space-y-2 rounded-md bg-card/40 p-3 shadow-[var(--shadow-border)]">
          <label className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs font-medium tracking-wide text-muted uppercase">
              {orbit ? "Pull" : "Gravity"}
            </span>
            <Slider
              min={0}
              max={20}
              step={0.1}
              value={[gravity]}
              onValueChange={(v) => setGravity(v[0] ?? 9.81)}
              aria-label={orbit ? "Pull" : "Gravity"}
            />
            <span className="w-10 text-right font-mono text-xs text-foreground tabular-nums">{gravity.toFixed(1)}</span>
          </label>
          <label className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs font-medium tracking-wide text-muted uppercase">Bounce</span>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[restitution]}
              onValueChange={(v) => setRestitution(v[0] ?? 0.35)}
              aria-label="Bounce"
            />
            <span className="w-10 text-right font-mono text-xs text-foreground tabular-nums">{restitution.toFixed(2)}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function OsCatalog() {
  const learned = useProgress((s) => s.learned);
  const n = learnedCount(learned);
  const title = osTitle(learned);
  const armed = n >= 6;
  const Icon = armed ? ShieldCheck : Shield;
  const neural = SIGNATURES.filter((s) => s.theater === "neural");
  const orbit = SIGNATURES.filter((s) => s.theater === "orbit");

  return (
    <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" aria-label="Sentinel OS catalog">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-sage" strokeWidth={1.75} />
          <p className="text-xs tracking-wide text-muted uppercase">Sentinel OS</p>
        </div>
        <p className="font-mono text-xs text-sage tabular-nums">
          {title} · {n}/6
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {armed
          ? "All six signatures armed. Self-defense live in Synapse and God's Eye."
          : "Seize a strain three times. The OS memorizes it and strikes that signature on its own."}
      </p>
      <p className="mt-3 text-xs font-medium tracking-wide text-muted uppercase">Synapse</p>
      <div className="mt-2 space-y-2">
        {neural.map((row) => (
          <SigMeter key={row.key} label={row.label} samples={samplesOf(learned, row.key)} />
        ))}
      </div>
      <p className="mt-3 text-xs font-medium tracking-wide text-muted uppercase">God's Eye</p>
      <div className="mt-2 space-y-2">
        {orbit.map((row) => (
          <SigMeter key={row.key} label={row.label} samples={samplesOf(learned, row.key)} />
        ))}
      </div>
    </div>
  );
}

function SigMeter({ label, samples }: { label: string; samples: number }) {
  const capped = Math.min(samples, LEARN_NEED);
  const armed = capped >= LEARN_NEED;
  const pct = Math.round((capped / LEARN_NEED) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted uppercase">{label}</span>
        <span className={cn("font-mono text-xs tabular-nums", armed ? "text-sage" : "text-foreground")}>
          {capped}/{LEARN_NEED}
          {armed ? " armed" : ""}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/12" aria-hidden>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function VaultPanel({ onClose }: { onClose: () => void }) {
  const pubkey = useIdentity((s) => s.pubkey);
  const short = useIdentity((s) => s.short);
  const curve = useIdentity((s) => s.curve);
  const injected = useIdentity((s) => s.injected);
  const injectedKind = useIdentity((s) => s.injectedKind);
  const busy = useIdentity((s) => s.busy);
  const error = useIdentity((s) => s.error);
  const connectInjected = useIdentity((s) => s.connectInjected);
  const disconnectInjected = useIdentity((s) => s.disconnectInjected);
  const xp = useProgress((s) => s.xp);
  const healed = useProgress((s) => s.healed);
  const cleared = useProgress((s) => s.cleared);
  const watches = useProgress((s) => s.watches);
  const rank = rankFor(xp);
  const nxt = nextRank(xp);
  const [copied, setCopied] = useState(false);
  const injectedPresent = hasInjectedWallet();
  const xpMax = nxt ? nxt.xp : rank.xp;
  const xpMin = rank.xp;
  const xpSpan = Math.max(1, xpMax - xpMin);

  async function copyKey() {
    if (!pubkey) return;
    try {
      await navigator.clipboard.writeText(pubkey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Profile vault"
      className="pointer-events-auto absolute top-32 right-3 left-3 z-20 max-h-[min(34rem,68dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:left-auto sm:w-80"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted uppercase">Profile vault</p>
          <p className="mt-1 font-display text-lg text-foreground">{rank.title}</p>
          <p className="font-mono text-xs text-sage">Lvl {rank.level}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close vault" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        One dossier across Synapse and God's Eye. Upgrade and heal here as you play. Local to this device.
      </p>
      <div className="mt-3 space-y-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]">
        <Meter
          label={nxt ? `XP to ${nxt.title}` : "XP"}
          value={nxt ? xp - xpMin : xp}
          max={nxt ? xpSpan : Math.max(xp, 1)}
        />
        <Meter label="Tissue heal" value={healed} max={36} />
        <Meter label="Mesh clearance" value={cleared} max={36} />
        <p className="font-mono text-xs text-subtle">{watches} watches logged</p>
        <p className="text-xs leading-relaxed text-muted">
          God's Eye never marks a body. Only exhaust: emission, runoff, worm.
        </p>
      </div>
      <OsCatalog />
      <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]">
        <p className="text-xs tracking-wide text-muted uppercase">
          Local {curve === "ed25519" ? "Ed25519" : curve === "hash" ? "hash" : "key"}
        </p>
        <p className="mt-1 break-all font-mono text-xs text-foreground">{pubkey || short}</p>
        <Button variant="solid" size="sm" className="mt-3" onClick={() => void copyKey()} disabled={!pubkey}>
          <Fingerprint className="size-4" strokeWidth={1.75} />
          {copied ? "Copied" : "Copy public key"}
        </Button>
      </div>
      <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]">
        <p className="text-xs tracking-wide text-muted uppercase">Injected wallet</p>
        {injected ? (
          <>
            <p className="mt-1 break-all font-mono text-xs text-foreground">
              {injectedKind === "solana" ? "sol" : "eth"} · {injected}
            </p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={disconnectInjected}>
              <Unplug className="size-4" strokeWidth={1.75} />
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              {injectedPresent
                ? "A wallet is available in this browser."
                : "No injected wallet here. Local identity is already live."}
            </p>
            <Button
              variant="solid"
              size="sm"
              className="mt-3"
              onClick={() => void connectInjected()}
              disabled={busy}
            >
              <Wallet className="size-4" strokeWidth={1.75} />
              {busy ? "Connecting" : "Connect wallet"}
            </Button>
          </>
        )}
        {error ? <p className="mt-2 text-sm text-ember">{error}</p> : null}
      </div>
    </div>
  );
}

function BriefingPanel({ onClose }: { onClose: () => void }) {
  const briefing = usePlayground((s) => s.briefing);

  return (
    <div
      role="dialog"
      aria-label="Briefing log"
      className="pointer-events-auto absolute top-32 right-3 left-3 z-20 max-h-[min(22rem,48dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:right-auto sm:left-5 sm:w-80"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted uppercase">Briefing</p>
          <p className="mt-1 font-display text-lg text-foreground">Field events</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close briefing" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <ol className="mt-3 space-y-2">
        {briefing.map((line, i) => (
          <li key={`${line.t}-${i}`} className="border-border border-l-2 pl-3">
            <p className="font-mono text-xs leading-relaxed text-foreground">{line.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Header({
  panel,
  setPanel,
}: {
  panel: Panel;
  setPanel: (p: Panel) => void;
}) {
  const count = usePlayground((s) => s.bodies.length);
  const grabbing = usePlayground((s) => s.grabbing);
  const watchDay = usePlayground((s) => s.watchDay);
  const claimWatch = usePlayground((s) => s.claimWatch);
  const theater = usePlayground((s) => s.theater);
  const setTheater = usePlayground((s) => s.setTheater);
  const short = useIdentity((s) => s.short);
  const ready = useIdentity((s) => s.ready);
  const xp = useProgress((s) => s.xp);
  const rank = rankFor(xp);
  const nxt = nextRank(xp);
  const claimed = watchDay === todayKey();
  const last = usePlayground((s) => s.briefing[0]?.text);
  const orbit = theater === "orbit";
  const xpPct = nxt ? Math.min(100, Math.round(((xp - rank.xp) / Math.max(1, nxt.xp - rank.xp)) * 100)) : 100;
  const learned = useProgress((s) => s.learned);
  const osN = learnedCount(learned);
  const osName = osTitle(learned);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="pointer-events-auto flex min-h-11 items-center gap-2">
            <Link
              to="/hub"
              className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase hover:text-foreground"
            >
              Command
            </Link>
            <span className="text-subtle" aria-hidden>
              /
            </span>
            <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">{NETWORK_SHORT}</p>
          </div>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground">{DECK_NAME}</h1>
          <p className="mt-1 hidden max-w-sm text-xs leading-relaxed text-muted sm:block">
            {orbit ? THEATER_ORBIT_TAG : NETWORK_TAG}
          </p>
          <p className="mt-1 truncate text-xs text-subtle sm:hidden">{last}</p>
          <div className="pointer-events-auto mt-2 flex w-fit items-center gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-border)]">
            <Button
              variant={theater === "neural" ? "selected" : "ghost"}
              size="sm"
              aria-label="Enter synapse theater"
              aria-pressed={theater === "neural"}
              onClick={() => setTheater("neural")}
            >
              <BrainCircuit className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{THEATER_NEURAL}</span>
            </Button>
            <Button
              variant={theater === "orbit" ? "selected" : "ghost"}
              size="sm"
              aria-label="Enter God's Eye theater"
              aria-pressed={theater === "orbit"}
              onClick={() => setTheater("orbit")}
            >
              <Globe className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{THEATER_ORBIT}</span>
            </Button>
          </div>
          <p className="mt-2 font-mono text-sm text-foreground tabular-nums">
            {count} {orbit ? "on the mesh" : "in the CSF"}
            <span className="ml-2 font-sans text-xs text-muted">
              {grabbing
                ? orbit
                  ? "Tractor lock · throw to release"
                  : "Axon lock · throw to release"
                : orbit
                  ? "Byproducts only. Seize emission, runoff, or worm to teach Sentinel OS."
                  : "Remote neuron. Seize HSV, West Nile, or rabies to teach Sentinel OS."}
            </span>
          </p>
        </div>
        <div className="rank-chip pointer-events-auto flex shrink-0 flex-col items-end gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-border)]">
          <div className="flex items-center gap-1">
          <Button
            variant={claimed ? "ghost" : "primary"}
            aria-label={claimed ? "Daily watch already claimed" : "Claim daily watch"}
            onClick={() => claimWatch()}
            disabled={claimed}
          >
            <Eye className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{claimed ? "On watch" : "Watch"}</span>
          </Button>
          <Button
            variant={panel === "vault" ? "selected" : "ghost"}
            aria-label="Open profile vault"
            aria-pressed={panel === "vault"}
            onClick={() => setPanel(panel === "vault" ? null : "vault")}
          >
            <Fingerprint className="size-4" strokeWidth={1.75} />
            <span className="hidden font-mono text-xs sm:inline">{rank.title}</span>
            <span className="hidden font-mono text-xs text-subtle lg:inline">{ready ? short : "minting"}</span>
          </Button>
          <Button
            variant={panel === "briefing" ? "selected" : "ghost"}
            aria-label="Open briefing"
            aria-pressed={panel === "briefing"}
            onClick={() => setPanel(panel === "briefing" ? null : "briefing")}
          >
            <ScrollText className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Briefing</span>
          </Button>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/12" aria-hidden>
            <div className="meter-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <p
            className="px-1 font-mono text-xs text-sage tabular-nums"
            aria-label={`Sentinel OS ${osName}, ${osN} of 6 signatures`}
          >
            OS {osN}/6
            <span className="ml-1 hidden text-muted sm:inline">{osName}</span>
          </p>
        </div>
      </div>
    </header>
  );
}

function Visor() {
  const theater = usePlayground((s) => s.theater);
  const orbit = theater === "orbit";
  return (
    <>
      <div className={cn("pointer-events-none absolute inset-0 z-[1]", orbit ? "visor-orbit" : "visor-neural")} />
      {orbit ? (
        <div className="pointer-events-none absolute inset-5 z-[2] hidden sm:block" aria-hidden>
          <span className="border-sage/40 absolute top-0 left-0 h-8 w-8 border-t border-l" />
          <span className="border-sage/40 absolute top-0 right-0 h-8 w-8 border-t border-r" />
          <span className="border-sage/40 absolute bottom-16 left-0 h-8 w-8 border-b border-l" />
          <span className="border-sage/40 absolute right-0 bottom-16 h-8 w-8 border-b border-r" />
        </div>
      ) : null}
    </>
  );
}

export function Playground() {
  const spawn = usePlayground((s) => s.spawn);
  const scatter = usePlayground((s) => s.scatter);
  const clear = usePlayground((s) => s.clear);
  const seed = usePlayground((s) => s.seed);
  const claimWatch = usePlayground((s) => s.claimWatch);
  const setSelected = usePlayground((s) => s.setSelected);
  const setTheater = usePlayground((s) => s.setTheater);
  const dismissLegend = usePlayground((s) => s.dismissLegend);
  const discovered = usePlayground((s) => s.discovered);
  const outcome = usePlayground((s) => s.outcome);
  const xp = useProgress((s) => s.xp);
  const healed = useProgress((s) => s.healed);
  const cleared = useProgress((s) => s.cleared);
  const rank = rankFor(xp);
  const learned = useProgress((s) => s.learned);
  const osName = osTitle(learned);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    bindPlaygroundTest();
    usePlayground.getState().hydrate();
    useProgress.getState().hydrate();
    void useIdentity.getState().init();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.repeat) return;
      if (e.code === "Digit1") {
        setSelected("sphere");
        spawn("sphere");
      } else if (e.code === "Digit2") {
        setSelected("box");
        spawn("box");
      } else if (e.code === "Digit3") {
        setSelected("cylinder");
        spawn("cylinder");
      } else if (e.code === "Space") {
        e.preventDefault();
        spawn();
      } else if (e.code === "KeyC") {
        clear();
      } else if (e.code === "KeyR") {
        seed();
      } else if (e.code === "KeyP") {
        scatter();
      } else if (e.code === "KeyW") {
        claimWatch();
      } else if (e.code === "KeyG") {
        setTheater(usePlayground.getState().theater === "orbit" ? "neural" : "orbit");
      } else if (e.code === "KeyN") {
        setTheater("neural");
      } else if (e.code === "KeyV") {
        setPanel((p) => (p === "vault" ? null : "vault"));
      } else if (e.code === "KeyB") {
        setPanel((p) => (p === "briefing" ? null : "briefing"));
      } else if (e.code === "Escape") {
        if (usePlayground.getState().outcome) {
          dismissLegend();
        } else {
          setPanel(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [claimWatch, clear, dismissLegend, scatter, seed, setSelected, setTheater, spawn]);

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-background text-foreground"
      data-rank={rank.level}
      data-heal={healTier(healed)}
      data-sight={sightTier(cleared, rank.level)}
      data-discovered={discovered ? "1" : "0"}
      data-outcome={outcome ?? ""}
      data-os={osName.toLowerCase()}
      data-os-count={learnedCount(learned)}
    >
      <div className="absolute inset-0">
        <PlaygroundCanvas />
      </div>
      <Visor />
      <Header panel={panel} setPanel={setPanel} />
      {panel === "vault" ? <VaultPanel onClose={() => setPanel(null)} /> : null}
      {panel === "briefing" ? <BriefingPanel onClose={() => setPanel(null)} /> : null}
      <Toolbar />
      <PhysicsLegend />
      <p className={cn("sr-only")}>
        Command Deck for The Remote Viewer Network. Synapse: remote neuron in cerebrospinal fluid against HSV, West
        Nile, and rabies. God's Eye: orbital mesh that reads human byproducts — emission, runoff, worm — never bodies.
        Seize each strain three times so Sentinel OS learns the signature and auto-defends in both theaters. One local
        profile ranks up as you play.
      </p>
    </main>
  );
}
