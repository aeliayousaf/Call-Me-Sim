import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  prepareCallSimulation,
  triggerImmediateCall,
  cancelCallSimulation,
} from '../services/callSimulationService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DelaySelection'>;
  route: RouteProp<RootStackParamList, 'DelaySelection'>;
};

const DELAY_OPTIONS: DelayOption[] = ['immediate', '10s', '30s', '1m', 'custom'];

export function DelaySelectionScreen({ navigation, route }: Props) {
  const { caller, autoStart = false } = route.params;
  const { settings, theme, setSettings } = useSettings();
  const [selectedDelay, setSelectedDelay] = useState<DelayConfig>(settings.defaultDelay);
  const [customSeconds, setCustomSeconds] = useState(
    String(settings.defaultDelay.customSeconds ?? 60)
  );
  const [countdownActive, setCountdownActive] = useState(false);
  const [pendingDelayMs, setPendingDelayMs] = useState(0);
  const [isStarting, setIsStarting] = useState(autoStart);
  const startedRef = useRef(false);

  const beginIncomingCall = async () => {
    await triggerImmediateCall(caller);
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

  const handleStart = async (delayOverride?: DelayConfig) => {
    const delay = delayOverride ?? buildDelayConfig();
    const ms = delayToMilliseconds(delay);

    if (!delayOverride) {
      await setSettings({ defaultDelay: delay });
    }

    setIsStarting(true);
    try {
      const result = await prepareCallSimulation(caller, delay);

      if (result.type === 'immediate') {
        await beginIncomingCall();
      } else {
        setPendingDelayMs(result.delayMs);
        setCountdownActive(true);
      }
    } catch (error) {
      console.warn('Failed to start simulation:', error);
      Alert.alert('Could not start', 'Something went wrong. Please try again.');
      if (autoStart) {
        navigation.goBack();
      }
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (!autoStart || startedRef.current) return;
    startedRef.current = true;
    handleStart(settings.defaultDelay);
  }, [autoStart]);

  const handleCancelCountdown = async () => {
    setCountdownActive(false);
    setPendingDelayMs(0);
    await cancelCallSimulation();
    navigation.goBack();
  };

  if (isStarting && !countdownActive) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Starting call…</Text>
        </View>
      </ScreenContainer>
    );
  }

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
            Lock your screen — the phone will ring like a real call.
          </Text>
          <Button title="Cancel" variant="secondary" onPress={handleCancelCountdown} style={styles.cancelBtn} />
        </View>
      </ScreenContainer>
    );
  }

  if (autoStart) {
    return null;
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
        <Button title="Start Simulation" onPress={() => handleStart()} large />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
