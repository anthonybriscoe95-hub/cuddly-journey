---
name: roblox-testing
description: Automated testing for Roblox with Jest-Lua (and legacy TestEZ) — making code testable, writing spec files, running tests in Studio or CI via run-in-roblox or Open Cloud Luau Execution, plus multiplayer playtest checklists. Use when adding tests, setting up CI, or verifying a feature.
---

# Roblox Testing

## Make code testable

Put rules and math in **pure ModuleScripts** (no `game:GetService` side effects at require time, no remotes) and keep thin "glue" Scripts that wire them to Roblox events. Pure modules can be tested fast and deterministically.

```lua
--!strict
-- src/shared/Util/Leveling.luau
local Leveling = {}

function Leveling.xpForLevel(level: number): number
	return math.floor(100 * level ^ 1.5)
end

function Leveling.addXP(level: number, xp: number, gained: number): (number, number)
	xp += gained
	while xp >= Leveling.xpForLevel(level) do
		xp -= Leveling.xpForLevel(level)
		level += 1
	end
	return level, xp
end

return Leveling
```

## Jest-Lua setup

`wally.toml`:
```toml
[dev-dependencies]
Jest = "jsdotlua/jest@<version>"
JestGlobals = "jsdotlua/jest-globals@<version>"
```
Map `DevPackages` into the project (e.g. `ReplicatedStorage.DevPackages`) only in a test project file (`test.project.json`) so tests never ship in the live game.

`src/shared/jest.config.luau`:
```lua
return { testMatch = { "**/*.spec" } }
```

Spec file `src/shared/Util/Leveling.spec.luau`:
```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local JestGlobals = require(ReplicatedStorage.DevPackages.JestGlobals)
local describe, it, expect = JestGlobals.describe, JestGlobals.it, JestGlobals.expect

local Leveling = require(script.Parent.Leveling)

describe("Leveling", function()
	it("levels up when XP crosses the threshold", function()
		local level, xp = Leveling.addXP(1, 0, Leveling.xpForLevel(1) + 5)
		expect(level).toBe(2)
		expect(xp).toBe(5)
	end)

	it("handles multiple level-ups at once", function()
		local level = Leveling.addXP(1, 0, 10_000)
		expect(level > 2).toBe(true)
	end)
end)
```

Runner `tests/run.server.luau`:
```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local runCLI = require(ReplicatedStorage.DevPackages.Jest).runCLI

local status, result = runCLI(ReplicatedStorage.Shared, {
	verbose = false,
	ci = true,
}, { ReplicatedStorage.Shared }):awaitStatus()

if status == "Rejected" then print(result) end
```

> Jest-Lua needs `debug.loadmodule`, which requires the `FFlagEnableLoadModule` fast flag set to `true` in Studio's `ClientAppSettings.json`. Check the Jest-Lua docs for the current setup steps.

## Running tests

- **Studio:** build the test place (`rojo build test.project.json -o test.rbxl`), open it, press Run (F8).
- **CLI:** `run-in-roblox --place test.rbxl --script tests/run.server.luau` (requires Studio installed locally).
- **CI:** Open Cloud **Luau Execution** API — upload the test place and execute the runner script on Roblox servers; fail the job on rejected status.

## What to test

- Formulas and progression curves (boundaries: level 1, max level, zero, negative).
- Validation helpers with hostile input: wrong types, NaN, ±inf, huge strings, Instances outside the allowed folder.
- Data migrations: a fixture for every historical `DataVersion` → latest.
- Economy operations: buy/sell/trade never create or destroy currency unexpectedly (sum before == sum after ± expected).

## Manual multiplayer checks

Studio → Test → **Clients and Servers** → Start with 2–4 players. Verify replication, leaving mid-action, respawn, lag simulation (Studio network settings), and device emulation. See the `qa-tester` agent for a full checklist.
