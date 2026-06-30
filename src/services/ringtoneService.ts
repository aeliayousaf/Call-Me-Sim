import { Audio, AVPlaybackStatus } from 'expo-av';
import { BuiltinRingtoneId, RingtoneId } from '../types';

const RINGTONES: Record<BuiltinRingtoneId, ReturnType<typeof require>> = {
  classic: require('../assets/ringtones/classic.mp3'),
  modern: require('../assets/ringtones/modern.mp3'),
  gentle: require('../assets/ringtones/gentle.mp3'),
};

export interface RingtonePlaybackOptions {
  ringtone: RingtoneId;
  customUri?: string | null;
}

let sound: Audio.Sound | null = null;
let isPlaying = false;

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
}

function resolveSource({ ringtone, customUri }: RingtonePlaybackOptions) {
  if (ringtone === 'custom' && customUri) {
    return { uri: customUri };
  }
  const builtin: BuiltinRingtoneId =
    ringtone === 'custom' ? 'classic' : ringtone;
  return RINGTONES[builtin];
}

export async function startRingtone(options: RingtonePlaybackOptions): Promise<void> {
  await stopRingtone();
  await configureAudioMode();

  const source = resolveSource(options);
  const { sound: newSound } = await Audio.Sound.createAsync(source, {
    isLooping: true,
    volume: 1.0,
  });

  sound = newSound;
  isPlaying = true;
  await sound.playAsync();
}

export async function stopRingtone(): Promise<void> {
  if (sound) {
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch {
      // Sound may already be unloaded
    }
    sound = null;
  }
  isPlaying = false;
}

export function getIsRingtonePlaying(): boolean {
  return isPlaying;
}

export async function previewRingtone(options: RingtonePlaybackOptions): Promise<void> {
  await stopRingtone();
  await configureAudioMode();

  const source = resolveSource(options);
  const { sound: previewSound } = await Audio.Sound.createAsync(source, {
    isLooping: false,
    volume: 0.8,
  });

  sound = previewSound;
  isPlaying = true;

  previewSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      stopRingtone();
    }
  });

  await previewSound.playAsync();
}
