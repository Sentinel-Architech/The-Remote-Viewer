import './crypto-polyfill';
import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import PresenceScreen from './screens/PresenceScreen';
import MessagingScreen from './screens/MessagingScreen';
import SensesScreen from './screens/SensesScreen';

export default function App() {
  const [screen, setScreen] = useState<'presence' | 'messages' | 'senses'>(
    'presence'
  );

  return (
    <View style={styles.root}>
      <View style={styles.nav}>
        <Button
          title="Identity"
          onPress={() => setScreen('presence')}
          color={screen === 'presence' ? '#2ecc71' : '#888'}
        />
        <Button
          title="Messages"
          onPress={() => setScreen('messages')}
          color={screen === 'messages' ? '#2ecc71' : '#888'}
        />
        <Button
          title="Senses"
          onPress={() => setScreen('senses')}
          color={screen === 'senses' ? '#2ecc71' : '#888'}
        />
      </View>
      {screen === 'presence' && <PresenceScreen />}
      {screen === 'messages' && <MessagingScreen />}
      {screen === 'senses' && <SensesScreen />}
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
