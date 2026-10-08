---
name: roblox-networking
description: Secure client-server networking in Roblox — RemoteEvents, RemoteFunctions, UnreliableRemoteEvents, validation, rate limiting, replication and filtering rules, and a reusable Remotes module. Use when adding any communication between client and server or reviewing remote handlers.
---

# Roblox Networking

## Mental model

- The **server** is the source of truth. Changes the client makes locally do not replicate (except to its own character's physics/animation and parts it has network ownership of).
- Clients send **intent**; the server validates, applies, and replicates the result.
- An exploiter can call any remote with any arguments, at any rate. Write every handler as if the caller is hostile.

## Which tool?

| Need | Use |
|---|---|
| Client → server action, fire-and-forget | `RemoteEvent:FireServer` / `OnServerEvent` |
| Server → client notification | `RemoteEvent:FireClient(player, ...)` / `FireAllClients` |
| Client asks server for data and waits | `RemoteFunction:InvokeServer` / `OnServerInvoke` |
| Server asks client | **Don't.** Never `InvokeClient` — it can hang forever. Use two RemoteEvents. |
| High-rate cosmetic data (aim, VFX) | `UnreliableRemoteEvent` (may drop/reorder; ~900 byte payload limit) |
| Simple replicated state on an instance | Attributes (server sets, clients read + `GetAttributeChangedSignal`) |
| Same-side communication | `BindableEvent` or a Signal module (not remotes) |
| Cross-server | `MessagingService` (pub/sub) or `MemoryStoreService` |

## Central Remotes module (shared)

```lua
--!strict
-- ReplicatedStorage/Shared/Remotes.luau
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local EVENTS = { "RequestPurchase", "Notify", "ShowHitEffect" }
local UNRELIABLE = { "AimDirection" }
local FUNCTIONS = { "GetShopData" }

local folder: Folder
if RunService:IsServer() then
	folder = Instance.new("Folder")
	folder.Name = "Remotes"
	for _, name in EVENTS do
		local r = Instance.new("RemoteEvent"); r.Name = name; r.Parent = folder
	end
	for _, name in UNRELIABLE do
		local r = Instance.new("UnreliableRemoteEvent"); r.Name = name; r.Parent = folder
	end
	for _, name in FUNCTIONS do
		local r = Instance.new("RemoteFunction"); r.Name = name; r.Parent = folder
	end
	folder.Parent = ReplicatedStorage
else
	folder = ReplicatedStorage:WaitForChild("Remotes") :: Folder
end

local Remotes = {}
function Remotes.event(name: string): RemoteEvent
	return folder:WaitForChild(name) :: RemoteEvent
end
function Remotes.unreliable(name: string): UnreliableRemoteEvent
	return folder:WaitForChild(name) :: UnreliableRemoteEvent
end
function Remotes.func(name: string): RemoteFunction
	return folder:WaitForChild(name) :: RemoteFunction
end
return Remotes
```

## Validation helpers (server)

```lua
--!strict
local Validate = {}

function Validate.number(x: unknown, min: number, max: number): boolean
	return typeof(x) == "number" and x == x and x >= min and x <= max
end

function Validate.integer(x: unknown, min: number, max: number): boolean
	return Validate.number(x, min, max) and math.floor(x :: number) == x
end

function Validate.string(x: unknown, maxLen: number): boolean
	return typeof(x) == "string" and #x <= maxLen and utf8.len(x) ~= nil
end

function Validate.vector3(x: unknown, maxMagnitude: number): boolean
	if typeof(x) ~= "Vector3" then return false end
	local v = x :: Vector3
	return v.X == v.X and v.Y == v.Y and v.Z == v.Z and v.Magnitude <= maxMagnitude
end

function Validate.instanceOf(x: unknown, className: string, ancestor: Instance?): boolean
	if typeof(x) ~= "Instance" then return false end
	local inst = x :: Instance
	return inst:IsA(className) and (ancestor == nil or inst:IsDescendantOf(ancestor))
end

function Validate.enum<T>(x: unknown, allowed: { [T]: any }): boolean
	return allowed[x :: any] ~= nil
end

return Validate
```

## Rate limiter (server)

```lua
--!strict
local Players = game:GetService("Players")

local RateLimiter = {}
RateLimiter.__index = RateLimiter

export type RateLimiter = typeof(setmetatable({} :: {
	_interval: number,
	_last: { [Player]: number },
}, RateLimiter))

-- maxPerSecond: how many calls per second one player may make
function RateLimiter.new(maxPerSecond: number): RateLimiter
	local self = setmetatable({ _interval = 1 / maxPerSecond, _last = {} }, RateLimiter)
	Players.PlayerRemoving:Connect(function(p) self._last[p] = nil end)
	return self
end

function RateLimiter.allow(self: RateLimiter, player: Player): boolean
	local now = os.clock()
	local last = self._last[player]
	if last and now - last < self._interval then return false end
	self._last[player] = now
	return true
end

return RateLimiter
```

## A secure handler, end to end

```lua
local SHOP = require(ReplicatedStorage.Shared.ShopConfig) -- { [itemId]: { price: number } }
local limiter = RateLimiter.new(4)

Remotes.event("RequestPurchase").OnServerEvent:Connect(function(player, itemId)
	if not limiter:allow(player) then return end
	if not Validate.string(itemId, 64) then return end
	local item = SHOP[itemId :: string]
	if not item then return end                         -- unknown item
	local profile = DataService.getProfile(player)
	if not profile then return end                      -- data not loaded
	if profile.Data.Inventory[itemId] then return end   -- already owned
	if profile.Data.Coins < item.price then             -- price comes from SERVER config
		Remotes.event("Notify"):FireClient(player, "Not enough coins")
		return
	end
	-- no yields between check and write (prevents double-spend races)
	profile.Data.Coins -= item.price
	profile.Data.Inventory[itemId] = true
	player:SetAttribute("Coins", profile.Data.Coins)
end)
```

## Hit validation pattern (combat)

1. Client detects a hit locally for responsiveness and sends `(targetCharacter, hitTime)`.
2. Server checks: weapon equipped, cooldown elapsed (server clock), target is a character with a living Humanoid, distance between attacker's and target's `HumanoidRootPart` ≤ weapon range + lag tolerance (e.g. +4–8 studs), optional raycast for walls.
3. Server applies damage from **server-side weapon config**, never a client-sent number.

## Replication gotchas

- Instances in `ServerStorage`/`ServerScriptService` never replicate. `ReplicatedStorage` replicates to everyone — don't store secrets there.
- With `StreamingEnabled`, parts may not exist on the client yet: use `WaitForChild` with timeouts, `Model.ModelStreamingMode = Persistent` for critical models, or `player:RequestStreamAroundAsync`.
- Remote arguments: tables lose metatables; mixed tables and non-string keys in dictionaries can be dropped; Instances the receiver can't see arrive as `nil`; functions can't be sent.
- Remote events fired before the client connects a handler are queued only briefly — prefer having the client ask for initial state (or read Attributes) once it is ready.
