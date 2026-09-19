/**
 * Native MoE Expert Registry
 * All experts are local, open-source, and fully operational offline.
 */

import { integrityExpert } from "./integrity.js";
import { identityExpert } from "./identity.js";
import { postureExpert } from "./posture.js";
import { networkExpert } from "./network.js";
import { threatExpert } from "./threat.js";
import type { Expert } from "../types.js";

export {
  integrityExpert,
  identityExpert,
  postureExpert,
  networkExpert,
  threatExpert,
};

export const ALL_EXPERTS: Expert[] = [
  integrityExpert,
  identityExpert,
  postureExpert,
  networkExpert,
  threatExpert,
];
