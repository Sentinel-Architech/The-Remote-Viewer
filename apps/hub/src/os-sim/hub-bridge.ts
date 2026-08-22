export type DefenseEvent = {
  attackType: string;
  outcome: "blocked" | "breached";
  xpGain: number;
};

export type CatalogEvent = {
  typeId: string;
  name: string;
};

type Hooks = {
  onDefense?: (e: DefenseEvent) => void;
  onCatalog?: (e: CatalogEvent) => void;
};

let hooks: Hooks = {};

export function setOsSimHooks(next: Hooks) {
  hooks = next;
}

export function emitDefense(e: DefenseEvent) {
  hooks.onDefense?.(e);
}

export function emitCatalog(e: CatalogEvent) {
  hooks.onCatalog?.(e);
}
