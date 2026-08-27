import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Bug,
  CircleUser,
  Cpu,
  Film,
  Gauge,
  Gift,
  Globe,
  IdCard,
  KeyRound,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Palette,
  Radio,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
  Wand2,
} from "lucide-react";

export type BriefStop = {
  icon: LucideIcon;
  label: string;
  line: string;
};

export type BriefStep = {
  kicker: string;
  title: string;
  where: string;
  body: string;
  icon: LucideIcon;
  stops?: BriefStop[];
  seal?: boolean;
};

export const BRIEFING_OPEN = "trv-briefing-open";
export const BRIEFING_FLAG = "trv-briefing-now";

export function openBriefing() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BRIEFING_FLAG, "1");
  window.dispatchEvent(new Event(BRIEFING_OPEN));
}

export function closeBriefing() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BRIEFING_FLAG);
  window.dispatchEvent(new Event(BRIEFING_OPEN));
}

export const BRIEFING_STEPS: BriefStep[] = [
  {
    kicker: "Viewer briefing",
    title: "The map is optional",
    where: "Every node · after first watch",
    body: "You are a Remote Viewer. The hub is a set of stations, not a feed. This map names each one. It is optional after your first watch — take it when you want the layout, not before you stand duty.",
    icon: LayoutDashboard,
  },
  {
    kicker: "Station · Command",
    title: "Command is home",
    where: "Left rail · Command · phone Home",
    body: "Start every session here. Sentinel health, autonomy, plan, and the daily duty strip live on Command. If Citizen lock is still open, the prompt is on this page — it is not in the rail.",
    icon: LayoutDashboard,
    stops: [
      { icon: LayoutDashboard, label: "Command", line: "Node dashboard and duty strip" },
      { icon: IdCard, label: "Citizen lock", line: "Opened from Command, not the rail" },
    ],
  },
  {
    kicker: "Station · Watch",
    title: "You are the neuron",
    where: "Left rail · Defend · Mesh · Honeypot",
    body: "Daily duty is intercepting hostile packets before they reach The Sentinel. One clean intercept on Defend, Mesh, or a SENTINEL OS jack-in pulse fulfills the watch. Then claim TRV. Missed days damage Sentinel health. Honeypot arms lures so inbound tricks file themselves.",
    icon: Brain,
    stops: [
      { icon: Brain, label: "Defend", line: "Watchful Neuron — you intercept" },
      { icon: Cpu, label: "Jack in", line: "SENTINEL OS — fly the tissue" },
      { icon: Globe, label: "Mesh", line: "God's-eye globe, same watch" },
      { icon: Bug, label: "Honeypot", line: "Arm lures · trap inbound" },
    ],
  },
  {
    kicker: "Station · OS",
    title: "Sentinel OS and the mic",
    where: "Left rail · OS · header mic",
    body: "The OS is Super over Cipher, Watcher, Privacy, Mesh, and Healer — each a super in their field. Human trains machine; machine trains human. Jack in from OS or Defend to fly the tissue and write signatures into OS memory. Skill audit (rail · Audit) scores those supers against par. Mosaic leaves this device only if you send it. Speak from the mic in the phone header, or open OS on the rail.",
    icon: Cpu,
    stops: [
      { icon: Cpu, label: "OS", line: "Dispatch agents, jack-in, edge lessons" },
      { icon: Gauge, label: "Audit", line: "Skill scores · doctrine, edge, live helm" },
      { icon: Mic, label: "Speak", line: "Header mic · hands-free helm" },
    ],
  },
  {
    kicker: "Station · Audit",
    title: "Skills must stay at par",
    where: "Left rail · Audit · also from OS",
    body: "Cipher, Watcher, Privacy, Mesh, Healer, and Sentinel Super are scored on doctrine (the written skill), edge vitals (this node), and live helm probes. Below par is a wound Healer names. You run the audit — the OS does not grade itself in secret.",
    icon: Gauge,
    stops: [
      { icon: Gauge, label: "Audit", line: "Run the battery · par is 70" },
      { icon: Cpu, label: "OS", line: "Brief a super that scored short" },
    ],
  },
  {
    kicker: "Station · Signal",
    title: "Live now, then clips",
    where: "Left rail · Live · Clips",
    body: "Go live from camera, mic, or both. A green pulse on your portrait means you are live now — Command, Profile, Friends, and the public card all show it. Clips are short drops for the commons, not a second live room.",
    icon: Radio,
    stops: [
      { icon: Radio, label: "Live", line: "Broadcast · green pulse on your mark" },
      { icon: Film, label: "Clips", line: "Short media into the commons" },
    ],
  },
  {
    kicker: "Station · People",
    title: "Friends, forum, public card",
    where: "Left rail · Friends · Forum · /v/your-handle",
    body: "Friends is follow, nearby radius, and talk. Forum is the commons — posts, ratings, unlocks. Your public card is a separate surface at your handle: portrait, craft, manifesto, live ring. Wallets, credits, and the docs vault never appear on that card.",
    icon: Users,
    stops: [
      { icon: Users, label: "Friends", line: "Follow, nearby, thread" },
      { icon: MessageSquare, label: "Forum", line: "Commons posts and unlocks" },
      { icon: CircleUser, label: "Public card", line: "Share /v/handle — identity only" },
    ],
  },
  {
    kicker: "Station · Make",
    title: "Studio, market, rewards",
    where: "Left rail · Studio · Market · Rewards",
    body: "Studio mints pixel, meme, photo, and video as TRV works. Market lists and buys those works in credits. Rewards spends watch TRV on frames and chrome. USD never spends in Rewards — convert in Billing only if the watch does not cover it.",
    icon: Wand2,
    stops: [
      { icon: Wand2, label: "Studio", line: "Make and mint" },
      { icon: Store, label: "Market", line: "List, buy, creator ledger" },
      { icon: Gift, label: "Rewards", line: "Spend claimed TRV — not USD" },
    ],
  },
  {
    kicker: "Station · Rails",
    title: "Hydra, Gateway, Shield",
    where: "Left rail · Hydra · Gateway · Browser",
    body: "Hydra files anonymous packets — CSAM, trafficking, and the rest — hashed, not a public feed. Gateway is the handshake and the covenant docs. Shield is the native browser: tracker strip, hub tunnel, reader. Network talk stays live in Shield so you are not glued to Friends.",
    icon: ShieldAlert,
    stops: [
      { icon: ShieldAlert, label: "Hydra", line: "Anonymous filing, on-device censor" },
      { icon: ScrollText, label: "Gateway", line: "Handshake and process docs" },
      { icon: Shield, label: "Browser", line: "Shield fetches · hub tunnel" },
    ],
  },
  {
    kicker: "Station · Profile",
    title: "Your node, not a feed",
    where: "Left rail · Profile · phone header mark",
    body: "Profile is the dedicated Viewer page. Identity (portrait, cover, craft, status), finances (credits, wallets, ledger), and a private docs vault. Government IDs do not go in the vault — Citizen lock hashes those on this device. The live pulse sits on the portrait.",
    icon: CircleUser,
    stops: [
      { icon: CircleUser, label: "Identity", line: "Portrait, craft, public extras" },
      { icon: Landmark, label: "Finances", line: "Credits, wallets, invoices" },
      { icon: ScrollText, label: "Docs vault", line: "Private notes — never IDs" },
    ],
  },
  {
    kicker: "Station · Lock",
    title: "Citizen, billing, wallet",
    where: "Command · Billing · header key",
    body: "US Citizen lock photographs a state or federal ID and a live selfie. Images stay on this device; a one-way hash stops fake nodes. Billing is plans, USD→TRV, and Company seats. The key icon opens your PIN-locked Ed25519 vault (legacy hash addresses can upgrade on unlock). A Company owner cannot unlock a seat wallet.",
    icon: Landmark,
    stops: [
      { icon: IdCard, label: "Citizen", line: "On-device ID hash · from Command" },
      { icon: Landmark, label: "Billing", line: "Plans, convert, seats" },
      { icon: KeyRound, label: "Wallet", line: "Header key · Ed25519 PIN vault" },
    ],
  },
  {
    kicker: "Station · Chrome",
    title: "Theme, settings, evidence",
    where: "Left rail · Theme · Settings · header shield",
    body: "Theme is your skin — Signal is high contrast. Settings is the native TRV lock versus a bridged Google/X identity, plus the hub tunnel. Means of Evidence (shield-check in the header) seals camera, mic, and telemetry locally. The Sentinel needs a sealed trail. It does not upload the payload.",
    icon: Settings,
    stops: [
      { icon: Palette, label: "Theme", line: "Presets, density, contrast" },
      { icon: Settings, label: "Settings", line: "Native lock, tunnel, MoE policy" },
      { icon: ShieldCheck, label: "Means of Evidence", line: "Header shield · on-device seals" },
    ],
  },
  {
    kicker: "Viewer briefing",
    title: "Seal the map",
    where: "Optional · after first watch",
    body: "You have the stations and where they live. Phone uses Home, Defend, Mesh, Rewards on the bottom bar — everything else is More. Desktop uses the left rail. Seal when you know the map. You can open this again from Command until you seal it.",
    icon: ShieldCheck,
    seal: true,
    stops: [
      { icon: LayoutDashboard, label: "Command", line: "Home" },
      { icon: Brain, label: "Defend / Mesh / Honeypot", line: "Daily watch" },
      { icon: Cpu, label: "OS + mic", line: "Sentinel" },
      { icon: Radio, label: "Live / Clips", line: "Signal" },
      { icon: Users, label: "Friends / Forum / card", line: "People" },
      { icon: Wand2, label: "Studio / Market / Rewards", line: "Make" },
      { icon: ShieldAlert, label: "Hydra / Gateway / Shield", line: "Rails" },
      { icon: CircleUser, label: "Profile", line: "Node" },
      { icon: Landmark, label: "Citizen / Billing / Wallet", line: "Lock" },
      { icon: Settings, label: "Theme / Settings / MoE", line: "Chrome" },
    ],
  },
];
