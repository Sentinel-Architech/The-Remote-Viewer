/** Simulation games that ship in this repo. They stay on the native stack. */

export const SIM_GAMES = [
  { id: "sentinel-os", surface: "hub", route: "/hub/neuron" },
  { id: "neural-link", surface: "command-deck", route: "/hub/deck?door=neural" },
  { id: "gods-eye", surface: "command-deck", route: "/hub/deck?door=orbit" },
  { id: "token-gateway", surface: "hub", route: "/hub/token-gateway" },
] as const;

export type SimGameId = (typeof SIM_GAMES)[number]["id"];

const BANNED_GAME_HOST =
  /fonts\.google|fonts\.gstatic|googleapis|firebase|stun\.l\.google|facebook\.net|connect\.facebook|graph\.facebook|meta\.com|alphabet\.com|play\.google|maps\.google|gstatic\.com/i;

export function assertNativeGameSource(source: string): void {
  if (BANNED_GAME_HOST.test(source)) {
    throw new Error("Simulation games stay on the native stack. Google, Meta, and Alphabet are not used.");
  }
}

export function assertSimGame(id: string): SimGameId {
  const found = SIM_GAMES.find((game) => game.id === id);
  if (!found) {
    throw new Error("That simulation is not one of the native games in this repo.");
  }
  assertNativeGameSource(found.route);
  return found.id;
}
