# AI Voice Calls (Phase 3) — Setup Guide

Real-time ElevenLabs voice agent conversations with a **30-second hard cap** enforced on both the app and the AI server.

## Architecture

```
App (AiActiveCallScreen)
  → POST /api/v1/conversation/start     (create session)
  → POST /api/v1/conversation/token       (ElevenLabs WebRTC token)
  → ElevenLabs ConversationProvider       (real-time voice)
  → polls GET /session/:id              (server force-end at 30s)
  → POST /api/v1/conversation/end         (cleanup)
```

## Requirements

- **Development build** — AI voice uses LiveKit WebRTC. **Expo Go is not supported.**
- **ElevenLabs account** with a configured [voice agent](https://elevenlabs.io/app/agents)
- **AI server** running (see below)
- **Internet connection** on the device

## 1. Configure the AI server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=agent_xxxxxxxx
MAX_CALL_DURATION_MS=30000
PORT=3001
```

Start the server:

```bash
npm install
npm run dev
```

Verify: `curl http://localhost:3001/health`

### Server limits (enforced)

| Limit | Default | Env var |
|-------|---------|---------|
| Max call duration | 30 seconds | `MAX_CALL_DURATION_MS` |
| Calls per hour (per device) | 10 | `MAX_CALLS_PER_HOUR` |
| Calls per day (per device) | 40 | `MAX_CALLS_PER_DAY` |

## 2. Point the app at your server

In `app.json` → `expo.extra.aiServerUrl`:

```json
"aiServerUrl": "http://YOUR_COMPUTER_IP:3001"
```

For production, deploy the `server/` folder (Railway, Fly.io, Render, etc.) and use your HTTPS URL.

**Android emulator:** use `http://10.0.2.2:3001`  
**iOS simulator:** use `http://localhost:3001`  
**Physical device:** use your computer's LAN IP (e.g. `http://192.168.1.5:3001`)

## 3. Build a development client

AI voice requires native modules. Create a dev build:

```bash
npx expo run:ios
# or
npx expo run:android
```

Or with EAS:

```bash
npm run build:ios
```

## 4. Enable AI voice in the app

1. Open **Settings**
2. Turn on **AI Voice Call**
3. Trigger a simulated call and **Accept**

The caller will speak in real time for up to **30 seconds**, then the call ends automatically.

## ElevenLabs agent tips

Configure your agent in the ElevenLabs dashboard:

- **Voice:** pick a natural phone-call voice
- **First message:** can be overridden per call (app sends caller name)
- **Max duration:** align agent behavior with 30s cap in the system prompt
- **Authentication:** keep agent private — the app uses server-issued conversation tokens only

## Privacy & App Store notes

When AI voice is enabled:

- Microphone audio is processed by **ElevenLabs** (and your server)
- **Internet is required**
- Update your privacy policy and App Store privacy labels accordingly
- Recommend keeping **Practice Mode** enabled during review

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "AI server request failed" | Check `aiServerUrl`, server running, device on same network |
| "Microphone permission required" | Grant mic permission in system settings |
| Works in Expo Go | Use a development build instead |
| No audio | Rebuild after adding LiveKit plugins; check agent ID and API key |
| Call ends at 30s | Expected — server-enforced limit |

## Files added

| Path | Purpose |
|------|---------|
| `server/` | Token proxy + 30s session limits |
| `src/screens/AiActiveCallScreen.tsx` | AI call UI |
| `src/hooks/useAiCallSession.ts` | Session orchestration |
| `src/services/aiConversationApi.ts` | Server API client |
