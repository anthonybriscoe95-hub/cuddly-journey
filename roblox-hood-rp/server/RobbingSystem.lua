-- Script → ServerScriptService/RobbingSystem
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes    = ReplicatedStorage:WaitForChild("Remotes")

local activeRobberies = {}  -- [player] = { location, configKey }
local cooldowns       = {}  -- [locationName] = tick() at last rob

local function cooldownLeft(locName, configKey)
	local last = cooldowns[locName]
	if not last then return 0 end
	return math.max(0, GameConfig.Robbery[configKey].cooldown - (tick() - last))
end

local function randomPay(configKey)
	local cfg = GameConfig.Robbery[configKey]
	return math.random(cfg.payMin, cfg.payMax)
end

Remotes.StartRobbery.OnServerEvent:Connect(function(player, locationName, configKey)
	if not GameConfig.Robbery[configKey] then return end

	if activeRobberies[player] then
		Remotes.ShowNotification:FireClient(player, "Already robbing!", "error")
		return
	end

	local cd = cooldownLeft(locationName, configKey)
	if cd > 0 then
		Remotes.ShowNotification:FireClient(player,
			"Location on cooldown: " .. math.ceil(cd) .. "s", "error")
		return
	end

	local cfg = GameConfig.Robbery[configKey]
	activeRobberies[player] = { location = locationName, configKey = configKey }

	-- Raise wanted level
	if _G.WantedAPI then
		_G.WantedAPI.AddWanted(player, cfg.wantedGain or 1)
	end

	-- Broadcast police alert to all clients
	Remotes.AlertPolice:FireAllClients(player.Name, locationName)
	Remotes.ShowNotification:FireClient(player,
		"Robbing " .. locationName .. "… don't get caught!", "error")

	task.delay(cfg.duration, function()
		local active = activeRobberies[player]
		if not active or active.location ~= locationName then return end

		activeRobberies[player] = nil
		cooldowns[locationName] = tick()

		local payout = randomPay(configKey)
		if _G.MoneyAPI then
			_G.MoneyAPI.GiveCash(player, payout)
		end

		Remotes.RobberySuccess:FireClient(player, payout)
		Remotes.ShowNotification:FireClient(player,
			"Robbery done! +$" .. payout, "success")
	end)
end)

Remotes.CancelRobbery.OnServerEvent:Connect(function(player)
	if activeRobberies[player] then
		activeRobberies[player] = nil
		Remotes.ShowNotification:FireClient(player, "Robbery cancelled.", "error")
	end
end)

Players.PlayerRemoving:Connect(function(player)
	activeRobberies[player] = nil
end)
