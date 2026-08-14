/**
 * Communication Freedom entitlement.
 * FREE + UNLIMITED in-network human communication when:
 *   - yearly subscription active, OR
 *   - Viewer opted to be hosted as a node AND node is on (reward path)
 *
 * SCAFFOLD: local flags until live billing + node registry.
 * See docs/locked/15-Communication-Freedom.md
 */

import * as SecureStore from 'expo-secure-store';

const KEY_SUB = 'trv_entitlement_subscription_v1';
const KEY_NODE = 'trv_entitlement_node_host_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type SubscriptionRecord = {
  active: boolean;
  expiresAt: string | null;
  plan: 'yearly';
};

/** Viewer who opted to be hosted as a node — rewarded with unlimited comms while on. */
export type NodeHostRecord = {
  /** Explicit opt-in to be hosted as a node */
  nodeHostingOptIn: boolean;
  /** Node currently on / reachable */
  nodeOn: boolean;
  /** Optional: Path B / permanent validator class */
  builtValidator: boolean;
  permanent: boolean;
  label?: string;
};

export type EntitlementSnapshot = {
  entitled: boolean;
  viaSubscription: boolean;
  /** Reward path: opted to host as node + node on */
  viaNodeHost: boolean;
  subscription: SubscriptionRecord;
  node: NodeHostRecord;
  freeUnlimitedComms: boolean;
};

const DEFAULT_SUB: SubscriptionRecord = {
  active: false,
  expiresAt: null,
  plan: 'yearly',
};

const DEFAULT_NODE: NodeHostRecord = {
  nodeHostingOptIn: false,
  nodeOn: false,
  builtValidator: false,
  permanent: false,
};

function subValid(sub: SubscriptionRecord): boolean {
  if (!sub.active || !sub.expiresAt) return false;
  const exp = Date.parse(sub.expiresAt);
  return !Number.isNaN(exp) && exp > Date.now();
}

/** Reward: every opted-in node host with node on gets unlimited comms. */
function nodeHostRewardValid(node: NodeHostRecord): boolean {
  return node.nodeHostingOptIn && node.nodeOn;
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

export async function getNodeHost(): Promise<NodeHostRecord> {
  const raw = await SecureStore.getItemAsync(KEY_NODE);
  if (!raw) return { ...DEFAULT_NODE };
  try {
    const parsed = { ...DEFAULT_NODE, ...JSON.parse(raw) } as NodeHostRecord;
    // Migrate older permanent-validator-only records into opt-in host shape
    if (parsed.builtValidator && parsed.permanent && !parsed.nodeHostingOptIn) {
      parsed.nodeHostingOptIn = true;
    }
    return parsed;
  } catch {
    return { ...DEFAULT_NODE };
  }
}

/** @deprecated use getNodeHost */
export async function getPermanentNode(): Promise<NodeHostRecord> {
  return getNodeHost();
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

export async function setNodeHost(
  partial: Partial<NodeHostRecord>
): Promise<NodeHostRecord> {
  const current = await getNodeHost();
  const next: NodeHostRecord = { ...current, ...partial };
  await SecureStore.setItemAsync(KEY_NODE, JSON.stringify(next), OPTIONS);
  return next;
}

/** @deprecated use setNodeHost */
export async function setPermanentNode(
  partial: Partial<NodeHostRecord>
): Promise<NodeHostRecord> {
  return setNodeHost(partial);
}

export async function getEntitlement(): Promise<EntitlementSnapshot> {
  const subscription = await getSubscription();
  const node = await getNodeHost();
  const viaSubscription = subValid(subscription);
  const viaNodeHost = nodeHostRewardValid(node);
  const entitled = viaSubscription || viaNodeHost;
  return {
    entitled,
    viaSubscription,
    viaNodeHost,
    subscription,
    node,
    freeUnlimitedComms: entitled,
  };
}

export async function canUseFreeUnlimitedComms(): Promise<boolean> {
  const snap = await getEntitlement();
  return snap.freeUnlimitedComms;
}

export async function activateYearlySubscriptionScaffold(): Promise<SubscriptionRecord> {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  return setSubscription({
    active: true,
    expiresAt: expires.toISOString(),
    plan: 'yearly',
  });
}

/** Opt in to be hosted as a node and turn node on — reward = unlimited comms. */
export async function optInNodeHostScaffold(
  label = 'Viewer node host'
): Promise<NodeHostRecord> {
  return setNodeHost({
    nodeHostingOptIn: true,
    nodeOn: true,
    label,
  });
}

/** @deprecated use optInNodeHostScaffold */
export async function activatePermanentNodeScaffold(
  label = 'Viewer node host'
): Promise<NodeHostRecord> {
  return optInNodeHostScaffold(label);
}

export async function setNodeOn(on: boolean): Promise<NodeHostRecord> {
  return setNodeHost({ nodeOn: on });
}

export async function optOutNodeHost(): Promise<NodeHostRecord> {
  return setNodeHost({
    nodeHostingOptIn: false,
    nodeOn: false,
  });
}
