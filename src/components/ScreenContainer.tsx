import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { PracticeModeBanner } from './PracticeModeBanner';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showPracticeBanner?: boolean;
  dark?: boolean;
}

export function ScreenContainer({
  children,
  style,
  showPracticeBanner = false,
  dark = false,
}: ScreenContainerProps) {
  const { theme } = useSettings();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: dark ? theme.callBackground : theme.background },
        style,
      ]}
    >
      {showPracticeBanner && <PracticeModeBanner />}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
