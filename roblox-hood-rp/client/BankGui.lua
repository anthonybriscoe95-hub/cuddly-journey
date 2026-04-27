-- LocalScript → StarterGui  (place inside a ScreenGui named "BankGui")
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player  = Players.LocalPlayer
local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local sg      = script.Parent
sg.Enabled    = false

-- ── Panel ──────────────────────────────────────────────────────────────────
local bg             = Instance.new("Frame", sg)
bg.Size              = UDim2.new(0, 420, 0, 440)
bg.AnchorPoint       = Vector2.new(0.5, 0.5)
bg.Position          = UDim2.new(0.5, 0, 0.5, 0)
bg.BackgroundColor3  = Color3.fromRGB(8, 8, 10)
bg.BorderSizePixel   = 0
local bgC = Instance.new("UICorner", bg); bgC.CornerRadius = UDim.new(0, 16)
local bgS = Instance.new("UIStroke",  bg)
bgS.Color     = Color3.fromRGB(255, 215, 0)
bgS.Thickness = 2

local title             = Instance.new("TextLabel", bg)
title.Size              = UDim2.new(1, 0, 0, 60)
title.BackgroundTransparency = 1
title.Text              = "🏦  CITY BANK"
title.Font              = Enum.Font.GothamBold
title.TextSize          = 26
title.TextColor3        = Color3.fromRGB(255, 215, 0)

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

-- ── Balance displays ───────────────────────────────────────────────────────
local function balanceBlock(parent, yPos, labelStr, valueName)
	local lbl              = Instance.new("TextLabel", parent)
	lbl.Size               = UDim2.new(1, -40, 0, 22)
	lbl.Position           = UDim2.new(0, 20, 0, yPos)
	lbl.BackgroundTransparency = 1
	lbl.Text               = labelStr
	lbl.Font               = Enum.Font.GothamBold
	lbl.TextSize           = 13
	lbl.TextColor3         = Color3.fromRGB(140, 140, 160)
	lbl.TextXAlignment     = Enum.TextXAlignment.Left

	local val              = Instance.new("TextLabel", parent)
	val.Name               = valueName
	val.Size               = UDim2.new(1, -40, 0, 34)
	val.Position           = UDim2.new(0, 20, 0, yPos + 22)
	val.BackgroundTransparency = 1
	val.Text               = "$0"
	val.Font               = Enum.Font.GothamBold
	val.TextSize           = 28
	val.TextColor3         = Color3.fromRGB(255, 255, 255)
	val.TextXAlignment     = Enum.TextXAlignment.Left
	return val
end

local cashDisplay = balanceBlock(bg, 68,  "CASH ON HAND",  "CashDisplay")
local bankDisplay = balanceBlock(bg, 130, "BANK BALANCE",  "BankDisplay")

-- ── Amount input ───────────────────────────────────────────────────────────
local amountBox               = Instance.new("TextBox", bg)
amountBox.Size                = UDim2.new(1, -40, 0, 46)
amountBox.Position            = UDim2.new(0, 20, 0, 210)
amountBox.BackgroundColor3    = Color3.fromRGB(18, 18, 22)
amountBox.BorderSizePixel     = 0
amountBox.PlaceholderText     = "Enter amount…"
amountBox.PlaceholderColor3   = Color3.fromRGB(80, 80, 100)
amountBox.Text                = ""
amountBox.Font                = Enum.Font.GothamBold
amountBox.TextSize            = 20
amountBox.TextColor3          = Color3.fromRGB(245, 245, 245)
amountBox.ClearTextOnFocus    = true
local abC = Instance.new("UICorner", amountBox); abC.CornerRadius = UDim.new(0, 10)
local abS = Instance.new("UIStroke",  amountBox); abS.Color = Color3.fromRGB(50, 50, 60); abS.Thickness = 1

-- ── Action buttons ─────────────────────────────────────────────────────────
local function actionBtn(parent, xScale, text, color)
	local btn             = Instance.new("TextButton", parent)
	btn.Size              = UDim2.new(0.45, 0, 0, 52)
	btn.Position          = UDim2.new(xScale, 0, 0, 274)
	btn.BackgroundColor3  = color
	btn.Text              = text
	btn.Font              = Enum.Font.GothamBold
	btn.TextSize          = 18
	btn.TextColor3        = Color3.fromRGB(255, 255, 255)
	btn.BorderSizePixel   = 0
	local bC = Instance.new("UICorner", btn); bC.CornerRadius = UDim.new(0, 12)
	return btn
end

local depositBtn  = actionBtn(bg, 0.03, "DEPOSIT",  Color3.fromRGB(50,  160, 100))
local withdrawBtn = actionBtn(bg, 0.52, "WITHDRAW", Color3.fromRGB(220, 150, 30))

local function refresh()
	local data = Remotes.GetMoneyData:InvokeServer()
	if data then
		cashDisplay.Text = "$" .. tostring(data.cash)
		bankDisplay.Text = "$" .. tostring(data.bank)
	end
end

sg:GetPropertyChangedSignal("Enabled"):Connect(function()
	if sg.Enabled then refresh() end
end)

depositBtn.MouseButton1Click:Connect(function()
	local amount = tonumber(amountBox.Text)
	if not amount or amount <= 0 then return end
	Remotes.Deposit:FireServer(amount)
	amountBox.Text = ""
	task.wait(0.35)
	refresh()
end)

withdrawBtn.MouseButton1Click:Connect(function()
	local amount = tonumber(amountBox.Text)
	if not amount or amount <= 0 then return end
	Remotes.Withdraw:FireServer(amount)
	amountBox.Text = ""
	task.wait(0.35)
	refresh()
end)
