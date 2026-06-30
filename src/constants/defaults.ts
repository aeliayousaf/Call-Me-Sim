import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCaller: null,
  defaultDelay: { type: 'immediate' },
  ringtone: 'classic',
  vibrationEnabled: true,
  darkMode: true,
  practiceModeLabel: true,
};

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
