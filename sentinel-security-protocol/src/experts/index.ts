/**
 * Native MoE Expert Registry
 * All experts are local, open-source, and fully operational offline.
 */

export { integrityExpert } from "./integrity.js";
export { identityExpert } from "./identity.js";
export { postureExpert } from "./posture.js";
export { networkExpert } from "./network.js";
export { threatExpert } from "./threat.js";

import { integrityExpert } from "./integrity.js";
import { identityExpert } from "./identity.js";
import { postureExpert } from "./posture.js";
import { networkExpert } from "./network.js";
import { threatExpert } from "./threat.js";
import type { Expert } from "../types.js";

export const ALL_EXPERTS: Expert[] = [
  integrityExpert,
  identityExpert,
  postureExpert,
  networkExpert,
  threatExpert,
];
