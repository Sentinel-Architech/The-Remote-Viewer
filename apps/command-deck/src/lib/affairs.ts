import { create } from "zustand";
import { useIdentity } from "@/lib/identity";
import { useHub } from "@/lib/hub-sync";
import { probeNative } from "@/lib/native";
import { SIGNATURES, isLearned, learnedCount, useProgress, type TheaterId } from "@/lib/progress";
import { usePulse } from "@/lib/pulse";

export type AffairTopic =
  | "synapse"
  | "orbit"
  | "hub"
  | "native"
  | "mesh"
  | "repair"
  | "os"
  | "vault"
  | "affairs";

export type AffairVerdict = "clear" | "watch" | "hold";

export type AffairFinding = {
  topic: AffairTopic;
  bound: string;
  verdict: AffairVerdict;
  detail: string;
};

export type AffairIntercept = {
  topic: AffairTopic;
  at: number;
  action: string;
  detail: string;
};

export type AffairAgent = {
  id: AffairTopic;
  name: string;
  line: string;
  bounds: string[];
  meta: boolean;
};

export const OUT_OF_BOUNDS =
  /walletconnect|metamask|ethers\.js|\bwagmi\b|\bstripe\b|\bsolana\b|anchor\.|\/fhe\b|googleapis|gstatic|stun\.l\.google|phantom wallet|web3modal/i;

export const AFFAIR_AGENTS: AffairAgent[] = [
  {
    id: "synapse",
    name: "Neural Link",
    line: "CSF field. HSV, WNV, rabies. Tap to seize. No human bodies as pieces.",
    bounds: ["Virions only: HSV, WNV, Rabies", "Play is toggle and tap", "No human body meshes"],
    meta: false,
  },
  {
    id: "orbit",
    name: "God's Eye",
    line: "Byproducts of human systems — emission, runoff, worm. Never bodies.",
    bounds: ["Emission, runoff, worm only", "Never mark a human body", "Sight is exhaust, not flesh"],
    meta: false,
  },
  {
    id: "hub",
    name: "HUB",
    line: "One Viewer. Six-digit pair. Signed dossier. Host ICE on Wi-Fi.",
    bounds: ["One identity across devices", "PIN wrap only", "No Google STUN, no vendor login"],
    meta: false,
  },
  {
    id: "native",
    name: "Native",
    line: "A–Z native web. WebCrypto, WebRTC, WebGL, PWA. Zero COI.",
    bounds: ["26/26 native letters", "Host ICE default", "No Google Fonts, no wallet path"],
    meta: false,
  },
  {
    id: "mesh",
    name: "Mesh",
    line: "Local, national, globe pulses. SNAP window, then NOW or wait.",
    bounds: ["Three live scopes only", "Hot SNAP or a close race locks the upgrade", "No outside identity on the board"],
    meta: false,
  },
  {
    id: "repair",
    name: "Repair",
    line: "Draft PRs for scoped bugs. SNAP diagnoses seize the fix or wait.",
    bounds: ["Draft only, never merge", "Repair SNAP is seize-the-fix during the lock", "No wallets, Stripe, Solana, FHE"],
    meta: false,
  },
  {
    id: "os",
    name: "Sentinel OS",
    line: "Learn three seizes per signature. Strike only what is learned. Specialist on-device or loopback.",
    bounds: [
      "LEARN_NEED is three",
      "Strike learned signatures only",
      "Autonomous at 6/6, not before",
      "Specialist on-device or loopback node — no vendor keys",
    ],
    meta: false,
  },
  {
    id: "vault",
    name: "Vault",
    line: "Ed25519 minted here. No OAuth. Origin links are not logins.",
    bounds: ["Sovereign key on device", "No Google or Microsoft identity", "X / GitHub / DF are install links", "Digital life is PIN-wrapped on the Viewer — never a vendor backup"],
    meta: false,
  },
  {
    id: "affairs",
    name: "Affairs",
    line: "Internal affairs of internal affairs. Watches the watchers. Cannot self-clear.",
    bounds: [
      "Must audit the other eight this run",
      "Cannot self-clear a hold — only Audit lifts a watcher miss",
      "If an agent misses a live bound, Affairs holds and freezes the deck",
    ],
    meta: true,
  },
];

const STORAGE = "trv-affairs-v1";
const LOG_CAP = 24;
const INTERCEPT_CAP = 12;
const ORBIT_OK = new Set(["Emission", "Runoff", "Worm"]);
const NEURAL_OK = new Set(["HSV", "WNV", "Rabies"]);

type Persisted = {
  held: AffairTopic[];
  log: AffairFinding[];
  lastAudit: number | null;
  intercepts: AffairIntercept[];
};

