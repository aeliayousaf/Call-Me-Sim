import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  setupNotifications,
  isIncomingCallNotification,
  getCallerFromNotification,
  dismissIncomingCallNotification,
} from '../services/notificationService';
import {
  consumeDuePendingCall,
  clearPendingCall,
  parseCaller,
} from '../services/pendingCallService';
import { stopBackgroundKeepAlive } from '../services/backgroundAudioService';
import { handleIncomingCallLaunch, navigateToHome } from '../navigation/navigationRef';
import { CallerContact } from '../types';

function launchIncomingCall(caller: CallerContact): void {
  stopBackgroundKeepAlive();
  clearPendingCall();
  handleIncomingCallLaunch(caller);
}

async function handleNotificationResponse(
  response: Notifications.NotificationResponse | null
): Promise<void> {
  if (!response) return;

  const data = response.notification.request.content.data;
  if (!isIncomingCallNotification(data)) return;

  const caller = parseCaller(getCallerFromNotification(data));
  if (!caller) return;

  if (response.actionIdentifier === 'decline') {
    await dismissIncomingCallNotification();
    await stopBackgroundKeepAlive();
    await clearPendingCall();
    navigateToHome();
    return;
  }

  launchIncomingCall(caller);
}

export function useCallNotificationHandlers(enabled: boolean): void {
  const handledIds = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) return;

    setupNotifications();

    const checkPending = async () => {
      const caller = await consumeDuePendingCall();
      if (caller) launchIncomingCall(caller);
    };

    checkPending();
    Notifications.getLastNotificationResponseAsync().then(handleNotificationResponse);

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (!isIncomingCallNotification(data)) return;

      const id = notification.request.identifier;
      if (handledIds.current.has(id)) return;
      handledIds.current.add(id);

      const caller = parseCaller(getCallerFromNotification(data));
      if (caller) launchIncomingCall(caller);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkPending();
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
      appStateSub.remove();
    };
  }, [enabled]);
}
