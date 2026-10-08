---
name: luau-best-practices
description: Modern Luau coding standards and idioms for Roblox — strict typing, module and class patterns, the task library, cleanup of connections, error handling, and deprecated APIs to avoid. Use when writing or reviewing any Luau/Lua code for Roblox.
---

# Luau Best Practices for Roblox

## File header & services

```lua
--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
```

## Types

```lua
export type Item = {
	id: string,
	name: string,
	rarity: "Common" | "Rare" | "Legendary", -- singleton string union
	price: number,
	tags: { string },             -- array
	stats: { [string]: number },  -- dictionary
	icon: string?,                -- optional
}

local function getPrice(item: Item, multiplier: number?): number
	return item.price * (multiplier or 1)
end
```

- Use `typeof(x) == "Instance"` / `x:IsA("BasePart")` for runtime checks of Roblox types, `type(x)` for Lua primitives only (`typeof` also works for both and knows `Vector3`, `CFrame`, etc.).
- Narrow with `if x then` / `assert(x, "msg")` instead of casting. Use `::` casts sparingly, e.g. `local part = workspace:FindFirstChild("Door") :: BasePart?`.
- Generic functions: `local function first<T>(list: { T }): T? return list[1] end`.

## Module pattern (service/controller)

```lua
--!strict
local CoinService = {}

local balances: { [Player]: number } = {}

function CoinService.get(player: Player): number
	return balances[player] or 0
end

function CoinService.add(player: Player, amount: number)
	assert(amount == amount and amount >= 0 and amount < math.huge, "invalid amount")
	balances[player] = CoinService.get(player) + amount
	player:SetAttribute("Coins", balances[player])
end

function CoinService.start()
	game:GetService("Players").PlayerRemoving:Connect(function(player)
		balances[player] = nil -- avoid leaks
	end)
end

return CoinService
```

## Class pattern (typed OOP)

```lua
--!strict
local Weapon = {}
Weapon.__index = Weapon

export type Weapon = typeof(setmetatable({} :: {
	damage: number,
	cooldown: number,
	_lastUsed: number,
}, Weapon))

function Weapon.new(damage: number, cooldown: number): Weapon
	return setmetatable({ damage = damage, cooldown = cooldown, _lastUsed = 0 }, Weapon)
end

function Weapon.canUse(self: Weapon): boolean
	return os.clock() - self._lastUsed >= self.cooldown
end

function Weapon.use(self: Weapon)
	self._lastUsed = os.clock()
end

return Weapon
```

## Bootstrap (one Script per side)

```lua
-- src/server/init.server.luau
local ServerScriptService = game:GetService("ServerScriptService")
local servicesFolder = ServerScriptService.Server.Services

local services = {}
for _, module in servicesFolder:GetChildren() do
	if module:IsA("ModuleScript") then
		services[module.Name] = require(module)
	end
end
for _, service in services do
	if service.init then service.init() end
end
for _, service in services do
	if service.start then task.spawn(service.start) end
end
```

## Players & characters (handle already-present players)

```lua
local function onCharacterAdded(character: Model)
	local humanoid = character:WaitForChild("Humanoid") :: Humanoid
	humanoid.Died:Once(function()
		-- handle death
	end)
end

local function onPlayerAdded(player: Player)
	if player.Character then onCharacterAdded(player.Character) end
	player.CharacterAdded:Connect(onCharacterAdded)
end

Players.PlayerAdded:Connect(onPlayerAdded)
for _, player in Players:GetPlayers() do
	task.spawn(onPlayerAdded, player)
end
```

## Cleanup

- Store every `RBXScriptConnection` you create for something with a lifetime and disconnect it when that thing ends. Use `:Once()` for one-shot events.
- A cleanup helper (Trove from sleitnick, or Janitor) is recommended: `trove:Connect(signal, fn)`, `trove:Add(instance)`, `trove:Destroy()`.
- `Instance:Destroy()` disconnects connections *on that instance*, but not connections the instance's scripts made to *other* objects.
- Clear per-player tables on `PlayerRemoving`.

## Tagged objects (CollectionService)

```lua
local CollectionService = game:GetService("CollectionService")

local function setupKillBrick(part: Instance)
	if not part:IsA("BasePart") then return end
	part.Touched:Connect(function(hit)
		local humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")
		if humanoid then humanoid.Health = 0 end
	end)
end

for _, part in CollectionService:GetTagged("KillBrick") do setupKillBrick(part) end
CollectionService:GetInstanceAddedSignal("KillBrick"):Connect(setupKillBrick)
```

## Errors & retries

```lua
local function retry<T>(attempts: number, fn: () -> T): (boolean, T | string)
	local lastErr: any
	for i = 1, attempts do
		local ok, result = pcall(fn)
		if ok then return true, result end
		lastErr = result
		task.wait(2 ^ (i - 1)) -- 1, 2, 4, 8s backoff
	end
	return false, tostring(lastErr)
end
```

## Deprecated → modern

| Avoid | Use |
|---|---|
| `wait()`, `spawn()`, `delay()` | `task.wait()`, `task.spawn()`, `task.delay()` / `task.defer()` |
| `workspace:FindPartOnRay*` | `workspace:Raycast(origin, dir, RaycastParams)` |
| `Region3` + `FindPartsInRegion3` | `workspace:GetPartBoundsInBox/InRadius`, `GetPartsInPart` with `OverlapParams` |
| `BodyVelocity`, `BodyGyro`, `BodyPosition` | `LinearVelocity`, `AlignOrientation`, `AlignPosition` |
| `Humanoid:LoadAnimation` | `Animator:LoadAnimation` |
| ValueObjects for state | Attributes |
| `game.Players` | `game:GetService("Players")` |
| `Instance.new("Part", parent)` | create, set properties, *then* set `.Parent` last |
| `table.getn`, `unpack` | `#t`, `table.unpack` |
| `string` concat in loops | `table.concat` or `buffer` |
| Knit (new projects) | small hand-rolled service loader |
| Roact | React-lua (`jsdotlua/react`) |
| Aftman/Foreman | Rokit |

## Performance idioms

- Generalized iteration `for k, v in t do` is idiomatic and fast.
- `table.create(n)` to preallocate; `table.clear(t)` to reuse.
- Localize hot functions/values outside loops.
- `--!native` at file top enables native codegen for compute-heavy modules (server-side; measure first).
