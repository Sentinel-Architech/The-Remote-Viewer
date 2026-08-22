export type Phase = "briefing" | "playing" | "paused" | "debrief" | "collapse";

export type CommsFrom = "SENTINEL" | "SYSTEM" | "VIEWER";

export type RegionId =
  | "prefrontal"
  | "hippocampus"
  | "amygdala"
  | "thalamus"
  | "cerebellum"
  | "motor"
  | "visual"
  | "brainstem";

export type ThreatTypeId =
  | "capsid"
  | "amyloid"
  | "prion"
  | "cytokine"
  | "leech"
  | "stripper";

export type CommsLine = {
  id: string;
  from: CommsFrom;
  text: string;
  at: number;
};

export type KnowledgeEntry = {
  typeId: ThreatTypeId;
  identified: boolean;
  encounters: number;
  neutralized: number;
  autoHeal: boolean;
  learnedAt?: number;
};

export type WaypointHud = {
  x: number;
  y: number;
  behind: boolean;
  visible: boolean;
};

export type HudSnapshot = {
  region: string;
  integrity: number;
  autonomy: number;
  scanProgress: number;
  viewerSync: number;
  sentinelSync: number;
  scanning: boolean;
  targetName: string | null;
  targetKnown: boolean;
  inScanRange: boolean;
  waypointDist: number;
  threatsLeft: number;
  pulseReady: boolean;
  cataloged: number;
  catalogTotal: number;
  waypoint: WaypointHud;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getPitch?: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

export type TouchAxes = {
  moveX: number;
  moveY: number;
  rise: number;
  scan: boolean;
  pulse: boolean;
};
