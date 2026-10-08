---
name: roblox-datastores
description: Safe player data persistence on Roblox — ProfileStore session locking, data templates and migrations, autosave and BindToClose, idempotent developer product receipts, OrderedDataStore leaderboards, MemoryStore and MessagingService. Use whenever saving or loading data, building leaderboards, or handling purchases.
---

# Roblox DataStores & Persistence

> Prefer **ProfileStore** (by loleris / MadStudio — the successor to ProfileService) for player data. It handles session locking, autosave, and `BindToClose` for you. Install from its GitHub releases / Creator Store and check its docs (`madstudioroblox.github.io/ProfileStore`) for the current API before relying on exact signatures below.

## Data template + migrations

```lua
--!strict
-- ServerScriptService/Server/Data/Template.luau
export type PlayerData = {
	DataVersion: number,
	Coins: number,
	Level: number,
	XP: number,
	Inventory: { [string]: boolean },
	PurchaseHistory: { string }, -- recent developer product PurchaseIds
	Settings: { MusicVolume: number, SfxVolume: number },
}

local TEMPLATE: PlayerData = {
	DataVersion = 2,
	Coins = 0,
	Level = 1,
	XP = 0,
	Inventory = {},
	PurchaseHistory = {},
	Settings = { MusicVolume = 0.5, SfxVolume = 0.8 },
}

return TEMPLATE
```

```lua
-- Migrations: each step upgrades from version N to N+1. Never edit an old step.
local MIGRATIONS: { [number]: (data: any) -> () } = {
	[1] = function(data)
		-- v1 stored "Gold"; v2 renamed it to "Coins"
		data.Coins = data.Gold or 0
		data.Gold = nil
	end,
}

local function migrate(data: any, latest: number)
	local v = data.DataVersion or 1
	while v < latest do
		local step = MIGRATIONS[v]
		if step then step(data) end
		v += 1
		data.DataVersion = v
	end
end
```

## ProfileStore service

```lua
--!strict
local Players = game:GetService("Players")
local ServerScriptService = game:GetService("ServerScriptService")

-- ProfileStore is a single ModuleScript; place it at src/server/Libs/ProfileStore.luau
local ProfileStore = require(ServerScriptService.Server.Libs.ProfileStore)
local TEMPLATE = require(script.Parent.Template)

-- Use a different store name in Studio so testing never touches live data
local STORE_NAME = if game:GetService("RunService"):IsStudio() then "PlayerData_Dev" else "PlayerData"
local PlayerStore = ProfileStore.New(STORE_NAME, TEMPLATE)

local profiles: { [Player]: any } = {}
local DataService = {}

local function onPlayerAdded(player: Player)
	local profile = PlayerStore:StartSessionAsync(`Player_{player.UserId}`, {
		Cancel = function()
			return player.Parent ~= Players -- stop waiting if they left
		end,
	})

	if profile == nil then
		player:Kick("Your data couldn't be loaded. Please rejoin.")
		return
	end

	profile:AddUserId(player.UserId) -- GDPR compliance
	profile:Reconcile()               -- fill in keys added to TEMPLATE since last save
	migrate(profile.Data, TEMPLATE.DataVersion)

	profile.OnSessionEnd:Connect(function()
		profiles[player] = nil
		player:Kick("Your session ended (joined another server?). Please rejoin.")
	end)

	if player.Parent == Players then
		profiles[player] = profile
		player:SetAttribute("Coins", profile.Data.Coins)
		player:SetAttribute("DataLoaded", true)
	else
		profile:EndSession() -- left while loading
	end
end

function DataService.getProfile(player: Player): any?
	return profiles[player]
end

-- Yields until the profile is loaded or the player leaves
function DataService.waitForProfile(player: Player): any?
	while player.Parent == Players and profiles[player] == nil do
		task.wait(0.1)
	end
	return profiles[player]
end

function DataService.start()
	for _, player in Players:GetPlayers() do task.spawn(onPlayerAdded, player) end
	Players.PlayerAdded:Connect(onPlayerAdded)
	Players.PlayerRemoving:Connect(function(player)
		local profile = profiles[player]
		if profile then profile:EndSession() end
	end)
end

return DataService
```

