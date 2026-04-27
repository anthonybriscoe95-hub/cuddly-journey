-- LocalScript → StarterGui  (place inside a ScreenGui named "GunShopGui")
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player  = Players.LocalPlayer
local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local sg      = script.Parent   -- the ScreenGui
sg.Enabled    = false

-- ── Background panel ───────────────────────────────────────────────────────
local bg             = Instance.new("Frame", sg)
bg.Size              = UDim2.new(0, 500, 0, 600)
bg.AnchorPoint       = Vector2.new(0.5, 0.5)
bg.Position          = UDim2.new(0.5, 0, 0.5, 0)
bg.BackgroundColor3  = Color3.fromRGB(8, 8, 10)
bg.BorderSizePixel   = 0
local bgC = Instance.new("UICorner", bg); bgC.CornerRadius = UDim.new(0, 16)
local bgS = Instance.new("UIStroke",  bg)
bgS.Color     = Color3.fromRGB(220, 30, 35)
bgS.Thickness = 2

local title             = Instance.new("TextLabel", bg)
title.Size              = UDim2.new(1, 0, 0, 60)
title.BackgroundTransparency = 1
title.Text              = "🔫  GUN SHOP"
title.Font              = Enum.Font.GothamBold
title.TextSize          = 28
title.TextColor3        = Color3.fromRGB(220, 30, 35)

local closeBtn            = Instance.new("TextButton", bg)
closeBtn.Size             = UDim2.new(0, 36, 0, 36)
closeBtn.Position         = UDim2.new(1, -46, 0, 12)
closeBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 60)
closeBtn.Text             = "✕"
closeBtn.Font             = Enum.Font.GothamBold
closeBtn.TextSize         = 18
closeBtn.TextColor3       = Color3.fromRGB(255, 255, 255)
local clC = Instance.new("UICorner", closeBtn); clC.CornerRadius = UDim.new(0, 8)
closeBtn.MouseButton1Click:Connect(function() sg.Enabled = false end)

-- ── Scroll list ─────────────────────────────────────────────────────────────
local scroll                     = Instance.new("ScrollingFrame", bg)
scroll.Size                      = UDim2.new(1, -40, 1, -80)
scroll.Position                  = UDim2.new(0, 20, 0, 70)
scroll.BackgroundTransparency    = 1
scroll.BorderSizePixel           = 0
scroll.ScrollBarThickness        = 4
scroll.ScrollBarImageColor3      = Color3.fromRGB(220, 30, 35)
scroll.CanvasSize                = UDim2.new(0, 0, 0, 0)

local layout         = Instance.new("UIListLayout", scroll)
layout.Padding       = UDim.new(0, 10)
layout.SortOrder     = Enum.SortOrder.LayoutOrder

local function buildRow(key, cfg)
	local row             = Instance.new("Frame", scroll)
	row.Size              = UDim2.new(1, -8, 0, 80)
	row.BackgroundColor3  = Color3.fromRGB(14, 14, 18)
	row.BorderSizePixel   = 0
	local rC = Instance.new("UICorner", row); rC.CornerRadius = UDim.new(0, 12)

	local nameLabel            = Instance.new("TextLabel", row)
	nameLabel.Size             = UDim2.new(0.55, 0, 0, 30)
	nameLabel.Position         = UDim2.new(0, 16, 0, 10)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text             = cfg.name
	nameLabel.Font             = Enum.Font.GothamBold
	nameLabel.TextSize         = 18
	nameLabel.TextColor3       = Color3.fromRGB(245, 245, 245)
	nameLabel.TextXAlignment   = Enum.TextXAlignment.Left

	local priceLabel            = Instance.new("TextLabel", row)
	priceLabel.Size             = UDim2.new(0.55, 0, 0, 26)
	priceLabel.Position         = UDim2.new(0, 16, 0, 42)
	priceLabel.BackgroundTransparency = 1
	priceLabel.Text             = "$" .. cfg.price
	priceLabel.Font             = Enum.Font.GothamBold
	priceLabel.TextSize         = 14
	priceLabel.TextColor3       = Color3.fromRGB(100, 220, 100)
	priceLabel.TextXAlignment   = Enum.TextXAlignment.Left

	local buyBtn              = Instance.new("TextButton", row)
	buyBtn.Size               = UDim2.new(0, 100, 0, 44)
	buyBtn.Position           = UDim2.new(1, -116, 0.5, -22)
	buyBtn.BackgroundColor3   = Color3.fromRGB(220, 30, 35)
	buyBtn.Text               = "BUY"
	buyBtn.Font               = Enum.Font.GothamBold
	buyBtn.TextSize           = 16
	buyBtn.TextColor3         = Color3.fromRGB(255, 255, 255)
	buyBtn.BorderSizePixel    = 0
	local bC = Instance.new("UICorner", buyBtn); bC.CornerRadius = UDim.new(0, 10)

	buyBtn.MouseButton1Click:Connect(function()
		Remotes.BuyWeapon:FireServer(key)
		sg.Enabled = false
	end)
end

-- Populate when opened
sg:GetPropertyChangedSignal("Enabled"):Connect(function()
	if not sg.Enabled then return end
	for _, c in ipairs(scroll:GetChildren()) do
		if c:IsA("Frame") then c:Destroy() end
	end
	local data = Remotes.GetWeaponShopData:InvokeServer()
	if not data then return end
	for key, cfg in pairs(data) do
		buildRow(key, cfg)
	end
	layout:ApplyLayout()
	scroll.CanvasSize = UDim2.new(0, 0, 0, layout.AbsoluteContentSize.Y + 20)
end)
