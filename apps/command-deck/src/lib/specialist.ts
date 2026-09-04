import { create } from "zustand";
import { isLearned, LEARN_NEED, learnedCount, osTitle, SIGNATURES, useProgress } from "@/lib/progress";
import { usePulse, readPulse, readSeverity } from "@/lib/pulse";
import { isTopicHeld, useAffairs, type AffairTopic } from "@/lib/affairs";
import { speakFact, usePill, viewingLens, currentFact, type Pill } from "@/lib/pill";
import { KIND_LABEL, usePlayground } from "@/components/playground/store";
import { SPECIALIST_TAG } from "@/lib/trv";

export { SPECIALIST_TAG };

export type SpecialistJob = "strain" | "snap" | "affairs" | "now";
export type SpecialistSource = "device" | "node";

const STORAGE = "trv.specialist";
const NODE_DEFAULT = "http://127.0.0.1:11434";
const VENDOR_AI =
  /openai|anthropic|googleapis|generativelanguage|groq\.com|together\.xyz|openrouter|api\.x\.ai|cohere|mistral\.ai|huggingface\.co\/(api|inference)|azure\.com|aws\.amazon/i;

export function hasWebGPU() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export function isLoopbackNode(raw: string) {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "::1";
  } catch {
    return false;
  }
}

export function isVendorAi(raw: string) {
  return VENDOR_AI.test(raw);
}

type Persisted = { source: SpecialistSource; node: string };

function readStored(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE);
    if (!raw) return { source: "device", node: NODE_DEFAULT };
    const v = JSON.parse(raw) as Persisted;
    return {
      source: v.source === "node" ? "node" : "device",
      node: typeof v.node === "string" && v.node.length ? v.node : NODE_DEFAULT,
    };
  } catch {
    return { source: "device", node: NODE_DEFAULT };
  }
}

export type SpecialistBrief = {
  job: SpecialistJob;
  source: SpecialistSource;
  text: string;
  at: number;
};

type SpecialistState = {
  ready: boolean;
  source: SpecialistSource;
  node: string;
  gpu: boolean;
  busy: boolean;
  error: string | null;
  last: SpecialistBrief | null;
  hydrate: () => void;
  setSource: (s: SpecialistSource) => void;
  setNode: (url: string) => void;
  brief: (job?: SpecialistJob) => Promise<SpecialistBrief | null>;
};

function persist(s: Pick<SpecialistState, "source" | "node">) {
  try {
    window.localStorage.setItem(STORAGE, JSON.stringify({ source: s.source, node: s.node }));
  } catch {
    /* storage blocked */
  }
}

function factsPacket(lens: Pill | null) {
  const p = useProgress.getState();
  const play = usePlayground.getState();
  const pulse = usePulse.getState();
  const clock = readPulse();
  const pressure = readSeverity(clock, null, pulse.repairForced);
  const affairs = useAffairs.getState();
  const held = (Object.keys(affairs.held) as AffairTopic[]).filter((k) => affairs.held[k]);
  const theater = play.theater;
  const selected = play.selected;
  const sig = SIGNATURES.find((s) => s.theater === theater && s.kind === selected);
  const samples = sig ? p.learned[sig.key] ?? 0 : 0;
  const labels = KIND_LABEL[theater];
  return {
    lens: lens ?? "red",
    theater,
    selected: labels[selected],
    signature: sig?.label ?? labels[selected],
    samples,
    need: LEARN_NEED,
    learned: learnedCount(p.learned),
    os: osTitle(p.learned),
    autonomous: SIGNATURES.every((s) => isLearned(p.learned, s.key)),
    phase: clock.phase,
    lock: pressure.lock,
    missed: pulse.missed,
    hotIn: Math.max(0, Math.ceil(pressure.hotIn / 1000)),
    left: Math.max(0, Math.ceil(clock.left / 1000)),
    held,
    gpu: hasWebGPU(),
  };
}

