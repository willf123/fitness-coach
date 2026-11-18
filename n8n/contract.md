# Contract: Coach app ↔ n8n "Fitness Coach" workflow

- **Workflow:** Fitness Coach (`zPhOrJ7zz6Kak0H5`) on n8n Cloud
- **Endpoint:** `POST {N8N_WEBHOOK_URL}` (production: `/webhook/fitness-coach`, test: `/webhook-test/fitness-coach`)
- **Auth:** header `x-api-key: {N8N_API_KEY}` (n8n Header Auth credential "Header Auth account")
- **Called only by** the Next.js route `POST /api/chat`. The browser never calls n8n directly.

## Request

```json
{
  "message": "Give me a 3-day beginner full body split",
  "sessionId": "8f1c2a4e-…"
}
```

| Field | Type | Rules |
|---|---|---|
| `message` | string | Required. Trimmed, 1–2000 characters. |
| `sessionId` | string | Required, non-empty. Keys the agent's conversation memory (last 10 turns). One per chat thread. |

## Responses

**200 – reply**
```json
{ "success": true, "data": { "reply": "markdown string" } }
```
`reply` is Markdown (paragraphs, lists, bold, occasional GFM tables).

**400 – invalid input** (empty/missing message, >2000 chars, missing sessionId)
```json
{ "success": false, "error": "Both 'message' (1–2000 characters) and 'sessionId' are required." }
```

**403 – bad/missing `x-api-key`**: returned by n8n itself (not our JSON shape).

**500 – agent/model failure** (after 1 automatic retry)
```json
{ "success": false, "error": "The coach is unavailable right now. Please try again." }
```

## Workflow shape
```
Webhook (POST, Header Auth, respond via Respond node)
 → Normalize – Webhook  { source: "webhook", input: { message, sessionId } }
 → Valid input?
     true  → Fitness Coach (AI Agent · OpenRouter gpt-4o-mini · Window Buffer Memory)
               ok    → Respond 200 – Reply
               error → Respond 500 – Coach error
     false → Respond 400 – Invalid input
```

## Notes
- Memory is in-process Window Buffer Memory. It can reset if n8n Cloud restarts. The app keeps its own visible history in localStorage.
- Gamification (XP, levels, streaks, badges) is computed entirely client-side. n8n does not know about it.
