# Coach

A minimal, gamified chat app for the **Fitness Coach** n8n workflow. Users chat with an AI personal trainer and earn XP for check-ins. XP drives levels, daily streaks, a daily goal and badges.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui
**Backend:** n8n webhook (see [`n8n/contract.md`](n8n/contract.md), export in [`n8n/workflow.json`](n8n/workflow.json))

```
browser → POST /api/chat → n8n webhook (x-api-key) → AI Agent → { success, data: { reply } }
```

The browser never calls n8n directly. The API key stays server-side.

## Run locally

```bash
cp .env.example .env.local   # fill in both values
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Value |
|---|---|
| `N8N_WEBHOOK_URL` | Production webhook URL (`…/webhook/fitness-coach`) |
| `N8N_WEBHOOK_API_KEY` | Value of the n8n "Header Auth account" credential |

> The key is intentionally **not** called `N8N_API_KEY`. That name usually holds the n8n Public API key (used by n8n-mcp), and an existing shell variable would silently override `.env.local`.

## Gamification rules

All progress is stored in the browser (`localStorage`, key `coach.progress.v1`). There are no accounts. Rules live in [`src/lib/gamification.ts`](src/lib/gamification.ts).

- **XP:** +10 per check-in. A message must have 3+ words, and XP pauses for 20s between messages. +15 for the first check-in of the day. +25 on reaching a 3-day streak, +50 every 7 days.
- **Levels:** next level costs `50 + 25 × (level − 1)` XP. Rookie → Regular → Committed → Athlete → Elite → Legend (then Legend II, III…). Shown as plates loading onto a barbell.
- **Streak:** consecutive calendar days with at least one check-in.
- **Daily goal:** 3 check-ins.
- **Badges:** First Rep, Warm-up, On a Roll, Week Strong, Fuel Up, Program Builder, Early Bird, Night Owl.

XP is only awarded after the coach replies successfully.

## Project layout

```
src/app/api/chat/route.ts   validates input, proxies to n8n
src/lib/n8n.ts              the single n8n caller (timeout, error normalising)
src/lib/gamification.ts     pure rules engine
src/hooks/                  use-chat (history, session), use-progress (XP state)
src/components/chat/        message list, markdown, composer, empty state
src/components/progress/    barbell, goal ring, badges, panel, mobile sheet
n8n/                        workflow export + contract
```