function deviceSpeak(job: SpecialistJob, lens: Pill | null): string {
  const f = factsPacket(lens);
  const voice = lens === "blue" ? "blue" : "red";
  if (job === "affairs" || (job === "now" && f.held.length)) {
    if (!f.held.length) {
      return voice === "red"
        ? "Affairs clear. Wire native. Specialist on-device."
        : "Internal Affairs is clear. The specialist is on this device. No vendor path.";
    }
    return voice === "red"
      ? `HOLD ${f.held.join(", ")}. Frozen. Audit lifts a watcher miss. No vendor keys.`
      : `Internal Affairs holds ${f.held.join(", ")}. The deck is frozen on those topics until Audit. The specialist will not call a company.`;
  }
  if (job === "snap" || (job === "now" && (f.lock || f.missed || f.phase === "snap"))) {
    if (f.lock) {
      return voice === "red"
        ? `NOW ${f.left}s. Seize or wait. This lock is the upgrade.`
        : `The SNAP lock is live — ${f.left} seconds. Take the lead now, or wait for the next pulse.`;
    }
    if (f.missed) {
      return voice === "red"
        ? "WAIT. You missed the lock. Next SNAP is the upgrade."
        : "You missed this lock. The next SNAP is your next chance. Drop still stocks the field.";
    }
    if (f.phase === "snap") {
      return voice === "red"
        ? `SNAP ${f.left}s. Lock in ${f.hotIn}s. Score the window.`
        : `SNAP is open for ${f.left} seconds. The lock lands in ${f.hotIn}. Score while it lasts.`;
    }
    return voice === "red"
      ? `Pulse ${f.left}s. Stock the field. SNAP is the lock.`
      : `A pulse is running (${f.left}s). Drop still stocks the field. SNAP is when the lock appears.`;
  }
  const remain = Math.max(0, f.need - f.samples);
  if (f.autonomous) {
    return voice === "red"
      ? `OS ${f.os}. 6/6. Autonomous. ${f.signature} is named. Strike learned only.`
      : `Sentinel OS is ${f.os}. All six signatures are named. It strikes only what it learned — including ${f.signature}.`;
  }
  if (remain === 0) {
    return voice === "red"
      ? `${f.signature} named. ${f.learned}/6. OS ${f.os}. Strike is live on this signature.`
      : `${f.signature} is named. Sentinel OS (${f.os}) can strike it. ${f.learned} of 6 signatures learned.`;
  }
  return voice === "red"
    ? `${f.signature}. ${f.samples}/${f.need} contacts. ${remain} more to name. ${f.learned}/6.`
    : `${f.signature} is in the field. ${f.samples} of ${f.need} seizes lock the name. ${remain} more and Sentinel OS can strike it.`;
}

async function nodeSpeak(url: string, job: SpecialistJob, lens: Pill | null): Promise<string> {
  if (isVendorAi(url) || !isLoopbackNode(url)) {
    throw new Error("Internal Affairs holds the specialist. Loopback node only. No vendor keys.");
  }
  const f = factsPacket(lens);
  const fact = currentFact(usePill.getState().factId);
  const prompt = [
    "You are the Sentinel OS specialist on The Remote Viewer Command Deck.",
    "In God We Trust. Facts only. No vendor services. No wallets.",
    `Lens: ${f.lens}. Job: ${job}.`,
    `Fact: ${fact.fact}`,
    `Named: ${speakFact(fact, f.lens)}`,
    JSON.stringify(f),
    "Reply in one or two short sentences. Same facts as the packet. Do not invent.",
  ].join("\n");
  const base = url.replace(/\/$/, "");
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt, stream: false }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error("Local node wait. Host weights, or stay on-device.");
    const json = (await res.json()) as { response?: string; message?: { content?: string } };
    const text = (json.response ?? json.message?.content ?? "").trim();
    if (!text) throw new Error("Local node silent. Stay on-device.");
    return text.slice(0, 420);
  } finally {
    window.clearTimeout(t);
  }
}

function resolveJob(job: SpecialistJob): Exclude<SpecialistJob, "now"> {
  if (job !== "now") return job;
  const affairs = useAffairs.getState();
  const held = (Object.keys(affairs.held) as AffairTopic[]).some((k) => affairs.held[k]);
  if (held) return "affairs";
  const pulse = usePulse.getState();
  const clock = readPulse();
  if (clock.phase === "snap" || pulse.missed) return "snap";
  return "strain";
}

export const useSpecialist = create<SpecialistState>((set, get) => ({
  ready: false,
  source: "device",
  node: NODE_DEFAULT,
  gpu: false,
  busy: false,
  error: null,
  last: null,
  hydrate: () => {
    const stored = typeof window === "undefined" ? { source: "device" as const, node: NODE_DEFAULT } : readStored();
    set({ ready: true, gpu: hasWebGPU(), ...stored });
  },
  setSource: (source) => {
    if (source === "node" && isVendorAi(get().node)) {
      useAffairs.getState().hold("os");
      set({ error: "Vendor path rejected. Loopback only.", source: "device" });
      persist({ source: "device", node: get().node });
      return;
    }
    persist({ source, node: get().node });
    set({ source, error: null });
  },
  setNode: (node) => {
    persist({ source: get().source, node });
    set({ node });
  },
  brief: async (raw = "now") => {
    if (isTopicHeld("os") || isTopicHeld("native") || isTopicHeld("affairs")) {
      const text = "Internal Affairs holds the specialist. On-device or loopback only.";
      set({ error: text, busy: false });
      return null;
    }
    const job = resolveJob(raw);
    const lens = viewingLens(usePill.getState());
    set({ busy: true, error: null });
    try {
      let text: string;
      let source: SpecialistSource = "device";
      if (get().source === "node") {
        if (isVendorAi(get().node) || !isLoopbackNode(get().node)) {
          useAffairs.getState().hold("os");
          throw new Error("Internal Affairs holds the specialist. Loopback node only. No vendor keys.");
        }
        try {
          text = await nodeSpeak(get().node, job, lens);
          source = "node";
        } catch (err) {
          text = deviceSpeak(job, lens);
          source = "device";
          set({ error: err instanceof Error ? err.message : "Node wait. On-device spoke." });
        }
      } else {
        text = deviceSpeak(job, lens);
      }
      const last: SpecialistBrief = { job, source, text, at: Date.now() };
      set({ last, busy: false, source: get().source });
      usePlayground.getState().pushBrief(`Specialist (${source}): ${text}`);
      return last;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Specialist held.";
      set({ busy: false, error });
      return null;
    }
  },
}));
