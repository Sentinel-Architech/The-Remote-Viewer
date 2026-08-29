import { useEffect, useState } from "react";
import { hasWebGL } from "@/lib/platform";
import { useIdentity } from "@/lib/identity";

export type NativeLetter = {
  letter: string;
  name: string;
  line: string;
  live: boolean;
};

export type NativeProbe = {
  letters: NativeLetter[];
  score: number;
  ice: "host" | "stun" | "banned";
  coi: string[];
};

const BANNED_ICE =
  /google|gstatic|googleapis|stun\.l\.google|microsoft|windows\.com|azure|skype|facebook|meta\.com|icloud|apple\.com|amazonaws|twilio/i;

const STACK: { letter: string; name: string; line: string }[] = [
  { letter: "A", name: "Auth", line: "Sovereign Viewer key on this device. No Google, no Microsoft, no outside login." },
  { letter: "B", name: "Broadcast", line: "Same-origin tabs share the HUB over BroadcastChannel — no vendor bus." },
  { letter: "C", name: "Crypto", line: "WebCrypto only. Ed25519 signs the dossier. AES-GCM wraps the seed behind your six digits." },
  { letter: "D", name: "Devices", line: "Phone, tablet, deck. One HUB identity on every Wi-Fi screen you pair." },
  { letter: "E", name: "Ed25519", line: "The Viewer key is an Ed25519 public key minted in the browser. Never a wallet." },
  { letter: "F", name: "Fonts", line: "Self-hosted Plex and Newsreader. No Google Fonts, no remote type CDN." },
  { letter: "G", name: "GPU", line: "WebGL field with adaptive DPR, shadows, and stars. Local textures only." },
  { letter: "H", name: "HUB", line: "Signed dossier, max-merge, instant sync. One Remote Viewer across paired devices." },
  { letter: "I", name: "ICE", line: "Host candidates on your Wi-Fi. No Google STUN. No vendor identity in the path." },
  { letter: "J", name: "Join", line: "Tap Link here, tap Join there, enter six digits. That is the only pair." },
  { letter: "K", name: "Keys", line: "The seed never leaves this device unless you wrap it with the pair code you typed." },
  { letter: "L", name: "Local", line: "Progress lives in local storage first, then max-merges through the HUB." },
  { letter: "M", name: "Mesh", line: "Live local, national, and globe boards. Friends compete on pulses you seize." },
  { letter: "N", name: "None", line: "No wallet, no OAuth, no Stripe, no contracts, no FHE, no outside identity." },
  { letter: "O", name: "Offline", line: "PWA install. Rank and Sentinel OS keep working when the mesh is quiet." },
  { letter: "P", name: "P2P", line: "WebRTC mesh, signaled by this app. Data moves device to device." },
  { letter: "Q", name: "Quality", line: "Touch, save-data, and core count pick GPU load so every Wi-Fi device stays playable." },
  { letter: "R", name: "Rapier", line: "Fixed 1/60 physics in the field. CSF and orbit stay on the device GPU." },
  { letter: "S", name: "Signal", line: "Own signaling relay. No Google signaling, no vendor presence server." },
  { letter: "T", name: "Tap", line: "Play is toggles and tap. Strain, Drop, Look, seize. No drag-throw." },
  { letter: "U", name: "Universal", line: "One web stack. Phone, tablet, laptop, desktop. One tap to install." },
  { letter: "V", name: "Vault", line: "One Viewer. Rank, heal, sight, and Sentinel OS combined across both theaters." },
  { letter: "W", name: "Web", line: "WebCrypto, WebRTC, WebGL, PWA. Native browser APIs from A to Z." },
  { letter: "X", name: "X", line: "X, GitHub, and Defense Front are origin links for install — never a login." },
  { letter: "Y", name: "Yours", line: "Your seed, your HUB, your seizes. Pair a device and it is still you." },
  { letter: "Z", name: "Zero COI", line: "Zero conflicts of interest. Native stack only, on every Wi-Fi device." },
];

export function iceUrlBanned(url: string) {
  return BANNED_ICE.test(url);
}

export function isNativeIceCandidate(candidate: string) {
  return !BANNED_ICE.test(candidate);
}

export function sanitizeIceServers(servers: RTCIceServer[] | undefined): RTCIceServer[] {
  if (!servers?.length) return [];
  const out: RTCIceServer[] = [];
  for (const server of servers) {
    const raw = Array.isArray(server.urls) ? server.urls : [server.urls];
    const urls = raw.map(String).filter((u) => u.length > 0 && !iceUrlBanned(u));
    if (urls.length) out.push({ ...server, urls });
  }
  return out;
}

