export interface CallerContact {
  id: string;
  name: string;
  phoneNumber: string;
  imageUri?: string;
}

export type DelayOption = 'immediate' | '10s' | '30s' | '1m' | 'custom';

export interface DelayConfig {
  type: DelayOption;
  customSeconds?: number;
}

export type BuiltinRingtoneId = 'classic' | 'modern' | 'gentle';
export type RingtoneId = BuiltinRingtoneId | 'custom';

export interface AppSettings {
  defaultCaller: CallerContact | null;
  defaultDelay: DelayConfig;
  ringtone: RingtoneId;
  /** Local file URI for a user-picked audio file */
  customRingtoneUri?: string | null;
  customRingtoneName?: string | null;
  vibrationEnabled: boolean;
  darkMode: boolean;
  /** Shows a "Practice Mode" banner for App Store compliance */
  practiceModeLabel: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  ContactPicker: { mode: 'call' | 'settings' };
  DelaySelection: { caller: CallerContact; autoStart?: boolean };
  IncomingCall: { caller: CallerContact };
  ActiveCall: { caller: CallerContact };
  Settings: undefined;
};
