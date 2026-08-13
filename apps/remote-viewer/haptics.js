/**
 * Haptic feedback patterns for The Remote Viewer.
 * Uses Vibration API where available (Android / many mobile browsers).
 * Silent no-op when unsupported.
 */

const PATTERNS = {
  /** Short tick — UI acknowledge */
  tick: [12],
  /** AR opened */
  arOpen: [18, 40, 18],
  /** Entered claim radius for a token */
  near: [25, 30, 25],
  /** Soft proximity pulse while near (throttled by caller) */
  nearPulse: [10],
  /** Successful claim / capture */
  claimSuccess: [30, 40, 30, 40, 80],
  /** Too far / failed claim */
  claimFail: [50, 30, 50],
  /** Already claimed */
  alreadyClaimed: [40],
  /** AR closed */
  arClose: [15],
  /** Credits landed in private vault */
  vault: [20, 35, 20, 35, 20],
};

export function canHaptic() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/**
 * Fire a named pattern or a custom number/array pattern.
 * @param {keyof PATTERNS | number | number[]} nameOrPattern
 */
export function haptic(nameOrPattern) {
  if (!canHaptic()) return false;
  let pattern;
  if (typeof nameOrPattern === 'string') {
    pattern = PATTERNS[nameOrPattern];
    if (!pattern) return false;
  } else {
    pattern = nameOrPattern;
  }
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export function hapticStop() {
  if (!canHaptic()) return;
  try {
    navigator.vibrate(0);
  } catch {}
}

export { PATTERNS };
