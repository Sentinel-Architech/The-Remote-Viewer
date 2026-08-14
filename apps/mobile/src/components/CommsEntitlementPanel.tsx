/**
 * Communication Freedom status + scaffold controls.
 * FREE unlimited TRV human comms via yearly sub OR permanent node on.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import {
  getEntitlement,
  activateYearlySubscriptionScaffold,
  activatePermanentNodeScaffold,
  setNodeOn,
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
        ? 'Suscripción anual de andamiaje activada (365 días). Comunicación TRV libre e ilimitada.'
        : 'Scaffold yearly subscription active (365 days). TRV communication free and unlimited.'
    );
  };

  const onNode = async () => {
    await activatePermanentNodeScaffold();
    await refresh();
    Alert.alert(
      isEs ? 'Nodo' : 'Node',
      isEs
        ? 'Validador permanente marcado como ENCENDIDO. Comunicación TRV libre e ilimitada.'
        : 'Permanent validator marked ON. TRV communication free and unlimited.'
    );
  };

  const toggleNode = async () => {
    if (!snap.node.builtValidator || !snap.node.permanent) {
      await onNode();
      return;
    }
    await setNodeOn(!snap.node.nodeOn);
    await refresh();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isEs ? 'Libertad de comunicación' : 'Communication Freedom'}
      </Text>
      <Text style={styles.hint}>
        {isEs
          ? 'Habla, texto, voz, web y otros canales humanos en la red TRV son GRATIS e ILIMITADOS con suscripción anual O un validador permanente con nodo ENCENDIDO. Muchos nodos = red activa y más segura. No incluye minutos de operadoras externas.'
          : 'Talk, text, voice, web, and other human channels on the TRV network are FREE and UNLIMITED with a yearly subscription OR a permanent validator with node ON. Many nodes keep the network active and safer. Does not include external carrier minutes.'}
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
        {isEs ? 'Nodo validador permanente: ' : 'Permanent validator node: '}
        <Text style={styles.mono}>
          {snap.viaPermanentNode
            ? isEs
              ? 'construido · permanente · ENCENDIDO'
              : 'built · permanent · ON'
            : snap.node.builtValidator && snap.node.permanent
              ? isEs
                ? 'permanente · APAGADO'
                : 'permanent · OFF'
              : isEs
                ? 'no configurado'
                : 'not configured'}
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
        style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
        onPress={toggleNode}
      >
        <Text style={styles.btnText}>
          {snap.node.nodeOn && snap.node.permanent
            ? isEs
              ? 'Apagar nodo permanente'
              : 'Turn permanent node OFF'
            : isEs
              ? 'Nodo permanente ENCENDIDO (andamiaje)'
              : 'Permanent node ON (scaffold)'}
        </Text>
      </Pressable>
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
    marginBottom: 12,
  },
  badgeOn: { backgroundColor: '#0d3d24' },
  badgeOff: { backgroundColor: '#3a1515' },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  row: { color: '#bbb', fontSize: 13, marginBottom: 6 },
  mono: { color: '#cfc', fontFamily: 'monospace', fontSize: 12 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
