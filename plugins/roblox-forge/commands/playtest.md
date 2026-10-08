---
description: Generate a playtest plan and automated tests for a feature or the whole game
argument-hint: [feature name — defaults to the whole game]
---

Use the `qa-tester` agent to prepare testing for: **$ARGUMENTS** (if nothing was given, cover the whole game)

1. Read the relevant code and any spec in `docs/`.
2. Write a manual playtest checklist (join/leave, death/respawn, multiplayer with Start Server + 2–4 players, mobile/gamepad, lag, data edge cases, purchases) saved to `docs/playtests/<feature>.md`.
3. Add Jest-Lua spec files for pure logic modules that lack tests (use the `roblox-testing` skill). If the project has no test setup, propose one and ask before adding dependencies.
4. List any bugs or risky code found while reading, with `file:line`.