type AffairsState = {
  held: Record<AffairTopic, boolean>;
  findings: AffairFinding[];
  intercepts: AffairIntercept[];
  lastAudit: number | null;
  selected: AffairTopic;
  hydrate: () => void;
  select: (id: AffairTopic) => void;
  audit: () => AffairFinding[];
  hold: (id: AffairTopic) => void;
  release: (id: AffairTopic) => boolean;
};

function emptyHeld(): Record<AffairTopic, boolean> {
  return {
    synapse: false,
    orbit: false,
    hub: false,
    native: false,
    mesh: false,
    repair: false,
    os: false,
    vault: false,
    affairs: false,
  };
}

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      held: Array.isArray(parsed.held) ? (parsed.held.filter(isTopic) as AffairTopic[]) : [],
      log: Array.isArray(parsed.log) ? parsed.log.filter(isFinding).slice(0, LOG_CAP) : [],
      lastAudit: typeof parsed.lastAudit === "number" ? parsed.lastAudit : null,
      intercepts: Array.isArray(parsed.intercepts)
        ? parsed.intercepts.filter(isIntercept).slice(0, INTERCEPT_CAP)
        : [],
    };
  } catch {
    return null;
  }
}

function writePersisted(state: AffairsState) {
  const held = (Object.keys(state.held) as AffairTopic[]).filter((k) => state.held[k]);
  localStorage.setItem(
    STORAGE,
    JSON.stringify({
      held,
      log: state.findings.slice(0, LOG_CAP),
      lastAudit: state.lastAudit,
      intercepts: state.intercepts.slice(0, INTERCEPT_CAP),
    } satisfies Persisted),
  );
}

function persistNow() {
  try {
    writePersisted(useAffairs.getState());
  } catch {
    /* ignore */
  }
}

function isTopic(v: unknown): v is AffairTopic {
  return AFFAIR_AGENTS.some((a) => a.id === v);
}

function isFinding(v: unknown): v is AffairFinding {
  if (!v || typeof v !== "object") return false;
  const f = v as AffairFinding;
  return (
    isTopic(f.topic) &&
    typeof f.bound === "string" &&
    typeof f.detail === "string" &&
    (f.verdict === "clear" || f.verdict === "watch" || f.verdict === "hold")
  );
}

function isIntercept(v: unknown): v is AffairIntercept {
  if (!v || typeof v !== "object") return false;
  const row = v as AffairIntercept;
  return isTopic(row.topic) && typeof row.action === "string" && typeof row.detail === "string";
}

export function boundRepairText(...parts: string[]) {
  const text = parts.join("\n");
  if (OUT_OF_BOUNDS.test(text)) {
    return { held: true, reason: "Out of bounds: wallet, contract, or vendor identity path." };
  }
  return { held: false, reason: "" };
}

export function isTopicHeld(id: AffairTopic) {
  return Boolean(useAffairs.getState().held[id] || useAffairs.getState().held.affairs);
}

export function recordIntercept(topic: AffairTopic, action: string, detail: string) {
  const row: AffairIntercept = { topic, action, detail, at: Date.now() };
  const intercepts = [row, ...useAffairs.getState().intercepts].slice(0, INTERCEPT_CAP);
  useAffairs.setState({ intercepts });
  persistNow();
  return row;
}

function finding(topic: AffairTopic, bound: string, verdict: AffairVerdict, detail: string): AffairFinding {
  return { topic, bound, verdict, detail };
}

function worst(findings: AffairFinding[]): AffairVerdict {
  if (findings.some((f) => f.verdict === "hold")) return "hold";
  if (findings.some((f) => f.verdict === "watch")) return "watch";
  return "clear";
}

function freeze(topic: AffairTopic, action: string, detail: string): false {
  recordIntercept(topic, action, detail);
  return false;
}

