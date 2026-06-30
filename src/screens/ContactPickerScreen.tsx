import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CallerContact } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { ContactAvatar } from '../components/ContactAvatar';
import { Button } from '../components/Button';
import {
  fetchContacts,
  requestContactsPermission,
  ContactsPermissionStatus,
} from '../services/contactsService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ContactPicker'>;
  route: RouteProp<RootStackParamList, 'ContactPicker'>;
};

export function ContactPickerScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { theme, settings, setSettings } = useSettings();
  const [contacts, setContacts] = useState<CallerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<ContactsPermissionStatus>('undetermined');
  const [search, setSearch] = useState('');

  const loadContacts = useCallback(async () => {
    setLoading(true);
    const result = await fetchContacts();
    setContacts(result.contacts);
    setPermissionStatus(result.permissionStatus);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleRequestPermission = async () => {
    const status = await requestContactsPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      await loadContacts();
    }
  };

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phoneNumber.toLowerCase().includes(query)
    );
  }, [contacts, search]);

  const handleSelect = (contact: CallerContact) => {
    if (mode === 'settings') {
      setSettings({ defaultCaller: contact });
      navigation.goBack();
    } else {
      navigation.navigate('DelaySelection', { caller: contact });
    }
  };

  const renderItem = ({ item }: { item: CallerContact }) => (
    <Pressable
      onPress={() => handleSelect(item)}
      style={({ pressed }) => [
        styles.contactRow,
        { backgroundColor: pressed ? theme.border : theme.surface },
      ]}
    >
      <ContactAvatar name={item.name} imageUri={item.imageUri} size={48} dark={settings.darkMode} />
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
          {item.phoneNumber}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: theme.primary }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Select Contact</Text>
        <View style={styles.back} />
      </View>

      {permissionStatus === 'denied' && (
        <View style={[styles.permissionBanner, { backgroundColor: theme.surface }]}>
          <Text style={[styles.permissionText, { color: theme.text }]}>
            Contacts access denied. Showing sample contacts. Enable access in Settings to use your
            real contacts.
          </Text>
          <Button
            title="Open Settings"
            variant="secondary"
            onPress={() => Linking.openSettings()}
            style={styles.settingsButton}
          />
        </View>
      )}

      {permissionStatus === 'undetermined' && (
        <View style={[styles.permissionBanner, { backgroundColor: theme.surface }]}>
          <Text style={[styles.permissionText, { color: theme.text }]}>
            Allow access to your contacts to pick a caller, or use sample contacts below.
          </Text>
          <Button
            title="Allow Contacts"
            onPress={handleRequestPermission}
            style={styles.settingsButton}
          />
        </View>
      )}

      <TextInput
        style={[
          styles.search,
          { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="Search contacts..."
        placeholderTextColor={theme.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
          )}
        />
      )}
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
    width: 70,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  permissionBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  permissionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingsButton: {
    alignSelf: 'flex-start',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  loader: {
    marginTop: 40,
  },
});
