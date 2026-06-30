import { config } from './config.js';
import { sessionStore } from './sessionStore.js';

const ELEVENLABS_TOKEN_URL = 'https://api.elevenlabs.io/v1/convai/conversation/token';

export async function fetchConversationToken(agentId) {
  const url = `${ELEVENLABS_TOKEN_URL}?agent_id=${encodeURIComponent(agentId)}`;
  const response = await fetch(url, {
    headers: {
      'xi-api-key': config.elevenLabsApiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs token request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('ElevenLabs response missing token');
  }

  return data.token;
}

export function createConversationSession(deviceId, callerName) {
  return sessionStore.createSession(deviceId, callerName);
}

export async function activateConversationSession(sessionId, deviceId) {
  const session = sessionStore.getSession(sessionId);
  if (!session) {
    throw new SessionError('Session not found', 404);
  }
  if (session.deviceId !== deviceId) {
    throw new SessionError('Session does not belong to this device', 403);
  }
  if (session.status === 'ended' || session.status === 'expired') {
    throw new SessionError('Session has already ended', 410);
  }
  if (session.tokenIssued) {
    throw new SessionError('Session token already issued', 409);
  }

  const rateCheck = sessionStore.checkRateLimits(deviceId);
  if (!rateCheck.allowed) {
    throw new SessionError(rateCheck.reason, 429);
  }

  const token = await fetchConversationToken(config.elevenLabsAgentId);
  const activated = sessionStore.activateSession(sessionId, token);
  sessionStore.recordUsage(deviceId);

  return {
    conversationToken: token,
    sessionId: activated.id,
    maxDurationMs: config.maxCallDurationMs,
    expiresAt: activated.expiresAt,
    remainingMs: sessionStore.getRemainingMs(activated),
  };
}

export function getSessionStatus(sessionId, deviceId) {
  const session = sessionStore.getSession(sessionId);
  if (!session) {
    throw new SessionError('Session not found', 404);
  }
  if (session.deviceId !== deviceId) {
    throw new SessionError('Session does not belong to this device', 403);
  }

  sessionStore.enforceExpiry(session);

  const remainingMs = sessionStore.getRemainingMs(session);
  const forceEnd = session.status === 'expired' || session.status === 'ended' || remainingMs <= 0;

  return {
    sessionId: session.id,
    status: session.status,
    remainingMs: Math.max(0, remainingMs),
    expiresAt: session.expiresAt,
    forceEnd,
  };
}

export function endConversationSession(sessionId, deviceId, reason = 'client_end') {
  const session = sessionStore.getSession(sessionId);
  if (!session) {
    throw new SessionError('Session not found', 404);
  }
  if (session.deviceId !== deviceId) {
    throw new SessionError('Session does not belong to this device', 403);
  }

  sessionStore.endSession(sessionId, reason);
  return { ok: true };
}

export class SessionError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'SessionError';
    this.statusCode = statusCode;
  }
}
