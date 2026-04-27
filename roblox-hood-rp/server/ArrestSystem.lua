-- Script → ServerScriptService/ArrestSystem
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes    = ReplicatedStorage:WaitForChild("Remotes")

-- ── Change this to your jail spawn CFrame ─────────────────────────────────
local JAIL_CF = CFrame.new(0, 5, 200)

local wantedLevels = {}  -- [userId] = 0–4
local cuffed       = {}  -- [userId] = bool
local inJail       = {}  -- [userId] = releaseTimestamp

-- ── Public API ─────────────────────────────────────────────────────────────

local WantedAPI = {}

function WantedAPI.AddWanted(player, amount)
	local uid = player.UserId
	wantedLevels[uid] = math.clamp((wantedLevels[uid] or 0) + (amount or 1), 0, 4)
	Remotes.UpdateWantedHUD:FireClient(player, wantedLevels[uid])
end

function WantedAPI.ClearWanted(player)
	wantedLevels[player.UserId] = 0
	Remotes.UpdateWantedHUD:FireClient(player, 0)
end

function WantedAPI.GetWanted(player)
	return wantedLevels[player.UserId] or 0
end

_G.WantedAPI = WantedAPI

-- ── Remote handlers ────────────────────────────────────────────────────────

Remotes.CuffPlayer.OnServerEvent:Connect(function(officer, target)
	if typeof(target) ~= "Instance" or not target:IsA("Player") then return end
	local oChar = officer.Character
	local tChar = target.Character
	if not oChar or not tChar then return end

	local dist = (oChar.HumanoidRootPart.Position - tChar.HumanoidRootPart.Position).Magnitude
	if dist > GameConfig.Police.CuffRange then
		Remotes.ShowNotification:FireClient(officer, "Too far away!", "error")
		return
	end
	if cuffed[target.UserId] then return end

	cuffed[target.UserId] = true
	local hum = tChar:FindFirstChildOfClass("Humanoid")
	if hum then hum.WalkSpeed = 0 end

	Remotes.ShowNotification:FireClient(target,  "You have been cuffed!", "error")
	Remotes.ShowNotification:FireClient(officer, "Cuffed " .. target.Name, "success")
end)

Remotes.UncuffPlayer.OnServerEvent:Connect(function(officer, target)
	if typeof(target) ~= "Instance" or not target:IsA("Player") then return end
	cuffed[target.UserId] = nil
	local tChar = target.Character
	if tChar then
		local hum = tChar:FindFirstChildOfClass("Humanoid")
		if hum then hum.WalkSpeed = 16 end
	end
	Remotes.ShowNotification:FireClient(target,  "You have been uncuffed.", "info")
	Remotes.ShowNotification:FireClient(officer, "Uncuffed " .. target.Name, "info")
end)

Remotes.SendToJail.OnServerEvent:Connect(function(officer, target)
	if typeof(target) ~= "Instance" or not target:IsA("Player") then return end
	if not cuffed[target.UserId] then
		Remotes.ShowNotification:FireClient(officer, "Player must be cuffed first!", "error")
		return
	end

	cuffed[target.UserId] = nil
	local releaseTime = tick() + GameConfig.Police.JailDuration
	inJail[target.UserId] = releaseTime
	WantedAPI.ClearWanted(target)

	local tChar = target.Character
	if tChar and tChar:FindFirstChild("HumanoidRootPart") then
		tChar.HumanoidRootPart.CFrame = JAIL_CF
	end
	local hum = tChar and tChar:FindFirstChildOfClass("Humanoid")
	if hum then hum.WalkSpeed = 8 end

	Remotes.ShowNotification:FireClient(target,
		"Sent to jail for " .. GameConfig.Police.JailDuration .. "s!", "error")

	task.delay(GameConfig.Police.JailDuration, function()
		if inJail[target.UserId] ~= releaseTime then return end
		inJail[target.UserId] = nil
		local char = target.Character
		if char then
			local h = char:FindFirstChildOfClass("Humanoid")
			if h then h.WalkSpeed = 16 end
		end
		Remotes.ShowNotification:FireClient(target, "Released from jail!", "success")
	end)
end)

Remotes.Bail.OnServerEvent:Connect(function(player)
	if not inJail[player.UserId] then return end
	local cost = GameConfig.Police.BailCost
	if not _G.MoneyAPI then return end
	if not _G.MoneyAPI.TakeCash(player, cost) then
		Remotes.ShowNotification:FireClient(player,
			"Need $" .. cost .. " for bail!", "error")
		return
	end
	inJail[player.UserId] = nil
	local char = player.Character
	if char then
		local h = char:FindFirstChildOfClass("Humanoid")
		if h then h.WalkSpeed = 16 end
	end
	Remotes.ShowNotification:FireClient(player, "Bailed out! -$" .. cost, "info")
end)

Remotes.AddWanted.OnServerEvent:Connect(function(player, amount)
	WantedAPI.AddWanted(player, amount)
end)

Remotes.ClearWanted.OnServerEvent:Connect(function(player)
	WantedAPI.ClearWanted(player)
end)

Remotes.GetWantedLevel.OnServerInvoke = function(player)
	return wantedLevels[player.UserId] or 0
end

Players.PlayerAdded:Connect(function(player)
	wantedLevels[player.UserId] = 0
end)

Players.PlayerRemoving:Connect(function(player)
	wantedLevels[player.UserId] = nil
	cuffed[player.UserId]       = nil
	inJail[player.UserId]       = nil
end)
