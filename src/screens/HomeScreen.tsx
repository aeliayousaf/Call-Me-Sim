import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { ContactAvatar } from '../components/ContactAvatar';
import { formatDelayLabel } from '../services/callService';
import { getReadyCaller } from '../constants/defaults';
import { RINGTONE_LABELS } from '../constants/defaults';
import { getRingtoneDisplayName } from '../services/ringtonePickerService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const { settings, theme } = useSettings();
  const caller = getReadyCaller(settings);

  const handleCallMe = () => {
    navigation.navigate('DelaySelection', { caller, autoStart: true });
  };

  const ringtoneLabel =
    settings.ringtone === 'custom'
      ? getRingtoneDisplayName(settings.ringtone, settings.customRingtoneName)
      : RINGTONE_LABELS[settings.ringtone];

  return (
    <ScreenContainer showPracticeBanner>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Call Me Now</Text>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <Text style={[styles.settingsLink, { color: theme.primary }]}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={styles.callerPreview}>
          <ContactAvatar
            name={caller.name}
            imageUri={caller.imageUri}
            size={96}
            dark={settings.darkMode}
          />
          <Text style={[styles.callerName, { color: theme.text }]}>{caller.name}</Text>
          <Text style={[styles.callerPhone, { color: theme.textSecondary }]}>
            {caller.phoneNumber}
          </Text>
        </View>

        <Button title="Call Me" onPress={handleCallMe} large style={styles.callButton} />

        <View style={[styles.readyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.readyTitle, { color: theme.text }]}>Ready to go</Text>
          <Text style={[styles.readyDetail, { color: theme.textSecondary }]}>
            Delay: {formatDelayLabel(settings.defaultDelay)}
          </Text>
          <Text style={[styles.readyDetail, { color: theme.textSecondary }]}>
            Ringtone: {ringtoneLabel}
          </Text>
          <Text style={[styles.readyDetail, { color: theme.textSecondary }]}>
            Vibration: {settings.vibrationEnabled ? 'On' : 'Off'}
          </Text>
          <Text style={[styles.readyDetail, { color: theme.textSecondary }]}>
            AI voice: {settings.aiVoiceCallEnabled ? 'On (30s max)' : 'Off'}
          </Text>
          <Pressable onPress={() => navigation.navigate('Settings')}>
            <Text style={[styles.customizeLink, { color: theme.primary }]}>Customize in Settings</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
          This app simulates incoming calls for practice purposes only. It does not place real
          phone calls or integrate with your phone system.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsLink: {
    fontSize: 17,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  callerPreview: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  callerName: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 12,
  },
  callerPhone: {
    fontSize: 16,
  },
  callButton: {
    width: '100%',
    maxWidth: 280,
  },
  readyCard: {
    width: '100%',
    maxWidth: 280,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  readyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  readyDetail: {
    fontSize: 14,
  },
  customizeLink: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
