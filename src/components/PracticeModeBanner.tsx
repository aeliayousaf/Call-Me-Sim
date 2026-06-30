import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

/** Compliance banner — makes clear this is a practice/simulation app */
export function PracticeModeBanner() {
  const { settings } = useSettings();

  if (!settings.practiceModeLabel) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Practice Mode — Simulated call only. No real calls are made.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
