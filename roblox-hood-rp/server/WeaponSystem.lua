-- Script → ServerScriptService/WeaponSystem
-- Weapons live in ServerStorage/Weapons as Tool objects.
-- If a tool isn't found, a placeholder part tool is given instead.
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage     = game:GetService("ServerStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes    = ReplicatedStorage:WaitForChild("Remotes")

local WeaponsFolder = ServerStorage:FindFirstChild("Weapons")

local function alreadyOwned(player, toolName)
	local char     = player.Character
	local backpack = player.Backpack
	return (char and char:FindFirstChild(toolName) ~= nil)
		or (backpack and backpack:FindFirstChild(toolName) ~= nil)
end

Remotes.GetWeaponShopData.OnServerInvoke = function(_player)
	return GameConfig.Weapons
end

Remotes.BuyWeapon.OnServerEvent:Connect(function(player, weaponKey)
	local cfg = GameConfig.Weapons[weaponKey]
	if not cfg then return end

	if alreadyOwned(player, cfg.toolName) then
		Remotes.ShowNotification:FireClient(player, "You already own that!", "error")
		return
	end

	if not _G.MoneyAPI then return end
	local cash = _G.MoneyAPI.GetCash(player)
	if cash < cfg.price then
		Remotes.ShowNotification:FireClient(player,
			"Need $" .. cfg.price .. " (have $" .. cash .. ")", "error")
		return
	end

	_G.MoneyAPI.TakeCash(player, cfg.price)

	-- Try real tool first
	if WeaponsFolder then
		local src = WeaponsFolder:FindFirstChild(cfg.toolName)
		if src then
			src:Clone().Parent = player.Backpack
			Remotes.ShowNotification:FireClient(player, "Purchased " .. cfg.name .. "!", "success")
			return
		end
	end

	-- Placeholder tool so the flow still works without actual models
	local tool          = Instance.new("Tool")
	tool.Name           = cfg.toolName
	tool.RequiresHandle = false
	local handle        = Instance.new("Part", tool)
	handle.Name         = "Handle"
	handle.Size         = Vector3.new(0.4, 0.4, 1.2)
	handle.BrickColor   = BrickColor.new("Dark grey")
	tool.Parent         = player.Backpack

	Remotes.ShowNotification:FireClient(player, "Purchased " .. cfg.name .. "!", "success")
end)
