import type { RegionId, ThreatTypeId } from "./types";

export type RegionDef = {
  id: RegionId;
  name: string;
  pos: [number, number, number];
  color: number;
};

export type ThreatDef = {
  id: ThreatTypeId;
  name: string;
  short: string;
  region: RegionId;
  color: number;
  health: number;
  scanSeconds: number;
  autoHealAfter: number;
  dossier: string;
  protocol: string;
  scanBeats: string[];
};

export const BRAIN = {
  rx: 88,
  ry: 52,
  rz: 70,
};

export const REGIONS: RegionDef[] = [
  { id: "prefrontal", name: "Prefrontal Cortex", pos: [-48, 12, -18], color: 0x7aa8a4 },
  { id: "hippocampus", name: "Hippocampus", pos: [22, -12, 14], color: 0x8eb4ae },
  { id: "amygdala", name: "Amygdala", pos: [38, -8, 26], color: 0xb07a7a },
  { id: "thalamus", name: "Thalamus", pos: [0, 2, 8], color: 0x9aa3b0 },
  { id: "cerebellum", name: "Cerebellum", pos: [4, -18, -42], color: 0x8a9b88 },
  { id: "motor", name: "Motor Cortex", pos: [-18, 26, 8], color: 0x7a96b0 },
  { id: "visual", name: "Visual Cortex", pos: [8, 6, -52], color: 0x6e8aa0 },
  { id: "brainstem", name: "Brainstem", pos: [0, -28, -12], color: 0x8a7a74 },
];

export const THREAT_TYPES: ThreatDef[] = [
  {
    id: "capsid",
    name: "Neuroinvasive Capsid",
    short: "Capsid",
    region: "hippocampus",
    color: 0xc45c5c,
    health: 2,
    scanSeconds: 2.2,
    autoHealAfter: 1,
    dossier:
      "Icosahedral envelope hijacking CA1 memory encoding. Non-self surface proteins bind AMPA receptors.",
    protocol: "Envelope-collapse pulse on an 18 Hz synaptic carrier.",
    scanBeats: [
      "Hold the vector. Sampling the fold.",
      "Envelope is icosahedral. Non-self epitopes.",
      "Target is CA1 encoding. Writing the map.",
    ],
  },
  {
    id: "amyloid",
    name: "Amyloid Lattice",
    short: "Amyloid",
    region: "prefrontal",
    color: 0xc4b48a,
    health: 3,
    scanSeconds: 2.6,
    autoHealAfter: 1,
    dossier:
      "Beta-sheet plaques bridging prefrontal dendrites, starving working memory of glucose.",
    protocol: "Chaperone-frequency shatter. Break the sheet, restore perfusion.",
    scanBeats: [
      "Dense sheet. Not a cell — a lattice.",
      "Beta-stack confirmed. Perfusion is trapped.",
      "Protocol: chaperone shatter. Cataloguing now.",
    ],
  },
  {
    id: "prion",
    name: "Prion Twist",
    short: "Prion",
    region: "cerebellum",
    color: 0xb48cc4,
    health: 2,
    scanSeconds: 2.8,
    autoHealAfter: 1,
    dossier:
      "Misfolded protein teaching neighbors to fold wrong. Spreads through cerebellar Purkinje trees.",
    protocol: "Counter-helix pulse. Unwrite the template before it tutors the next cell.",
    scanBeats: [
      "This fold is teaching. That is the danger.",
      "Helical misfold. Purkinje trees at risk.",
      "Counter-helix locked. I will remember this twist.",
    ],
  },
  {
    id: "cytokine",
    name: "Cytokine Flare",
    short: "Flare",
    region: "amygdala",
    color: 0xd07848,
    health: 2,
    scanSeconds: 1.8,
    autoHealAfter: 1,
    dossier:
      "Inflammatory cascade stuck on in the amygdala. Fear circuitry firing without a threat.",
    protocol: "Anti-inflammatory quench. Drop the cascade, spare the circuit.",
    scanBeats: [
      "Heat signature is chemical, not viral.",
      "Cascade is looped. Amygdala cannot stand down.",
      "Quench protocol ready. We take the fire together.",
    ],
  },
  {
    id: "leech",
    name: "Synaptic Leech",
    short: "Leech",
    region: "thalamus",
    color: 0x5cb4a0,
    health: 2,
    scanSeconds: 2.3,
    autoHealAfter: 1,
    dossier:
      "Parasitic vesicle riding thalamic relays, sipping acetylcholine and dropping packets.",
    protocol: "Relay-cleanse pulse. Cut the siphon, reseal the cleft.",
    scanBeats: [
      "Something is feeding on the relay.",
      "Vesicle parasite. Acetylcholine is being sipped.",
      "Siphon mapped. Cleanse pulse will reseal the cleft.",
    ],
  },
  {
    id: "stripper",
    name: "Myelin Stripper",
    short: "Stripper",
    region: "motor",
    color: 0x6a8cc4,
    health: 3,
    scanSeconds: 2.5,
    autoHealAfter: 1,
    dossier:
      "Enzymatic sheath peeler on corticospinal axons. Signal leaks; motor intent frays.",
    protocol: "Remyelination binder. Coat the axon, stop the leak.",
    scanBeats: [
      "Axon is naked. Sheath is being peeled.",
      "Enzymatic. Corticospinal leak confirmed.",
      "Binder protocol written. We coat it back.",
    ],
  },
];

export const TYPE_BY_ID: Record<ThreatTypeId, ThreatDef> = Object.fromEntries(
  THREAT_TYPES.map((t) => [t.id, t]),
) as Record<ThreatTypeId, ThreatDef>;

export const REGION_BY_ID: Record<RegionId, RegionDef> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
) as Record<RegionId, RegionDef>;

export const CATALOG_TOTAL = THREAT_TYPES.length;
export const THREATS_PER_TYPE = 2;
