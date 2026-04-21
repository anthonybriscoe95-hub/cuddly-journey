# TradeOps AI

AI-first field service platform for HVAC, plumbing, and electrical contractors. Built with Expo + React Native — runs on iOS, Android, and the web from a single codebase.

This MVP demonstrates the full UX flow with mocked services. Swap the mock layer for real APIs to ship.

## Run it

```bash
cd tradeops-ai
npm install
npx expo start
```

Then choose how to preview:

- **Browser (instant)** → press `w` in the terminal. Opens at `http://localhost:8081`.
- **Real iPhone (10 seconds)** → install [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store, open the camera, scan the QR code in the terminal.
- **Real Android (10 seconds)** → install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Play Store, open it, scan the QR code.
- **iOS Simulator** → press `i` (requires macOS + Xcode).
- **Android Emulator** → press `a` (requires Android Studio).

## What's in here

```
app/                    Routes (file-based, expo-router)
  _layout.tsx           Root stack navigator
  (tabs)/               Bottom tab bar
    _layout.tsx
    index.tsx           Dashboard — KPIs, today's jobs, crew, AI calls
    jobs.tsx            Filterable + searchable job list
    ai.tsx              AI receptionist hub + call list
    customers.tsx       Customer directory sorted by LTV
  job/[id].tsx          Job detail — status flow, line items, notes
  customer/[id].tsx     Customer detail — contact, history, LTV
  call/[id].tsx         AI call detail — transcript, summary, linked job
  invoice/[id].tsx      Invoice modal — payment method, send

src/
  theme.ts              Colors, spacing, type scale
  types.ts              Domain types (Job, Customer, AICall, etc.)
  mockData.ts           Seed data — 6 jobs, 5 customers, 3 AI calls, 4 techs
  store.ts              Tiny reactive store (useSyncExternalStore)
  format.ts             Money, time, duration helpers
  components/           Card, Badge, Avatar, JobRow
```

## Core flows to demo

1. **Dashboard → Job → Status advance.** Tap any job. Hit "Start drive" → "Arrived" → "Mark complete" → "Send invoice." Each step persists in the store and shows in the dashboard KPIs.
2. **AI Calls → Call detail.** Open the AI tab. Tap a call. See the AI summary, full transcript bubble UI, and the linked job that was auto-booked.
3. **Add line items + send invoice.** From a completed job, add a few line items (e.g. "Capacitor R45 replacement", qty 1, $185). Hit "Send invoice." Pick a payment method. Tap mark paid.
4. **Customer LTV view.** Customers tab → tap "Sage Apartments" — see lifetime value, all their jobs.

## What to swap for production

| Mock | Replace with |
|---|---|
| `src/store.ts` (in-memory) | Postgres + Drizzle/Prisma + tRPC, or Supabase |
| `src/mockData.ts` | Real customer/job seed migration |
| AI call transcripts | Vapi / Retell / Bland for the voice agent + GPT-4o for summarization |
| `Linking.openURL('tel:...')` | Twilio for outbound calls + recording |
| Invoice "Send" action | Stripe payment links + webhooks |
| Tap-to-pay | Stripe Terminal SDK |
| Map "Directions" | `react-native-maps` with route optimization |

## Architecture notes

- **expo-router** for navigation (file-based, like Next.js). Switch from Stack to Drawer in `app/_layout.tsx` to add a side menu.
- **`useSyncExternalStore`** powers the tiny store in `src/store.ts` — zero deps, swap for Zustand or Redux Toolkit Query when you add a backend.
- **Theme tokens** live in `src/theme.ts`. To rebrand for white-label, change `colors.primary`, `colors.dark`, and `app.json` icon/splash.
- **TypeScript strict mode is on** — `npx tsc --noEmit` should always pass.

## Scripts

```bash
npm run start    # Expo dev server (all platforms)
npm run web      # Browser only
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
```
