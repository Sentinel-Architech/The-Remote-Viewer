/**
 * Holographic RWB shield — clockwise glow while Sentinel is actively looking.
 * Shows elapsed time. Pure RN Animated (no extra deps).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

type Props = {
  active: boolean;
  /** Elapsed milliseconds while looking */
  elapsedMs: number;
  label?: string;
};

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m > 0) return `${m}:${rem.toString().padStart(2, '0')}`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function SentinelShield({ active, elapsedMs, label }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.55)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      spin.setValue(0);
      spinLoop.current = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 2800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.45,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      spinLoop.current.start();
      pulseLoop.current.start();
    } else {
      spinLoop.current?.stop();
      pulseLoop.current?.stop();
      spin.setValue(0);
      pulse.setValue(0.55);
    }
    return () => {
      spinLoop.current?.stop();
      pulseLoop.current?.stop();
    };
  }, [active, spin, pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        {/* Outer holographic ring — clockwise */}
        <Animated.View
          style={[
            styles.ringOuter,
            {
              transform: [{ rotate }],
              opacity: active ? pulse : 0.35,
            },
          ]}
        >
          <View style={[styles.arc, styles.arcRed]} />
          <View style={[styles.arc, styles.arcWhite]} />
          <View style={[styles.arc, styles.arcBlue]} />
          <View style={[styles.arc, styles.arcRedSoft]} />
        </Animated.View>

        {/* Inner counter-weight ring for depth */}
        <Animated.View
          style={[
            styles.ringInner,
            {
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-180deg'],
                  }),
                },
              ],
              opacity: active ? 0.85 : 0.3,
            },
          ]}
        >
          <View style={styles.innerDash} />
        </Animated.View>

        {/* Shield core */}
        <Animated.View
          style={[
            styles.core,
            active && styles.coreActive,
            { opacity: active ? pulse : 0.7 },
          ]}
        >
          <Text style={styles.coreGlyph}>⬡</Text>
          <Text style={styles.coreLabel}>{label || 'SENTINEL'}</Text>
        </Animated.View>
      </View>

      <Text style={[styles.status, active ? styles.statusOn : styles.statusOff]}>
        {active ? 'LOOKING' : 'STANDBY'}
      </Text>
      <Text style={styles.timer}>
        {active ? formatElapsed(elapsedMs) : '—'}
      </Text>
    </View>
  );
}

const SIZE = 168;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 12 },
  stage: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#E81B23',
    borderRightColor: '#FFFFFF',
    borderBottomColor: '#00A3E0',
    borderLeftColor: '#E81B23',
    shadowColor: '#00A3E0',
    shadowOpacity: 0.85,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  arc: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  arcRed: { top: 4, alignSelf: 'center', backgroundColor: '#E81B23' },
  arcWhite: {
    right: 8,
    top: '45%',
    backgroundColor: '#FFFFFF',
  },
  arcBlue: { bottom: 4, alignSelf: 'center', backgroundColor: '#00A3E0' },
  arcRedSoft: {
    left: 8,
    top: '45%',
    backgroundColor: '#C41E3A',
    opacity: 0.9,
  },
  ringInner: {
    position: 'absolute',
    width: SIZE - 36,
    height: SIZE - 36,
    borderRadius: (SIZE - 36) / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.55)',
  },
  innerDash: { flex: 1 },
  core: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#0a1520',
    borderWidth: 2,
    borderColor: '#1a3a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreActive: {
    borderColor: '#FFFFFF',
    shadowColor: '#E81B23',
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  coreGlyph: { color: '#fff', fontSize: 28, marginBottom: 2 },
  coreLabel: {
    color: '#9cf',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  status: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  statusOn: { color: '#2ecc71' },
  statusOff: { color: '#555' },
  timer: {
    marginTop: 4,
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
