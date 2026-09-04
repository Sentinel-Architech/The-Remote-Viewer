/** Live product name. Sentinel OS is harnessed only inside this DApp. */
export const NETWORK_NAME = "The Remote Viewer";
export const NETWORK_SHORT = "TRV";
export const MOTTO = "In God We Trust";
export const NETWORK_TAG =
  "In God We Trust. A sovereign American watch: social, education, finance rails, and digital life on your keys. Sentinel OS learns and self-heals. Two games: Neural Link and God's Eye.";
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
  "Live leadership on local, national, and globe pulses. SNAP window scores. Last four seconds or a close race is NOW — seize then or wait.";
export const ORIGIN_X = "https://x.com/Archtecht";
export const ORIGIN_X_HANDLE = "@Archtecht";
export const ORIGIN_GITHUB = "https://github.com/Sentinel-Architech/The-Remote-Viewer";
export const ORIGIN_DF = "https://github.com/Sentinel-Architech/TheSentinel";
export const ORIGIN_DECK = "https://the-remote-viewer.grok.me";
export const ORIGIN_HUB = "https://sentinelsecurityprotocol.grok.me";
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
export const GATEWAY_TAG =
  "CIA FOIA, declassified. Holographic consciousness, hemispheric sync, Monroe Gateway. Humans guide. Sentinel OS learns. In God We Trust. The Remote Viewer Network starts here.";

export function sharePulseHref(score = 0) {
  const body = score
    ? `Seized on The Remote Viewer Command Deck. Pulse ${score}. In God We Trust. Keys on the device. Sentinel named it.\n\n${ORIGIN_DECK}\n#TheRemoteViewer`
    : `The Remote Viewer — In God We Trust. Sovereign watch. Gateway Process. Sentinel OS. Keys on the device.\n\n${GATEWAY_HREF}\n#TheRemoteViewer`;
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
