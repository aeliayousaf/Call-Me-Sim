import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { RingtoneId } from '../types';
import { RINGTONE_LABELS } from '../constants/defaults';

const RINGTONE_PREFIX = 'custom_ringtone';

/**
 * Opens the system file picker so the user can choose an audio file from their phone.
 * iOS note: Apps cannot access the system ringtone library — users pick from Files,
 * Downloads, iCloud Drive, or other audio stored on the device.
 */
export async function pickRingtoneFromDevice(): Promise<{ uri: string; name: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'audio/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const extension = asset.name?.includes('.') ? asset.name.split('.').pop() : 'mp3';
  const destUri = `${FileSystem.documentDirectory}${RINGTONE_PREFIX}.${extension}`;

  await clearSavedCustomRingtones();
  await FileSystem.copyAsync({ from: asset.uri, to: destUri });

  return {
    uri: destUri,
    name: asset.name ?? 'Custom ringtone',
  };
}

async function clearSavedCustomRingtones(): Promise<void> {
  const dir = FileSystem.documentDirectory;
  if (!dir) return;

  try {
    const files = await FileSystem.readDirectoryAsync(dir);
    await Promise.all(
      files
        .filter((file) => file.startsWith(RINGTONE_PREFIX))
        .map((file) => FileSystem.deleteAsync(`${dir}${file}`, { idempotent: true }))
    );
  } catch {
    // No saved ringtones to clear
  }
}

export function getRingtoneDisplayName(
  ringtone: RingtoneId,
  customName?: string | null
): string {
  if (ringtone === 'custom' && customName) {
    return customName;
  }
  if (ringtone === 'custom') {
    return 'Custom';
  }
  return RINGTONE_LABELS[ringtone] ?? 'Classic';
}
