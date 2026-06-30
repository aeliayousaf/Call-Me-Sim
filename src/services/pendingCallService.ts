import AsyncStorage from '@react-native-async-storage/async-storage';
import { CallerContact } from '../types';

const PENDING_CALL_KEY = '@call_me_now_pending_call';

export interface PendingCall {
  caller: CallerContact;
  fireAt: number;
}

export async function savePendingCall(pending: PendingCall): Promise<void> {
  await AsyncStorage.setItem(PENDING_CALL_KEY, JSON.stringify(pending));
}

export async function getPendingCall(): Promise<PendingCall | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_CALL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCall;
  } catch {
    return null;
  }
}

export async function clearPendingCall(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_CALL_KEY);
}

/** Returns caller if a scheduled call should have fired while the app was suspended. */
export async function consumeDuePendingCall(): Promise<CallerContact | null> {
  const pending = await getPendingCall();
  if (!pending) return null;
  if (Date.now() < pending.fireAt - 500) return null;

  await clearPendingCall();
  return pending.caller;
}

export function serializeCaller(caller: CallerContact): string {
  return JSON.stringify(caller);
}

export function parseCaller(raw: unknown): CallerContact | null {
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as CallerContact;
  } catch {
    return null;
  }
}
