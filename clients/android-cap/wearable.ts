export type AudioRoute = "none" | "phone" | "watch" | "headset";
export type HapticsClass = "none" | "basic" | "rich";
export type KeyCustodyWear = "none" | "phone_bridged";

export type WearablePotential = {
  audioRoute: AudioRoute;
  haptics: HapticsClass;
  glanceApp: boolean;
  keyCustody: KeyCustodyWear;
  /** Paired and OS reports ready */
  paired: boolean;
  notes: string[];
};

export type WearableProbe = {
  hasBtAudio: boolean;
  hasWatchSession: boolean;
  hasHeadsetRoute: boolean;
  haptics: HapticsClass;
  glanceAppInstalled: boolean;
};

export function mapWearable(p: WearableProbe): WearablePotential {
  const notes: string[] = [];
  let audioRoute: AudioRoute = "none";
  if (p.hasHeadsetRoute) audioRoute = "headset";
  else if (p.hasWatchSession) audioRoute = "watch";
  else if (p.hasBtAudio) audioRoute = "phone";

  if (audioRoute === "none") notes.push("No wearable audio route");
  if (!p.glanceAppInstalled) notes.push("No glance app — entitlement only on phone");

  return {
    audioRoute,
    haptics: p.haptics,
    glanceApp: p.glanceAppInstalled,
    keyCustody: "phone_bridged",
    paired: p.hasWatchSession || p.hasHeadsetRoute || p.hasBtAudio,
    notes,
  };
}
