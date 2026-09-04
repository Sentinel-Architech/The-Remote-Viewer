import { useEffect, useState, lazy, Suspense, type ReactNode } from "react";
import {
  Activity,
  Box,
  BrainCircuit,
  Circle,
  CirclePlus,
  Cylinder,
  Delete,
  Download,
  Eye,
  Fingerprint,
  Hexagon,
  Globe,
  Link2,
  ListOrdered,
  Orbit,
  Radio,
  RotateCcw,
  ScrollText,
  Shield,
  ShieldCheck,
  Scan,
  Timer,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  DECK_NAME,
  HUB_TAG,
  IDENTITY_TAG,
  MOTTO,
  NATIVE_TAG,
  NETWORK_SHORT,
  NETWORK_TAG,
  THEATER_NEURAL,
  THEATER_ORBIT,
  THEATER_ORBIT_TAG,
  WIRE_TAG,
} from "@/lib/trv";
import { useIdentity } from "@/lib/identity";
import {
  backspaceJoin,
  formatPin,
  startHub,
  startJoin,
  startLink,
  tapDigit,
  useHub,
} from "@/lib/hub-sync";
import { startWire, useRepairLive } from "@/lib/wire";
import { listBoard, postStanding } from "@/lib/board";
import { useInstall } from "@/lib/install";
import { regionLabel, rowsFor, useLiveLead, useLivePulseFeed, useSnapPressure } from "@/lib/live";
import { hasWebGL, useFieldQuality, useQualityPref } from "@/lib/platform";
import { physicsLine, physicsProfile } from "@/lib/physics";
import { toggleFieldCapture } from "@/lib/capture";
import { useNativeProbe } from "@/lib/native";
import { usePulse, usePulseClock } from "@/lib/pulse";
import {
  healTier,
  isLearned,
  LEARN_NEED,
  learnedCount,
  nextRank,
  osTitle,
  rankFor,
  samplesOf,
  SIGNATURES,
  sightTier,
  sigKey,
  useProgress,
} from "@/lib/progress";
import { BoardDashboard, InstallStrip } from "./board";
import { RepairPanel } from "./repair";
import { AffairsChip, AffairsPanel } from "./affairs";
import { FriendsPanel, GuestGate, ShopPanel, SocialDock, useClaimSocial } from "./social";
import { PillChip, PillGate, useHydratePill } from "./pill";
import { SpecialistChip, SpecialistPanel } from "./specialist";
import { DigitalLife } from "./life";
import { useSpecialist } from "@/lib/specialist";
import { lineFor, PILL_TAG, usePill, viewingLens } from "@/lib/pill";
import { assertHubAllowed, assertMeshAllowed, useAffairs } from "@/lib/affairs";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  bindPlaygroundTest,
  KIND_LABEL,
  todayKey,
  usePlayground,
  type ShapeKind,
} from "./store";

const PlaygroundCanvas = lazy(() => import("./scene").then((m) => ({ default: m.PlaygroundCanvas })));

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

