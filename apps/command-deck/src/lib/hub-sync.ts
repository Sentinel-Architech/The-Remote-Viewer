import { create } from "zustand";
import { P2PRoom, type PeerInfo } from "@/lib/multiplayer";
import { exportSeedB64, signPayload, useIdentity } from "@/lib/identity";
import {
  canonDossier,
  parseSnapshot,
  readSnapshot,
  snapshotEqual,
  useProgress,
} from "@/lib/progress";
import { getDossier, putDossier, putPair, takePair } from "@/lib/hub";

export type HubMode = "idle" | "link" | "join";

export type HubDevice = {
  id: string;
  name: string;
  live: boolean;
  rttMs: number | null;
};

type HubState = {
  mode: HubMode;
  pin: string;
  joinInput: string;
  live: number;
  devices: HubDevice[];
  lastSync: number | null;
  error: string | null;
  linkingUntil: number;
};

const CHANNEL = "trv-hub-v1";
const PAIR_MS = 90_000;
const enc = new TextEncoder();
const dec = new TextDecoder();

let started = false;
let channel: BroadcastChannel | null = null;
let hubRoom: P2PRoom | null = null;
let pairRoom: P2PRoom | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pairTimer: ReturnType<typeof setTimeout> | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastPushed = "";
let applying = false;
let joining = false;
let peerId = "";
let meshLock: Promise<void> = Promise.resolve();

export const useHub = create<HubState>(() => ({
  mode: "idle",
  pin: "",
  joinInput: "",
  live: 1,
  devices: [],
  lastSync: null,
  error: null,
  linkingUntil: 0,
}));

function deviceName() {
  if (typeof window === "undefined") return "Deck";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 700px)").matches;
  if (coarse && narrow) return "Phone";
  if (coarse) return "Tablet";
  return "Deck";
}

function sessionPeerId() {
  if (typeof window === "undefined") return "t0";
  try {
    const rec = sessionStorage.getItem("trv-hub-tab-v1");
    if (rec && /^[a-zA-Z0-9_-]{2,16}$/.test(rec)) return rec;
    const id = `t${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("trv-hub-tab-v1", id);
    return id;
  } catch {
    return `t${Math.random().toString(36).slice(2, 10)}`;
  }
}

function hubRoomId(pubkey: string) {
  const cleaned = pubkey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 31);
  return `h${cleaned || "0"}`;
}

function mintPin() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => String(b % 10)).join("");
}

async function derivePinKey(pin: string) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(`trv-hub-pair-v1:${pin}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function wrapSeed(pin: string, seedB64: string) {
  const key = await derivePinKey(pin);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(seedB64));
  const pack = new Uint8Array(12 + new Uint8Array(ct).byteLength);
  pack.set(iv, 0);
  pack.set(new Uint8Array(ct), 12);
  let s = "";
  pack.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s);
}

async function unwrapSeed(pin: string, wrap: string) {
  const bin = atob(wrap);
  const pack = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) pack[i] = bin.charCodeAt(i);
  if (pack.byteLength < 13) throw new Error("Pair wrap rejected");
  const iv = pack.slice(0, 12);
  const ct = pack.slice(12);
  const key = await derivePinKey(pin);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

function brief(text: string) {
  void import("@/components/playground/store").then(({ usePlayground }) => {
    usePlayground.getState().pushBrief(text);
  });
}

function setDevices(peers: PeerInfo[]) {
  const livePeers = peers.filter((p) => p.connectionState === "connected");
  const self = deviceName();
  const devices: HubDevice[] = [
    { id: peerId || "self", name: self, live: true, rttMs: 0 },
    ...livePeers.map((p) => ({
      id: p.id,
      name: p.name || "Device",
      live: true,
      rttMs: p.rttMs,
    })),
  ];
  useHub.setState({ devices, live: devices.length });
}

function ingest(raw: unknown) {
  const snap = parseSnapshot(raw);
  if (!snap) return;
  applying = true;
  const changed = useProgress.getState().applyRemote(snap);
  applying = false;
  if (changed) useHub.setState({ lastSync: Date.now(), error: null });
}

