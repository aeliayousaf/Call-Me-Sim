import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { RingtoneHandler } from './src/components/RingtoneHandler';
import { useCallNotificationHandlers } from './src/hooks/useCallNotificationHandlers';

function AppContent() {
  const { settings, isLoading } = useSettings();
  useCallNotificationHandlers(!isLoading);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <RingtoneHandler>
        <AppContent />
      </RingtoneHandler>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
