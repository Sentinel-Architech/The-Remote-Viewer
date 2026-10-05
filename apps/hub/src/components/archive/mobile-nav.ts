/**
 * Archived equal-width bottom nav.
 * Replaced by the scrolling, partly transparent menu in bottom-menu.tsx.
 * The routes stay here so the old list is not discarded.
 */

export const ARCHIVED_MOBILE_NAV = [
  { to: "/hub", label: "Home" },
  { to: "/hub/deck", label: "Deck" },
  { to: "/hub/shop", label: "Shop" },
  { to: "/hub/friends", label: "Friends" },
] as const;
