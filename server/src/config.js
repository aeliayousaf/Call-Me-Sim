import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? '',
  elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID ?? '',
  maxCallDurationMs: Number(process.env.MAX_CALL_DURATION_MS ?? 30_000),
  maxCallsPerHour: Number(process.env.MAX_CALLS_PER_HOUR ?? 10),
  maxCallsPerDay: Number(process.env.MAX_CALLS_PER_DAY ?? 40),
  sessionPendingTtlMs: Number(process.env.SESSION_PENDING_TTL_MS ?? 120_000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

export function assertConfig() {
  const missing = [];
  if (!config.elevenLabsApiKey) missing.push('ELEVENLABS_API_KEY');
  if (!config.elevenLabsAgentId) missing.push('ELEVENLABS_AGENT_ID');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
