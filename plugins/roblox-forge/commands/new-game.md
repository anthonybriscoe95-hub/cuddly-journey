---
description: Take a Roblox game idea from concept to a playable, well-structured project (research → GDD → architecture → scaffold → first playable loop)
argument-hint: <game idea, e.g. "co-op tower defense with pets">
---

Create a new Roblox game from this idea: **$ARGUMENTS**

Work through these phases, delegating to the studio's specialist agents. Pause after Phase 2 to confirm direction with the user before writing lots of code.

## Phase 1 — Research (parallel)
- `game-researcher`: find 5–10 comparable successful Roblox experiences, what makes them work, player complaints, and gaps to exploit.

## Phase 2 — Design
- `game-designer`: using the research, write `docs/GDD.md` (use the `game-design-doc` skill template). Define the 30-second, 5-minute, and long-term loops, the first-60-seconds experience, and an MVP scope.
- `monetization-designer`: fill in the economy and monetization sections.
- Present the pitch, core loop, and MVP scope to the user and **ask for approval or changes**.

## Phase 3 — Architecture
- `systems-architect`: produce the module map, network contract, data schema, and build order for the MVP. Save to `docs/ARCHITECTURE.md`.

## Phase 4 — Scaffold
- Set up the Rojo project using the `roblox-project-setup` skill and its templates (`default.project.json`, `wally.toml`, `selene.toml`, `stylua.toml`, `.luaurc`, `.gitignore`), folder layout, bootstrap scripts, shared `Remotes` module, and `DataService` (ProfileStore-based, via the `roblox-datastores` skill).

## Phase 5 — First playable loop
- `luau-engineer`: implement the 30-second core loop end to end (server-authoritative).
- `ui-ux-designer`: minimal HUD for the loop.
- `level-designer`: a greybox test map or a command-bar build script.
- `security-auditor`: review all remotes; fix Critical/High findings.
- `qa-tester`: playtest checklist + unit tests for pure logic.

## Finish
Give the user: the file tree, setup commands (`rokit install`, `wally install`, `rojo serve`), how to connect Studio, how to playtest, and the next 3 milestones from the GDD.
