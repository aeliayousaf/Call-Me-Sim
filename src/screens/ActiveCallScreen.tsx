import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { ScreenContainer } from '../components/ScreenContainer';
import { ContactAvatar } from '../components/ContactAvatar';
import { ActiveCallControls } from '../components/CallControls';
import { useCallTimer } from '../hooks/useCallTimer';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActiveCall'>;
  route: RouteProp<RootStackParamList, 'ActiveCall'>;
};

/** Fake active call UI with timer and controls. No real audio connection is established. */
export function ActiveCallScreen({ navigation, route }: Props) {
  const { caller } = route.params;
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const { formattedDuration } = useCallTimer(true);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleEndCall = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <ScreenContainer dark>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.status}>Simulated Call</Text>
          <Text style={styles.timer}>{formattedDuration}</Text>
        </View>

        <View style={styles.center}>
          <ContactAvatar name={caller.name} imageUri={caller.imageUri} size={120} />
          <Text style={styles.name}>{caller.name}</Text>
          <Text style={styles.phone}>{caller.phoneNumber}</Text>
        </View>

        <View style={styles.controls}>
          <ActiveCallControls
            muted={muted}
            speaker={speaker}
            onToggleMute={() => setMuted((m) => !m)}
            onToggleSpeaker={() => setSpeaker((s) => !s)}
            onEndCall={handleEndCall}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  top: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 4,
  },
  status: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  center: {
    alignItems: 'center',
    gap: 12,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: 16,
  },
  phone: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  controls: {
    paddingBottom: 16,
  },
});
