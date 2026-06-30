import Constants from 'expo-constants';

/** Hard cap mirrored from server default — server is source of truth. */
export const AI_MAX_CALL_DURATION_MS = 30_000;

export function getAiServerUrl(): string {
  const extra = Constants.expoConfig?.extra as { aiServerUrl?: string } | undefined;
  return extra?.aiServerUrl ?? 'http://localhost:3001';
}
