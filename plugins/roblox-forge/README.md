# Roblox Forge

A complete Roblox game studio team for Claude Code.

## Agents (your team)

| Agent | Role |
|---|---|
| `game-designer` | Core loops, mechanics, progression, GDDs, feature specs, balancing |
| `level-designer` | Maps, player flow, lighting, terrain, command-bar build scripts |
| `ui-ux-designer` | HUDs, menus, shops; mobile/console/PC-friendly UI built in code |
| `technical-artist` | VFX, animation, audio, game feel |
| `monetization-designer` | Economy, pricing, game passes, dev products, policy compliance |
| `game-researcher` | Market and competitor research, current Roblox API/policy lookups |
| `systems-architect` | Architecture, module maps, network contracts, data models |
| `luau-engineer` | Implements gameplay and systems in strict Luau |
| `data-engineer` | DataStores, ProfileStore, purchases, leaderboards, cross-server |
| `security-auditor` | Exploit-proofing remotes, economy, and purchases (read-only reviewer) |
| `performance-engineer` | Profiling and optimizing for mobile |
| `qa-tester` | Jest-Lua tests, playtest plans, bug triage |

Claude delegates to them automatically when a task fits, or you can ask for one directly:
"Have the security-auditor review my shop code."

## Commands

| Command | What it does |
|---|---|
| `/roblox-forge:studio <request>` | Claude acts as producer and runs the whole team on any request |
| `/roblox-forge:new-game <idea>` | Idea → research → GDD → architecture → Rojo scaffold → first playable loop |
| `/roblox-forge:feature <feature>` | Spec → design → build → security review → tests |
| `/roblox-forge:review [path]` | Parallel security, performance, data, and code-quality review |
| `/roblox-forge:debug <error>` | Diagnose and fix a bug from an Output error or description |
| `/roblox-forge:research <topic>` | Sourced market or technical research |
| `/roblox-forge:gdd <idea>` | Write or update `docs/GDD.md` |
| `/roblox-forge:playtest [feature]` | Playtest checklist + automated tests |

## Skills (knowledge Claude loads when relevant)

`luau-best-practices` · `roblox-networking` · `roblox-datastores` · `roblox-project-setup` (with config templates) · `roblox-ui` · `roblox-monetization` · `roblox-performance` · `roblox-testing` · `game-design-doc`

## Hook

After Claude writes or edits a `.lua`/`.luau` file, the plugin formats it with **StyLua** and lints it with **Selene** (when a `selene.toml` is present). Lint errors go back to Claude to fix. If the tools aren't installed, the hook does nothing.

## Recommended workflow

Claude edits files on disk; Roblox Studio doesn't read files directly. Use **Rojo** to sync:

1. Run `/roblox-forge:new-game` (or ask Claude to "set up Rojo for this project").
2. `rokit install && wally install && rojo serve`
3. In Studio, install the Rojo plugin and click **Connect**. Code changes from Claude appear in Studio live.
4. Playtest in Studio (use **Test → Clients and Servers** with 2+ players for multiplayer features).

Optional: connect Claude straight to Studio with Roblox's official Studio MCP server (see the Roblox Creator docs / `Roblox/studio-rust-mcp-server` on GitHub) so it can inspect and run code in an open place.
