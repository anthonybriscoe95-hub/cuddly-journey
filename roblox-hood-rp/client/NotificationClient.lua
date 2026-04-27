-- LocalScript → StarterGui/NotificationClient (inside a ScreenGui)
local Players           = game:GetService("Players")
local TweenService      = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player  = Players.LocalPlayer
local Remotes = ReplicatedStorage:WaitForChild("Remotes")

local COLORS = {
	success = Color3.fromRGB(50,  200, 80),
	error   = Color3.fromRGB(220, 50,  50),
	cash    = Color3.fromRGB(255, 210, 50),
	info    = Color3.fromRGB(100, 160, 255),
}

local sg              = Instance.new("ScreenGui")
sg.Name               = "NotificationGui"
sg.ResetOnSpawn       = false
sg.IgnoreGuiInset     = true
sg.ZIndexBehavior     = Enum.ZIndexBehavior.Sibling
sg.Parent             = player.PlayerGui

local SLOT_HEIGHT = 58
local MAX_NOTIFS  = 5
local queue       = {}
local active      = {}  -- ordered list of live frames

local function repositionAll()
	for i, frame in ipairs(active) do
		local targetY = 20 + (i - 1) * SLOT_HEIGHT
		TweenService:Create(frame, TweenInfo.new(0.2, Enum.EasingStyle.Quart), {
			Position = UDim2.new(1, -20, 0, targetY)
		}):Play()
	end
end

local function removeFrame(frame)
	for i, f in ipairs(active) do
		if f == frame then
			table.remove(active, i)
			break
		end
	end
	TweenService:Create(frame, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
		Position = UDim2.new(1, 320, 0, frame.Position.Y.Offset)
	}):Play()
	task.delay(0.3, function()
		frame:Destroy()
		repositionAll()
	end)
end

local function showNotif(msg, kind)
	-- Drop oldest if at cap
	if #active >= MAX_NOTIFS then
		removeFrame(active[1])
	end

	local color = COLORS[kind] or COLORS.info

	local frame               = Instance.new("Frame", sg)
	frame.Size                = UDim2.new(0, 290, 0, 50)
	frame.AnchorPoint         = Vector2.new(1, 0)
	frame.Position            = UDim2.new(1, 320, 0, 20 + #active * SLOT_HEIGHT)
	frame.BackgroundColor3    = Color3.fromRGB(10, 10, 12)
	frame.BorderSizePixel     = 0
	local fC = Instance.new("UICorner", frame); fC.CornerRadius = UDim.new(0, 10)
	local fS = Instance.new("UIStroke", frame)
	fS.Color     = color
	fS.Thickness = 2

	local bar               = Instance.new("Frame", frame)
	bar.Size                = UDim2.new(0, 5, 1, 0)
	bar.BackgroundColor3    = color
	bar.BorderSizePixel     = 0
	local bC = Instance.new("UICorner", bar); bC.CornerRadius = UDim.new(0, 10)

	local lbl                  = Instance.new("TextLabel", frame)
	lbl.Size                   = UDim2.new(1, -18, 1, 0)
	lbl.Position               = UDim2.new(0, 14, 0, 0)
	lbl.BackgroundTransparency = 1
	lbl.Text                   = msg
	lbl.Font                   = Enum.Font.GothamBold
	lbl.TextSize               = 15
	lbl.TextColor3             = Color3.fromRGB(245, 245, 245)
	lbl.TextXAlignment         = Enum.TextXAlignment.Left
	lbl.TextWrapped            = true

	table.insert(active, frame)

	-- Slide in
	TweenService:Create(frame, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
		Position = UDim2.new(1, -20, 0, frame.Position.Y.Offset)
	}):Play()

	task.delay(3.5, function()
		if frame.Parent then removeFrame(frame) end
	end)
end

Remotes.ShowNotification.OnClientEvent:Connect(showNotif)
