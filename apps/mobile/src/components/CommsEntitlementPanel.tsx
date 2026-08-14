/**
 * Communication Freedom — yearly sub OR node-host opt-in reward.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import {
  getEntitlement,
  activateYearlySubscriptionScaffold,
  optInNodeHostScaffold,
  setNodeOn,
  optOutNodeHost,
  EntitlementSnapshot,
} from '../services/entitlement';
import type { Locale } from '../i18n/strings';

type Props = { locale?: Locale };

export function CommsEntitlementPanel({ locale = 'en' }: Props) {
  const [snap, setSnap] = useState<EntitlementSnapshot | null>(null);
  const isEs = locale === 'es';

  const refresh = useCallback(async () => {
    setSnap(await getEntitlement());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!snap) return null;

  const onSub = async () => {
    await activateYearlySubscriptionScaffold();
    await refresh();
    Alert.alert(
      isEs ? 'Suscripción' : 'Subscription',
      isEs
        ? 'Suscripción anual (andamiaje) activa. Comunicación TRV libre e ilimitada.'
        : 'Yearly subscription (scaffold) active. TRV communication free and unlimited.'
    );
  };

  const onOptInHost = async () => {
    await optInNodeHostScaffold();
    await refresh();
    Alert.alert(
      isEs ? 'Nodo anfitrión' : 'Node host',
      isEs
        ? 'Ha optado por ser alojado como nodo y está ENCENDIDO. Recompensa: comunicación TRV ilimitada.'
        : 'You opted to be hosted as a node and it is ON. Reward: unlimited TRV communication.'
    );
  };

  const toggleNodePower = async () => {
    if (!snap.node.nodeHostingOptIn) {
      await onOptInHost();
      return;
    }
    await setNodeOn(!snap.node.nodeOn);
    await refresh();
  };

  const onOptOut = async () => {
    await optOutNodeHost();
    await refresh();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isEs ? 'Libertad de comunicación' : 'Communication Freedom'}
      </Text>
      <Text style={styles.hint}>
        {isEs
          ? 'Habla, texto, voz, web y otros canales humanos en la red TRV son GRATIS e ILIMITADOS con suscripción anual O si usted opta por ser alojado como nodo (recompensa por mantener la red activa).'
          : 'Talk, text, voice, web, and other human channels on the TRV network are FREE and UNLIMITED with a yearly subscription OR if you opt to be hosted as a node (reward for keeping the network active).'}
      </Text>

      <View
        style={[
          styles.badge,
          snap.freeUnlimitedComms ? styles.badgeOn : styles.badgeOff,
        ]}
      >
        <Text style={styles.badgeText}>
          {snap.freeUnlimitedComms
            ? isEs
              ? 'ILIMITADO · GRATIS (TRV)'
              : 'UNLIMITED · FREE (TRV)'
            : isEs
              ? 'SIN ENTITLEMENT DE RED'
              : 'NO NETWORK ENTITLEMENT'}
        </Text>
      </View>

      {snap.viaNodeHost && (
        <Text style={styles.reward}>
          {isEs
            ? 'Recompensa de anfitrión de nodo activa'
            : 'Node-host reward active'}
        </Text>
      )}

      <Text style={styles.row}>
        {isEs ? 'Suscripción anual: ' : 'Yearly subscription: '}
        <Text style={styles.mono}>
          {snap.viaSubscription
            ? isEs
              ? `activa hasta ${snap.subscription.expiresAt?.slice(0, 10)}`
              : `active until ${snap.subscription.expiresAt?.slice(0, 10)}`
            : isEs
              ? 'no activa'
              : 'not active'}
        </Text>
      </Text>
      <Text style={styles.row}>
        {isEs ? 'Anfitrión de nodo: ' : 'Node host: '}
        <Text style={styles.mono}>
          {!snap.node.nodeHostingOptIn
            ? isEs
              ? 'no optó'
              : 'not opted in'
            : snap.node.nodeOn
              ? isEs
                ? 'optó · ENCENDIDO · recompensa'
                : 'opted in · ON · rewarded'
              : isEs
                ? 'optó · APAGADO (sin recompensa hasta encender)'
                : 'opted in · OFF (no reward until on)'}
        </Text>
      </Text>

      <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onSub}>
        <Text style={styles.btnText}>
          {isEs
            ? 'Activar suscripción anual (andamiaje)'
            : 'Activate yearly subscription (scaffold)'}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.btn, styles.btnPrimary, { marginTop: 8 }]}
        onPress={toggleNodePower}
      >
        <Text style={styles.btnText}>
          {!snap.node.nodeHostingOptIn
            ? isEs
              ? 'Optar por ser nodo (recompensa: ilimitado)'
              : 'Opt in to host as a node (reward: unlimited)'
            : snap.node.nodeOn
              ? isEs
                ? 'Apagar nodo (pausa recompensa)'
                : 'Turn node OFF (pause reward)'
              : isEs
                ? 'Encender nodo (activar recompensa)'
                : 'Turn node ON (activate reward)'}
        </Text>
      </Pressable>

      {snap.node.nodeHostingOptIn && (
        <Pressable
          style={[styles.btn, styles.btnGhost, { marginTop: 8 }]}
          onPress={onOptOut}
        >
          <Text style={styles.btnText}>
            {isEs ? 'Cancelar opción de nodo' : 'Opt out of node hosting'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#12140f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3a1a',
    marginBottom: 24,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#9a9', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeOn: { backgroundColor: '#0d3d24' },
  badgeOff: { backgroundColor: '#3a1515' },
  badgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  reward: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: { color: '#bbb', fontSize: 13, marginBottom: 6 },
  mono: { color: '#cfc', fontFamily: 'monospace', fontSize: 12 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSecondary: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
