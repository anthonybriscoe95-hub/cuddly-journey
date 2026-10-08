--[[
	CLICK SIMULATOR - SERVER
	Put this in: ServerScriptService (as a normal Script)

	Handles: coins, click upgrades, rebirths, game passes, collectible coins,
	the rebirth portal, and saving.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local MarketplaceService = game:GetService("MarketplaceService")

----------------------------------------------------------------
-- SETTINGS (change these!)
----------------------------------------------------------------
local DOUBLE_COINS_GAMEPASS_ID = 0 -- paste your "2x Coins" Game Pass ID here (0 = disabled)
local AUTO_CLICKER_GAMEPASS_ID = 0 -- paste your "Auto Clicker" Game Pass ID here (0 = disabled)
local BASE_UPGRADE_COST = 25       -- cost of the first "+1 per click" upgrade
local UPGRADE_COST_GROWTH = 1.5    -- each upgrade costs this much more than the last
local BASE_REBIRTH_COST = 1000     -- coins needed for the first rebirth
local CLICK_COOLDOWN = 0.08        -- seconds between clicks (stops auto-clicker spam)
local AUTOSAVE_INTERVAL = 60       -- seconds
local AUTO_CLICKS_PER_SECOND = 2   -- clicks the Auto Clicker pass does for you
local MAX_MAP_COINS = 30           -- coins lying around the island at once
local MAP_COIN_CLICKS = 5          -- a map coin is worth this many clicks

----------------------------------------------------------------
-- REMOTES (created automatically, nothing to set up)
----------------------------------------------------------------
local remotes = Instance.new("Folder")
remotes.Name = "Remotes"
remotes:SetAttribute("GamePassId", DOUBLE_COINS_GAMEPASS_ID)
remotes:SetAttribute("AutoClickerPassId", AUTO_CLICKER_GAMEPASS_ID)
remotes.Parent = ReplicatedStorage

local function makeRemote(name)
	local remote = Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = remotes
	return remote
end

local clickEvent = makeRemote("Click")
local upgradeEvent = makeRemote("Upgrade")
local rebirthEvent = makeRemote("Rebirth")
local notifyEvent = makeRemote("Notify") -- server -> client messages ("Not enough coins!")

----------------------------------------------------------------
-- DATA
----------------------------------------------------------------
local store = DataStoreService:GetDataStore("ClickSimulator_v1")
local sessions = {} -- [player] = { Coins, ClickPower, Rebirths, HasPass, HasAuto, LastClick, Loaded }

local function upgradeCost(data)
	return math.floor(BASE_UPGRADE_COST * UPGRADE_COST_GROWTH ^ (data.ClickPower - 1))
end

local function rebirthCost(data)
	return BASE_REBIRTH_COST * (data.Rebirths + 1)
end

local function multiplier(data)
	return (1 + data.Rebirths) * (data.HasPass and 2 or 1)
end

-- Push the latest numbers to leaderstats + player attributes (the GUI reads these)
local function sync(player)
	local data = sessions[player]
	if not data then
		return
	end
	local leaderstats = player:FindFirstChild("leaderstats")
	if leaderstats then
		leaderstats.Coins.Value = data.Coins
		leaderstats.Rebirths.Value = data.Rebirths
	end
	player:SetAttribute("ClickPower", data.ClickPower)
	player:SetAttribute("Multiplier", multiplier(data))
	player:SetAttribute("UpgradeCost", upgradeCost(data))
	player:SetAttribute("RebirthCost", rebirthCost(data))
	player:SetAttribute("HasPass", data.HasPass)
	player:SetAttribute("HasAuto", data.HasAuto)
end

local function save(player)
	local data = sessions[player]
	if not data or not data.Loaded then
		return -- never overwrite real saves with blank data if loading failed
	end
	local ok, err = pcall(function()
		store:SetAsync(tostring(player.UserId), {
			Coins = data.Coins,
			ClickPower = data.ClickPower,
			Rebirths = data.Rebirths,
		})
	end)
	if not ok then
		warn("Save failed for " .. player.Name .. ": " .. tostring(err))
	end
end

local function ownsPass(player, passId)
	if passId == 0 then
		return false
	end
	local ok, owns = pcall(function()
		return MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)
	end)
	return ok and owns
end

local function onPlayerAdded(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	local coins = Instance.new("IntValue")
	coins.Name = "Coins"
	coins.Parent = leaderstats
	local rebirths = Instance.new("IntValue")
	rebirths.Name = "Rebirths"
	rebirths.Parent = leaderstats
	leaderstats.Parent = player

	local data = { Coins = 0, ClickPower = 1, Rebirths = 0, HasPass = false, HasAuto = false, LastClick = 0, Loaded = false }

	local ok, saved = pcall(function()
		return store:GetAsync(tostring(player.UserId))
	end)
	if ok then
		data.Loaded = true
		if type(saved) == "table" then
			data.Coins = saved.Coins or 0
			data.ClickPower = saved.ClickPower or 1
			data.Rebirths = saved.Rebirths or 0
		end
	else
		warn("Load failed for " .. player.Name .. " (progress will not save this session): " .. tostring(saved))
	end

	data.HasPass = ownsPass(player, DOUBLE_COINS_GAMEPASS_ID)
	data.HasAuto = ownsPass(player, AUTO_CLICKER_GAMEPASS_ID)
	if player.Parent then
		sessions[player] = data
		sync(player)
	end
end

Players.PlayerAdded:Connect(onPlayerAdded)
for _, player in Players:GetPlayers() do
	task.spawn(onPlayerAdded, player)
end

Players.PlayerRemoving:Connect(function(player)
	save(player)
	sessions[player] = nil
end)

game:BindToClose(function()
	for _, player in Players:GetPlayers() do
		task.spawn(save, player)
	end
	task.wait(3)
end)

task.spawn(function()
	while true do
		task.wait(AUTOSAVE_INTERVAL)
		for _, player in Players:GetPlayers() do
			task.spawn(save, player)
		end
	end
end)

----------------------------------------------------------------
-- GAMEPLAY
----------------------------------------------------------------
clickEvent.OnServerEvent:Connect(function(player)
	local data = sessions[player]
	if not data then
		return
	end
	local now = os.clock()
	if now - data.LastClick < CLICK_COOLDOWN then
		return
	end
	data.LastClick = now
	data.Coins += data.ClickPower * multiplier(data)
	sync(player)
end)

local function notify(player, text, good)
	notifyEvent:FireClient(player, text, good)
end

upgradeEvent.OnServerEvent:Connect(function(player)
	local data = sessions[player]
	if not data then
		return
	end
	local cost = upgradeCost(data)
	if data.Coins >= cost then
		data.Coins -= cost
		data.ClickPower += 1
		sync(player)
		notify(player, "Upgraded! +" .. data.ClickPower .. " per click", true)
	else
		notify(player, "Not enough coins! Need " .. cost, false)
	end
end)

local function tryRebirth(player)
	local data = sessions[player]
	if not data then
		return
	end
	local cost = rebirthCost(data)
	if data.Coins >= cost then
		data.Coins = 0
		data.ClickPower = 1
		data.Rebirths += 1
		sync(player)
		notify(player, "🔁 REBIRTH! Now x" .. multiplier(data) .. " coins!", true)
	else
		notify(player, "Rebirth needs " .. cost .. " coins!", false)
	end
end

rebirthEvent.OnServerEvent:Connect(tryRebirth)

-- Turn on a pass right away when someone buys it in-game
MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
	local data = sessions[player]
	if not purchased or not data then
		return
	end
	if passId == DOUBLE_COINS_GAMEPASS_ID then
		data.HasPass = true
		notify(player, "⭐ 2x Coins unlocked! Thank you!", true)
	elseif passId == AUTO_CLICKER_GAMEPASS_ID then
		data.HasAuto = true
		notify(player, "🤖 Auto Clicker unlocked! Thank you!", true)
	end
	sync(player)
end)

-- Auto Clicker pass: free clicks every second
task.spawn(function()
	while true do
		task.wait(1)
		for player, data in sessions do
			if data.HasAuto then
				data.Coins += data.ClickPower * multiplier(data) * AUTO_CLICKS_PER_SECOND
				sync(player)
			end
		end
	end
end)

----------------------------------------------------------------
-- REBIRTH PORTAL (walk into it to rebirth)
----------------------------------------------------------------
local portalCooldown = {}
local map = workspace:FindFirstChild("Map")
local portal = map and map:FindFirstChild("RebirthPortal")
local swirl = portal and portal:FindFirstChild("PortalSwirl")
if swirl then
	swirl.Touched:Connect(function(hit)
		local player = Players:GetPlayerFromCharacter(hit.Parent)
		if player and os.clock() - (portalCooldown[player] or 0) > 2 then
			portalCooldown[player] = os.clock()
			tryRebirth(player)
		end
	end)
end

----------------------------------------------------------------
-- COINS LYING AROUND THE ISLAND (walk over them to collect)
----------------------------------------------------------------
local coinFolder = Instance.new("Folder")
coinFolder.Name = "MapCoins"
coinFolder.Parent = workspace

-- Coins only land on these parts (not on trees, rocks, lamps...)
local GROUND = { Grass = true, Plaza = true, NorthPath = true, EastPath = true, SouthPath = true, WestPath = true }
local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Exclude
rayParams.FilterDescendantsInstances = { coinFolder }

local function spawnCoin()
	for _ = 1, 10 do -- try a few random spots
		local origin = Vector3.new(math.random(-185, 185), 100, math.random(-185, 185))
		local result = workspace:Raycast(origin, Vector3.new(0, -200, 0), rayParams)
		if result and GROUND[result.Instance.Name] then
			local coin = Instance.new("Part")
			coin.Name = "MapCoin"
			coin.Shape = Enum.PartType.Cylinder
			coin.Size = Vector3.new(0.6, 4, 4)
			coin.CFrame = CFrame.new(result.Position + Vector3.new(0, 2.5, 0)) * CFrame.Angles(0, math.rad(math.random(0, 360)), 0)
			coin.Anchored = true
			coin.CanCollide = false
			coin.Material = Enum.Material.Neon
			coin.Color = Color3.fromRGB(255, 200, 30)
			coin.Parent = coinFolder

			local taken = false
			coin.Touched:Connect(function(hit)
				local player = Players:GetPlayerFromCharacter(hit.Parent)
				local data = player and sessions[player]
				if taken or not data then
					return
				end
				taken = true
				local amount = data.ClickPower * multiplier(data) * MAP_COIN_CLICKS
				data.Coins += amount
				sync(player)
				notify(player, "+" .. amount .. " 💰", true)
				coin:Destroy()
			end)
			return
		end
	end
end

task.spawn(function()
	while true do
		if #coinFolder:GetChildren() < MAX_MAP_COINS then
			spawnCoin()
		end
		task.wait(1)
	end
end)
