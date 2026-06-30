import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useConversationControls,
  useConversationInput,
  useConversationMode,
  useConversationStatus,
} from '@elevenlabs/react-native';
import { CallerContact } from '../types';
import { AI_MAX_CALL_DURATION_MS } from '../constants/aiConversation';
import {
  endAiConversationSession,
  fetchAiConversationStatus,
  fetchAiConversationToken,
  startAiConversationSession,
} from '../services/aiConversationApi';
import { requestMicrophonePermission } from '../services/microphonePermissionService';

export type AiCallPhase = 'connecting' | 'connected' | 'ending' | 'error';

function buildAgentOverrides(caller: CallerContact) {
  return {
    agent: {
      prompt: {
        prompt: [
          `You are ${caller.name}, calling the user on the phone for a brief realistic conversation.`,
          'Keep every reply to one or two short sentences, like a real phone call.',
          'Stay in character as the caller.',
          'Wrap up naturally and say goodbye within 30 seconds total.',
          'Never claim to be emergency services, police, or a government agency.',
        ].join(' '),
      },
      firstMessage: `Hey, it's ${caller.name}. Got a minute?`,
      language: 'en' as const,
    },
  };
}

export function useAiCallSession(caller: CallerContact, onEnded: () => void) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();
  const { isMuted, setMuted } = useConversationInput();

  const [phase, setPhase] = useState<AiCallPhase>('connecting');
  const [remainingMs, setRemainingMs] = useState(AI_MAX_CALL_DURATION_MS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const endedRef = useRef(false);
  const expiresAtRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const endCall = useCallback(
    async (reason = 'client_end') => {
      if (endedRef.current) return;
      endedRef.current = true;
      setPhase('ending');

      try {
        await endSession();
      } catch {
        // Session may already be closed
      }

      if (sessionIdRef.current) {
        try {
          await endAiConversationSession(sessionIdRef.current, reason);
        } catch {
          // Best-effort cleanup
        }
      }

      onEndedRef.current();
    },
    [endSession]
  );

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      try {
        const micGranted = await requestMicrophonePermission();
        if (!micGranted) {
          throw new Error('Microphone permission is required for AI voice calls.');
        }

        const start = await startAiConversationSession(caller.name);
        if (cancelled) return;

        sessionIdRef.current = start.sessionId;
        const tokenResponse = await fetchAiConversationToken(start.sessionId);
        if (cancelled) return;

        expiresAtRef.current = tokenResponse.expiresAt;
        setRemainingMs(tokenResponse.remainingMs);

        await startSession({
          conversationToken: tokenResponse.conversationToken,
          overrides: buildAgentOverrides(caller),
        });

        if (cancelled) return;
        setPhase('connected');
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to start AI call';
        setErrorMessage(message);
        setPhase('error');
      }
    };

    connect();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- connect once per caller
  }, [caller.id, caller.name, startSession]);

  useEffect(() => {
    if (phase !== 'connected') return;

    const tick = setInterval(() => {
      const expiresAt = expiresAtRef.current;
      if (!expiresAt) return;

      const remaining = Math.max(0, expiresAt - Date.now());
      setRemainingMs(remaining);

      if (remaining <= 0) {
        endCall('max_duration');
      }
    }, 250);

    return () => clearInterval(tick);
  }, [phase, endCall]);

  useEffect(() => {
    if (phase !== 'connected' || !sessionIdRef.current) return;

    const poll = setInterval(async () => {
      if (!sessionIdRef.current || endedRef.current) return;

      try {
        const pollStatus = await fetchAiConversationStatus(sessionIdRef.current);
        setRemainingMs(pollStatus.remainingMs);
        if (pollStatus.forceEnd) {
          endCall('server_limit');
        }
      } catch {
        // Ignore transient network errors during poll
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [phase, endCall]);

  useEffect(() => {
    return () => {
      if (!endedRef.current && sessionIdRef.current) {
        endedRef.current = true;
        void endSession();
        void endAiConversationSession(sessionIdRef.current, 'unmount');
      }
    };
  }, [endSession]);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  return {
    phase,
    remainingMs,
    errorMessage,
    isSpeaking,
    status,
    isMuted,
    toggleMute,
    endCall,
  };
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export { formatCountdown };