async function signedPut() {
  const id = useIdentity.getState();
  if (!id.pubkey) return;
  const snap = readSnapshot();
  const canon = canonDossier(id.pubkey, snap);
  if (canon === lastPushed) return;
  lastPushed = canon;
  channel?.postMessage({ t: "dossier", d: snap });
  hubRoom?.send({ t: "dossier", d: snap });
  useHub.setState({ lastSync: Date.now(), error: null });
  if (id.curve !== "ed25519") return;
  const sig = await signPayload(canon);
  if (!sig) return;
  try {
    await putDossier({
      data: {
        pubkey: id.pubkey,
        sig,
        ...snap,
      },
    });
    useHub.setState({ lastSync: Date.now(), error: null });
  } catch (err) {
    lastPushed = "";
    useHub.setState({ error: err instanceof Error ? err.message : "HUB push failed" });
  }
}

function queuePush() {
  if (applying) return;
  if (pushTimer) return;
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void signedPut();
  }, 280);
}

async function pullRemote() {
  const id = useIdentity.getState();
  if (!id.pubkey) return;
  try {
    const row = await getDossier({ data: { pubkey: id.pubkey } });
    if (row) ingest(row);
  } catch (err) {
    useHub.setState({ error: err instanceof Error ? err.message : "HUB pull failed" });
  }
}

function closePair() {
  if (pairTimer) {
    clearTimeout(pairTimer);
    pairTimer = null;
  }
  pairRoom?.close();
  pairRoom = null;
}

function closeHubMesh() {
  hubRoom?.close();
  hubRoom = null;
}

function joinHubMesh() {
  meshLock = meshLock.then(joinHubMeshInner, joinHubMeshInner);
  return meshLock;
}

async function joinHubMeshInner() {
  const id = useIdentity.getState();
  if (!id.pubkey) return;
  closeHubMesh();
  const room = hubRoomId(id.pubkey);
  const selfId = peerId || sessionPeerId();
  peerId = selfId;
  const p2p = new P2PRoom({
    room,
    selfId,
    name: deviceName(),
    onPeersChanged: (peers) => {
      setDevices(peers);
      const ids = [selfId, ...peers.map((p) => p.id)].sort();
      if (peers.some((p) => p.connectionState === "connected") && ids[0] === selfId) {
        hubRoom?.send({ t: "dossier", d: readSnapshot() });
      }
    },
    onMessage: (_from, data) => {
      const msg = data as { t?: string; d?: unknown };
      if (msg?.t === "dossier") ingest(msg.d);
    },
  });
  hubRoom = p2p;
  await p2p.join();
  setDevices(p2p.peerList());
}

async function openPairRoom(pin: string, host: boolean) {
  closePair();
  const selfId = peerId || sessionPeerId();
  peerId = selfId;
  const p2p = new P2PRoom({
    room: `pair${pin}`,
    selfId,
    name: deviceName(),
    onPeersChanged: (peers) => {
      if (!host) return;
      if (!peers.some((p) => p.connectionState === "connected")) return;
      const seed = exportSeedB64();
      if (!seed) return;
      void wrapSeed(pin, seed).then((wrap) => {
        p2p.send({ t: "seed", wrap });
      });
    },
    onMessage: (_from, data) => {
      const msg = data as { t?: string; wrap?: string };
      if (msg?.t === "seed" && typeof msg.wrap === "string") {
        void finishJoin(pin, msg.wrap);
      }
    },
  });
  pairRoom = p2p;
  await p2p.join();
}

async function finishJoin(pin: string, wrap: string) {
  if (joining) return;
  joining = true;
  try {
    const seed = await unwrapSeed(pin, wrap);
    await useIdentity.getState().adopt(seed);
    closePair();
    useHub.setState({
      mode: "idle",
      pin: "",
      joinInput: "",
      error: null,
      linkingUntil: 0,
    });
    brief("HUB joined. This device is the same Remote Viewer.");
    await joinHubMesh();
    await pullRemote();
    queuePush();
    channel?.postMessage({ t: "identity" });
  } catch (err) {
    useHub.setState({ error: err instanceof Error ? err.message : "Join failed" });
  } finally {
    joining = false;
  }
}

