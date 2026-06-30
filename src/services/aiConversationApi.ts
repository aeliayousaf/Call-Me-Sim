import { getAiServerUrl } from '../constants/aiConversation';
import { getDeviceId } from './deviceIdService';

export interface ConversationStartResponse {
  sessionId: string;
  maxDurationMs: number;
  pendingExpiresAt: number;
}

export interface ConversationTokenResponse {
  conversationToken: string;
  sessionId: string;
  maxDurationMs: number;
  expiresAt: number;
  remainingMs: number;
}

export interface ConversationStatusResponse {
  sessionId: string;
  status: 'pending' | 'active' | 'ended' | 'expired';
  remainingMs: number;
  expiresAt: number | null;
  forceEnd: boolean;
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const baseUrl = getAiServerUrl().replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : 'AI server request failed';
    throw new Error(message);
  }
  return data as T;
}

async function getJson<T>(path: string): Promise<T> {
  const baseUrl = getAiServerUrl().replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : 'AI server request failed';
    throw new Error(message);
  }
  return data as T;
}

export async function startAiConversationSession(callerName: string): Promise<ConversationStartResponse> {
  const deviceId = await getDeviceId();
  return postJson<ConversationStartResponse>('/api/v1/conversation/start', {
    deviceId,
    callerName,
  });
}

export async function fetchAiConversationToken(
  sessionId: string
): Promise<ConversationTokenResponse> {
  const deviceId = await getDeviceId();
  return postJson<ConversationTokenResponse>('/api/v1/conversation/token', {
    sessionId,
    deviceId,
  });
}

export async function fetchAiConversationStatus(
  sessionId: string
): Promise<ConversationStatusResponse> {
  const deviceId = await getDeviceId();
  return getJson<ConversationStatusResponse>(
    `/api/v1/conversation/session/${encodeURIComponent(sessionId)}?deviceId=${encodeURIComponent(deviceId)}`
  );
}

export async function endAiConversationSession(
  sessionId: string,
  reason = 'client_end'
): Promise<void> {
  const deviceId = await getDeviceId();
  await postJson('/api/v1/conversation/end', { sessionId, deviceId, reason });
}

export async function checkAiServerHealth(): Promise<boolean> {
  try {
    const baseUrl = getAiServerUrl().replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
