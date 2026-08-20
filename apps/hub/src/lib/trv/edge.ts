import { motionScore } from "./citizen";

export const AGENT_IDS = ["sentinel", "cipher", "watcher", "privacy", "mesh", "healer"] as const;
export type AgentId = (typeof AGENT_IDS)[number];
export type LessonDir = "h2m" | "m2h";

export const AGENTS: Record<
  AgentId,
  { name: string; duty: string; senses: string; field: string; rank: "super" | "domain-super" }
> = {
  sentinel: {
    name: "Sentinel",
    field: "the whole Network",
    rank: "super",
    duty: "Super agent. Delegates to domain supers. Learns from you; teaches you back.",
    senses: "all fields",
  },
  cipher: {
    name: "Cipher",
    field: "encryption",
    rank: "domain-super",
    duty: "Super of keys. WebCrypto, PIN wallets, Ed25519 addresses. Never asks for a seed.",
    senses: "keys",
  },
  watcher: {
    name: "Watcher",
    field: "sensing",
    rank: "domain-super",
    duty: "Super of eye and ear. Motion on-device. Mosaic only if you send it.",
    senses: "vision · mic",
  },
  privacy: {
    name: "Privacy",
    field: "policy",
    rank: "domain-super",
    duty: "Super of silence. GPC, Shield, no bulk PII. Network stays one DApp.",
    senses: "headers · policy",
  },
  mesh: {
    name: "Mesh",
    field: "defense",
    rank: "domain-super",
    duty: "Super of intercepts. Simulated attacks. Real harm is Hydra.",
    senses: "defense log",
  },
  healer: {
    name: "Healer",
    field: "recovery",
    rank: "domain-super",
    duty: "Super of R&D. Health, autonomy, wounds after a missed intercept.",
    senses: "vitals · XP",
  },
};

export function routeField(prompt: string): AgentId {
  const t = prompt.toLowerCase();
  if (/encrypt|cipher|wallet|pin|hash|aes|key/.test(t)) return "cipher";
  if (/watch|camera|mosaic|see|mic|threat|eye/.test(t)) return "watcher";
  if (/privacy|gpc|tracker|pii|ads|shield|leak/.test(t)) return "privacy";
  if (/mesh|attack|neuron|intercept|globe|pulse/.test(t)) return "mesh";
  if (/heal|health|r&d|rd |wound|autonomy/.test(t)) return "healer";
  return "sentinel";
}

export function ordersFor(id: AgentId): string {
  return {
    sentinel: "Learn from this Viewer and teach them one thing they have not named.",
    cipher: "Report the state of this node's encryption heart.",
    watcher: "Read the mosaiced gate. Any threat to this Viewer?",
    privacy: "Is this node leaking bulk PII or tracker query strings?",
    mesh: "How should this Viewer train the next intercept?",
    healer: "Read health and autonomy. What should they spend in R&D?",
  }[id];
}

export type EdgeVitals = {
  https: boolean;
  webcrypto: boolean;
  nodeKey: boolean;
  gpc: boolean;
  online: boolean;
  moeSeals: number;
  lessons: number;
  walletHint: boolean;
};

export type EdgeLesson = {
  at: string;
  agent: AgentId;
  pattern: string;
  counsel: string;
  dir: LessonDir;
};

function nodeKeyRaw(): string {
  const k = localStorage.getItem("trv-node-key") || crypto.randomUUID();
  localStorage.setItem("trv-node-key", k);
  return k;
}

async function aesKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(nodeKeyRaw().slice(0, 16).padEnd(16, "0"));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function edgeEncrypt(plain: string): Promise<string> {
  const key = await aesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  const bytes = new Uint8Array(iv.byteLength + buf.byteLength);
  bytes.set(iv);
  bytes.set(new Uint8Array(buf), iv.byteLength);
  return btoa(String.fromCharCode(...bytes));
}

export async function edgeDecrypt(pack: string): Promise<string> {
  const raw = Uint8Array.from(atob(pack), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const key = await aesKey();
  const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(buf);
}

export async function loadLessons(): Promise<EdgeLesson[]> {
  const pack = localStorage.getItem("trv-edge-lessons");
  if (!pack) return [];
  try {
    const json = await edgeDecrypt(pack);
    return (JSON.parse(json) as EdgeLesson[]).map((l) => ({
      ...l,
      dir: l.dir === "h2m" || l.dir === "m2h" ? l.dir : "m2h",
      agent: (AGENTS[l.agent as AgentId] ? l.agent : "sentinel") as AgentId,
    }));
  } catch {
    return [];
  }
}

export async function addLesson(lesson: EdgeLesson) {
  const all = await loadLessons();
  all.unshift(lesson);
  const cut = all.slice(0, 80);
  localStorage.setItem("trv-edge-lessons", await edgeEncrypt(JSON.stringify(cut)));
}

export function edgeVitals(): EdgeVitals {
  let moe = 0;
  try {
    moe = (JSON.parse(localStorage.getItem("trv-moe-seals") || "[]") as unknown[]).length;
  } catch {
    moe = 0;
  }
  let lessons = 0;
  try {
    /* count is in encrypted blob — approximate from last known */
    lessons = Number(localStorage.getItem("trv-edge-n") || "0");
  } catch {
    lessons = 0;
  }
  return {
    https: location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1",
    webcrypto: Boolean(crypto.subtle),
    nodeKey: Boolean(localStorage.getItem("trv-node-key")),
    gpc: Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl),
    online: navigator.onLine,
    moeSeals: moe,
    lessons,
    walletHint: Boolean(localStorage.getItem("trv-wallet-meta")),
  };
}

export function rememberLessonCount(n: number) {
  localStorage.setItem("trv-edge-n", String(n));
}

export function mosaicFrame(video: HTMLVideoElement, block = 14): string {
  const w = 320;
  const h = 180;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = false;
  const dw = Math.max(1, Math.floor(w / block));
  const dh = Math.max(1, Math.floor(h / block));
  ctx.drawImage(video, 0, 0, dw, dh);
  ctx.drawImage(c, 0, 0, dw, dh, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.45);
}

export function sampleMotion(video: HTMLVideoElement, frames: ImageData[]): number {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 90;
  const ctx = c.getContext("2d");
  if (!ctx) return 0;
  ctx.drawImage(video, 0, 0, 160, 90);
  frames.push(ctx.getImageData(0, 0, 160, 90));
  if (frames.length > 8) frames.shift();
  return motionScore(frames);
}
