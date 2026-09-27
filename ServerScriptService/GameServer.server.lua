--[[
	CLICK SIMULATOR - SERVER
	Put this in: ServerScriptService (as a normal Script)

	Handles: coins, click upgrades, rebirths, 2x Coins game pass, and saving.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local MarketplaceService = game:GetService("MarketplaceService")

----------------------------------------------------------------
-- SETTINGS (change these!)
----------------------------------------------------------------
local DOUBLE_COINS_GAMEPASS_ID = 0 -- paste your Game Pass ID here (0 = disabled)
local BASE_UPGRADE_COST = 25       -- cost of the first "+1 per click" upgrade
local UPGRADE_COST_GROWTH = 1.5    -- each upgrade costs this much more than the last
local BASE_REBIRTH_COST = 1000     -- coins needed for the first rebirth
local CLICK_COOLDOWN = 0.08        -- seconds between clicks (stops auto-clicker spam)
local AUTOSAVE_INTERVAL = 60       -- seconds

----------------------------------------------------------------
-- REMOTES (created automatically, nothing to set up)
----------------------------------------------------------------
local remotes = Instance.new("Folder")
remotes.Name = "Remotes"
remotes:SetAttribute("GamePassId", DOUBLE_COINS_GAMEPASS_ID)
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

----------------------------------------------------------------
-- DATA
----------------------------------------------------------------
local store = DataStoreService:GetDataStore("ClickSimulator_v1")
local sessions = {} -- [player] = { Coins, ClickPower, Rebirths, HasPass, LastClick, Loaded }

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

local function ownsPass(player)
	if DOUBLE_COINS_GAMEPASS_ID == 0 then
		return false
	end
	local ok, owns = pcall(function()
		return MarketplaceService:UserOwnsGamePassAsync(player.UserId, DOUBLE_COINS_GAMEPASS_ID)
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

	local data = { Coins = 0, ClickPower = 1, Rebirths = 0, HasPass = false, LastClick = 0, Loaded = false }

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

	data.HasPass = ownsPass(player)
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
	end
end)

rebirthEvent.OnServerEvent:Connect(function(player)
	local data = sessions[player]
	if not data then
		return
	end
	if data.Coins >= rebirthCost(data) then
		data.Coins = 0
		data.ClickPower = 1
		data.Rebirths += 1
		sync(player)
	end
end)

-- Give 2x coins right away when someone buys the pass in-game
MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
	if purchased and passId == DOUBLE_COINS_GAMEPASS_ID and sessions[player] then
		sessions[player].HasPass = true
		sync(player)
	end
end)
