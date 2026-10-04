# JAGO - AI Scholarship Assistant (MoTA)

Node.js + TypeScript + Express API with Gemini tool calling, RAG over scheme guidelines,
personalised student context and mock NSP/SFMP/NOS adapters.

## Run
```bash
npm install
cp .env.example .env      # add GEMINI_API_KEY (empty = offline demo mode)
npm run dev               # http://localhost:5000 (demo chat UI)
npm test                  # smoke test against a running server
```

## API
`POST /api/v1/chat` with header `X-JAGO-API-KEY: <secret>`
```json
{ "studentId": "STU001", "message": "Meri scholarship ka status kya hai?", "sessionId": "optional" }
```
Response: `{ success, data: { reply, sessionId, mode, toolsUsed, context } }`. Reuse `sessionId` for follow-ups.
`GET /health` shows whether Gemini or offline mode is active.

## Architecture
- `adapters/` + `services/student|scholarship`: provider interfaces with mock data. Replace with real NSP/SFMP/NOS clients.
- `tools/`: Gemini function calling (profile, live status, guideline search, eligibility). The student id is bound server-side, so the model can never read another student's data.
- `services/rag.service.ts`: chunks `knowledge/*.md`, uses Gemini embeddings when available, keyword search otherwise. Swap the in-memory store for pgvector later.
- `services/session.service.ts`: per-student conversation memory (in-memory, 30 min TTL).
- `services/safety.service.ts`: redacts Aadhaar/OTP-like input before the model sees it.
- `middleware/security.ts`: constant-time API key check and per-student rate limit.
- `services/fallback.service.ts`: rule-based replies if Gemini is missing or fails.

## Before production
1. Replace every `knowledge/*.md` file with official MoTA guideline text (current files are SAMPLE content).
2. Verify the income ceilings and levels in `eligibility.service.ts`.
3. Move sessions to PostgreSQL/Redis, set a strong `JAGO_API_KEY`, restrict `CORS_ORIGINS`.
4. Add real adapters once NSP/SFMP/NOS credentials are issued.