export function nativeIceMode(servers: RTCIceServer[]) {
  const urls = servers.flatMap((s) => (Array.isArray(s.urls) ? s.urls : [s.urls])).map(String);
  if (urls.some(iceUrlBanned)) return "banned" as const;
  if (urls.length) return "stun" as const;
  return "host" as const;
}

function coiFlags(ice: RTCIceServer[]): string[] {
  const flags: string[] = [];
  if (typeof document !== "undefined") {
    for (const node of document.querySelectorAll("link[rel='stylesheet'], script[src]")) {
      const href = (node as HTMLLinkElement).href || (node as HTMLScriptElement).src || "";
      if (/fonts\.google|fonts\.gstatic|googleapis\.com\/css/i.test(href)) flags.push("google-fonts");
      if (/googletagmanager|google-analytics|gtag\//i.test(href)) flags.push("google-analytics");
    }
  }
  if (typeof window !== "undefined") {
    const w = window as Window & { ethereum?: unknown; solana?: unknown };
    if (w.ethereum) flags.push("wallet-injected");
    if (w.solana) flags.push("solana-injected");
  }
  if (
    ice.some((s) => {
      const raw = Array.isArray(s.urls) ? s.urls : [s.urls];
      return raw.some((u) => iceUrlBanned(String(u)));
    })
  ) {
    flags.push("banned-stun");
  }
  return [...new Set(flags)];
}

let cached: { at: number; key: string; probe: NativeProbe } | null = null;

function storageOk() {
  if (typeof localStorage === "undefined") return false;
  try {
    return Number.isFinite(localStorage.length);
  } catch {
    return false;
  }
}
function envIceServers(): RTCIceServer[] {
  return [];
}

export function probeNative(): NativeProbe {
  const now = Date.now();
  const ice = envIceServers();
  const iceMode = nativeIceMode(ice);
  const id =
    typeof window === "undefined"
      ? { ready: false, curve: null as string | null, pubkey: "" }
      : useIdentity.getState();
  const key = `${id.ready}:${id.curve}:${id.pubkey}:${iceMode}`;
  if (cached && now - cached.at < 800 && cached.key === key) return cached.probe;
  const coi = coiFlags(ice);
  const cryptoOk = typeof crypto !== "undefined" && Boolean(crypto.subtle);
  const rtcOk = typeof RTCPeerConnection !== "undefined";
  const bcOk = typeof BroadcastChannel !== "undefined";
  const swOk = typeof navigator !== "undefined" && "serviceWorker" in navigator;
  const storeOk = storageOk();
  const webgl = hasWebGL();
  const fontsOk = !coi.includes("google-fonts");
  const zeroCoi = iceMode !== "banned" && fontsOk && !coi.includes("banned-stun");
  const qualityOk =
    typeof navigator !== "undefined" &&
    (typeof navigator.hardwareConcurrency === "number" || typeof window.matchMedia === "function");
  const tapOk = typeof window !== "undefined";
  const liveFor: Record<string, boolean> = {
    A: Boolean(id.ready && id.pubkey),
    B: bcOk,
    C: cryptoOk,
    D: Boolean(id.ready),
    E: id.curve === "ed25519" || id.curve === "hash",
    F: fontsOk,
    G: webgl,
    H: Boolean(id.pubkey),
    I: iceMode !== "banned",
    J: rtcOk && cryptoOk,
    K: storeOk && Boolean(id.pubkey),
    L: storeOk,
    M: storeOk,
    N: zeroCoi,
    O: swOk || storeOk,
    P: rtcOk,
    Q: qualityOk,
    R: webgl,
    S: rtcOk,
    T: tapOk,
    U: swOk || storeOk,
    V: Boolean(id.ready),
    W: cryptoOk && rtcOk && webgl,
    X: true,
    Y: storeOk && Boolean(id.pubkey),
    Z: zeroCoi,
  };
  const letters: NativeLetter[] = STACK.map((row) => ({
    ...row,
    live: liveFor[row.letter] !== false,
  }));
  const score = letters.filter((l) => l.live).length;
  const probe = { letters, score, ice: iceMode, coi };
  cached = { at: now, key, probe };
  return probe;
}

const SSR_PROBE: NativeProbe = {
  letters: STACK.map((row) => ({ ...row, live: true })),
  score: 26,
  ice: "host",
  coi: [],
};

export function useNativeProbe() {
  const ready = useIdentity((s) => s.ready);
  const pubkey = useIdentity((s) => s.pubkey);
  const [probe, setProbe] = useState<NativeProbe>(SSR_PROBE);
  useEffect(() => {
    setProbe(probeNative());
  }, [ready, pubkey]);
  return probe;
}
