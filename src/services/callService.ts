import { DelayConfig } from '../types';

export function delayToMilliseconds(delay: DelayConfig): number {
  switch (delay.type) {
    case 'immediate':
      return 0;
    case '10s':
      return 10_000;
    case '30s':
      return 30_000;
    case '1m':
      return 60_000;
    case 'custom':
      return Math.max(0, (delay.customSeconds ?? 0) * 1000);
    default:
      return 0;
  }
}

export function formatCallDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDelayLabel(delay: DelayConfig): string {
  switch (delay.type) {
    case 'immediate':
      return 'Immediately';
    case '10s':
      return '10 seconds';
    case '30s':
      return '30 seconds';
    case '1m':
      return '1 minute';
    case 'custom':
      return `${delay.customSeconds ?? 0} seconds`;
    default:
      return 'Immediately';
  }
}
