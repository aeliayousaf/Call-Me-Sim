import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { ContactAvatar } from '../components/ContactAvatar';
import { formatDelayLabel } from '../services/callService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const { settings, theme } = useSettings();
  const defaultCaller = settings.defaultCaller;

  const handleCallMe = () => {
    if (defaultCaller) {
      navigation.navigate('DelaySelection', { caller: defaultCaller });
    } else {
      navigation.navigate('ContactPicker', { mode: 'call' });
    }
  };

  return (
    <ScreenContainer showPracticeBanner>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Call Me Now</Text>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <Text style={[styles.settingsLink, { color: theme.primary }]}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        {defaultCaller ? (
          <View style={styles.callerPreview}>
            <ContactAvatar
              name={defaultCaller.name}
              imageUri={defaultCaller.imageUri}
              size={80}
              dark={settings.darkMode}
            />
            <Text style={[styles.callerName, { color: theme.text }]}>{defaultCaller.name}</Text>
            <Text style={[styles.callerPhone, { color: theme.textSecondary }]}>
              {defaultCaller.phoneNumber}
            </Text>
            <Pressable onPress={() => navigation.navigate('ContactPicker', { mode: 'call' })}>
              <Text style={[styles.changeLink, { color: theme.primary }]}>Change caller</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select a contact to simulate an incoming call
          </Text>
        )}

        <Button title="Call Me" onPress={handleCallMe} large style={styles.callButton} />

        <Text style={[styles.delayHint, { color: theme.textSecondary }]}>
          Default delay: {formatDelayLabel(settings.defaultDelay)}
        </Text>
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
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  callerPreview: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  callerName: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  callerPhone: {
    fontSize: 16,
  },
  changeLink: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  callButton: {
    width: '100%',
    maxWidth: 280,
  },
  delayHint: {
    marginTop: 16,
    fontSize: 14,
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
