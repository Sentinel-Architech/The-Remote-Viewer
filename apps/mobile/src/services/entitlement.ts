/**
 * Communication Freedom entitlement.
 * FREE + UNLIMITED in-network human communication when:
 *   - yearly subscription active, OR
 *   - permanent validator node is on
 *
 * SCAFFOLD: local flags until live billing + validator registry.
 * See docs/locked/15-Communication-Freedom.md
 */

import * as SecureStore from 'expo-secure-store';

const KEY_SUB = 'trv_entitlement_subscription_v1';
const KEY_NODE = 'trv_entitlement_permanent_node_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type SubscriptionRecord = {
  active: boolean;
  /** ISO date string; ignored if active is false */
  expiresAt: string | null;
  plan: 'yearly';
};

export type PermanentNodeRecord = {
  /** Viewer operates a built validator */
  builtValidator: boolean;
  /** Node marked permanent (not demo) */
  permanent: boolean;
  /** Node currently on / reachable */
  nodeOn: boolean;
  label?: string;
};

export type EntitlementSnapshot = {
  entitled: boolean;
  viaSubscription: boolean;
  viaPermanentNode: boolean;
  subscription: SubscriptionRecord;
  node: PermanentNodeRecord;
  /** Free unlimited human comms on TRV rails */
  freeUnlimitedComms: boolean;
};

const DEFAULT_SUB: SubscriptionRecord = {
  active: false,
  expiresAt: null,
  plan: 'yearly',
};

const DEFAULT_NODE: PermanentNodeRecord = {
  builtValidator: false,
  permanent: false,
  nodeOn: false,
};

function subValid(sub: SubscriptionRecord): boolean {
  if (!sub.active) return false;
  if (!sub.expiresAt) return false;
  const exp = Date.parse(sub.expiresAt);
  if (Number.isNaN(exp)) return false;
  return exp > Date.now();
}

function nodeValid(node: PermanentNodeRecord): boolean {
  return node.builtValidator && node.permanent && node.nodeOn;
}

export async function getSubscription(): Promise<SubscriptionRecord> {
  const raw = await SecureStore.getItemAsync(KEY_SUB);
  if (!raw) return { ...DEFAULT_SUB };
  try {
    return { ...DEFAULT_SUB, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SUB };
  }
}

export async function getPermanentNode(): Promise<PermanentNodeRecord> {
  const raw = await SecureStore.getItemAsync(KEY_NODE);
  if (!raw) return { ...DEFAULT_NODE };
  try {
    return { ...DEFAULT_NODE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_NODE };
  }
}

export async function setSubscription(
  partial: Partial<SubscriptionRecord>
): Promise<SubscriptionRecord> {
  const current = await getSubscription();
  const next: SubscriptionRecord = {
    ...current,
    ...partial,
    plan: 'yearly',
  };
  await SecureStore.setItemAsync(KEY_SUB, JSON.stringify(next), OPTIONS);
  return next;
}

export async function setPermanentNode(
  partial: Partial<PermanentNodeRecord>
): Promise<PermanentNodeRecord> {
  const current = await getPermanentNode();
  const next: PermanentNodeRecord = { ...current, ...partial };
  await SecureStore.setItemAsync(KEY_NODE, JSON.stringify(next), OPTIONS);
  return next;
}

export async function getEntitlement(): Promise<EntitlementSnapshot> {
  const subscription = await getSubscription();
  const node = await getPermanentNode();
  const viaSubscription = subValid(subscription);
  const viaPermanentNode = nodeValid(node);
  const entitled = viaSubscription || viaPermanentNode;
  return {
    entitled,
    viaSubscription,
    viaPermanentNode,
    subscription,
    node,
    freeUnlimitedComms: entitled,
  };
}

/**
 * Gate for network-carried human communication.
 * Local-only drafts remain available regardless.
 */
export async function canUseFreeUnlimitedComms(): Promise<boolean> {
  const snap = await getEntitlement();
  return snap.freeUnlimitedComms;
}

/** Scaffold helper: activate a 365-day yearly subscription locally. */
export async function activateYearlySubscriptionScaffold(): Promise<SubscriptionRecord> {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  return setSubscription({
    active: true,
    expiresAt: expires.toISOString(),
    plan: 'yearly',
  });
}

/** Scaffold helper: mark permanent validator node on. */
export async function activatePermanentNodeScaffold(
  label = 'Path B permanent node'
): Promise<PermanentNodeRecord> {
  return setPermanentNode({
    builtValidator: true,
    permanent: true,
    nodeOn: true,
    label,
  });
}

export async function setNodeOn(on: boolean): Promise<PermanentNodeRecord> {
  return setPermanentNode({ nodeOn: on });
}
