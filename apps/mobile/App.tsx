import './crypto-polyfill';
import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import PresenceScreen from './screens/PresenceScreen';
import MessagingScreen from './screens/MessagingScreen';
import SensesScreen from './screens/SensesScreen';
import TutorialScreen from './screens/TutorialScreen';
import { getLocale } from './src/services/locale';
import { hasCompletedTutorial } from './src/services/tutorial';
import { t, Locale } from './src/i18n/strings';

export default function App() {
  const [screen, setScreen] = useState<'presence' | 'messages' | 'senses'>(
    'presence'
  );
  const [locale, setLocaleState] = useState<Locale>('en');
  const [boot, setBoot] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    (async () => {
      const [loc, done] = await Promise.all([
        getLocale(),
        hasCompletedTutorial(),
      ]);
      setLocaleState(loc);
      setShowTutorial(!done);
      setBoot(false);
    })();
  }, []);

  const refreshLocale = async () => {
    setLocaleState(await getLocale());
  };

  if (boot) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color="#2ecc71" />
      </View>
    );
  }

  if (showTutorial) {
    return (
      <TutorialScreen
        locale={locale}
        onFinished={() => setShowTutorial(false)}
      />
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.nav}>
        <Button
          title={t(locale, 'identity')}
          onPress={() => setScreen('presence')}
          color={screen === 'presence' ? '#2ecc71' : '#888'}
        />
        <Button
          title={t(locale, 'messages')}
          onPress={() => setScreen('messages')}
          color={screen === 'messages' ? '#2ecc71' : '#888'}
        />
        <Button
          title={t(locale, 'senses')}
          onPress={() => setScreen('senses')}
          color={screen === 'senses' ? '#2ecc71' : '#888'}
        />
      </View>
      {screen === 'presence' && (
        <PresenceScreen
          locale={locale}
          onLocaleChange={refreshLocale}
          onReplayTutorial={() => setShowTutorial(true)}
        />
      )}
      {screen === 'messages' && <MessagingScreen locale={locale} />}
      {screen === 'senses' && <SensesScreen locale={locale} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { alignItems: 'center', justifyContent: 'center' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: '#111',
  },
});
