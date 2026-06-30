import * as Contacts from 'expo-contacts';
import { CallerContact } from '../types';
import { PLACEHOLDER_CONTACTS } from '../constants/placeholders';

export type ContactsPermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function requestContactsPermission(): Promise<ContactsPermissionStatus> {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function getContactsPermissionStatus(): Promise<ContactsPermissionStatus> {
  const { status } = await Contacts.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function mapContact(contact: Contacts.ExistingContact): CallerContact | null {
  const name = contact.name?.trim();
  const phone = contact.phoneNumbers?.[0]?.number?.trim();
  if (!name || !phone) return null;

  return {
    id: contact.id ?? `${name}-${phone}`,
    name,
    phoneNumber: phone,
    imageUri: contact.image?.uri,
  };
}

export async function fetchContacts(): Promise<{
  contacts: CallerContact[];
  permissionStatus: ContactsPermissionStatus;
}> {
  const permissionStatus = await getContactsPermissionStatus();

  if (permissionStatus !== 'granted') {
    return { contacts: PLACEHOLDER_CONTACTS, permissionStatus };
  }

  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
      sort: Contacts.SortTypes.FirstName,
    });

    const contacts = data
      .map(mapContact)
      .filter((c): c is CallerContact => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (contacts.length === 0) {
      return { contacts: PLACEHOLDER_CONTACTS, permissionStatus };
    }

    return { contacts, permissionStatus };
  } catch (error) {
    console.warn('Failed to fetch contacts:', error);
    return { contacts: PLACEHOLDER_CONTACTS, permissionStatus };
  }
}
