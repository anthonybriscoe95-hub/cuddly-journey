-- LocalScript → StarterGui/WantedHud (inside a ScreenGui)
-- Shows the player's current wanted level in the top-right corner.
local Players           = game:GetService("Players")
local TweenService      = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player  = Players.LocalPlayer
local Remotes = ReplicatedStorage:WaitForChild("Remotes")

local LEVELS = {
	[0] = { label = "CLEAN",       color = Color3.fromRGB(100, 200, 100), stars = "✅"  },
	[1] = { label = "SUSPICIOUS",  color = Color3.fromRGB(255, 220, 50),  stars = "⭐"  },
	[2] = { label = "WANTED",      color = Color3.fromRGB(255, 140, 0),   stars = "⭐⭐" },
	[3] = { label = "ARMED",       color = Color3.fromRGB(220, 50,  50),  stars = "⭐⭐⭐" },
	[4] = { label = "MOST WANTED", color = Color3.fromRGB(180, 0,   0),   stars = "⭐⭐⭐⭐" },
}

local sg              = Instance.new("ScreenGui")
sg.Name               = "WantedHud"
sg.ResetOnSpawn       = false
sg.IgnoreGuiInset     = true
sg.Parent             = player.PlayerGui

local frame             = Instance.new("Frame", sg)
frame.Size              = UDim2.new(0, 210, 0, 46)
frame.AnchorPoint       = Vector2.new(1, 0)
frame.Position          = UDim2.new(1, -20, 0, 20)
frame.BackgroundColor3  = Color3.fromRGB(10, 10, 12)
frame.BorderSizePixel   = 0
local fC = Instance.new("UICorner", frame); fC.CornerRadius = UDim.new(0, 10)
local fS = Instance.new("UIStroke",  frame)
fS.Color     = Color3.fromRGB(100, 200, 100)
fS.Thickness = 2

local starsLabel            = Instance.new("TextLabel", frame)
starsLabel.Size             = UDim2.new(0, 42, 1, 0)
starsLabel.Position         = UDim2.new(0, 6, 0, 0)
starsLabel.BackgroundTransparency = 1
starsLabel.Text             = "✅"
starsLabel.Font             = Enum.Font.GothamBold
starsLabel.TextSize         = 18

local levelLabel            = Instance.new("TextLabel", frame)
levelLabel.Size             = UDim2.new(1, -54, 1, 0)
levelLabel.Position         = UDim2.new(0, 50, 0, 0)
levelLabel.BackgroundTransparency = 1
levelLabel.Text             = "CLEAN"
levelLabel.Font             = Enum.Font.GothamBold
levelLabel.TextSize         = 15
levelLabel.TextColor3       = Color3.fromRGB(100, 200, 100)
levelLabel.TextXAlignment   = Enum.TextXAlignment.Left

local function update(level)
	local cfg = LEVELS[math.clamp(level, 0, 4)]
	TweenService:Create(levelLabel, TweenInfo.new(0.2), { TextColor3 = cfg.color }):Play()
	TweenService:Create(fS,         TweenInfo.new(0.2), { Color = cfg.color }):Play()
	levelLabel.Text  = cfg.label
	starsLabel.Text  = cfg.stars
end

update(0)

Remotes.UpdateWantedHUD.OnClientEvent:Connect(update)

-- Sync on first load
task.spawn(function()
	local level = Remotes.GetWantedLevel:InvokeServer()
	update(level or 0)
end)
