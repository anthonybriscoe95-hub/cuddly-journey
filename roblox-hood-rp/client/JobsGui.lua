-- LocalScript → StarterGui  (place inside a ScreenGui named "JobsGui")
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player  = Players.LocalPlayer
local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local sg      = script.Parent
sg.Enabled    = false

local currentJob = nil  -- tracks which job key is active

-- ── Panel ──────────────────────────────────────────────────────────────────
local bg             = Instance.new("Frame", sg)
bg.Size              = UDim2.new(0, 460, 0, 560)
bg.AnchorPoint       = Vector2.new(0.5, 0.5)
bg.Position          = UDim2.new(0.5, 0, 0.5, 0)
bg.BackgroundColor3  = Color3.fromRGB(8, 8, 10)
bg.BorderSizePixel   = 0
local bgC = Instance.new("UICorner", bg); bgC.CornerRadius = UDim.new(0, 16)
local bgS = Instance.new("UIStroke",  bg)
bgS.Color     = Color3.fromRGB(100, 220, 100)
bgS.Thickness = 2

local title             = Instance.new("TextLabel", bg)
title.Size              = UDim2.new(1, 0, 0, 60)
title.BackgroundTransparency = 1
title.Text              = "💼  JOBS BOARD"
title.Font              = Enum.Font.GothamBold
title.TextSize          = 26
title.TextColor3        = Color3.fromRGB(100, 220, 100)

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
local scroll                  = Instance.new("ScrollingFrame", bg)
scroll.Size                   = UDim2.new(1, -40, 1, -80)
scroll.Position               = UDim2.new(0, 20, 0, 70)
scroll.BackgroundTransparency = 1
scroll.BorderSizePixel        = 0
scroll.ScrollBarThickness     = 4
scroll.ScrollBarImageColor3   = Color3.fromRGB(100, 220, 100)
scroll.CanvasSize             = UDim2.new(0, 0, 0, 0)

local layout     = Instance.new("UIListLayout", scroll)
layout.Padding   = UDim.new(0, 10)
layout.SortOrder = Enum.SortOrder.LayoutOrder

local function buildRow(key, cfg)
	local row             = Instance.new("Frame", scroll)
	row.Size              = UDim2.new(1, -8, 0, 100)
	row.BackgroundColor3  = Color3.fromRGB(14, 14, 18)
	row.BorderSizePixel   = 0
	local rC = Instance.new("UICorner", row); rC.CornerRadius = UDim.new(0, 12)

	local icon             = Instance.new("TextLabel", row)
	icon.Size              = UDim2.new(0, 60, 1, 0)
	icon.Position          = UDim2.new(0, 10, 0, 0)
	icon.BackgroundTransparency = 1
	icon.Text              = cfg.icon or "💼"
	icon.Font              = Enum.Font.GothamBold
	icon.TextSize          = 34

	local nameLabel            = Instance.new("TextLabel", row)
	nameLabel.Size             = UDim2.new(0.5, 0, 0, 30)
	nameLabel.Position         = UDim2.new(0, 78, 0, 14)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text             = cfg.name
	nameLabel.Font             = Enum.Font.GothamBold
	nameLabel.TextSize         = 16
	nameLabel.TextColor3       = Color3.fromRGB(245, 245, 245)
	nameLabel.TextXAlignment   = Enum.TextXAlignment.Left

	local details              = Instance.new("TextLabel", row)
	details.Size               = UDim2.new(0.5, 0, 0, 26)
	details.Position           = UDim2.new(0, 78, 0, 46)
	details.BackgroundTransparency = 1
	details.Text               = "$" .. cfg.pay .. "  ·  " .. cfg.duration .. "s / task"
	details.Font               = Enum.Font.GothamBold
	details.TextSize           = 13
	details.TextColor3         = Color3.fromRGB(100, 220, 100)
	details.TextXAlignment     = Enum.TextXAlignment.Left

	local btn              = Instance.new("TextButton", row)
	btn.Size               = UDim2.new(0, 100, 0, 42)
	btn.Position           = UDim2.new(1, -116, 0.5, -21)
	btn.BackgroundColor3   = Color3.fromRGB(50, 160, 80)
	btn.Text               = currentJob == key and "QUIT" or "WORK"
	btn.Font               = Enum.Font.GothamBold
	btn.TextSize           = 15
	btn.TextColor3         = Color3.fromRGB(255, 255, 255)
	btn.BorderSizePixel    = 0
	local bC = Instance.new("UICorner", btn); bC.CornerRadius = UDim.new(0, 10)
	if currentJob == key then
		btn.BackgroundColor3 = Color3.fromRGB(180, 50, 50)
	end

	btn.MouseButton1Click:Connect(function()
		if currentJob == key then
			Remotes.StopJob:FireServer()
			currentJob = nil
		else
			if currentJob then Remotes.StopJob:FireServer() end
			Remotes.StartJob:FireServer(key)
			currentJob = key
		end
		sg.Enabled = false
	end)
end

sg:GetPropertyChangedSignal("Enabled"):Connect(function()
	if not sg.Enabled then return end
	for _, c in ipairs(scroll:GetChildren()) do
		if c:IsA("Frame") then c:Destroy() end
	end
	local jobs = Remotes.GetJobList:InvokeServer()
	if not jobs then return end
	for key, cfg in pairs(jobs) do
		buildRow(key, cfg)
	end
	layout:ApplyLayout()
	scroll.CanvasSize = UDim2.new(0, 0, 0, layout.AbsoluteContentSize.Y + 20)
end)

-- Clear job tracking if server stops it
Remotes.JobTaskComplete.OnClientEvent:Connect(function(_jobKey)
	-- optionally flash a task-done indicator here
end)
