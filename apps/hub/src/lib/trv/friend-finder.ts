/** Closed until this many opted-in Viewers are in the coarsened watch. */
export const FRIEND_FINDER_MIN = 12;

export type FinderNode = { handle: string; miles: number };

export function friendFinder(input: {
  optedIn: boolean;
  nodes: FinderNode[];
}) {
  if (!input.optedIn) {
    return { open: false, reason: "Opt in before the finder can run." as const, suggestions: [] };
  }
  if (input.nodes.length < FRIEND_FINDER_MIN) {
    return {
      open: false,
      reason: `${input.nodes.length} of ${FRIEND_FINDER_MIN} opted-in Viewers. The finder stays closed.` as const,
      suggestions: [],
    };
  }
  return {
    open: true,
    reason: "Mutual handshake only. No automatic follow." as const,
    suggestions: input.nodes.slice(0, 5),
  };
}