type Panel = "vault" | "briefing" | "board" | "repair" | "affairs" | "friends" | "shop" | "specialist" | null;

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
  const setSelected = usePlayground((s) => s.setSelected);
  const spawn = usePlayground((s) => s.spawn);
  const seizeNow = usePlayground((s) => s.seizeNow);
  const scatter = usePlayground((s) => s.scatter);
  const clear = usePlayground((s) => s.clear);
  const seed = usePlayground((s) => s.seed);
  const count = usePlayground((s) => s.bodies.length);
  const theater = usePlayground((s) => s.theater);
  const lookMode = usePlayground((s) => s.lookMode);
  const toggleLook = usePlayground((s) => s.toggleLook);
  const q = useFieldQuality();
  const toggleUhd = useQualityPref((s) => s.toggleUhd);
  const [recording, setRecording] = useState(false);
  const learned = useProgress((s) => s.learned);
  const labels = KIND_LABEL[theater];
  const orbit = theater === "orbit";
  const clock = usePulseClock();
  const pressure = useSnapPressure();
  const missed = usePulse((s) => s.missed);
  const snap = clock.phase === "snap";
  const now = pressure.lock;
  const wait = missed && !snap;
  const snapIn = Math.max(0, Math.ceil(clock.snapIn / 1000));

  return (
    <div className="deck-toolbar pointer-events-none absolute inset-x-0 z-10 px-3 pb-2 sm:px-5">
      <div className="pointer-events-auto flex w-full max-w-[calc(100%-3.75rem)] flex-col gap-2 rounded-xl bg-card p-2 shadow-[var(--shadow-border)] sm:max-w-2xl sm:p-3">
        <div className="flex items-center gap-2" role="group" aria-label="Strain toggle">
          {SHAPE_KINDS.map((kind) => {
            const Icon = orbit ? SHAPE_ICONS[kind] : NEURAL_ICONS[kind];
            const label = labels[kind];
            return (
              <Button
                key={kind}
                variant={selected === kind ? "selected" : "ghost"}
                aria-label={`Select ${label}`}
                aria-pressed={selected === kind}
                onClick={() => setSelected(kind)}
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
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Field taps">
          <Button
            variant={now ? "primary" : wait ? "ghost" : "solid"}
            aria-label={
              now
                ? `NOW. Seize the nearest strain or wait for the next upgrade.`
                : snap
                  ? `SNAP drop ${labels[selected]}. Score now — lock in ${Math.max(0, Math.ceil(pressure.hotIn / 1000))} seconds.`
                  : wait
                    ? `You wait. Next SNAP in ${snapIn} seconds. Drop still stocks the field.`
                    : `Drop ${labels[selected]}`
            }
            onClick={() => (now ? seizeNow() : spawn())}
            className={cn("flex-1 sm:flex-none", now && "pulse-snap-hot", wait && "pulse-wait")}
            data-snap={snap ? "1" : "0"}
            data-severity={pressure.severity}
            data-wait={wait ? "1" : "0"}
          >
            {wait ? <Timer className="size-4" strokeWidth={1.75} /> : <CirclePlus className="size-4" strokeWidth={1.75} />}
            {now ? "NOW" : snap ? "SNAP" : wait ? "WAIT" : "Drop"}
          </Button>
          <Button
            variant="solid"
            aria-label={orbit ? "Sweep byproducts onto the mesh" : "Pulse an outbreak into the CSF"}
            onClick={scatter}
            className="flex-1 sm:flex-none"
          >
            <Activity className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{orbit ? "Sweep" : "Outbreak"}</span>
          </Button>
          <Button
            variant={lookMode ? "selected" : "ghost"}
            aria-label={lookMode ? "Look on. Drag to orbit." : "Look off. Tap the field to seize."}
            aria-pressed={lookMode}
            onClick={() => toggleLook()}
          >
            <Orbit className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Look</span>
          </Button>
          <Button
            variant={q.uhd ? "selected" : "ghost"}
            aria-label={
              q.uhd
                ? "4K on. 3840 by 2160 field, UHD maps, high-rate animation."
                : "4K off. Tap for 3840 by 2160 on this deck. Phones stay native pixels."
            }
            aria-pressed={q.uhd}
            onClick={() => toggleUhd()}
            data-uhd={q.uhd ? "1" : "0"}
          >
            <Scan className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">4K</span>
          </Button>
          <Button
            variant={recording ? "primary" : "ghost"}
            aria-label={recording ? "Stop recording the field video." : "Record the field as video. 4K when 4K is on."}
            aria-pressed={recording}
            onClick={() => {
              void toggleFieldCapture({ theater, uhd: q.uhd })
                .then((out) => setRecording(out.recording))
                .catch(() => {
                  setRecording(false);
                  usePlayground.getState().pushBrief("This device cannot record the field.");
                });
            }}
            data-record={recording ? "1" : "0"}
          >
            <Video className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{recording ? "Stop" : "Record"}</span>
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
              Discovery logged. Tune {orbit ? "pull" : "gravity"} and bounce. Rapier stays on this device and follows the
              screen.
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
          ? "All six signatures armed. Self-defense live in Neural Link and God's Eye."
          : "Seize a strain three times. The OS memorizes it and strikes that signature on its own."}
      </p>
      <p className="mt-3 text-xs font-medium tracking-wide text-muted uppercase">Neural Link</p>
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

function HubDeck() {
  const mode = useHub((s) => s.mode);
  const pin = useHub((s) => s.pin);
  const joinInput = useHub((s) => s.joinInput);
  const live = useHub((s) => s.live);
  const devices = useHub((s) => s.devices);
  const error = useHub((s) => s.error);
  const linkingUntil = useHub((s) => s.linkingUntil);
  const lastSync = useHub((s) => s.lastSync);
  const [now, setNow] = useState(() => Date.now());
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  useEffect(() => {
    if (mode !== "link") return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [mode]);

  const left = Math.max(0, Math.ceil((linkingUntil - now) / 1000));

  return (
    <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" data-hub-deck="1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-sage" strokeWidth={1.75} />
          <p className="text-xs tracking-wide text-muted uppercase">One HUB</p>
        </div>
        <p className="font-mono text-xs text-sage tabular-nums" data-hub-live={live}>
          {live} live
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{HUB_TAG}</p>
      <div className="mt-3 flex items-center gap-1" role="group" aria-label="HUB pair">
        <Button
          variant={mode === "link" ? "selected" : "ghost"}
          aria-pressed={mode === "link"}
          aria-label="Link this HUB to another device"
          onClick={() => {
            if (!assertHubAllowed()) {
              useHub.setState({ error: "Internal Affairs holds the HUB." });
              return;
            }
            startLink();
          }}
          className="flex-1"
        >
          <Link2 className="size-4" strokeWidth={1.75} />
          Link
        </Button>
        <Button
          variant={mode === "join" ? "selected" : "ghost"}
          aria-pressed={mode === "join"}
          aria-label="Join a HUB from another device"
          onClick={() => {
            if (!assertHubAllowed()) {
              useHub.setState({ error: "Internal Affairs holds the HUB." });
              return;
            }
            startJoin();
          }}
          className="flex-1"
        >
          <Radio className="size-4" strokeWidth={1.75} />
          Join
        </Button>
      </div>
      {mode === "link" ? (
        <div className="mt-3 text-center">
          <p className="text-xs tracking-wide text-muted uppercase">Pair code</p>
          <p
            className="font-display mt-1 text-3xl tracking-[0.2em] text-foreground tabular-nums"
            aria-live="polite"
            data-hub-pin={pin}
          >
            {formatPin(pin)}
          </p>
          <p className="mt-1 font-mono text-xs text-subtle tabular-nums">{left}s open</p>
        </div>
      ) : null}
      {mode === "join" ? (
        <div className="mt-3">
          <p className="text-center font-display text-3xl tracking-[0.2em] text-foreground tabular-nums">
            {formatPin(joinInput)}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1" role="group" aria-label="Pair digits">
            {digits.map((d) => (
              <Button key={d} variant="ghost" aria-label={`Digit ${d}`} onClick={() => tapDigit(d)}>
                {d}
              </Button>
            ))}
            <Button variant="ghost" aria-label="Clear last digit" onClick={() => backspaceJoin()}>
              <Delete className="size-4" strokeWidth={1.75} />
            </Button>
            <Button variant="ghost" aria-label="Digit 0" onClick={() => tapDigit("0")}>
              0
            </Button>
            <span />
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-ember">{error}</p> : null}
      <ul className="mt-3 space-y-1">
        {(devices.length ? devices : [{ id: "self", name: "This device", live: true, rttMs: 0 }]).map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-2 font-mono text-xs text-foreground">
            <span>{d.name}</span>
            <span className="text-sage">{d.live ? "live" : "idle"}</span>
          </li>
        ))}
      </ul>
      {lastSync ? (
        <p className="mt-2 font-mono text-xs text-subtle tabular-nums">Synced {new Date(lastSync).toLocaleTimeString()}</p>
      ) : error ? null : (
        <p className="mt-2 text-xs text-subtle">Waiting for the first seize on this HUB.</p>
      )}
    </div>
  );
}

function WireStrip() {
  const hub = useHub((s) => s.live);
  const native = useNativeProbe();
  const osN = useProgress((s) => learnedCount(s.learned));
  const held = useAffairs((s) => s.held);
  const findings = useAffairs((s) => s.findings);
  const holds = (Object.keys(held) as Array<keyof typeof held>).filter((k) => held[k]).length;
  const ia = holds ? "hold" : findings.length ? "clear" : "armed";
  const repair = useRepairLive((s) => s.open);
  const repairSnap = useRepairLive((s) => s.snap);
  const pressure = useSnapPressure();
  const phys = physicsProfile(useFieldQuality());
  return (
    <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" data-wire="1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-sage" strokeWidth={1.75} />
          <p className="text-xs tracking-wide text-muted uppercase">Wire</p>
        </div>
        <p className={cn("font-mono text-xs tabular-nums", pressure.lock ? "text-ember" : "text-sage")}>
          {pressure.lock ? "NOW" : pressure.severity === "pulse" ? "SNAP" : "live"}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{WIRE_TAG}</p>
      <ul className="mt-3 space-y-1 font-mono text-xs text-foreground tabular-nums">
        <li className="flex justify-between gap-2">
          <span>HUB</span>
          <span className="text-sage">{hub} live</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Native</span>
          <span className="text-sage">{native.score}/26</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Rapier</span>
          <span className="text-sage" data-physics-band={phys.band}>
            {physicsLine(phys).replace("Rapier ", "")}
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>4K</span>
          <span className={phys.band === "uhd" ? "text-sage" : "text-muted"} data-uhd-wire={phys.band === "uhd" ? "1" : "0"}>
            {phys.band === "uhd" ? "3840×2160" : "native"}
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>OS</span>
          <span className="text-sage">{osN}/6</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Mesh</span>
          <span className={pressure.lock ? "text-ember" : "text-sage"}>
            {pressure.lock ? "NOW" : pressure.severity === "pulse" ? "SNAP" : "pulse"}
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Repair</span>
          <span className={repairSnap ? "text-ember" : "text-sage"}>
            {repairSnap ? "NOW" : repair ? `${repair} open` : "clear"}
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>IA</span>
          <span className={ia === "hold" ? "text-ember" : "text-sage"}>{ia}</span>
        </li>
      </ul>
    </div>
  );
}

function NativeStack() {
  const probe = useNativeProbe();
  const [open, setOpen] = useState<string | null>(null);
  const selected = probe.letters.find((row) => row.letter === open) ?? null;
  return (
    <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" data-native-az={probe.score}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-sage" strokeWidth={1.75} />
          <p className="text-xs tracking-wide text-muted uppercase">Native stack A–Z</p>
        </div>
        <p className="font-mono text-xs text-sage tabular-nums">
          {probe.score}/26 · {probe.ice === "host" ? "host ICE" : probe.ice === "stun" ? "stun" : "blocked"}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{NATIVE_TAG}</p>
      <div className="mt-3 grid grid-cols-5 gap-1" role="group" aria-label="Native stack A to Z">
        {probe.letters.map((row) => (
          <Button
            key={row.letter}
            variant={open === row.letter ? "selected" : row.live ? "solid" : "ghost"}
            aria-label={`${row.letter} ${row.name}. ${row.line}`}
            aria-pressed={open === row.letter}
            onClick={() => setOpen((cur) => (cur === row.letter ? null : row.letter))}
            className="font-mono"
          >
            {row.letter}
          </Button>
        ))}
      </div>
      {selected ? (
        <p className="mt-3 text-xs leading-relaxed text-foreground">
          <span className="font-mono text-sage">{selected.letter}</span>
          <span className="ml-2 font-medium">{selected.name}</span>
          <span className="mt-1 block text-muted">{selected.line}</span>
        </p>
      ) : (
        <p className="mt-3 text-xs text-subtle">Tap a letter. Every one is native web — no outside identity.</p>
      )}
      {probe.coi.length ? (
        <p className="mt-2 text-xs text-ember">Ignored on this device: {probe.coi.join(" · ")}</p>
      ) : null}
    </div>
  );
}

function VaultPanel({ onClose }: { onClose: () => void }) {
  const pubkey = useIdentity((s) => s.pubkey);
  const short = useIdentity((s) => s.short);
  const curve = useIdentity((s) => s.curve);
  const xp = useProgress((s) => s.xp);
  const healed = useProgress((s) => s.healed);
  const cleared = useProgress((s) => s.cleared);
  const watches = useProgress((s) => s.watches);
  const rank = rankFor(xp);
  const nxt = nextRank(xp);
  const [copied, setCopied] = useState(false);
  const xpMax = nxt ? nxt.xp : rank.xp;
  const xpMin = rank.xp;
  const xpSpan = Math.max(1, xpMax - xpMin);
  const { user, isPending } = useCurrentUserState();
  const lens = usePill((s) => s.lens);

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
          {isPending ? (
            <div className="mt-2 h-11 w-28 rounded-md bg-foreground/12" aria-hidden />
          ) : user ? (
            <p className="mt-2 truncate text-sm text-foreground">{user.displayName ?? "Signed in with X"}</p>
          ) : (
            <p className="mt-2 text-sm text-muted">Guest · Viewer key only</p>
          )}
          {authEnabled && user ? (
            <Button
              variant="ghost"
              className="mt-2"
              aria-label="Sign out of X"
              onClick={() => void signOut().catch(() => undefined)}
            >
              Sign out of X
            </Button>
          ) : null}
        </div>
        <Button variant="ghost" size="icon" aria-label="Close vault" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{IDENTITY_TAG}</p>
      {lens ? <p className="mt-2 text-xs leading-relaxed text-sage">{PILL_TAG[lens]}</p> : null}
      <DigitalLife />
      <HubDeck />
      <WireStrip />
      <NativeStack />
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
          Sovereign {curve === "ed25519" ? "Ed25519" : curve === "hash" ? "hash" : "Viewer"} key
        </p>
        <p className="mt-1 break-all font-mono text-xs text-foreground">{pubkey || short}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Minted on this device, shared only by a tap-code you control. Native stack A–Z — phone, tablet, or desktop
          over Wi-Fi. No extension, no app store, no outside wallet, no Google identity.
        </p>
        <Button variant="solid" className="mt-3" onClick={() => void copyKey()} disabled={!pubkey}>
          <Fingerprint className="size-4" strokeWidth={1.75} />
          {copied ? "Copied" : "Copy public key"}
        </Button>
      </div>
      <InstallStrip />
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
  const lookMode = usePlayground((s) => s.lookMode);
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
  const heldSynapse = useAffairs((s) => s.held.synapse);
  const heldOrbit = useAffairs((s) => s.held.orbit);
  const heldAffairs = useAffairs((s) => s.held.affairs);
  const freezeNeural = heldSynapse || heldAffairs;
  const freezeOrbit = heldOrbit || heldAffairs;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">{NETWORK_SHORT}</p>
          <h1 className="deck-title font-display mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {DECK_NAME}
          </h1>
          <p className="mt-1 text-xs font-medium tracking-[0.18em] text-sage uppercase">{MOTTO}</p>
          <PillChip />
          <p className="deck-tag mt-1 hidden max-w-sm text-xs leading-relaxed text-muted sm:block">
            {orbit ? THEATER_ORBIT_TAG : NETWORK_TAG}
          </p>
          <p className="mt-1 truncate text-xs text-subtle sm:hidden">{last}</p>
          <div className="pointer-events-auto mt-2 flex w-fit items-center gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-border)]">
            <Button
              variant={theater === "neural" ? "selected" : "ghost"}
              aria-label="Enter Neural Link"
              aria-pressed={theater === "neural"}
              disabled={freezeNeural && theater !== "neural"}
              onClick={() => setTheater("neural")}
            >
              <BrainCircuit className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{THEATER_NEURAL}</span>
            </Button>
            <Button
              variant={theater === "orbit" ? "selected" : "ghost"}
              aria-label="Enter God's Eye theater"
              aria-pressed={theater === "orbit"}
              disabled={freezeOrbit && theater !== "orbit"}
              onClick={() => setTheater("orbit")}
            >
              <Globe className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{THEATER_ORBIT}</span>
            </Button>
          </div>
          <LiveLeadBar onOpen={() => setPanel(panel === "board" ? null : "board")} />
          <p className="deck-hint mt-2 hidden font-mono text-sm text-foreground tabular-nums sm:block">
            {count} {orbit ? "on the mesh" : "in the CSF"}
            <span className="ml-2 font-sans text-xs text-muted">
              {lookMode
                ? "Look on. Drag to orbit. Toggle Look off, then tap a strain to seize."
                : orbit
                  ? "Tap a byproduct to seize it. Toggle a type, tap Drop — or tap the field."
                  : "Tap a virion to seize it. Toggle a type, tap Drop — or tap the field."}
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
              variant={panel === "board" ? "selected" : "ghost"}
              aria-label="Open mesh board"
              aria-pressed={panel === "board"}
              onClick={() => setPanel(panel === "board" ? null : "board")}
            >
              <ListOrdered className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Board</span>
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
            <InstallChip />
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
          <PulseStrip />
          <HubChip onOpen={() => setPanel(panel === "vault" ? null : "vault")} />
          <RepairChip
            active={panel === "repair"}
            onOpen={() => setPanel(panel === "repair" ? null : "repair")}
          />
          <AffairsChip
            active={panel === "affairs"}
            onOpen={() => setPanel(panel === "affairs" ? null : "affairs")}
          />
          <SpecialistChip
            active={panel === "specialist"}
            onOpen={() => setPanel(panel === "specialist" ? null : "specialist")}
          />
        </div>
      </div>
    </header>
  );
}

function PulseStrip() {
  const clock = usePulseClock();
  const pressure = useSnapPressure();
  const score = usePulse((s) => s.score);
  const ghost = usePulse((s) => s.ghost);
  const missed = usePulse((s) => s.missed);
  const snap = clock.phase === "snap";
  const now = pressure.lock;
  const secs = Math.max(0, Math.ceil(clock.left / 1000));
  const snapIn = Math.max(0, Math.ceil(clock.snapIn / 1000));
  const hotIn = Math.max(0, Math.ceil(pressure.hotIn / 1000));
  const pubkey = useIdentity((s) => s.pubkey);
  const scope = useLiveLead((s) => s.scope);
  const region = useLiveLead((s) => s.region);
  const live = useLiveLead((s) => rowsFor(s));
  const mine = live.find((r) => r.pubkey === pubkey) ?? null;
  const lead = live[0];
  const youLead = Boolean(mine && mine.place === 1);
  const place = youLead ? "you #1" : mine ? `you #${mine.place}` : live.length ? "unposted" : "empty";
  const label = regionLabel(scope, region);
  const viewing = viewingLens({ lens: usePill((s) => s.lens), glimpse: usePill((s) => s.glimpse) });
  const voice = lineFor(now ? "now" : snap ? "snap" : missed ? "wait" : "pulse", viewing);
  const line = now
    ? `NOW ${secs}s`
    : snap
      ? `SNAP ${secs}s`
      : missed
        ? `wait · SNAP ${snapIn}s`
        : `Pulse ${secs}s`;
  return (
    <p
      className={cn(
        "max-w-[11rem] px-1 text-right font-mono text-xs tabular-nums",
        now ? "text-ember" : snap ? "text-ember" : missed ? "text-ember" : "text-muted",
      )}
      aria-label={`${voice} ${place}.`}
      data-phase={clock.phase}
      data-severity={pressure.severity}
      data-wait={missed && !snap ? "1" : "0"}
      data-place={mine?.place ?? 0}
    >
      {line}
      <span className="ml-1">
        {place}
        {score ? ` · ${score}` : ghost ? ` · beat ${ghost}` : ""}
      </span>
      <span className="mt-0.5 block truncate text-xs text-subtle">
        {scope === "globe" ? "Globe" : label}
        {now && pressure.reason === "race" ? " · race" : lead && !youLead ? ` · lead ${lead.pulseScore}` : youLead ? " · lead" : ""}
        {snap && !now && hotIn ? ` · lock ${hotIn}s` : ""}
      </span>
    </p>
  );
}

function HubChip({ onOpen }: { onOpen: () => void }) {
  const mode = useHub((s) => s.mode);
  const pin = useHub((s) => s.pin);
  const live = useHub((s) => s.live);
  const probe = useNativeProbe();
  const linking = mode === "link" && pin.length === 6;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="min-h-11 w-full rounded-lg px-1 py-1 text-right"
      aria-label={
        linking
          ? `HUB pair code ${formatPin(pin)}. Native stack ${probe.score} of 26.`
          : `HUB ${live} live. Native stack ${probe.score} of 26. Open vault to link devices.`
      }
      data-hub-chip={live}
      data-native-score={probe.score}
    >
      <p className="font-mono text-xs text-sage tabular-nums">
        {linking ? `HUB ${formatPin(pin)}` : `HUB · ${live} live`}
      </p>
      <p className="font-mono text-xs text-subtle tabular-nums">
        {probe.score === 26 ? "A–Z native" : `native ${probe.score}/26`}
      </p>
    </button>
  );
}

function RepairChip({ onOpen, active }: { onOpen: () => void; active: boolean }) {
  const open = useRepairLive((s) => s.open);
  const snap = useRepairLive((s) => s.snap);
  const seized = useRepairLive((s) => s.seized);
  const missed = useRepairLive((s) => s.missed);
  const last = useRepairLive((s) => s.last);
  const label = seized && last
    ? `Repair seized #${last.number}`
    : snap
      ? `Repair NOW${last ? ` #${last.number}` : ""}`
      : missed
        ? "Repair wait"
        : open
          ? `Repair · ${open} open`
          : "Repair · clear";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="min-h-11 w-full rounded-lg px-1 py-1 text-right"
      aria-label={`${label}. Open Sentinel Repair.`}
      aria-pressed={active}
      data-repair-chip="1"
      data-repair-open={open}
      data-repair-snap={snap ? "1" : "0"}
      data-repair-seized={seized ? "1" : "0"}
    >
      <p className={cn("font-mono text-xs tabular-nums", snap || missed ? "text-ember" : "text-sage")}>
        {active && !snap && !seized && !missed ? "Repair · open" : label}
      </p>
    </button>
  );
}

function InstallChip() {
  const { install, standalone, canPrompt } = useInstall();
  if (standalone) return null;
  return (
    <Button
      variant="ghost"
      aria-label={canPrompt ? "Install Command Deck on this device" : "Add Command Deck to this device"}
      onClick={() => void install()}
    >
      <Download className="size-4" strokeWidth={1.75} />
      <span className="hidden lg:inline">{canPrompt ? "Install" : "Add"}</span>
    </Button>
  );
}

function LiveLeadBar({ onOpen }: { onOpen: () => void }) {
  const clock = usePulseClock();
  const pressure = useSnapPressure();
  const snap = clock.phase === "snap";
  const now = pressure.lock;
  const missed = usePulse((s) => s.missed);
  const score = usePulse((s) => s.score);
  const secs = Math.max(0, Math.ceil(clock.left / 1000));
  const snapIn = Math.max(0, Math.ceil(clock.snapIn / 1000));
  const hotIn = Math.max(0, Math.ceil(pressure.hotIn / 1000));
  const scope = useLiveLead((s) => s.scope);
  const setScope = useLiveLead((s) => s.setScope);
  const region = useLiveLead((s) => s.region);
  const live = useLiveLead((s) => rowsFor(s));
  const pubkey = useIdentity((s) => s.pubkey);
  const mine = live.find((r) => r.pubkey === pubkey) ?? null;
  const preview = live.slice(0, 3);

  return (
    <div
      className={cn(
        "pointer-events-auto mt-2 w-fit max-w-[min(18rem,calc(100vw-7.5rem))] rounded-xl bg-card p-1 shadow-[var(--shadow-border)]",
        now ? "pulse-snap-hot" : snap ? "pulse-snap" : missed && "pulse-wait",
      )}
      data-phase={clock.phase}
      data-severity={pressure.severity}
    >
      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Live board scope">
        {(["local", "national", "globe"] as const).map((s) => (
          <Button
            key={s}
            variant={scope === s ? "selected" : "ghost"}
            aria-pressed={scope === s}
            aria-label={`${s} live board`}
            onClick={() => setScope(s)}
          >
            {s === "globe" ? "Globe" : s === "national" ? "Nation" : "Local"}
          </Button>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-1 block min-h-11 w-full rounded-lg px-2 py-1 text-left"
        aria-label="Open live mesh board"
      >
        <p className={cn("font-mono text-xs tabular-nums", now || snap || missed ? "text-ember" : "text-foreground")}>
          {now
            ? `NOW ${secs}s — seize or wait`
            : snap
              ? `SNAP ${secs}s · lock ${hotIn}s`
              : missed
                ? `You wait · next SNAP ${snapIn}s`
                : `SNAP in ${snapIn}s · ${regionLabel(scope, region)}`}
          {score ? ` · ${score}` : ""}
        </p>
        {preview.length === 0 ? (
          <p className="mt-0.5 text-xs text-muted">Empty {scope} pulse. Seize to take the lead.</p>
        ) : (
          <ol className="mt-0.5 space-y-0.5">
            {preview.slice(0, 2).map((row) => (
              <li key={row.pubkey} className="font-mono text-xs text-subtle tabular-nums">
                {row.place} {row.pubkey === pubkey ? "you" : row.short} · {row.pulseScore}
              </li>
            ))}
            {mine && mine.place > 2 ? (
              <li className="font-mono text-xs text-sage tabular-nums">
                {mine.place} you · {mine.pulseScore}
              </li>
            ) : null}
          </ol>
        )}
      </button>
    </div>
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

function FieldGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(hasWebGL());
  }, []);
  if (!ok) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-6">
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted">
          This field needs WebGL, which this browser does not expose. Open Command Deck in a current browser on this
          device.
        </p>
      </div>
    );
  }
  return children;
}

export function Playground() {
  const spawn = usePlayground((s) => s.spawn);
  const seizeNow = usePlayground((s) => s.seizeNow);
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
  const phase = usePulse((s) => s.lastPhase);
  const pressure = useSnapPressure();
  const native = useNativeProbe();
  const iaHolds = useAffairs((s) => (Object.keys(s.held) as Array<keyof typeof s.held>).filter((k) => s.held[k]).length);
  const missed = usePulse((s) => s.missed);
  const wait = missed && phase !== "snap" && pressure.severity !== "snap";
  useLivePulseFeed();
  useClaimSocial();
  useHydratePill();
  useEffect(() => {
    useSpecialist.getState().hydrate();
  }, []);
  const pill = usePill((s) => s.lens);
  const glimpse = usePill((s) => s.glimpse);
  const viewing = viewingLens({ lens: pill, glimpse });
  const phys = physicsProfile(useFieldQuality());

  useEffect(() => {
    bindPlaygroundTest();
    usePlayground.getState().hydrate();
    useProgress.getState().hydrate();
    usePulse.getState().hydrate();
    void useIdentity.getState().init().then(() => {
      startHub();
      startWire();
      useAffairs.getState().hydrate();
      useAffairs.getState().audit();
      bindPlaygroundTest();
    });
    const api = (window as Window & { __playground?: Record<string, unknown> }).__playground;
    if (api) {
      api.listBoard = listBoard;
      api.openRepair = () => setPanel("repair");
      api.openAffairs = () => setPanel("affairs");
      api.openSpecialist = () => setPanel("specialist");
      api.briefSpecialist = (job?: "strain" | "snap" | "affairs" | "now") => useSpecialist.getState().brief(job);
      api.takeLife = (pin: string) => import("@/lib/life").then((m) => m.takeLife(pin));
      api.wrapLife = (pin: string) => import("@/lib/life").then((m) => m.wrapLife(pin));
      api.carryLife = (pin: string, raw: unknown) => import("@/lib/life").then((m) => m.carryLife(pin, raw));
      api.destroyLife = () => import("@/lib/life").then((m) => m.destroyThisCopy());
      api.openFriends = () => setPanel("friends");
      api.choosePill = (pill: "red" | "blue") => usePill.getState().choose(pill);
      api.peekPill = () => usePill.getState().peek();
      api.pill = () => viewingLens(usePill.getState());
      api.postStanding = () => {
        if (!assertMeshAllowed()) throw new Error("Internal Affairs holds the Mesh Board.");
        const id = useIdentity.getState();
        const p = useProgress.getState();
        return postStanding({
          data: {
            pubkey: id.pubkey,
            xp: p.xp,
            seizes: p.seizes,
            healed: p.healed,
            cleared: p.cleared,
            watches: p.watches,
            learned: learnedCount(p.learned),
          },
        });
      };
    }
  }, []);

  useEffect(() => {
    return useRepairLive.subscribe((s) => {
      if (!s.wantPanel) return;
      setPanel("repair");
      useRepairLive.setState({ wantPanel: false });
    });
  }, []);

  useEffect(() => {
    return usePulse.subscribe((s, prev) => {
      if (s.lastSeverity === "pulse" && prev.lastSeverity === "watch") {
        usePlayground.getState().pushBrief("SNAP window. Score now — the lock is the last four seconds, or a close race.");
      }
      if (s.lastSeverity === "snap" && prev.lastSeverity !== "snap") {
        usePlayground.getState().pushBrief("NOW. This lock is the upgrade. Miss it and you wait.");
      }
      if (s.missed && !prev.missed) {
        usePlayground.getState().pushBrief("Lock missed. You wait for the next upgrade.");
      }
      if (s.upgraded && !prev.upgraded) {
        usePlayground.getState().pushBrief("Pulse upgrade locked. Leadership holds until the next SNAP.");
      }
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.repeat) return;
      if (e.code === "Digit1") {
        setSelected("sphere");
      } else if (e.code === "Digit2") {
        setSelected("box");
      } else if (e.code === "Digit3") {
        setSelected("cylinder");
      } else if (e.code === "Space") {
        e.preventDefault();
        if (pressure.lock) seizeNow();
        else spawn();
      } else if (e.code === "KeyC") {
        clear();
      } else if (e.code === "KeyR") {
        seed();
      } else if (e.code === "KeyP") {
        scatter();
      } else if (e.code === "KeyL") {
        usePlayground.getState().toggleLook();
      } else if (e.code === "KeyW") {
        claimWatch();
      } else if (e.code === "KeyG") {
        setTheater(usePlayground.getState().theater === "orbit" ? "neural" : "orbit");
      } else if (e.code === "KeyN") {
        setTheater("neural");
      } else if (e.code === "KeyV") {
        setPanel((p) => (p === "vault" ? null : "vault"));
      } else if (e.code === "KeyM") {
        setPanel((p) => (p === "board" ? null : "board"));
      } else if (e.code === "KeyB") {
        setPanel((p) => (p === "briefing" ? null : "briefing"));
      } else if (e.code === "KeyF") {
        setPanel((p) => (p === "repair" ? null : "repair"));
      } else if (e.code === "KeyI") {
        setPanel((p) => (p === "affairs" ? null : "affairs"));
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
  }, [claimWatch, clear, dismissLegend, scatter, seed, setSelected, setTheater, spawn, seizeNow, pressure.lock]);

  if (!pill) {
    return (
      <main className="relative h-dvh w-full overflow-hidden bg-background text-foreground" data-gateway="1">
        <PillGate />
      </main>
    );
  }

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-background text-foreground select-none"
      data-rank={rank.level}
      data-heal={healTier(healed)}
      data-sight={sightTier(cleared, rank.level)}
      data-discovered={discovered ? "1" : "0"}
      data-outcome={outcome ?? ""}
      data-os={osName.toLowerCase()}
      data-os-count={learnedCount(learned)}
      data-phase={phase}
      data-severity={pressure.severity}
      data-hub="1"
      data-repair="1"
      data-native={native.score}
      data-affairs="1"
      data-specialist="1"
      data-wire="1"
      data-ia-holds={String(iaHolds)}
      data-social="1"
      data-auth="1"
      data-pill={viewing ?? ""}
      data-glimpse={glimpse ? "1" : "0"}
      data-wait={wait ? "1" : "0"}
      data-physics={phys.band}
      data-physics-solver={phys.solver}
      data-uhd={phys.band === "uhd" ? "1" : "0"}
    >
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full w-full bg-background" aria-hidden />}>
          <FieldGate>
            <PlaygroundCanvas />
          </FieldGate>
        </Suspense>
      </div>
      <Visor />
      <Header panel={panel} setPanel={setPanel} />
      {panel === "vault" ? <VaultPanel onClose={() => setPanel(null)} /> : null}
      {panel === "briefing" ? <BriefingPanel onClose={() => setPanel(null)} /> : null}
      {panel === "board" ? <BoardDashboard onClose={() => setPanel(null)} /> : null}
      {panel === "repair" ? <RepairPanel onClose={() => setPanel(null)} /> : null}
      {panel === "affairs" ? <AffairsPanel onClose={() => setPanel(null)} /> : null}
      {panel === "specialist" ? <SpecialistPanel onClose={() => setPanel(null)} /> : null}
      {panel === "friends" ? (
        <FriendsPanel
          onClose={() => setPanel(null)}
          onPair={() => setPanel("vault")}
          onBoard={() => setPanel("board")}
          onShop={() => setPanel("shop")}
        />
      ) : null}
      {panel === "shop" ? <ShopPanel onClose={() => setPanel(null)} /> : null}
      {panel === null ? <GuestGate onPlay={() => undefined} /> : null}
      <Toolbar />
      <SocialDock
        panel={panel}
        onFriends={() => setPanel(panel === "friends" ? null : "friends")}
        onBoard={() => setPanel(panel === "board" ? null : "board")}
        onYou={() => setPanel(panel === "vault" ? null : "vault")}
      />
      <PhysicsLegend />
      <p className={cn("sr-only")}>
        Command Deck for The Remote Viewer Network. In God We Trust. Choose red or blue lens before sign-in. Same facts, two deliveries. Glimpse the other side. Two games only: Neural Link and God's Eye. Neural Link: remote neuron in cerebrospinal fluid against HSV, West
        Nile, and rabies. God's Eye: orbital mesh that reads human byproducts — emission, runoff, worm — never bodies.
        Seize each strain three times so Sentinel OS learns the signature and auto-defends in both theaters. Play by
        toggle and tap: select a type, tap Drop or the field, tap a strain to seize. SNAP window scores. Last four
        seconds or a close race is NOW — tap NOW or the strain, or wait. Miss the lock and Drop becomes WAIT until the
        next SNAP. Repair SNAP: tap Seize fix in the lock or wait. Live local, national, and globe boards. One Remote Viewer HUB syncs rank and Sentinel OS to
        every paired device instantly. Native stack A–Z: WebCrypto, WebRTC host ICE, WebGL, PWA — no Google identity, no
        wallet. Sentinel Repair diagnoses by tap. GitHub automations open draft fix PRs. Command Deck never merges.
        One-tap install from Defense Front, X, and GitHub. Internal Affairs watches the watchers. All agents report on one
        wire. On-device specialist names strains, briefs SNAP, and reports Affairs. Pair a local node for your own weights. Zero vendor keys.
        Each Viewer owns their digital life. Take a PIN wrap. Carry it. Destroy a copy. X is a name, not the key.
      </p>
    </main>
  );
}
