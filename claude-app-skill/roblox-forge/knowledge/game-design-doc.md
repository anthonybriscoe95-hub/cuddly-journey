---
name: game-design-doc
description: Template and process for writing a Roblox game design document (GDD) or feature spec — pitch, core loops, progression, economy, social, monetization, UI flows, technical plan, milestones, and success metrics. Use when planning a new game or a major feature.
---

# Roblox Game Design Document

Write the GDD as `docs/GDD.md` in the project (keep it living — update as decisions change). Keep each section tight; link to separate feature specs in `docs/features/` for detail.

## Template

```markdown
# <Game Name> — Game Design Document
_Last updated: <date> · Owner: <name>_

## 1. Pitch
- **Hook (one sentence):**
- **Genre / sub-genre:**
- **Target players:** age band, platforms (mobile-first?), play style
- **Comparable Roblox games:** 3–5, and what we do differently
- **Why now:** trend or gap it fills

## 2. Core Loops
- **30-second loop:** the moment-to-moment action
- **5-minute loop:** the session goal
- **Long-term loop:** what brings players back tomorrow and next week
- Loop diagram (action → reward → upgrade → harder action)

## 3. First-Time User Experience (first 60 seconds)
- Spawn location and what the player sees first
- First action, first reward (within 30 s), first goal
- How mechanics are taught without text

## 4. Mechanics
For each mechanic: description, controls (PC / mobile / gamepad), rules and numbers, edge cases.

## 5. Progression
- Levels / unlocks / rebirths; XP curve formula and time-to-milestone table
- Content gating

## 6. Economy
- Currencies; sources and sinks per currency with rates
- Inflation controls

## 7. Monetization
- Game passes, developer products, Premium perks, private servers (with prices)
- Policy compliance (paid random items, trading)

## 8. Social
- Co-op / competitive features, trading, parties, friend invites, leaderboards

## 9. World & Art Direction
- Zones/map list, visual style, reference images, lighting mood, audio style

## 10. UI / UX
- Screen list (HUD, shop, inventory, settings…) with wireframes
- Input map per platform

## 11. Technical Plan
- Architecture summary (see `systems-architect`), data schema, remotes list
- Performance budgets; StreamingEnabled?

## 12. Live Ops
- Daily rewards, quests, events calendar, update cadence

## 13. Metrics & Success Criteria
- D1 / D7 / D30 retention targets, session length, conversion, ARPDAU
- Custom `AnalyticsService` funnels to instrument

## 14. Milestones
| Milestone | Scope | Exit criteria |
|---|---|---|
| Prototype | core loop playable, greybox | "is it fun?" playtest with 5+ people |
| Vertical slice | one polished zone, data saving, basic UI | stable 2-player test |
| Alpha | all core features | full-server test, no blockers |
| Launch | content, monetization, thumbnails/icon | perf budgets met on mobile |

## 15. Risks & Open Questions
```

## Feature spec template (`docs/features/<feature>.md`)

```markdown
# Feature: <name>
**Goal:** which loop / metric this improves
**Player story:** As a player, I want … so that …
**Behavior:** step-by-step from the player's view, including UI states
**Rules & numbers:** table
**Server vs. client:** what the server owns; remotes needed
**Edge cases:** leave mid-action, death, lag, full inventory, insufficient funds, mobile
**Acceptance criteria:** testable checklist
**Out of scope:**
```
