import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { ScreenContainer } from '../components/ScreenContainer';
import { ContactAvatar } from '../components/ContactAvatar';
import { ActiveCallControls } from '../components/CallControls';
import { formatCountdown, useAiCallSession } from '../hooks/useAiCallSession';
import { AI_MAX_CALL_DURATION_MS } from '../constants/aiConversation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AiActiveCall'>;
  route: RouteProp<RootStackParamList, 'AiActiveCall'>;
};

/** Real-time ElevenLabs voice agent call — max 30s enforced client + server. */
export function AiActiveCallScreen({ navigation, route }: Props) {
  const { caller } = route.params;
  const [speaker, setSpeaker] = useState(true);

  const handleEnded = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [navigation]);

  const { phase, remainingMs, errorMessage, isSpeaking, isMuted, toggleMute, endCall } =
    useAiCallSession(caller, handleEnded);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleEndCall = () => {
    endCall('user_hangup');
  };

  const elapsedMs = AI_MAX_CALL_DURATION_MS - remainingMs;
  const elapsedLabel = formatCountdown(elapsedMs);
  const remainingLabel = formatCountdown(remainingMs);

  return (
    <ScreenContainer dark>
      <View style={styles.container}>
        <View style={styles.top}>
          {phase === 'connecting' ? (
            <View style={styles.connectingRow}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.statusText}>Connecting AI caller…</Text>
            </View>
          ) : phase === 'error' ? (
            <Text style={styles.errorText}>{errorMessage ?? 'AI call failed'}</Text>
          ) : (
            <>
              <Text style={styles.timer}>{elapsedLabel}</Text>
              <Text style={styles.countdown}>Ends in {remainingLabel}</Text>
              <Text style={styles.modeText}>
                {isSpeaking ? 'Caller speaking' : 'Listening…'}
              </Text>
            </>
          )}
        </View>

        <View style={styles.center}>
          <ContactAvatar name={caller.name} imageUri={caller.imageUri} size={120} />
          <Text style={styles.name}>{caller.name}</Text>
          <Text style={styles.phone}>{caller.phoneNumber}</Text>
          <Text style={styles.aiBadge}>AI voice call</Text>
        </View>

        <View style={styles.controls}>
          <ActiveCallControls
            muted={isMuted}
            speaker={speaker}
            onToggleMute={toggleMute}
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
    gap: 6,
    minHeight: 72,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  timer: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  countdown: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  modeText: {
    color: '#B8E65E',
    fontSize: 13,
    fontWeight: '500',
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
  aiBadge: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  controls: {
    paddingBottom: 16,
  },
});
