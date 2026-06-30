import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DelayOption, BuiltinRingtoneId } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { SettingRow, SettingSection } from '../components/SettingRow';
import { formatDelayLabel } from '../services/callService';
import { DELAY_LABELS, RINGTONE_LABELS, getReadyCaller } from '../constants/defaults';
import { previewRingtone } from '../services/ringtoneService';
import {
  getRingtoneDisplayName,
  pickRingtoneFromDevice,
} from '../services/ringtonePickerService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const DELAY_OPTIONS: DelayOption[] = ['immediate', '10s', '30s', '1m'];
const RINGTONE_OPTIONS: BuiltinRingtoneId[] = ['classic', 'modern', 'gentle'];

export function SettingsScreen({ navigation }: Props) {
  const { settings, theme, setSettings } = useSettings();
  const [pickingRingtone, setPickingRingtone] = useState(false);

  const handleBuiltinSelect = async (ringtone: BuiltinRingtoneId) => {
    await setSettings({ ringtone });
    await previewRingtone({ ringtone });
  };

  const handlePickFromPhone = async () => {
    setPickingRingtone(true);
    try {
      const picked = await pickRingtoneFromDevice();
      if (!picked) return;

      await setSettings({
        ringtone: 'custom',
        customRingtoneUri: picked.uri,
        customRingtoneName: picked.name,
      });
      await previewRingtone({ ringtone: 'custom', customUri: picked.uri });
    } catch {
      Alert.alert(
        'Could not use file',
        'Please choose a supported audio file (MP3, M4A, WAV, etc.) from your device.'
      );
    } finally {
      setPickingRingtone(false);
    }
  };

  const customLabel = getRingtoneDisplayName(
    settings.ringtone,
    settings.customRingtoneName
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: theme.primary }]}>Done</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} style={{ backgroundColor: theme.background }}>
        <SettingSection title="Default Caller">
          <Pressable
            onPress={() => navigation.navigate('ContactPicker', { mode: 'settings' })}
            style={[styles.row, { borderBottomColor: theme.border }]}
          >
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              {getReadyCaller(settings).name}
            </Text>
            <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
          </Pressable>
        </SettingSection>

        <SettingSection title="Default Delay">
          {DELAY_OPTIONS.map((option, index) => (
            <Pressable
              key={option}
              onPress={() => setSettings({ defaultDelay: { type: option } })}
              style={[
                styles.row,
                index < DELAY_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <Text style={[styles.rowLabel, { color: theme.text }]}>{DELAY_LABELS[option]}</Text>
              {settings.defaultDelay.type === option && (
                <Text style={[styles.check, { color: theme.primary }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </SettingSection>

        <SettingSection title="Ringtone">
          <Pressable
            onPress={handlePickFromPhone}
            disabled={pickingRingtone}
            style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}
          >
            <View style={styles.customRow}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Choose from phone</Text>
              {settings.ringtone === 'custom' && settings.customRingtoneName ? (
                <Text style={[styles.customName, { color: theme.textSecondary }]} numberOfLines={1}>
                  {customLabel}
                </Text>
              ) : null}
            </View>
            {pickingRingtone ? (
              <ActivityIndicator color={theme.primary} />
            ) : settings.ringtone === 'custom' ? (
              <Text style={[styles.check, { color: theme.primary }]}>✓</Text>
            ) : (
              <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
            )}
          </Pressable>

          {RINGTONE_OPTIONS.map((option, index) => (
            <Pressable
              key={option}
              onPress={() => handleBuiltinSelect(option)}
              style={[
                styles.row,
                index < RINGTONE_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <Text style={[styles.rowLabel, { color: theme.text }]}>{RINGTONE_LABELS[option]}</Text>
              {settings.ringtone === option && (
                <Text style={[styles.check, { color: theme.primary }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </SettingSection>

        <Text style={[styles.ringtoneNote, { color: theme.textSecondary }]}>
          Pick any audio file saved on your phone (Music, Downloads, Files). iOS does not allow
          apps to access the built-in system ringtone list.
        </Text>

        <View style={[styles.toggleSection, { backgroundColor: theme.surface }]}>
          <SettingRow label="Vibration" description="Vibrate during incoming call">
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(v) => setSettings({ vibrationEnabled: v })}
            />
          </SettingRow>
          <SettingRow label="Dark Mode" description="Use dark theme for app screens">
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => setSettings({ darkMode: v })}
            />
          </SettingRow>
          <SettingRow
            label="Practice Mode Label"
            description="Show compliance banner during simulations"
          >
            <Switch
              value={settings.practiceModeLabel}
              onValueChange={(v) => setSettings({ practiceModeLabel: v })}
            />
          </SettingRow>
        </View>

        <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
          Current default delay: {formatDelayLabel(settings.defaultDelay)}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: {
    fontSize: 17,
    width: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  check: {
    fontSize: 18,
    fontWeight: '700',
  },
  toggleSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  customRow: {
    flex: 1,
    marginRight: 12,
  },
  customName: {
    fontSize: 13,
    marginTop: 2,
  },
  ringtoneNote: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: -12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  footerNote: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
