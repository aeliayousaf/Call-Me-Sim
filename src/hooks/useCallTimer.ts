import { useEffect, useRef, useState } from 'react';
import { formatCallDuration } from '../services/callService';

export function useCallTimer(active: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setElapsedSeconds(0);
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [active]);

  return {
    elapsedSeconds,
    formattedDuration: formatCallDuration(elapsedSeconds),
  };
}

export function useCountdown(
  targetMs: number,
  onComplete: () => void,
  enabled: boolean
) {
  const [remainingMs, setRemainingMs] = useState(targetMs);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled || targetMs <= 0) {
      if (enabled && targetMs <= 0) {
        onCompleteRef.current();
      }
      return;
    }

    setRemainingMs(targetMs);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, targetMs - elapsed);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [targetMs, enabled]);

  return {
    remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
}
