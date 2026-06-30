import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = '@callmenow/device_id';

function generateId(): string {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable per-install ID used for server-side rate limits. */
export async function getDeviceId(): Promise<string> {
  const cached = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (cached) return cached;

  let id: string | null = null;
  if (Platform.OS === 'android' && Application.getAndroidId) {
    id = Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    id = await Application.getIosIdForVendorAsync();
  }

  const deviceId = id ?? generateId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}