function auditFirstOrder(): AffairFinding[] {
  const out: AffairFinding[] = [];
  const neural = SIGNATURES.filter((s) => s.theater === "neural");
  const orbit = SIGNATURES.filter((s) => s.theater === "orbit");
  const id = useIdentity.getState();
  const hub = useHub.getState();
  const native = probeNative();
  const progress = useProgress.getState();
  const pulse = usePulse.getState();
  const intercepts = useAffairs.getState().intercepts;

  const neuralOk = neural.every((s) => NEURAL_OK.has(s.label));
  out.push(
    finding(
      "synapse",
      "Virions only",
      neuralOk ? "clear" : "hold",
      neuralOk
        ? `Neural Link labels ${neural.map((s) => s.label).join(", ")}. Tap seize is live.`
        : "Neural Link labels left the medical set. Hold.",
    ),
  );

  const orbitOk = orbit.every((s) => ORBIT_OK.has(s.label));
  const bodyWord = /body|bodies|person|people|human face/i.test(orbit.map((s) => s.label).join(" "));
  out.push(
    finding(
      "orbit",
      "Never bodies",
      !orbitOk || bodyWord ? "hold" : "clear",
      orbitOk && !bodyWord
        ? `God's Eye reads ${orbit.map((s) => s.label).join(", ")}. No bodies on the mesh.`
        : "God's Eye drifted toward bodies. Hold.",
    ),
  );

  const hubOk = Boolean(id.pubkey) && hub.live >= 1;
  out.push(
    finding(
      "hub",
      "One HUB",
      hubOk ? "clear" : "watch",
      hubOk ? `HUB ${hub.live} live. Pair stays six digits.` : "HUB has not minted a Viewer yet.",
    ),
  );

  const nativeHold = native.ice === "banned" || native.coi.includes("google-fonts") || native.coi.includes("banned-stun");
  out.push(
    finding(
      "native",
      "A–Z native",
      nativeHold ? "hold" : native.score < 26 ? "watch" : "clear",
      nativeHold
        ? `Native ${native.score}/26 · ${native.ice}. COI ${native.coi.join(" · ") || "flagged"}.`
        : `Native ${native.score}/26 · ${native.ice} ICE.`,
    ),
  );

  const scopesOk = pulse.lastPhase === "open" || pulse.lastPhase === "snap";
  out.push(
    finding(
      "mesh",
      "SNAP watch / pulse / snap",
      scopesOk ? "clear" : "watch",
      `Pulse ${pulse.lastPhase}. Severity ${pulse.lastSeverity}. Seizes ${pulse.seizes}. Hot ${pulse.hotSeizes}. Board stays local / nation / globe.`,
    ),
  );

  const repairBound = intercepts.find((row) => row.topic === "repair" && /wallet|contract|vendor/i.test(row.detail));
  out.push(
    finding(
      "repair",
      "Draft never merge",
      repairBound ? "watch" : "clear",
      repairBound
        ? `Repair intercept: ${repairBound.detail}`
        : "Repair may diagnose. Internal Affairs strips wallet and contract patches.",
    ),
  );

  const n = learnedCount(progress.learned);
  out.push(
    finding(
      "os",
      "Strike only learned",
      n >= 6 ? "clear" : n > 0 ? "watch" : "clear",
      n >= 6
        ? "Sentinel OS autonomous. Self-defense in both theaters."
        : `Sentinel OS ${n}/6. Strikes stay on learned signatures.`,
    ),
  );

  const vaultOk = Boolean(id.ready && id.pubkey) && (id.curve === "ed25519" || id.curve === "hash");
  out.push(
    finding(
      "vault",
      "Sovereign key",
      vaultOk ? "clear" : "watch",
      vaultOk ? `Vault ${id.curve}. No outside login.` : "Vault still minting.",
    ),
  );

  return out;
}

function independentMisses(first: AffairFinding[]): { topic: AffairTopic; reason: string }[] {
  const misses: { topic: AffairTopic; reason: string }[] = [];
  const neural = SIGNATURES.filter((s) => s.theater === "neural");
  const orbit = SIGNATURES.filter((s) => s.theater === "orbit");
  const probe = probeNative();
  const id = useIdentity.getState();
  const firstOf = (topic: AffairTopic) => first.find((f) => f.topic === topic);

  if (!neural.every((s) => NEURAL_OK.has(s.label)) && firstOf("synapse")?.verdict !== "hold") {
    misses.push({ topic: "synapse", reason: "Neural Link labels left HSV/WNV/Rabies and the Neural Link agent did not escalate." });
  }
  const orbitLabels = orbit.map((s) => s.label).join(" ");
  const orbitBad = !orbit.every((s) => ORBIT_OK.has(s.label)) || /body|bodies|person|people|human face/i.test(orbitLabels);
  if (orbitBad && firstOf("orbit")?.verdict !== "hold") {
    misses.push({ topic: "orbit", reason: "God's Eye drifted toward bodies and the God's Eye agent did not escalate." });
  }
  const nativeBad = probe.ice === "banned" || probe.coi.includes("google-fonts") || probe.coi.includes("banned-stun");
  if (nativeBad && firstOf("native")?.verdict !== "hold") {
    misses.push({ topic: "native", reason: "Native left the wire and the Native agent did not escalate." });
  }
  if (id.ready && id.curve && id.curve !== "ed25519" && id.curve !== "hash" && firstOf("vault")?.verdict !== "hold") {
    misses.push({ topic: "vault", reason: "Vault is not a sovereign Ed25519 key and the Vault agent did not escalate." });
  }
  return misses;
}