export function startLink() {
  const cur = useHub.getState();
  if (cur.mode === "link") {
    stopLink();
    return;
  }
  const id = useIdentity.getState();
  const seed = exportSeedB64();
  if (!id.pubkey || !seed) {
    useHub.setState({ error: "Viewer key not ready" });
    return;
  }
  const pin = mintPin();
  useHub.setState({
    mode: "link",
    pin,
    joinInput: "",
    error: null,
    linkingUntil: Date.now() + PAIR_MS,
  });
  void wrapSeed(pin, seed)
    .then((wrap) => putPair({ data: { pin, wrap, pubkey: id.pubkey } }))
    .then(() => openPairRoom(pin, true))
    .catch((err: unknown) => {
      useHub.setState({ error: err instanceof Error ? err.message : "Link failed" });
    });
  if (pairTimer) clearTimeout(pairTimer);
  pairTimer = setTimeout(() => stopLink(), PAIR_MS);
  brief("HUB link open. Tap Join on the other device and enter the six digits.");
}

export function stopLink() {
  closePair();
  useHub.setState({ mode: "idle", pin: "", linkingUntil: 0 });
}

export function startJoin() {
  const cur = useHub.getState();
  if (cur.mode === "join") {
    stopJoin();
    return;
  }
  closePair();
  useHub.setState({ mode: "join", pin: "", joinInput: "", error: null, linkingUntil: 0 });
}

export function stopJoin() {
  closePair();
  useHub.setState({ mode: "idle", joinInput: "", error: null });
}

export function tapDigit(d: string) {
  if (!/^\d$/.test(d)) return;
  const cur = useHub.getState();
  if (cur.mode !== "join") return;
  const joinInput = (cur.joinInput + d).slice(0, 6);
  useHub.setState({ joinInput, error: null });
  if (joinInput.length === 6) void submitJoin(joinInput);
}

export function backspaceJoin() {
  const cur = useHub.getState();
  if (cur.mode !== "join") return;
  useHub.setState({ joinInput: cur.joinInput.slice(0, -1) });
}

export async function submitJoin(pin = useHub.getState().joinInput) {
  if (!/^\d{6}$/.test(pin)) {
    useHub.setState({ error: "Enter six digits" });
    return;
  }
  useHub.setState({ error: null });
  void openPairRoom(pin, false);
  for (let i = 0; i < 10; i++) {
    const mode = useHub.getState().mode;
    if (mode === "idle" && i > 0) return;
    try {
      const ticket = await takePair({ data: { pin } });
      if (ticket?.wrap) {
        await finishJoin(pin, ticket.wrap);
        return;
      }
    } catch (err) {
      useHub.setState({ error: err instanceof Error ? err.message : "Join failed" });
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  if (useHub.getState().mode !== "idle") {
    useHub.setState({ error: "Code expired or not yet open. Tap Link on the other device." });
  }
}

export async function startHub() {
  if (typeof window === "undefined") return;
  if (started) return;
  started = true;
  peerId = sessionPeerId();
  await useIdentity.getState().init();
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (ev: MessageEvent<{ t?: string; d?: unknown }>) => {
      const msg = ev.data;
      if (msg?.t === "dossier") ingest(msg.d);
      if (msg?.t === "identity") void useIdentity.getState().reload().then(() => joinHubMesh());
    };
  } catch {
    channel = null;
  }
  window.addEventListener("storage", (e) => {
    if (e.key === "trv-deck-identity-v1") {
      void useIdentity.getState().reload().then(() => joinHubMesh());
    }
  });
  useProgress.subscribe((s, prev) => {
    if (applying) return;
    if (
      snapshotEqual(
        {
          xp: s.xp,
          seizes: s.seizes,
          healed: s.healed,
          cleared: s.cleared,
          watches: s.watches,
          learned: s.learned,
          seq: s.seq,
        },
        {
          xp: prev.xp,
          seizes: prev.seizes,
          healed: prev.healed,
          cleared: prev.cleared,
          watches: prev.watches,
          learned: prev.learned,
          seq: prev.seq,
        },
      )
    ) {
      return;
    }
    queuePush();
  });
  useIdentity.subscribe((s, prev) => {
    if (s.pubkey && s.pubkey !== prev.pubkey) void joinHubMesh();
  });
  await joinHubMesh();
  await pullRemote();
  queuePush();
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (useHub.getState().live <= 1) void pullRemote();
  }, 2000);
}

export function formatPin(pin: string) {
  const p = pin.replace(/\D/g, "").slice(0, 6).padEnd(6, "·");
  return `${p.slice(0, 3)} ${p.slice(3)}`;
}

export function ingestDossier(raw: unknown) {
  ingest(raw);
}

export function pushHubNow() {
  return signedPut();
}

export function pullHubNow() {
  return pullRemote();
}
