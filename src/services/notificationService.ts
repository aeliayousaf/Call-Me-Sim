import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { CallerContact } from '../types';
import { serializeCaller } from './pendingCallService';
import {
  prepareContactImageForNotification,
  buildNotificationAttachments,
} from './contactImageService';

export const INCOMING_CALL_CHANNEL_ID = 'incoming-call';
export const SCHEDULED_CALL_NOTIFICATION_ID = 'scheduled-incoming-call';
export const ACTIVE_INCOMING_NOTIFICATION_ID = 'active-incoming-call';

export const INCOMING_CALL_CATEGORY = 'incoming_call';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(INCOMING_CALL_CHANNEL_ID, {
      name: 'Incoming Calls',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 800, 400, 800],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      sound: 'default',
      enableVibrate: true,
    });
  }

  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync(INCOMING_CALL_CATEGORY, [
      {
        identifier: 'accept',
        buttonTitle: 'Accept',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'decline',
        buttonTitle: 'Decline',
        options: { opensAppToForeground: true, isDestructive: true },
      },
    ]);
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status === 'granted';
}

async function buildIncomingCallContent(caller: CallerContact) {
  const imageUri = await prepareContactImageForNotification(caller);
  const attachments = buildNotificationAttachments(imageUri);

  return {
    title: caller.name,
    subtitle: Platform.OS === 'ios' ? 'Incoming call' : undefined,
    body: Platform.OS === 'android' ? 'Incoming call' : caller.phoneNumber,
    data: {
      type: 'incoming_call',
      caller: serializeCaller(caller),
      notificationImageUri: imageUri,
    },
    sound: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
    sticky: true,
    autoDismiss: false,
    categoryIdentifier: INCOMING_CALL_CATEGORY,
    interruptionLevel: 'timeSensitive' as const,
    ...(attachments ? { attachments } : {}),
  };
}

export async function scheduleIncomingCallNotification(
  caller: CallerContact,
  fireDate: Date
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(SCHEDULED_CALL_NOTIFICATION_ID);

  const content = await buildIncomingCallContent(caller);

  await Notifications.scheduleNotificationAsync({
    identifier: SCHEDULED_CALL_NOTIFICATION_ID,
    content,
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: fireDate,
      channelId: INCOMING_CALL_CHANNEL_ID,
    },
  });
}

export async function showIncomingCallNotification(caller: CallerContact): Promise<void> {
  const content = await buildIncomingCallContent(caller);

  await Notifications.scheduleNotificationAsync({
    identifier: ACTIVE_INCOMING_NOTIFICATION_ID,
    content,
    trigger: {
      channelId: INCOMING_CALL_CHANNEL_ID,
    },
  });
}

export async function cancelScheduledCallNotifications(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(SCHEDULED_CALL_NOTIFICATION_ID);
  await dismissIncomingCallNotification();
}

export async function dismissIncomingCallNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(ACTIVE_INCOMING_NOTIFICATION_ID);
  await Notifications.cancelScheduledNotificationAsync(ACTIVE_INCOMING_NOTIFICATION_ID);
}

export function isIncomingCallNotification(data: Record<string, unknown> | undefined): boolean {
  return data?.type === 'incoming_call';
}

export function getCallerFromNotification(data: Record<string, unknown> | undefined) {
  return data?.caller;
}
