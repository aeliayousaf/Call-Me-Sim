import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

let vibrationInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Uses in-app haptics/vibration only — does not trigger system call UI.
 * On Android, Vibration API requires VIBRATE permission (declared in app.json).
 */
export async function startVibration(): Promise<void> {
  stopVibration();

  const pattern = Platform.OS === 'android' ? [0, 800, 400, 800] : undefined;

  if (Platform.OS === 'android') {
    Vibration.vibrate(pattern, true);
  } else {
    vibrationInterval = setInterval(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 1200);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}

export function stopVibration(): void {
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
  Vibration.cancel();
}

export async function vibrateOnce(): Promise<void> {
  if (Platform.OS === 'android') {
    Vibration.vibrate(100);
  } else {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}
