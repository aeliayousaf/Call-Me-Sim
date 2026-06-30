import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { assertConfig, config } from './config.js';
import {
  SessionError,
  activateConversationSession,
  createConversationSession,
  endConversationSession,
  getSessionStatus,
} from './conversationService.js';

assertConfig();

const app = express();

app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  })
);
app.use(express.json({ limit: '32kb' }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    maxCallDurationMs: config.maxCallDurationMs,
  });
});

app.post('/api/v1/conversation/start', (req, res) => {
  try {
    const deviceId = String(req.body?.deviceId ?? '').trim();
    const callerName = String(req.body?.callerName ?? 'Caller').trim();

    if (!deviceId || deviceId.length < 8) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const session = createConversationSession(deviceId, callerName);
    return res.json(session);
  } catch (error) {
    console.error('start session error', error);
    return res.status(500).json({ error: 'Failed to create session' });
  }
});

app.post('/api/v1/conversation/token', async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId ?? '').trim();
    const deviceId = String(req.body?.deviceId ?? '').trim();

    if (!sessionId || !deviceId) {
      return res.status(400).json({ error: 'sessionId and deviceId are required' });
    }

    const result = await activateConversationSession(sessionId, deviceId);
    return res.json(result);
  } catch (error) {
    if (error instanceof SessionError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('token error', error);
    return res.status(500).json({ error: 'Failed to issue conversation token' });
  }
});

app.get('/api/v1/conversation/session/:sessionId', (req, res) => {
  try {
    const deviceId = String(req.query.deviceId ?? '').trim();
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId query param is required' });
    }

    const status = getSessionStatus(req.params.sessionId, deviceId);
    return res.json(status);
  } catch (error) {
    if (error instanceof SessionError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('status error', error);
    return res.status(500).json({ error: 'Failed to read session status' });
  }
});

app.post('/api/v1/conversation/end', (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId ?? '').trim();
    const deviceId = String(req.body?.deviceId ?? '').trim();
    const reason = String(req.body?.reason ?? 'client_end');

    if (!sessionId || !deviceId) {
      return res.status(400).json({ error: 'sessionId and deviceId are required' });
    }

    endConversationSession(sessionId, deviceId, reason);
    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof SessionError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('end error', error);
    return res.status(500).json({ error: 'Failed to end session' });
  }
});

app.listen(config.port, () => {
  console.log(`Call Me Now AI server listening on :${config.port}`);
  console.log(`Max call duration: ${config.maxCallDurationMs}ms`);
});
