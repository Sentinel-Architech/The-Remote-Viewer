/** Live product name. Sentinel OS is harnessed only inside this DApp. */
export const NETWORK_NAME = "The Remote Viewer";
export const NETWORK_SHORT = "TRV";
export const MOTTO = "In God We Trust";
export const NETWORK_TAG =
  "In God We Trust. The Remote Viewer Network first — your profile, mesh, and vault on this device. Neural watch is a door. God's Eye reads exhaust of systems — never bodies.";
export const DECK_NAME = "Command Deck";
export const THEATER_NEURAL = "Neural Link";
export const THEATER_ORBIT = "God's Eye";
export const THEATER_ORBIT_TAG = "Byproducts of human systems. Never bodies.";
export const IDENTITY_TAG =
  "In God We Trust. Sign in with X. Viewer key stays on this device. PIN never left the phone. No Google identity. Stripe is a rail, not you.";
export const HUB_TAG =
  "Tap Link on this screen, tap Join on the other, enter the six digits. Rank, Sentinel OS, and seizes land on every device at once.";
export const NATIVE_TAG =
  "A–Z native web. Host ICE on Wi-Fi. WebCrypto, WebRTC, WebGL, PWA. Zero Google identity, zero wallet.";
export const BOARD_NAME = "Mesh Board";
export const BOARD_TAG =
  "A record of the watch — local, national, globe. Not a leaderboard for sport.";
export const ORIGIN_X = "https://x.com/Archtecht";
export const ORIGIN_X_HANDLE = "@Archtecht";
export const ORIGIN_GITHUB = "https://github.com/Sentinel-Architech/The-Remote-Viewer";
export const ORIGIN_DF = "https://github.com/Sentinel-Architech/TheSentinel";
export const ORIGIN_DECK = "https://the-remote-viewer.grok.me";
export const ORIGIN_HUB = "https://the-remote-viewer.grok.me";
export const HUB_SHOP = ORIGIN_HUB;
export const HUB_FRIENDS = ORIGIN_HUB;
export const HUB_OS = `${ORIGIN_HUB}/hub/os`;
export const X_INTENT = "https://x.com/intent/tweet";
export const X_MONEY = ORIGIN_X;
export const GATEWAY_TITLE = "Analysis and Assessment of Gateway Process";
export const GATEWAY_ID = "CIA-RDP96-00788R001700210016-5";
export const GATEWAY_YEAR = "1983";
export const GATEWAY_HREF = "https://www.cia.gov/readingroom/document/cia-rdp96-00788r001700210016-5";
export const GATEWAY_PDF = "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf";
export const GATEWAY_ROOM = "https://www.cia.gov/readingroom/";
export const COMMISSION_SERIAL = "TRV-OZ00H-20260912-001";
export const COMMISSION_STILL = "/gateway/TRV-OZ00H-20260912-001.png";
export const COMMISSION_CLAIM =
  "Protected original — commissioned work — exclusive. © 2026. No unauthorized use.";

export function sharePulseHref(score = 0) {
  const body = score
    ? `Seized on The Remote Viewer Command Deck. Pulse ${score}. In God We Trust. Keys on the device.\n\n${ORIGIN_DECK}\n#TheRemoteViewer`
    : `The Remote Viewer — In God We Trust. Sovereign watch. Gateway Process. Keys on the device.\n\n${ORIGIN_DECK}\n#TheRemoteViewer`;
  return `${X_INTENT}?text=${encodeURIComponent(body)}`;
}
export const BOT_NAME = "Sentinel Repair";
export const BOT_TAG =
  "Tap Repair for a diagnosis. SNAP severity is seize-or-wait: tap Seize fix in the lock, or wait for the next upgrade. GitHub automations open draft PRs for scoped bugs. Command Deck never merges. No wallets, no contracts.";
export const WIRE_TAG =
  "Every agent reports at once. HUB, Mesh, Repair, Native, Sentinel OS, Internal Affairs — one wire, no split allegiance.";
export const AFFAIRS_NAME = "Internal Affairs";
export const AFFAIRS_TAG =
  "One agent per topic. Affairs watches those agents. Holds freeze Repair, OS strikes, and any path that leaves the native wire.";
export const SPECIALIST_TAG =
  "On-device specialist. Names strains, briefs SNAP, reports Affairs. Pair a local node if you host weights. Zero vendor keys.";
export const LIFE_TAG =
  "Each Viewer owns this life. The key, rank, seizes, and lens live on the device. Take a PIN wrap. Carry it. Destroy a copy. X is a name, not ownership.";
export const HUB_MAP = [
  {
    to: "/",
    title: "Network",
    line: "Home after the pill. Profile, mesh, vault. You own this life.",
    door: "network",
  },
  {
    to: "/hub/deck?door=neural",
    title: "Neural Link",
    line: "Walk the neuron. THC on watch. HSV, West Nile, rabies.",
    door: "neural",
  },
  {
    to: "/hub/deck?door=orbit",
    title: "God's Eye",
    line: "Orbit. Exhaust of systems. Never bodies.",
    door: "orbit",
  },
  {
    to: "/hub/deck",
    title: "Command Deck",
    line: "The watch. Neural Link first. God's Eye after the neuron is named.",
    door: "deck",
  },
  {
    to: "/?gate=1",
    title: "Gateway",
    line: "Eye. Red or Blue. Same facts. Two deliveries.",
    door: "gateway",
  },
] as const;
