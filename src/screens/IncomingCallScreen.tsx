import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { ContactAvatar } from '../components/ContactAvatar';
import { IncomingCallControls } from '../components/CallControls';
import { useIncomingCallEffects } from '../hooks/useIncomingCallEffects';
import { dismissIncomingCallNotification } from '../services/notificationService';
import { stopBackgroundKeepAlive } from '../services/backgroundAudioService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IncomingCall'>;
  route: RouteProp<RootStackParamList, 'IncomingCall'>;
};

/**
 * In-app full-screen incoming call simulation.
 * Platform note: We intentionally avoid CallKit (iOS) and full-screen intent
 * notifications (Android) because this app does not perform real VoIP calling.
 * The simulation runs entirely within the app UI.
 */
export function IncomingCallScreen({ navigation, route }: Props) {
  const { caller } = route.params;
  const { settings } = useSettings();

  const { stopAll } = useIncomingCallEffects({
    active: true,
    ringtone: settings.ringtone,
    customRingtoneUri: settings.customRingtoneUri,
    vibrationEnabled: settings.vibrationEnabled,
  });

  useEffect(() => {
    stopBackgroundKeepAlive();
    dismissIncomingCallNotification();
    activateKeepAwakeAsync('incoming-call');

    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      sub.remove();
      deactivateKeepAwake('incoming-call');
    };
  }, []);

  const handleDecline = async () => {
    await stopAll();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleAccept = async () => {
    await stopAll();
    navigation.replace('ActiveCall', { caller });
  };

  return (
    <ScreenContainer dark showPracticeBanner>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.label}>Incoming call</Text>
          {settings.practiceModeLabel && (
            <Text style={styles.practiceLabel}>Practice Mode</Text>
          )}
        </View>

        <View style={styles.center}>
          <ContactAvatar name={caller.name} imageUri={caller.imageUri} size={140} />
          <Text style={styles.name}>{caller.name}</Text>
          <Text style={styles.phone}>{caller.phoneNumber}</Text>
          <Text style={styles.simulated}>Simulated call — not a real phone call</Text>
        </View>

        <View style={styles.controls}>
          <IncomingCallControls onAccept={handleAccept} onDecline={handleDecline} />
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
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  practiceLabel: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    gap: 12,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: 16,
  },
  phone: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
  },
  simulated: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  controls: {
    paddingBottom: 16,
  },
});
