--[[
	CLICK SIMULATOR - CLIENT (the on-screen buttons)
	Put this in: StarterPlayer > StarterPlayerScripts (as a LocalScript)

	Builds the whole GUI by code, so you don't have to make any GUI yourself.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local MarketplaceService = game:GetService("MarketplaceService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local gamePassId = remotes:GetAttribute("GamePassId") or 0

----------------------------------------------------------------
-- NUMBER FORMATTING (1500 -> 1.5K)
----------------------------------------------------------------
local suffixes = { "", "K", "M", "B", "T", "Qd", "Qn", "Sx" }
local function short(n)
	n = n or 0
	local i = 1
	while math.abs(n) >= 1000 and i < #suffixes do
		n /= 1000
		i += 1
	end
	if i == 1 then
		return tostring(math.floor(n))
	end
	return string.format("%.1f%s", n, suffixes[i])
end

----------------------------------------------------------------
-- GUI HELPERS
----------------------------------------------------------------
local gui = Instance.new("ScreenGui")
gui.Name = "ClickSimGui"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local function round(obj, radius)
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, radius or 12)
	corner.Parent = obj
end

local function outline(obj, color)
	local stroke = Instance.new("UIStroke")
	stroke.Thickness = 3
	stroke.Color = color or Color3.fromRGB(0, 0, 0)
	stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
	stroke.Parent = obj
end

local function makeButton(text, color, size, position)
	local button = Instance.new("TextButton")
	button.Size = size
	button.Position = position
	button.AnchorPoint = Vector2.new(0.5, 0.5)
	button.BackgroundColor3 = color
	button.Text = text
	button.TextColor3 = Color3.new(1, 1, 1)
	button.Font = Enum.Font.FredokaOne
	button.TextScaled = true
	button.AutoButtonColor = true
	button.Parent = gui
	round(button, 14)
	outline(button)
	local pad = Instance.new("UIPadding")
	pad.PaddingLeft = UDim.new(0, 8)
	pad.PaddingRight = UDim.new(0, 8)
	pad.PaddingTop = UDim.new(0, 6)
	pad.PaddingBottom = UDim.new(0, 6)
	pad.Parent = button
	return button
end

local originalSizes = {}
local function bounce(obj)
	originalSizes[obj] = originalSizes[obj] or obj.Size
	local original = originalSizes[obj]
	local small = UDim2.new(original.X.Scale * 0.9, original.X.Offset * 0.9, original.Y.Scale * 0.9, original.Y.Offset * 0.9)
	obj.Size = small
	TweenService:Create(obj, TweenInfo.new(0.15, Enum.EasingStyle.Back), { Size = original }):Play()
end

----------------------------------------------------------------
-- BUILD THE SCREEN
----------------------------------------------------------------
-- Coins display (top middle)
local coinsLabel = Instance.new("TextLabel")
coinsLabel.AnchorPoint = Vector2.new(0.5, 0)
coinsLabel.Position = UDim2.new(0.5, 0, 0, 10)
coinsLabel.Size = UDim2.new(0, 320, 0, 60)
coinsLabel.BackgroundColor3 = Color3.fromRGB(255, 196, 0)
coinsLabel.TextColor3 = Color3.new(1, 1, 1)
coinsLabel.Font = Enum.Font.FredokaOne
coinsLabel.TextScaled = true
coinsLabel.Text = "💰 0"
coinsLabel.Parent = gui
round(coinsLabel, 16)
outline(coinsLabel)

local infoLabel = Instance.new("TextLabel")
infoLabel.AnchorPoint = Vector2.new(0.5, 0)
infoLabel.Position = UDim2.new(0.5, 0, 0, 75)
infoLabel.Size = UDim2.new(0, 320, 0, 26)
infoLabel.BackgroundTransparency = 1
infoLabel.TextColor3 = Color3.new(1, 1, 1)
infoLabel.TextStrokeTransparency = 0
infoLabel.Font = Enum.Font.FredokaOne
infoLabel.TextScaled = true
infoLabel.Text = ""
infoLabel.Parent = gui

-- Big CLICK button (bottom middle)
local clickButton = makeButton("CLICK!", Color3.fromRGB(0, 200, 90),
	UDim2.new(0, 200, 0, 200), UDim2.new(0.5, 0, 1, -130))
clickButton.UICorner.CornerRadius = UDim.new(0.5, 0) -- make it a circle

-- Side buttons (left side)
local upgradeButton = makeButton("Upgrade", Color3.fromRGB(0, 140, 255),
	UDim2.new(0, 190, 0, 60), UDim2.new(0, 110, 0.5, -70))
local rebirthButton = makeButton("Rebirth", Color3.fromRGB(170, 60, 255),
	UDim2.new(0, 190, 0, 60), UDim2.new(0, 110, 0.5, 0))
local passButton = makeButton("⭐ 2x COINS ⭐", Color3.fromRGB(255, 70, 70),
	UDim2.new(0, 190, 0, 60), UDim2.new(0, 110, 0.5, 70))
passButton.Visible = gamePassId ~= 0

----------------------------------------------------------------
-- "+10" POPUPS WHEN YOU CLICK
----------------------------------------------------------------
local function popup(text)
	local label = Instance.new("TextLabel")
	label.AnchorPoint = Vector2.new(0.5, 0.5)
	label.Position = UDim2.new(0.5 + (math.random() - 0.5) * 0.2, 0, 1, -250)
	label.Size = UDim2.new(0, 120, 0, 40)
	label.BackgroundTransparency = 1
	label.TextColor3 = Color3.fromRGB(255, 220, 0)
	label.TextStrokeTransparency = 0
	label.Font = Enum.Font.FredokaOne
	label.TextScaled = true
	label.Text = text
	label.Parent = gui
	local tween = TweenService:Create(label, TweenInfo.new(0.8), {
		Position = label.Position - UDim2.new(0, 0, 0, 120),
		TextTransparency = 1,
		TextStrokeTransparency = 1,
	})
	tween:Play()
	tween.Completed:Connect(function()
		label:Destroy()
	end)
end

----------------------------------------------------------------
-- KEEP TEXT UP TO DATE
----------------------------------------------------------------
local leaderstats = player:WaitForChild("leaderstats")
local coins = leaderstats:WaitForChild("Coins")
local rebirths = leaderstats:WaitForChild("Rebirths")

local function refresh()
	coinsLabel.Text = "💰 " .. short(coins.Value)
	local perClick = (player:GetAttribute("ClickPower") or 1) * (player:GetAttribute("Multiplier") or 1)
	infoLabel.Text = "+" .. short(perClick) .. " per click  |  Rebirths: " .. rebirths.Value
	upgradeButton.Text = "⬆ +1 Click (" .. short(player:GetAttribute("UpgradeCost")) .. ")"
	rebirthButton.Text = "🔁 Rebirth (" .. short(player:GetAttribute("RebirthCost")) .. ")"
	if player:GetAttribute("HasPass") then
		passButton.Visible = false
	end
end

coins.Changed:Connect(refresh)
rebirths.Changed:Connect(refresh)
player.AttributeChanged:Connect(refresh)
refresh()

----------------------------------------------------------------
-- BUTTON ACTIONS
----------------------------------------------------------------
clickButton.Activated:Connect(function()
	bounce(clickButton)
	local perClick = (player:GetAttribute("ClickPower") or 1) * (player:GetAttribute("Multiplier") or 1)
	popup("+" .. short(perClick))
	remotes.Click:FireServer()
end)

upgradeButton.Activated:Connect(function()
	bounce(upgradeButton)
	remotes.Upgrade:FireServer()
end)

rebirthButton.Activated:Connect(function()
	bounce(rebirthButton)
	remotes.Rebirth:FireServer()
end)

passButton.Activated:Connect(function()
	bounce(passButton)
	MarketplaceService:PromptGamePassPurchase(player, gamePassId)
end)
