# Harbor Glass Window Cleaning — Business App

An AI-powered lead generation, CRM, and business toolkit built for
**Harbor Glass Window Cleaning** (302-494-9680 · harborglasscleaning@gmail.com ·
harborglasswindowcleaning.com), plus a customer-facing marketing website.

Built with **Next.js 15 (App Router) · React 19 · Tailwind CSS**. Runs fully in
**demo mode with zero configuration** — every integration below is optional and
upgrades the app when you add a key.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:3000
```

- `/` — the public **Harbor Glass website**: online booking, free estimate
  request, live chat, before/after gallery, testimonials, service-area map,
  and contact form. Booking requests flow straight into the app as leads.
- `/login` — owner sign-in (demo mode: any email + password of 4+ characters).
- `/app` — the business app (see modules below).

## Modules

| Module | What it does |
|---|---|
| **Dashboard** | New leads, pipeline value, revenue this month, follow-ups due, hottest leads. |
| **Lead Finder** | Search public business listings via the official Google Places API (with a key), filter/sort every lead by name, website, phone, email, city, source, and opportunity score, and quick-add leads you spot in Facebook groups, Nextdoor, or Reddit. |
| **AI Assistant** | Personalized outreach messages for homeowners, businesses, realtors, property managers, and Airbnb hosts — three tones, per-lead personalization, one-click copy or email. |
| **Route Planner** | Save leads, organize by neighborhood, auto-order stops (nearest-neighbor), open the full route in Google Maps, embedded map with a key. |
| **CRM** | Kanban pipeline: New → Contacted → Estimate Scheduled → Quote Sent → Won / Lost, with follow-up dates and due alerts. Winning a lead auto-creates a job. |
| **Estimates** | Professional branded estimates: customer info, service line items, taxes, totals, logo — export via Print → Save as PDF. |
| **Invoices** | Same builder plus payment buttons: Stripe link, Square link, Cash App, Venmo. |
| **Marketing Studio** | Facebook / Instagram / Google Business Profile posts, plus print-ready flyer, door hanger, business card, and before/after templates. |
| **Review Generator** | Post-job review requests by text and email, plus a downloadable QR code linking to your Google Reviews page. |
| **AI Business Coach** | A morning briefing computed from your live data: best neighborhoods, businesses to visit, overdue follow-ups, revenue and job counts, and a prioritized task list. |

## Configuration (all optional)

Copy `.env.example` to `.env.local` and fill in what you have:

| Key | Unlocks |
|---|---|
| `OPENAI_API_KEY` | AI-written outreach, marketing copy, and website live chat (falls back to built-in templates). |
| `GOOGLE_MAPS_API_KEY` | Live Google Places business search in the Lead Finder. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Embedded Google Maps directions in the Route Planner. |
| `NEXT_PUBLIC_FIREBASE_*` | Real authentication and cloud data (see below). |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, `NEXT_PUBLIC_SQUARE_PAYMENT_LINK`, `NEXT_PUBLIC_CASHAPP_CASHTAG`, `NEXT_PUBLIC_VENMO_HANDLE` | Payment buttons on invoices (also editable in-app under Settings). |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | Your real Google review link for requests and the QR code. |

### Data & auth

Demo mode stores everything in the browser (`localStorage`) so the app works
instantly on any machine. For multi-device cloud data, all persistence lives in
one file — `lib/store.js` — and login lives in `app/login/page.jsx`; swap them
for Firestore reads/writes and `firebase/auth` once your Firebase env vars are
set. The rest of the app talks only to the store helpers, so nothing else
changes.

### A note on lead sources (important)

This app **does not scrape Facebook, Nextdoor, or Reddit** — automated scraping
violates those platforms' terms of service and risks your accounts. Instead it
combines sources that are reliable and compliant:

- **Google Places API** (official) for storefronts, restaurants, realtors,
  property managers, and other businesses,
- **your own website's booking/estimate form**, which feeds leads directly
  into the CRM,
- **manual quick-add** for opportunities you personally spot in local Facebook
  groups, Nextdoor, or Reddit while participating there.

## Deployment

The easiest path is [Vercel](https://vercel.com): import the repo, add your
env vars, deploy. Any Node host works:

```bash
npm run build
npm start
```

## Project structure

```
app/
  page.jsx              # public marketing website (booking, chat, gallery…)
  login/                # owner sign-in
  app/                  # the business app (dashboard, leads, crm, …)
  api/generate/         # OpenAI-backed copywriting endpoint (with fallback)
  api/leads/search/     # Google Places lead search (with fallback)
components/             # shared UI + estimate/invoice builder
lib/
  company.js            # brand, services, pipeline stages — edit me
  store.js              # data layer (localStorage now, Firestore-ready)
  templates.js          # built-in copywriting engine
```
