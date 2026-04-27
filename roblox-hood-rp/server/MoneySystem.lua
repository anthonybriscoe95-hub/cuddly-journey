-- Script → ServerScriptService/MoneySystem
local Players          = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService  = game:GetService("DataStoreService")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes    = ReplicatedStorage:WaitForChild("Remotes")
local MoneyStore = DataStoreService:GetDataStore("HoodRP_Money_v1")

local cache = {}  -- [userId] = { cash, bank, cashVal, bankVal }

local function load(player)
	local ok, data = pcall(function()
		return MoneyStore:GetAsync("p_" .. player.UserId)
	end)
	if ok and data then return data end
	return { cash = GameConfig.StartingCash, bank = GameConfig.StartingBank }
end

local function save(player)
	local d = cache[player.UserId]
	if not d then return end
	pcall(function()
		MoneyStore:SetAsync("p_" .. player.UserId, { cash = d.cash, bank = d.bank })
	end)
end

-- ── Public API (used by other server scripts via _G.MoneyAPI) ──────────────

local API = {}

function API.GiveCash(player, amount)
	local d = cache[player.UserId]
	if not d then return end
	d.cash += math.floor(amount)
	d.cashVal.Value = d.cash
end

function API.TakeCash(player, amount)
	local d = cache[player.UserId]
	if not d or d.cash < amount then return false end
	d.cash -= math.floor(amount)
	d.cashVal.Value = d.cash
	return true
end

function API.GiveBank(player, amount)
	local d = cache[player.UserId]
	if not d then return end
	d.bank += math.floor(amount)
	d.bankVal.Value = d.bank
end

function API.GetCash(player)
	local d = cache[player.UserId]
	return d and d.cash or 0
end

function API.GetBank(player)
	local d = cache[player.UserId]
	return d and d.bank or 0
end

_G.MoneyAPI = API

-- ── Player lifecycle ───────────────────────────────────────────────────────

Players.PlayerAdded:Connect(function(player)
	local data = load(player)

	local stats    = Instance.new("Folder")
	stats.Name     = "leaderstats"
	stats.Parent   = player

	local cashVal  = Instance.new("IntValue")
	cashVal.Name   = "Cash"
	cashVal.Value  = data.cash
	cashVal.Parent = stats

	local bankVal  = Instance.new("IntValue")
	bankVal.Name   = "Bank"
	bankVal.Value  = data.bank
	bankVal.Parent = stats

	cache[player.UserId] = {
		cash    = data.cash,
		bank    = data.bank,
		cashVal = cashVal,
		bankVal = bankVal,
	}
end)

Players.PlayerRemoving:Connect(function(player)
	save(player)
	cache[player.UserId] = nil
end)

game:BindToClose(function()
	for _, p in ipairs(Players:GetPlayers()) do save(p) end
end)

-- ── Remote handlers ────────────────────────────────────────────────────────

Remotes.Deposit.OnServerEvent:Connect(function(player, amount)
	if type(amount) ~= "number" or amount <= 0 then return end
	amount = math.floor(amount)
	local d = cache[player.UserId]
	if not d or d.cash < amount then
		Remotes.ShowNotification:FireClient(player, "Not enough cash!", "error")
		return
	end
	d.cash -= amount
	d.bank += amount
	d.cashVal.Value = d.cash
	d.bankVal.Value = d.bank
	Remotes.ShowNotification:FireClient(player, "Deposited $" .. amount, "success")
end)

Remotes.Withdraw.OnServerEvent:Connect(function(player, amount)
	if type(amount) ~= "number" or amount <= 0 then return end
	amount = math.floor(amount)
	local d = cache[player.UserId]
	if not d or d.bank < amount then
		Remotes.ShowNotification:FireClient(player, "Not enough in bank!", "error")
		return
	end
	d.bank -= amount
	d.cash += amount
	d.cashVal.Value = d.cash
	d.bankVal.Value = d.bank
	Remotes.ShowNotification:FireClient(player, "Withdrew $" .. amount, "success")
end)

Remotes.GetMoneyData.OnServerInvoke = function(player)
	local d = cache[player.UserId]
	if not d then return { cash = 0, bank = 0 } end
	return { cash = d.cash, bank = d.bank }
end

-- Money stack pickup
Remotes.CollectMoney.OnServerEvent:Connect(function(player, stackPart)
	if typeof(stackPart) ~= "Instance" or not stackPart:IsA("BasePart") then return end
	if not stackPart.Parent then return end
	if not stackPart:GetAttribute("MoneyValue") then return end

	local char = player.Character
	if not char or not char:FindFirstChild("HumanoidRootPart") then return end
	local dist = (char.HumanoidRootPart.Position - stackPart.Position).Magnitude
	if dist > 10 then return end

	local value = stackPart:GetAttribute("MoneyValue")
	stackPart:Destroy()
	API.GiveCash(player, value)
	Remotes.ShowNotification:FireClient(player, "Collected $" .. value, "cash")
end)
