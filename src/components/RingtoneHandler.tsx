import React, { useEffect } from 'react';
import { configureAudioMode, stopRingtone } from '../services/ringtoneService';

/**
 * Initializes audio subsystem for ringtone playback.
 * Mount once at app root. Cleans up on unmount.
 */
export function RingtoneHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureAudioMode().catch(console.warn);
    return () => {
      stopRingtone().catch(console.warn);
    };
  }, []);

  return <>{children}</>;
}
