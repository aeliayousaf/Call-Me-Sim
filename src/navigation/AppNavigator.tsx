import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSettings } from '../context/SettingsContext';
import { navigationRef } from './navigationRef';
import { HomeScreen } from '../screens/HomeScreen';
import { ContactPickerScreen } from '../screens/ContactPickerScreen';
import { DelaySelectionScreen } from '../screens/DelaySelectionScreen';
import { IncomingCallScreen } from '../screens/IncomingCallScreen';
import { ActiveCallScreen } from '../screens/ActiveCallScreen';
import { AiActiveCallScreen } from '../screens/AiActiveCallScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { settings, theme } = useSettings();

  const navTheme = settings.darkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          primary: theme.primary,
          border: theme.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          primary: theme.primary,
          border: theme.border,
        },
      };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ContactPicker" component={ContactPickerScreen} />
        <Stack.Screen name="DelaySelection" component={DelaySelectionScreen} />
        <Stack.Screen
          name="IncomingCall"
          component={IncomingCallScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="ActiveCall"
          component={ActiveCallScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="AiActiveCall"
          component={AiActiveCallScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
