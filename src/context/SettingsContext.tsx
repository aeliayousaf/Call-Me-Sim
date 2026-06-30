import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants/defaults';
import { loadSettings, updateSettings } from '../services/storageService';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';

interface SettingsContextValue {
  settings: AppSettings;
  theme: ThemeColors;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  setSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    const loaded = await loadSettings();
    setSettingsState(loaded);
  }, []);

  useEffect(() => {
    refreshSettings().finally(() => setIsLoading(false));
  }, [refreshSettings]);

  const setSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await updateSettings(partial);
    setSettingsState(updated);
  }, []);

  const theme = settings.darkMode ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ settings, theme, isLoading, refreshSettings, setSettings }),
    [settings, theme, isLoading, refreshSettings, setSettings]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
