import { useCallback, useEffect, useRef } from 'react';
import { startRingtone, stopRingtone } from '../services/ringtoneService';
import { startVibration, stopVibration } from '../services/vibrationService';
import { RingtoneId } from '../types';

interface UseIncomingCallEffectsOptions {
  active: boolean;
  ringtone: RingtoneId;
  customRingtoneUri?: string | null;
  vibrationEnabled: boolean;
}

/**
 * Manages ringtone loop and vibration for the in-app incoming call simulation.
 * This runs entirely within the app — no CallKit or system call UI is used.
 */
export function useIncomingCallEffects({
  active,
  ringtone,
  customRingtoneUri,
  vibrationEnabled,
}: UseIncomingCallEffectsOptions) {
  const activeRef = useRef(active);
  activeRef.current = active;

  const stopAll = useCallback(async () => {
    await stopRingtone();
    stopVibration();
  }, []);

  useEffect(() => {
    if (!active) {
      stopAll();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await startRingtone({ ringtone, customUri: customRingtoneUri });
        if (cancelled) {
          await stopRingtone();
          return;
        }
        if (vibrationEnabled) {
          await startVibration();
        }
      } catch (error) {
        console.warn('Incoming call effects failed:', error);
      }
    })();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [active, ringtone, customRingtoneUri, vibrationEnabled, stopAll]);

  return { stopAll };
}
