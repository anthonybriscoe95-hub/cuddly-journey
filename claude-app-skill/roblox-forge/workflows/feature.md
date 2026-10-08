---
description: Design, build, secure, and test a new feature in your Roblox game end to end
argument-hint: <feature, e.g. "daily reward streak with a calendar UI">
---

Build this feature in the current Roblox project: **$ARGUMENTS**

1. **Explore** the project structure and existing systems (services, Remotes module, data template, UI framework) so the feature fits in.
2. **Spec** — have `game-designer` write a short feature spec (`docs/features/<name>.md`): behavior, rules/numbers, edge cases, acceptance criteria. Involve `monetization-designer` if it touches currency or Robux, and `ui-ux-designer` if it has UI.
3. **Design the system** — for anything beyond a small change, have `systems-architect` define modules, remotes (with validation rules), and data schema changes (with a `DataVersion` migration if persisted data changes).
4. **Implement** — `luau-engineer` (and `data-engineer` for persistence, `ui-ux-designer` for UI, `technical-artist` for feedback/VFX). Run independent parts in parallel.
5. **Secure** — `security-auditor` reviews all new/changed remotes and economy logic. Apply Critical/High fixes.
6. **Test** — `qa-tester` adds unit tests for pure logic and a manual playtest checklist.
7. **Report** — files changed (with Studio locations), how to test, and any follow-ups.
