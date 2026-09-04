import type { FieldQuality } from "@/lib/platform";

export const PHYSICS_STEP = 1 / 60;
export const NOW_FORCE = 1.85;
export const CSF_WAKE = 0.85;

export type PhysicsBand = "field" | "deck";

export type PhysicsProfile = {
  band: PhysicsBand;
  timeStep: number;
  solver: number;
  pgs: number;
  interpolate: boolean;
  ccdNeural: boolean;
  ccdOrbit: boolean;
  maxCcdSubsteps: number;
  forceEvery: 1 | 2 | 3;
  lengthUnit: number;
  aniso: number;
  ornament: boolean;
  sphere: [number, number];
  gyri: [number, number];
  skull: [number, number];
  csf: [number, number];
  earth: [number, number];
  atmo: [number, number];
  ring: [number, number];
};

const DECK: PhysicsProfile = {
  band: "deck",
  timeStep: PHYSICS_STEP,
  solver: 5,
  pgs: 1,
  interpolate: true,
  ccdNeural: false,
  ccdOrbit: true,
  maxCcdSubsteps: 1,
  forceEvery: 1,
  lengthUnit: 0.5,
  aniso: 8,
  ornament: true,
  sphere: [28, 20],
  gyri: [28, 20],
  skull: [48, 32],
  csf: [40, 28],
  earth: [64, 48],
  atmo: [32, 24],
  ring: [8, 28],
};

const FIELD: PhysicsProfile = {
  band: "field",
  timeStep: PHYSICS_STEP,
  solver: 4,
  pgs: 1,
  interpolate: true,
  ccdNeural: false,
  ccdOrbit: true,
  maxCcdSubsteps: 1,
  forceEvery: 2,
  lengthUnit: 0.5,
  aniso: 4,
  ornament: false,
  sphere: [16, 12],
  gyri: [16, 12],
  skull: [32, 20],
  csf: [24, 16],
  earth: [32, 24],
  atmo: [20, 16],
  ring: [6, 16],
};

export function physicsBand(q: Pick<FieldQuality, "power" | "coarse">): PhysicsBand {
  return q.power === "low-power" || q.coarse ? "field" : "deck";
}

export function physicsProfile(q: Pick<FieldQuality, "power" | "coarse">): PhysicsProfile {
  return physicsBand(q) === "field" ? FIELD : DECK;
}

export function ccdFor(theater: "neural" | "orbit", profile: PhysicsProfile) {
  return theater === "orbit" ? profile.ccdOrbit : profile.ccdNeural;
}

export function fieldForcesActive(wait: boolean) {
  return !wait;
}

export function forceScaleFor(step: number, forceEvery: number, now: boolean) {
  if (now || forceEvery <= 1) return 1;
  if (step % forceEvery !== 0) return 0;
  return forceEvery;
}

export function csfPulse(phase: number) {
  return Math.sin(phase * 1.15) > CSF_WAKE;
}

export function shouldForceBody(
  theater: "neural" | "orbit",
  dynamic: boolean,
  sleeping: boolean,
  phase: number,
  now: boolean,
) {
  if (!dynamic) return false;
  if (!sleeping) return true;
  if (theater === "orbit" || now) return true;
  return csfPulse(phase);
}

export function shouldWake(theater: "neural" | "orbit", sleeping: boolean, phase: number, now: boolean) {
  if (theater === "orbit") return true;
  if (now) return true;
  if (!sleeping) return false;
  return csfPulse(phase);
}

export type ForceVec = { x: number; y: number; z: number };

export function fieldForce(
  theater: "neural" | "orbit",
  t: ForceVec,
  mass: number,
  gravity: number,
  phase: number,
  now: boolean,
): ForceVec | null {
  const boost = now ? NOW_FORCE : 1;
  if (theater === "neural") {
    const pulse = 0.62 + 0.38 * Math.sin(phase * 1.15);
    const m = Math.max(mass, 0.12) * pulse * boost;
    return {
      x: -t.z * 0.28 * m,
      y: Math.sin(t.x * 0.65 + phase) * 0.16 * m,
      z: t.x * 0.28 * m,
    };
  }
  const len = Math.hypot(t.x, t.y, t.z);
  if (len < 0.05) return null;
  const mag = gravity * Math.max(mass, 0.2) * boost;
  return { x: (-t.x / len) * mag, y: (-t.y / len) * mag, z: (-t.z / len) * mag };
}

export type ForceTarget = {
  isDynamic(): boolean;
  isSleeping(): boolean;
  translation(): ForceVec;
  mass(): number;
  addForce(force: ForceVec, wakeUp: boolean): void;
};

export function applyMobileForce(
  body: ForceTarget,
  theater: "neural" | "orbit",
  gravity: number,
  now: boolean,
  phase: number,
  forceScale = 1,
) {
  if (!shouldForceBody(theater, body.isDynamic(), body.isSleeping(), phase, now)) return false;
  const force = fieldForce(theater, body.translation(), body.mass(), gravity, phase, now);
  if (!force) return false;
  if (forceScale !== 1) {
    force.x *= forceScale;
    force.y *= forceScale;
    force.z *= forceScale;
  }
  body.addForce(force, shouldWake(theater, body.isSleeping(), phase, now));
  return true;
}

export function physicsLine(profile: PhysicsProfile) {
  return `Rapier ${profile.band} ${profile.solver}/${profile.pgs} · 1/60 · CCD ${profile.ccdOrbit ? "orbit" : "off"}`;
}
