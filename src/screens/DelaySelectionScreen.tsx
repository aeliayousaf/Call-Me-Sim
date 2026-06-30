import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, DelayConfig, DelayOption } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { ContactAvatar } from '../components/ContactAvatar';
import { Button } from '../components/Button';
import { delayToMilliseconds } from '../services/callService';
import { DELAY_LABELS } from '../constants/defaults';
import { useCountdown } from '../hooks/useCallTimer';
import {
  setupNotifications,
  scheduleIncomingCallNotification,
  showIncomingCallNotification,
  cancelScheduledCallNotifications,
} from '../services/notificationService';
import { savePendingCall, clearPendingCall } from '../services/pendingCallService';
import {
  startBackgroundKeepAlive,
  stopBackgroundKeepAlive,
} from '../services/backgroundAudioService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DelaySelection'>;
  route: RouteProp<RootStackParamList, 'DelaySelection'>;
};

const DELAY_OPTIONS: DelayOption[] = ['immediate', '10s', '30s', '1m', 'custom'];

export function DelaySelectionScreen({ navigation, route }: Props) {
  const { caller } = route.params;
  const { settings, theme, setSettings } = useSettings();
  const [selectedDelay, setSelectedDelay] = useState<DelayConfig>(settings.defaultDelay);
  const [customSeconds, setCustomSeconds] = useState(
    String(settings.defaultDelay.customSeconds ?? 60)
  );
  const [countdownActive, setCountdownActive] = useState(false);
  const [pendingDelayMs, setPendingDelayMs] = useState(0);

  const beginIncomingCall = async () => {
    await stopBackgroundKeepAlive();
    await clearPendingCall();
    await showIncomingCallNotification(caller);
    navigation.replace('IncomingCall', { caller });
  };

  const { remainingSeconds } = useCountdown(pendingDelayMs, beginIncomingCall, countdownActive);

  const buildDelayConfig = (): DelayConfig => {
    if (selectedDelay.type === 'custom') {
      const seconds = parseInt(customSeconds, 10) || 0;
      return { type: 'custom', customSeconds: seconds };
    }
    return selectedDelay;
  };

  const handleStart = async () => {
    const delay = buildDelayConfig();
    const ms = delayToMilliseconds(delay);
    await setSettings({ defaultDelay: delay });

    const granted = await setupNotifications();
    if (!granted) {
      Alert.alert(
        'Notifications needed',
        'Allow notifications so the simulated call can appear on your lock screen when the phone is locked.'
      );
    }

    const fireDate = new Date(Date.now() + ms);
    await savePendingCall({ caller, fireAt: fireDate.getTime() });

    if (ms <= 0) {
      await beginIncomingCall();
    } else {
      await scheduleIncomingCallNotification(caller, fireDate);
      await startBackgroundKeepAlive();
      setPendingDelayMs(ms);
      setCountdownActive(true);
    }
  };

  const handleCancelCountdown = async () => {
    setCountdownActive(false);
    setPendingDelayMs(0);
    await cancelScheduledCallNotifications();
    await stopBackgroundKeepAlive();
    await clearPendingCall();
  };

  if (countdownActive) {
    return (
      <ScreenContainer>
        <View style={styles.countdownContainer}>
          <ContactAvatar name={caller.name} imageUri={caller.imageUri} size={100} dark={settings.darkMode} />
          <Text style={[styles.countdownTitle, { color: theme.text }]}>Incoming call in...</Text>
          <Text style={[styles.countdownNumber, { color: theme.primary }]}>{remainingSeconds}</Text>
          <Text style={[styles.countdownSub, { color: theme.textSecondary }]}>
            from {caller.name}
          </Text>
          <Text style={[styles.lockHint, { color: theme.textSecondary }]}>
            You can lock your screen — the call will still come through.
          </Text>
          <Button title="Cancel" variant="secondary" onPress={handleCancelCountdown} style={styles.cancelBtn} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: theme.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>When to call?</Text>
        <View style={styles.back} />
      </View>

      <View style={styles.callerSection}>
        <ContactAvatar name={caller.name} imageUri={caller.imageUri} size={72} dark={settings.darkMode} />
        <Text style={[styles.callerName, { color: theme.text }]}>{caller.name}</Text>
        <Text style={[styles.callerPhone, { color: theme.textSecondary }]}>{caller.phoneNumber}</Text>
      </View>

      <View style={styles.options}>
        {DELAY_OPTIONS.map((option) => {
          const isSelected = selectedDelay.type === option;
          return (
            <Pressable
              key={option}
              onPress={() => setSelectedDelay({ type: option, customSeconds: parseInt(customSeconds, 10) || 60 })}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                {DELAY_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedDelay.type === 'custom' && (
        <View style={styles.customInput}>
          <Text style={[styles.customLabel, { color: theme.textSecondary }]}>Seconds</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
            ]}
            keyboardType="number-pad"
            value={customSeconds}
            onChangeText={setCustomSeconds}
            placeholder="60"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Button title="Start Simulation" onPress={handleStart} large />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: {
    fontSize: 17,
    width: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  callerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  callerName: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  callerPhone: {
    fontSize: 15,
  },
  options: {
    paddingHorizontal: 16,
    gap: 10,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  customInput: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  countdownTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: '700',
  },
  countdownSub: {
    fontSize: 16,
  },
  lockHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  cancelBtn: {
    marginTop: 32,
    minWidth: 160,
  },
});
