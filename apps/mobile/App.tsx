import './crypto-polyfill';
import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import PresenceScreen from './screens/PresenceScreen';
import MessagingScreen from './screens/MessagingScreen';
import SensesScreen from './screens/SensesScreen';
import { getLocale } from './src/services/locale';
import { t, Locale } from './src/i18n/strings';

export default function App() {
  const [screen, setScreen] = useState<'presence' | 'messages' | 'senses'>(
    'presence'
  );
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    getLocale().then(setLocaleState);
  }, [screen]);

  const refreshLocale = async () => {
    setLocaleState(await getLocale());
  };

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
        <PresenceScreen locale={locale} onLocaleChange={refreshLocale} />
      )}
      {screen === 'messages' && <MessagingScreen />}
      {screen === 'senses' && <SensesScreen locale={locale} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: '#111',
  },
});
