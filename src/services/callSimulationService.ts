import { Alert } from 'react-native';
import { CallerContact, DelayConfig } from '../types';
import { delayToMilliseconds } from './callService';
import {
  setupNotifications,
  scheduleIncomingCallNotification,
  showIncomingCallNotification,
  cancelScheduledCallNotifications,
} from './notificationService';
import { savePendingCall, clearPendingCall } from './pendingCallService';
import {
  startBackgroundKeepAlive,
  stopBackgroundKeepAlive,
} from './backgroundAudioService';

export interface StartCallSimulationResult {
  type: 'immediate' | 'countdown';
  delayMs: number;
}

export async function prepareCallSimulation(
  caller: CallerContact,
  delay: DelayConfig
): Promise<StartCallSimulationResult> {
  const ms = delayToMilliseconds(delay);

  const granted = await setupNotifications();
  if (!granted) {
    Alert.alert(
      'Notifications needed',
      'Allow notifications so the simulated call can ring on your lock screen.'
    );
  }

  const fireDate = new Date(Date.now() + ms);
  await savePendingCall({ caller, fireAt: fireDate.getTime() });

  if (ms <= 0) {
    return { type: 'immediate', delayMs: 0 };
  }

  await scheduleIncomingCallNotification(caller, fireDate);
  await startBackgroundKeepAlive();
  return { type: 'countdown', delayMs: ms };
}

export async function triggerImmediateCall(caller: CallerContact): Promise<void> {
  await stopBackgroundKeepAlive();
  await clearPendingCall();
  await showIncomingCallNotification(caller);
}

export async function cancelCallSimulation(): Promise<void> {
  await cancelScheduledCallNotifications();
  await stopBackgroundKeepAlive();
  await clearPendingCall();
}
