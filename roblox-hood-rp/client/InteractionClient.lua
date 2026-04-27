-- LocalScript → StarterPlayerScripts/InteractionClient
-- Parts need Attribute "Interaction" (string key) and optionally "InteractionLabel" (string).
local Players           = game:GetService("Players")
local UserInputService  = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService        = game:GetService("RunService")

local player  = Players.LocalPlayer
local Remotes = ReplicatedStorage:WaitForChild("Remotes")

local INTERACT_RANGE = 8
local currentTarget  = nil

-- ── Build prompt UI ────────────────────────────────────────────────────────
local sg        = Instance.new("ScreenGui")
sg.Name         = "InteractionPrompt"
sg.ResetOnSpawn = false
sg.IgnoreGuiInset = true
sg.Parent       = player.PlayerGui

local promptFrame             = Instance.new("Frame", sg)
promptFrame.Name              = "Prompt"
promptFrame.Size              = UDim2.new(0, 230, 0, 52)
promptFrame.AnchorPoint       = Vector2.new(0.5, 1)
promptFrame.Position          = UDim2.new(0.5, 0, 0.85, 0)
promptFrame.BackgroundColor3  = Color3.fromRGB(10, 10, 12)
promptFrame.BorderSizePixel   = 0
promptFrame.Visible           = false
local pC = Instance.new("UICorner", promptFrame); pC.CornerRadius = UDim.new(0, 10)
local pS = Instance.new("UIStroke", promptFrame)
pS.Color     = Color3.fromRGB(220, 30, 35)
pS.Thickness = 2

local keyBadge                = Instance.new("TextLabel", promptFrame)
keyBadge.Size                 = UDim2.new(0, 40, 1, -8)
keyBadge.Position             = UDim2.new(0, 6, 0, 4)
keyBadge.BackgroundColor3     = Color3.fromRGB(220, 30, 35)
keyBadge.Text                 = "E"
keyBadge.Font                 = Enum.Font.GothamBold
keyBadge.TextSize             = 20
keyBadge.TextColor3           = Color3.fromRGB(255, 255, 255)
local kC = Instance.new("UICorner", keyBadge); kC.CornerRadius = UDim.new(0, 6)

local promptLabel             = Instance.new("TextLabel", promptFrame)
promptLabel.Name              = "Label"
promptLabel.Size              = UDim2.new(1, -56, 1, 0)
promptLabel.Position          = UDim2.new(0, 52, 0, 0)
promptLabel.BackgroundTransparency = 1
promptLabel.Text              = "Interact"
promptLabel.Font              = Enum.Font.GothamBold
promptLabel.TextSize          = 16
promptLabel.TextColor3        = Color3.fromRGB(245, 245, 245)
promptLabel.TextXAlignment    = Enum.TextXAlignment.Left

-- ── Interaction handlers ───────────────────────────────────────────────────

local function openGui(name)
	local gui = player.PlayerGui:FindFirstChild(name)
	if gui then gui.Enabled = not gui.Enabled end
end

local interactions = {
	BankVault    = function(part)
		local locName = part:GetAttribute("LocationName") or "CityBank"
		Remotes.StartRobbery:FireServer(locName, "Bank")
	end,
	BankTeller   = function() openGui("BankGui") end,
	GunShop      = function() openGui("GunShopGui") end,
	JobBoard     = function() openGui("JobsGui") end,
	MoneyStack   = function(part) Remotes.CollectMoney:FireServer(part) end,
	ShopRegister = function(part)
		local locName = part:GetAttribute("LocationName") or "Shop_" .. math.random(9999)
		Remotes.StartRobbery:FireServer(locName, "Shop")
	end,
	GunShopReg   = function(part)
		local locName = part:GetAttribute("LocationName") or "GunShop"
		Remotes.StartRobbery:FireServer(locName, "GunShop")
	end,
	BailDesk     = function() Remotes.Bail:FireServer() end,
}

-- ── Heartbeat scan ─────────────────────────────────────────────────────────

RunService.Heartbeat:Connect(function()
	local char = player.Character
	if not char or not char:FindFirstChild("HumanoidRootPart") then
		promptFrame.Visible = false
		currentTarget = nil
		return
	end
	local root = char.HumanoidRootPart

	local best, bestDist = nil, INTERACT_RANGE + 1
	for _, part in ipairs(workspace:GetDescendants()) do
		if part:IsA("BasePart") and part:GetAttribute("Interaction") then
			local d = (part.Position - root.Position).Magnitude
			if d < bestDist then
				bestDist = d
				best = part
			end
		end
	end

	currentTarget = best
	if currentTarget then
		promptLabel.Text    = currentTarget:GetAttribute("InteractionLabel") or "Interact"
		promptFrame.Visible = true
	else
		promptFrame.Visible = false
	end
end)

-- ── Input ──────────────────────────────────────────────────────────────────

UserInputService.InputBegan:Connect(function(input, processed)
	if processed or input.KeyCode ~= Enum.KeyCode.E then return end
	if not currentTarget then return end
	local key     = currentTarget:GetAttribute("Interaction")
	local handler = interactions[key]
	if handler then handler(currentTarget) end
end)
