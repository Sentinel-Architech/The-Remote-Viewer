const DB = "trv-media";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("blobs")) req.result.createObjectStore("blobs");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putMedia(id: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("blobs", "readwrite");
    tx.objectStore("blobs").put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMediaUrl(id: string): Promise<string | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction("blobs", "readonly");
    const q = tx.objectStore("blobs").get(id);
    q.onsuccess = () => resolve(q.result as Blob | undefined);
    q.onerror = () => reject(q.error);
  });
  return blob ? URL.createObjectURL(blob) : null;
}

export function newMediaId(kind: string) {
  return `${kind}-${crypto.randomUUID()}`;
}

export function pickMaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  const score = (v: SpeechSynthesisVoice) => {
    const n = `${v.name} ${v.voiceURI} ${v.lang}`.toLowerCase();
    if (/female|samantha|karen|moira|tessa|zira|susan|salli|ivy|joanna|kendra|kimberly|salli|fiona|veena|victoria/.test(n)) return -2;
    if (/male|daniel|david|alex|fred|arthur|george|thomas|gordon|reed|baritone|ravi|matthew|justin|joey/.test(n)) return 3;
    if (v.lang.toLowerCase().startsWith("en")) return 1;
    return 0;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0] ?? null;
}

export function announce(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 0.72;
    const male = pickMaleVoice();
    if (male) u.voice = male;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no speech */
  }
}

export const VOICE_ROUTES: { say: string; to: string }[] = [
  { say: "command", to: "/hub" },
  { say: "os", to: "/hub/os" },
  { say: "forum", to: "/hub/forum" },
  { say: "studio", to: "/hub/create" },
  { say: "shop", to: "/hub/shop" },
  { say: "live", to: "/hub/live" },
  { say: "friends", to: "/hub/friends" },
  { say: "hydra", to: "/hub/hydra" },
  { say: "mesh", to: "/hub/mesh" },
  { say: "neuron", to: "/hub/neuron" },
  { say: "clips", to: "/hub/clips" },
  { say: "theme", to: "/hub/theme" },
  { say: "profile", to: "/hub/profile" },
  { say: "settings", to: "/hub/settings" },
  { say: "billing", to: "/hub/billing" },
  { say: "browser", to: "/hub/browser" },
  { say: "shield", to: "/hub/browser" },
];

export function matchVoiceRoute(said: string): string | null {
  const t = said.toLowerCase();
  const hit = VOICE_ROUTES.find((r) => t.includes(`open ${r.say}`) || t.includes(`go to ${r.say}`) || t.includes(`go ${r.say}`));
  return hit?.to ?? null;
}
