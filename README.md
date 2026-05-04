# AI Agent Command Room

A local-first React command center that routes tasks to specialized AI agents,
keeps a safety/approval gate on risky actions, and never shows fake task results.

## Easiest way to use it (no install, no terminal)

1. Go to `agent-command-room.html` in this repo on GitHub.
2. Click the **Download raw file** button (or right-click "Save as…").
3. Double-click the downloaded file. Your browser opens the dashboard.
4. Optional: type a Backend URL in the header (e.g. `http://localhost:5174/api`)
   if you have a backend running. Leave it empty to just explore the UI.

The whole app is bundled into a single self-contained HTML file. It runs from
your hard drive — no Node, no npm, no `localhost`.

Open this clickable preview in your browser (no download required):
https://raw.githack.com/anthonybriscoe95-hub/cuddly-journey/claude/ai-agent-command-room-gj4E5/agent-command-room.html

## Full dev setup (with the mock backend)

```bash
git clone <this repo>
cd cuddly-journey
git checkout claude/ai-agent-command-room-gj4E5

npm install
cp server/.env.example server/.env
# edit server/.env and add your OPENAI_API_KEY (optional)

npm run dev
```

Then open http://localhost:5173.

The Vite dev server proxies `/api/*` to the local mock backend on port 5174,
so the UI talks to the backend without CORS hassles.

## How it works

- **Without an API key**: `/api/agent-task` returns an explicit "no key configured"
  message — no fake business data is ever produced.
- **With an API key**: each agent uses a tailored system prompt and returns real
  JSON results (summary + list).
- **Risky task types** (`draft_messages`, `schedule_followups`, `content_creation`)
  generate an approval card. Nothing is sent, posted, or scheduled until you click
  Approve.

## Backend routes

- `GET  /api/health` — connection check (also reports whether OpenAI key is set)
- `POST /api/agent-task` — runs an agent task
- `POST /api/approval` — confirms an approved action
- `POST /api/gmail/draft` — creates a Gmail draft (mock — wire to Gmail API)
- `POST /api/calendar/create` — creates a calendar event (mock)
- `POST /api/sheets/update` — updates a Google Sheet (mock)

The Gmail/Calendar/Sheets mocks return success and log payloads. Replace them
with real integrations when you're ready — the UI doesn't need to change.

## Keyboard shortcuts

- `Cmd/Ctrl` + `Enter` — run the typed task from anywhere on the page
- `Enter` in the task box — add and run
- `Esc` in the task box — clear the input
- `Enter` in the chat box — send

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs Vite + the mock backend together (recommended) |
| `npm run dev:web` | Vite dev server only (port 5173) |
| `npm run dev:api` | Mock backend only (port 5174) |
| `npm run build` | Production build into `dist/` |
| `npm run build:standalone` | Build the single-file `standalone/index.html` |
| `npm run preview` | Serve the production build locally |

## What changed vs the original component

Bug fixes:
- Used a ref for the active-task guard so rapid clicks can't double-run.
- Memoized `motion` keyframe arrays so animations don't restart every render.
- Auto-finalize tasks once their approvals resolve (was stuck at "Waiting").
- `clearWorkspace` now refuses to wipe state while a task is mid-flight.
- Removed redundant double-normalization in render paths.
- Stored chat as objects (id/sender/text/time) instead of opaque strings.

New features:
- Toast notifications, task cancel/delete, output copy, JSON export.
- Per-agent specialized chat replies routed by keyword scoring.
- Status filter + free-text search over the queue.
- Stats bar (Total / Done / Failed / Awaiting / Backend).
- Live clock + periodic backend health poll.
- Activity log levels (info/ok/warn/error) with color coding.
- Built-in self-tests show pass/fail in the UI.
