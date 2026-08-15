export type IntegrityFormState =
  | { phase: "idle" }
  | { phase: "compose"; note: string }
  | { phase: "submitting" }
  | { phase: "done" }
  | { phase: "error"; message: string };

/** Coarse only — never lat/lng of a subject */
export type AreaBulletin = {
  id: string;
  /** Broad region label, e.g. county or metro — not a street */
  regionLabel: string;
  /** Irrelevant code name, not a person name */
  codeName: string;
  seen: boolean;
};

export type AreaBulletinState =
  | { enabled: false }
  | { enabled: true; items: AreaBulletin[] };
