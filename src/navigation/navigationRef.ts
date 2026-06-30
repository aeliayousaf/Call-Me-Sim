import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList, CallerContact } from '../types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToIncomingCall(caller: CallerContact): void {
  if (!navigationRef.isReady()) return;

  const current = navigationRef.getCurrentRoute()?.name;
  if (current === 'IncomingCall' || current === 'ActiveCall') return;

  navigationRef.navigate('IncomingCall', { caller });
}

export function navigateToHome(): void {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
}

export function handleIncomingCallLaunch(caller: CallerContact): void {
  if (!navigationRef.isReady()) {
    const interval = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(interval);
        navigateToIncomingCall(caller);
      }
    }, 100);
    setTimeout(() => clearInterval(interval), 5000);
    return;
  }
  navigateToIncomingCall(caller);
}
