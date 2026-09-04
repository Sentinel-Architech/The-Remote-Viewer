import { create } from "zustand";

export type Pill = "red" | "blue";

export type Fact = {
  id: string;
  fact: string;
  red: string;
  blue: string;
};

const STORAGE = "trv.pill";
export const GLIMPSE_MS = 8000;

export const FACTS: Fact[] = [
  {
    id: "hsv",
    fact: "HSV is in the cerebrospinal fluid. Three seizes lock the signature.",
    red: "HSV. CSF. Three contacts. Signature locks. OS strikes.",
    blue: "Herpes simplex is in the fluid. Seize it three times so Sentinel OS can name it and defend.",
  },
  {
    id: "snap",
    fact: "The SNAP lock is the last four seconds, or a close race. Seize then or wait.",
    red: "NOW. Four seconds. Seize or wait. The lock is the upgrade.",
    blue: "The window is four seconds. Take the lead now, or the next pulse is your next chance.",
  },
  {
    id: "orbit",
    fact: "God's Eye reads byproducts of human systems. Never bodies.",
    red: "Byproduct only. Emission. Runoff. Worm. No bodies.",
    blue: "God's Eye reads exhaust of systems — never a person.",
  },
  {
    id: "keys",
    fact: "The Viewer key is minted on this device. Sign-in with X is social, not the key.",
    red: "Ed25519 here. X is a name. The key never left the phone.",
    blue: "Your Viewer key stays on this device. X is how friends find you. PIN never left the phone.",
  },
];

export const PILL_TAG = {
  red: "Red lens. Raw wire. Same facts. No frame.",
  blue: "Blue lens. Briefing wire. Same facts. Guided.",
} as const;

type PillState = {
  ready: boolean;
  lens: Pill | null;
  glimpse: boolean;
  factId: string;
  hydrate: () => void;
  choose: (pill: Pill) => void;
  setFact: (id: string) => void;
  peek: () => void;
};

function readStored(): Pill | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE);
    return v === "red" || v === "blue" ? v : null;
  } catch {
    return null;
  }
}

export const usePill = create<PillState>((set) => ({
  ready: false,
  lens: null,
  glimpse: false,
  factId: FACTS[0]?.id ?? "hsv",
  hydrate: () => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("gate") === "1" || window.location.hash === "#gateway") {
        set({ ready: true, lens: null });
        return;
      }
    }
    set({ ready: true, lens: readStored() });
  },
  choose: (pill) => {
    try {
      window.localStorage.setItem(STORAGE, pill);
    } catch {
      /* storage blocked */
    }
    set({ lens: pill, glimpse: false, ready: true });
  },
  setFact: (id) => {
    if (!FACTS.some((f) => f.id === id)) return;
    set({ factId: id });
  },
  peek: () => {
    const t = window.setTimeout(() => {
      if (usePill.getState().glimpse) set({ glimpse: false });
    }, GLIMPSE_MS);
    void t;
    set({ glimpse: true });
  },
}));

export function viewingLens(state: Pick<PillState, "lens" | "glimpse">): Pill | null {
  if (!state.lens) return null;
  if (!state.glimpse) return state.lens;
  return state.lens === "red" ? "blue" : "red";
}

export function speakFact(fact: Fact, lens: Pill) {
  return lens === "red" ? fact.red : fact.blue;
}

export function currentFact(factId: string) {
  return FACTS.find((f) => f.id === factId) ?? FACTS[0]!;
}

export function lineFor(kind: "now" | "snap" | "wait" | "pulse", lens: Pill | null) {
  if (lens === "red") {
    if (kind === "now") return "NOW. Seize or wait.";
    if (kind === "snap") return "SNAP. Score the lock.";
    if (kind === "wait") return "WAIT. Next SNAP.";
    return "Pulse. Stock the field.";
  }
  if (lens === "blue") {
    if (kind === "now") return "This lock is the upgrade. Take it now, or wait.";
    if (kind === "snap") return "The SNAP window is open. Score while it lasts.";
    if (kind === "wait") return "You missed the lock. The next SNAP is your next chance.";
    return "A pulse is running. Drop still stocks the field.";
  }
  if (kind === "now") return "NOW. Seize or wait.";
  if (kind === "snap") return "SNAP window.";
  if (kind === "wait") return "WAIT for the next SNAP.";
  return "Pulse running.";
}
