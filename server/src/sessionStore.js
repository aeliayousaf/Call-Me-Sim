import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';

/** @typedef {'pending' | 'active' | 'ended' | 'expired'} SessionStatus */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} deviceId
 * @property {string} callerName
 * @property {SessionStatus} status
 * @property {number} createdAt
 * @property {number | null} startedAt
 * @property {number | null} expiresAt
 * @property {boolean} tokenIssued
 * @property {string | null} endReason
 */

class SessionStore {
  constructor() {
    /** @type {Map<string, Session>} */
    this.sessions = new Map();
    /** @type {Map<string, number[]>} */
    this.usageByDevice = new Map();
  }

  createSession(deviceId, callerName) {
    const now = Date.now();
    const session = {
      id: uuidv4(),
      deviceId,
      callerName: callerName?.trim() || 'Caller',
      status: 'pending',
      createdAt: now,
      startedAt: null,
      expiresAt: null,
      tokenIssued: false,
      endReason: null,
    };
    this.sessions.set(session.id, session);
    return {
      sessionId: session.id,
      maxDurationMs: config.maxCallDurationMs,
      pendingExpiresAt: now + config.sessionPendingTtlMs,
    };
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    this.enforceExpiry(session);
    return session;
  }

  activateSession(sessionId, _token) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    this.expireStalePendingSessions();

    if (session.status !== 'pending') {
      throw new Error(`Cannot activate session in status ${session.status}`);
    }

    const now = Date.now();
    if (now - session.createdAt > config.sessionPendingTtlMs) {
      session.status = 'expired';
      session.endReason = 'pending_timeout';
      throw new Error('Session expired before activation');
    }

    session.status = 'active';
    session.startedAt = now;
    session.expiresAt = now + config.maxCallDurationMs;
    session.tokenIssued = true;
    return session;
  }

  endSession(sessionId, reason) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    if (session.status === 'ended' || session.status === 'expired') return;
    session.status = 'ended';
    session.endReason = reason;
  }

  enforceExpiry(session) {
    if (session.status !== 'active' || !session.expiresAt) return;
    if (Date.now() >= session.expiresAt) {
      session.status = 'expired';
      session.endReason = 'max_duration';
    }
  }

  getRemainingMs(session) {
    if (!session.expiresAt) return config.maxCallDurationMs;
    return session.expiresAt - Date.now();
  }

  expireStalePendingSessions() {
    const now = Date.now();
    for (const session of this.sessions.values()) {
      if (session.status !== 'pending') continue;
      if (now - session.createdAt > config.sessionPendingTtlMs) {
        session.status = 'expired';
        session.endReason = 'pending_timeout';
      }
    }
  }

  expireActiveSessions() {
    for (const session of this.sessions.values()) {
      this.enforceExpiry(session);
    }
  }

  checkRateLimits(deviceId) {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const usage = (this.usageByDevice.get(deviceId) ?? []).filter((t) => t > dayAgo);

    const perHour = usage.filter((t) => t > hourAgo).length;
    if (perHour >= config.maxCallsPerHour) {
      return { allowed: false, reason: 'Hourly AI call limit reached. Try again later.' };
    }
    if (usage.length >= config.maxCallsPerDay) {
      return { allowed: false, reason: 'Daily AI call limit reached. Try again tomorrow.' };
    }
    return { allowed: true };
  }

  recordUsage(deviceId) {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const usage = (this.usageByDevice.get(deviceId) ?? []).filter((t) => t > dayAgo);
    usage.push(now);
    this.usageByDevice.set(deviceId, usage);
  }
}

export const sessionStore = new SessionStore();

setInterval(() => {
  sessionStore.expireActiveSessions();
  sessionStore.expireStalePendingSessions();
}, 1000);
