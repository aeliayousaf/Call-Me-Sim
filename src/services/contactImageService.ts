import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { CallerContact } from '../types';

const NOTIFICATION_IMAGE_PREFIX = 'caller-notification';

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-_]/g, '_');
}

function guessExtension(uri: string): string {
  const match = uri.match(/\.(jpe?g|png|gif|heic|webp)(\?|$)/i);
  return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

/**
 * Copies the contact photo to app storage so it can be attached to a notification.
 * iOS shows this as the notification thumbnail. Android local notifications in Expo
 * do not yet support per-notification images (app icon is used instead).
 */
export async function prepareContactImageForNotification(
  caller: CallerContact
): Promise<string | null> {
  if (!caller.imageUri) return null;

  const dir = FileSystem.documentDirectory;
  if (!dir) return null;

  const ext = guessExtension(caller.imageUri);
  const destUri = `${dir}${NOTIFICATION_IMAGE_PREFIX}-${sanitizeId(caller.id)}.${ext}`;

  try {
    await FileSystem.deleteAsync(destUri, { idempotent: true });
    await FileSystem.copyAsync({ from: caller.imageUri, to: destUri });

    const info = await FileSystem.getInfoAsync(destUri);
    if (!info.exists) return null;

    return destUri;
  } catch (error) {
    console.warn('Could not prepare contact image for notification:', error);
    return null;
  }
}

export function buildNotificationAttachments(imageUri: string | null) {
  if (!imageUri || Platform.OS !== 'ios') return undefined;

  // expo-notifications iOS native layer reads `uri` (TypeScript types say `url`)
  return [
    {
      identifier: 'contact-photo',
      url: imageUri,
      uri: imageUri,
      type: imageUri.endsWith('.png') ? 'public.png' : 'public.jpeg',
      typeHint: imageUri.endsWith('.png') ? 'public.png' : 'public.jpeg',
      hideThumbnail: false,
    },
  ];
}
