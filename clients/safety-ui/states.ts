export type IntegrityCategory =
  | "harm"
  | "impersonation"
  | "illegal_content"
  | "other";

export type IntegrityFormState =
  | { phase: "idle" }
  | { phase: "compose"; category: IntegrityCategory; note: string }
  | { phase: "submitting" }
  | { phase: "done" }
  | { phase: "error"; message: string };

/** Coarse only — never lat/lng of a subject */
export type AreaBulletin = {
  id: string;
  regionLabel: string;
  codeName: string;
  seen: boolean;
};

export type AreaBulletinState =
  | { enabled: false }
  | { enabled: true; items: AreaBulletin[] };

export function validateNote(note: string): string | null {
  const t = note.trim();
  if (t.length < 3) return "Add a short description";
  if (t.length > 2000) return "Too long";
  return null;
}