function auditMeta(first: AffairFinding[]): AffairFinding[] {
  if (!first.length) {
    return [finding("affairs", "Must audit the eight", "hold", "No first-order audit this run. Affairs holds itself.")];
  }
  const misses = independentMisses(first);
  if (misses.length) {
    return [
      finding(
        "affairs",
        "Watchers watched",
        "hold",
        misses.map((m) => m.reason).join(" "),
      ),
    ];
  }
  const holds = first.filter((f) => f.verdict === "hold");
  if (holds.length) {
    return [
      finding(
        "affairs",
        "Cannot self-clear",
        "watch",
        `Watching ${holds.map((h) => h.topic).join(", ")}. Restore the bound, then Release. Affairs stays unlocked so you can lift a topic hold.`,
      ),
    ];
  }
  return [finding("affairs", "Watchers watched", "clear", "Eight topic agents audited. Nothing left the wire.")];
}

export function runAudit(): AffairFinding[] {
  const first = auditFirstOrder();
  return [...first, ...auditMeta(first)];
}

export function verdictOf(id: AffairTopic, findings: AffairFinding[]): AffairVerdict {
  return worst(findings.filter((f) => f.topic === id));
}

export function deckVerdict(findings: AffairFinding[]): AffairVerdict {
  return worst(findings);
}

export const useAffairs = create<AffairsState>((set, get) => ({
  held: emptyHeld(),
  findings: [],
  intercepts: [],
  lastAudit: null,
  selected: "affairs",
  hydrate: () => {
    if (typeof window === "undefined") return;
    const rec = readPersisted();
    if (!rec) return;
    const held = emptyHeld();
    for (const id of rec.held) held[id] = true;
    set({ held, findings: rec.log, lastAudit: rec.lastAudit, intercepts: rec.intercepts });
  },
  select: (id) => set({ selected: id }),
  audit: () => {
    const findings = runAudit();
    const held = { ...get().held };
    for (const row of findings) {
      if (row.topic === "affairs") continue;
      if (row.verdict === "hold") held[row.topic] = true;
    }
    const meta = findings.find((f) => f.topic === "affairs");
    held.affairs = meta?.verdict === "hold";
    const next = { ...get(), findings, held, lastAudit: Date.now() };
    set(next);
    try {
      writePersisted(next);
    } catch {
      /* ignore */
    }
    return findings;
  },
  hold: (id) => {
    const held = { ...get().held, [id]: true };
    const next = { ...get(), held };
    set(next);
    try {
      writePersisted(next);
    } catch {
      /* ignore */
    }
  },
  release: (id) => {
    const { held } = get();
    if (id === "affairs") return false;
    if (held.affairs) return false;
    const nextHeld = { ...held, [id]: false };
    const next = { ...get(), held: nextHeld };
    set(next);
    try {
      writePersisted(next);
    } catch {
      /* ignore */
    }
    return true;
  },
}));

export function assertRepairAllowed() {
  if (isTopicHeld("repair") || isTopicHeld("native") || isTopicHeld("affairs")) {
    freeze("repair", "arm", "Repair frozen. Bound: native stack, no wallets, no contracts.");
    throw new Error("Internal Affairs holds Repair. Bound: native stack, no wallets, no contracts.");
  }
}

export function assertOsAllowed(theater: TheaterId) {
  if (isTopicHeld("os") || isTopicHeld("affairs")) {
    return freeze("os", "strike", "Sentinel OS frozen by Internal Affairs.");
  }
  if (theater === "orbit" && isTopicHeld("orbit")) {
    return freeze("orbit", "strike", "God's Eye held. OS strike frozen.");
  }
  if (theater === "neural" && isTopicHeld("synapse")) {
    return freeze("synapse", "strike", "Neural Link held. OS strike frozen.");
  }
  const learned = useProgress.getState().learned;
  return SIGNATURES.some((s) => s.theater === theater && isLearned(learned, s.key));
}

export function assertTheaterAllowed(theater: TheaterId) {
  if (isTopicHeld("affairs")) return freeze("affairs", "theater", "Affairs held. Both theaters frozen.");
  if (theater === "neural" && isTopicHeld("synapse")) {
    return freeze("synapse", "theater", "Neural Link held. CSF field frozen.");
  }
  if (theater === "orbit" && isTopicHeld("orbit")) {
    return freeze("orbit", "theater", "God's Eye held. Mesh freeze.");
  }
  return true;
}

export function assertSpawnAllowed(theater: TheaterId) {
  return assertTheaterAllowed(theater);
}

export function assertSeizeAllowed(theater: TheaterId) {
  return assertTheaterAllowed(theater);
}

export function assertHubAllowed() {
  if (isTopicHeld("hub") || isTopicHeld("native") || isTopicHeld("affairs") || isTopicHeld("vault")) {
    return freeze("hub", "pair", "HUB pair frozen by Internal Affairs.");
  }
  return true;
}

export function assertMeshAllowed() {
  if (isTopicHeld("mesh") || isTopicHeld("affairs")) {
    return freeze("mesh", "post", "Mesh board frozen by Internal Affairs.");
  }
  return true;
}
