import { Audio } from 'expo-av';

const SILENCE = require('../assets/silence.mp3');

let keepAliveSound: Audio.Sound | null = null;

/**
 * Plays silent audio so iOS/Android keep the app alive in the background while
 * a call is scheduled. This lets the in-app timer fire even if the screen locks.
 * Platform note: The OS may still suspend the app after long periods or low memory.
 */
export async function startBackgroundKeepAlive(): Promise<void> {
  await stopBackgroundKeepAlive();

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });

  const { sound } = await Audio.Sound.createAsync(SILENCE, {
    isLooping: true,
    volume: 0.01,
  });

  keepAliveSound = sound;
  await sound.playAsync();
}

export async function stopBackgroundKeepAlive(): Promise<void> {
  if (keepAliveSound) {
    try {
      await keepAliveSound.stopAsync();
      await keepAliveSound.unloadAsync();
    } catch {
      // Already stopped
    }
    keepAliveSound = null;
  }
}
