import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NOW_FORCE,
  PHYSICS_STEP,
  applyMobileForce,
  ccdFor,
  csfPulse,
  fieldForce,
  fieldForcesActive,
  forceScaleFor,
  physicsBand,
  physicsLine,
  physicsProfile,
  shouldForceBody,
  shouldWake,
  type ForceTarget,
} from "./physics.ts";

const DECK_Q = { power: "high-performance" as const, coarse: false };
const FIELD_Q = { power: "low-power" as const, coarse: true };

function fakeBody(opts: {
  dynamic?: boolean;
  sleeping?: boolean;
  t?: { x: number; y: number; z: number };
  mass?: number;
}): ForceTarget & { forces: { force: { x: number; y: number; z: number }; wake: boolean }[] } {
  const forces: { force: { x: number; y: number; z: number }; wake: boolean }[] = [];
  return {
    forces,
    isDynamic: () => opts.dynamic !== false,
    isSleeping: () => Boolean(opts.sleeping),
    translation: () => opts.t ?? { x: 1, y: 2, z: 0.5 },
    mass: () => opts.mass ?? 1,
    addForce(force, wakeUp) {
      forces.push({ force: { ...force }, wake: wakeUp });
    },
  };
}

describe("physics profile", () => {
  it("keeps a fixed 1/60 step on every device", () => {
    const deck = physicsProfile(DECK_Q);
    const field = physicsProfile(FIELD_Q);
    assert.equal(deck.timeStep, PHYSICS_STEP);
    assert.equal(field.timeStep, PHYSICS_STEP);
    assert.equal(PHYSICS_STEP, 1 / 60);
    assert.equal(deck.interpolate, true);
    assert.equal(field.interpolate, true);
  });

  it("scales solver and geometry down on the field band", () => {
    assert.equal(physicsBand(DECK_Q), "deck");
    assert.equal(physicsBand(FIELD_Q), "field");
    const deck = physicsProfile(DECK_Q);
    const field = physicsProfile(FIELD_Q);
    assert.ok(field.solver <= deck.solver);
    assert.equal(field.solver, 4);
    assert.equal(deck.solver, 5);
    assert.equal(field.pgs, 1);
    assert.equal(deck.pgs, 1);
    assert.equal(field.forceEvery, 2);
    assert.equal(deck.forceEvery, 1);
    assert.equal(field.ornament, false);
    assert.equal(deck.ornament, true);
    assert.ok(field.sphere[0] < deck.sphere[0]);
    assert.ok(field.earth[0] < deck.earth[0]);
    assert.match(physicsLine(field), /Rapier field 4\/1/);
  });

  it("keeps CCD off in Neural Link and on in God's Eye", () => {
    const deck = physicsProfile(DECK_Q);
    const field = physicsProfile(FIELD_Q);
    assert.equal(ccdFor("neural", deck), false);
    assert.equal(ccdFor("neural", field), false);
    assert.equal(ccdFor("orbit", deck), true);
    assert.equal(ccdFor("orbit", field), true);
    assert.equal(deck.ccdNeural, false);
    assert.equal(deck.maxCcdSubsteps, 1);
  });
});

describe("field forces", () => {
  it("freezes swirl during WAIT and keeps SNAP NOW hotter", () => {
    assert.equal(fieldForcesActive(true), false);
    assert.equal(fieldForcesActive(false), true);
    const base = fieldForce("neural", { x: 1, y: 0, z: 2 }, 1, 9.81, 0, false);
    const now = fieldForce("neural", { x: 1, y: 0, z: 2 }, 1, 9.81, 0, true);
    assert.ok(base && now);
    assert.ok(Math.abs(now.x) > Math.abs(base.x));
    assert.ok(Math.abs(now.x / base.x - NOW_FORCE) < 1e-9);
  });

  it("swirls Neural Link in the CSF plane and pulls God's Eye inward", () => {
    const neural = fieldForce("neural", { x: 1, y: 0, z: 2 }, 1, 9.81, 0.4, false);
    assert.ok(neural);
    assert.ok(neural.x < 0);
    assert.ok(neural.z > 0);
    const orbit = fieldForce("orbit", { x: 4, y: 0, z: 0 }, 1, 9.81, 0, false);
    assert.ok(orbit);
    assert.ok(orbit.x < 0);
    assert.ok(Math.abs(orbit.y) < 1e-12);
    assert.ok(Math.abs(orbit.z) < 1e-12);
    assert.equal(fieldForce("orbit", { x: 0, y: 0, z: 0 }, 1, 9.81, 0, false), null);
  });

  it("applies every other step on the field and doubles the force to keep the mean", () => {
    assert.equal(forceScaleFor(1, 2, false), 0);
    assert.equal(forceScaleFor(2, 2, false), 2);
    assert.equal(forceScaleFor(2, 2, true), 1);
    assert.equal(forceScaleFor(7, 1, false), 1);
  });

  it("lets Neural Link sleepers rest except on a CSF pulse or NOW", () => {
    const restPhase = Math.asin(0) / 1.15;
    assert.equal(csfPulse(restPhase), false);
    assert.equal(shouldForceBody("neural", true, true, restPhase, false), false);
    assert.equal(shouldWake("neural", true, restPhase, false), false);
    assert.equal(shouldForceBody("neural", true, true, restPhase, true), true);
    assert.equal(shouldWake("neural", true, restPhase, true), true);
    const wakePhase = (Math.PI / 2) / 1.15;
    assert.equal(csfPulse(wakePhase), true);
    assert.equal(shouldForceBody("neural", true, true, wakePhase, false), true);
    assert.equal(shouldForceBody("neural", false, false, wakePhase, true), false);
  });

  it("never lets God's Eye sleep through the pull", () => {
    assert.equal(shouldForceBody("orbit", true, true, 0, false), true);
    assert.equal(shouldWake("orbit", true, 0, false), true);
    const body = fakeBody({ sleeping: true, t: { x: 3, y: 0, z: 0 } });
    assert.equal(applyMobileForce(body, "orbit", 9.81, false, 0, 1), true);
    assert.equal(body.forces.length, 1);
    assert.equal(body.forces[0]?.wake, true);
    assert.ok((body.forces[0]?.force.x ?? 0) < 0);
  });

  it("does not wake a resting Neural Link virion between CSF pulses", () => {
    const restPhase = 0;
    const body = fakeBody({ sleeping: true, t: { x: 1, y: 1, z: 1 } });
    assert.equal(csfPulse(restPhase), false);
    assert.equal(applyMobileForce(body, "neural", 9.81, false, restPhase, 1), false);
    assert.equal(body.forces.length, 0);
  });
});