## Idempotent developer product receipts

`ProcessReceipt` may be called multiple times for the same purchase (retries, server hops). Only **one** callback may be assigned per server — keep it in one module.

```lua
--!strict
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")

local PURCHASE_HISTORY_LIMIT = 50

-- ProductId -> grant function (must not yield; must only modify profile.Data)
local PRODUCTS: { [number]: (player: Player, profile: any) -> () } = {
	[123456789] = function(player, profile) -- "100 Coins"
		profile.Data.Coins += 100
		player:SetAttribute("Coins", profile.Data.Coins)
	end,
}

MarketplaceService.ProcessReceipt = function(receipt)
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet -- will retry on next join
	end

	local profile = DataService.waitForProfile(player)
	if not profile then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	local history = profile.Data.PurchaseHistory
	if table.find(history, receipt.PurchaseId) then
		return Enum.ProductPurchaseDecision.PurchaseGranted -- already granted earlier
	end

	local grant = PRODUCTS[receipt.ProductId]
	if not grant then
		warn("Unknown product", receipt.ProductId)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	local ok, err = pcall(grant, player, profile)
	if not ok then
		warn("Grant failed:", err)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	table.insert(history, receipt.PurchaseId)
	while #history > PURCHASE_HISTORY_LIMIT do table.remove(history, 1) end

	-- The grant lives in the session-locked profile and is saved by autosave/EndSession.
	-- For high-value products, force a save before granting (see ProfileStore docs for
	-- its Save/OnAfterSave API) so a server crash can't lose a paid grant.
	return Enum.ProductPurchaseDecision.PurchaseGranted
end
```

## Raw DataStoreService (non-player / global data)

```lua
local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("GlobalConfig")

-- Read-modify-write ALWAYS through UpdateAsync
local ok, result = pcall(function()
	return store:UpdateAsync("EventCounter", function(old: number?)
		return (old or 0) + 1   -- return nil to cancel the write
	end)
end)
```

Rules: `pcall` everything; retry with backoff; never `GetAsync` → `SetAsync` for shared keys; ≥ 6 s between writes to one key; ≤ 4 MB per key; data must be JSON-serializable (convert `Vector3`/`Color3`/`CFrame` to arrays); check `DataStoreService:GetRequestBudgetForRequestType(Enum.DataStoreRequestType.UpdateAsync)` in heavy systems.

## Global leaderboard (OrderedDataStore)

```lua
local ods = DataStoreService:GetOrderedDataStore("TopCoins_v1")

-- write (server, throttled, e.g. on leave or every few minutes)
pcall(ods.SetAsync, ods, tostring(player.UserId), math.floor(coins)) -- integers only

-- read top 50 (refresh every ~60 s, not per player)
local ok, pages = pcall(ods.GetSortedAsync, ods, false, 50)
if ok then
	for rank, entry in pages:GetCurrentPage() do
		local userId = tonumber(entry.key)
		-- resolve names with Players:GetNameFromUserIdAsync (pcall + cache)
	end
end
```

## Cross-server tools

- **MemoryStoreService** — fast, expiring data: `GetSortedMap` (live leaderboards, server lists), `GetQueue` (matchmaking), `GetHashMap`. Always set expirations; respect quotas; never the only copy of persistent progress.
- **MessagingService** — pub/sub between servers (`PublishAsync`/`SubscribeAsync`): global announcements, cross-server events. ≤ 1 kB messages, best-effort delivery.
- **TeleportService** — `TeleportAsync` with `TeleportOptions`; pass small data via `SetTeleportData` only for non-trusted info (it's client-visible). End the ProfileStore session before teleporting is handled automatically by leave — ensure the next place waits for the lock.

## Testing data in Studio

- Game Settings → Security → "Enable Studio Access to API Services" must be on to use real DataStores in Studio.
- Use a separate store name in Studio (shown above) to protect live data.
- Test: brand-new player, returning player, old `DataVersion`, leaving during load, rejoining instantly, server shutdown with players present.
