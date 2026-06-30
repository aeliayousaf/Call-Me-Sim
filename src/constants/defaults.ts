import { AppSettings, CallerContact } from '../types';
import { PLACEHOLDER_CONTACTS } from './placeholders';

export const DEFAULT_CALLER: CallerContact = PLACEHOLDER_CONTACTS[0];

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCaller: DEFAULT_CALLER,
  defaultDelay: { type: '10s' },
  ringtone: 'classic',
  vibrationEnabled: true,
  darkMode: true,
  practiceModeLabel: false,
};

/** Caller used when starting a simulation — saved default or built-in fallback. */
export function getReadyCaller(settings: AppSettings): CallerContact {
  return settings.defaultCaller ?? DEFAULT_CALLER;
}

export const DELAY_LABELS: Record<string, string> = {
  immediate: 'Immediately',
  '10s': '10 seconds',
  '30s': '30 seconds',
  '1m': '1 minute',
  custom: 'Custom delay',
};

export const RINGTONE_LABELS: Record<string, string> = {
  classic: 'Classic',
  modern: 'Modern',
  gentle: 'Gentle',
};
