/** Runtime flags — conservative defaults */
export type Flags = {
  freeSignal: "weak" | "standard";
  freeSearchRpm: number;
  freeConcurrentLive: number;
  areaBulletinsDefault: boolean;
  wakePhrase: string;
  tutorialVersion: string;
  continuousLearningDefault: boolean;
  conductOptInDefault: boolean;
};

export const DEFAULT_FLAGS: Flags = {
  freeSignal: "weak",
  freeSearchRpm: 10,
  freeConcurrentLive: 1,
  areaBulletinsDefault: false,
  wakePhrase: "Hey Sentinel",
  tutorialVersion: "v1",
  continuousLearningDefault: true, // on-device only
  conductOptInDefault: false,
};
