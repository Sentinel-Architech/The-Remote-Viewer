/** Command Deck theaters. Same ban as the hub games: no Google, Meta, or Alphabet hosts. */

export const DECK_GAMES = [
  { id: "neural-link", route: "/hub/deck?door=neural" },
  { id: "gods-eye", route: "/hub/deck?door=orbit" },
] as const;

const BANNED_GAME_HOST =
  /fonts\.google|fonts\.gstatic|googleapis|firebase|stun\.l\.google|facebook\.net|connect\.facebook|graph\.facebook|meta\.com|alphabet\.com|play\.google|maps\.google|gstatic\.com/i;

export function assertDeckGame(id: string): void {
  const found = DECK_GAMES.find((game) => game.id === id);
  if (!found || BANNED_GAME_HOST.test(found.route)) {
    throw new Error("Simulation games stay on the native stack. Google, Meta, and Alphabet are not used.");
  }
}
