# Briscoe AI Command OS

A premium, dark-mode "agentic operating system" for running a local service +
AI automation business — built as a real React + Tailwind frontend, not a
mockup. Every page is wired, all data persists in `localStorage`, and every
skill produces a real, formatted text output you can copy, download, or save
to the Vault.

## Stack

- **React 19** + **Vite** for the app shell
- **Tailwind CSS v3** for the design system (dark mode, charcoal/black/white
  with an orange accent)
- **localStorage** for persistence — no backend required
- Zero external state libs; small `useReducer`-based store

## Pages

- **Dashboard** — hero, stats, today's tasks, follow-ups, pipeline, recent
  AI runs, quick actions
- **Skills** — clickable skill cards (Find Local Leads, Cold Text/Email,
  Follow Up, Build Offer, Generate Flyer, TikTok Script, Invoice, Daily
  Business Plan, Client Status Report) — each opens a form and produces a
  formatted output
- **Leads** — CRM table with filters, statuses (New / Contacted / Interested
  / Booked / Won / Lost), and full edit modal
- **Clients** — engagement cards with deliverable checklists, pricing,
  status, due dates
- **Vault** — file memory system with categories (Raw / Wiki / Outputs /
  Clients / Automations); skill outputs save here in one click
- **Outreach Generator** — text / email / follow-up / call / FB DM with
  tone control
- **Daily Command Center** — today's tasks, follow-ups, client work,
  content plan, weekly revenue tracker
- **Settings** — business info, brand color, services, pricing, data reset

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Notes

- Every skill is a pure JS function in `src/skills/registry.js` — drop in a
  new entry and it shows up in the Skills page automatically.
- All data is keyed under `briscoe-os.v1` in localStorage. Clear it from
  Settings → "Reset all data" to start clean.
