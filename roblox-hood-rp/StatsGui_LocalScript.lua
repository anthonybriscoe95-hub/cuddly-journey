-- StatsGui (LocalScript inside StarterGui > StatsGui > StatsFrame)
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local frame = script.Parent

frame.Visible = true
frame.AnchorPoint = Vector2.new(0, 0.5)
frame.Size = UDim2.new(0, 360, 0, 720)
frame.Position = UDim2.new(0, 20, 0.5, 0)
frame.BackgroundColor3 = Color3.fromRGB(8, 8, 10)
frame.BorderSizePixel = 0

local uiScale = Instance.new("UIScale", frame)
uiScale.Scale = 0.65

local frameCorner = Instance.new("UICorner", frame)
frameCorner.CornerRadius = UDim.new(0, 28)

local frameStroke = Instance.new("UIStroke", frame)
frameStroke.Color = Color3.fromRGB(220, 30, 35)
frameStroke.Thickness = 3
frameStroke.Transparency = 0.05
frameStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border

local moneyRow = Instance.new("Frame", frame)
moneyRow.Size = UDim2.new(1, -40, 0, 150)
moneyRow.Position = UDim2.new(0, 20, 0, 24)
moneyRow.BackgroundTransparency = 1

local function buildMoney(parent, posX, color, icon, label)
	local container = Instance.new("Frame", parent)
	container.Size = UDim2.new(0.5, -10, 1, 0)
	container.Position = UDim2.new(posX, 0, 0, 0)
	container.BackgroundTransparency = 1

	local circle = Instance.new("Frame", container)
	circle.Size = UDim2.new(0, 86, 0, 86)
	circle.Position = UDim2.new(0.5, -43, 0, 0)
	circle.BackgroundColor3 = Color3.fromRGB(14, 14, 16)
	circle.BorderSizePixel = 0

	local cC = Instance.new("UICorner", circle)
	cC.CornerRadius = UDim.new(1, 0)

	local cS = Instance.new("UIStroke", circle)
	cS.Color = color
	cS.Thickness = 2
	cS.Transparency = 0.1

	local iconLabel = Instance.new("TextLabel", circle)
	iconLabel.Size = UDim2.new(1, 0, 1, 0)
	iconLabel.BackgroundTransparency = 1
	iconLabel.Font = Enum.Font.GothamBold
	iconLabel.TextSize = 36
	iconLabel.TextColor3 = color
	iconLabel.Text = icon

	local labelText = Instance.new("TextLabel", container)
	labelText.Size = UDim2.new(1, 0, 0, 18)
	labelText.Position = UDim2.new(0, 0, 0, 92)
	labelText.BackgroundTransparency = 1
	labelText.Text = label
	labelText.Font = Enum.Font.GothamBold
	labelText.TextSize = 14
	labelText.TextColor3 = color

	local value = Instance.new("TextLabel", container)
	value.Size = UDim2.new(1, 0, 0, 28)
	value.Position = UDim2.new(0, 0, 0, 112)
	value.BackgroundTransparency = 1
	value.Text = "$0"
	value.Font = Enum.Font.GothamBold
	value.TextSize = 24
	value.TextColor3 = color

	return value
end

local bankValue = buildMoney(moneyRow, 0,   Color3.fromRGB(255, 255, 255), "🏦", "BANK")
local cashValue = buildMoney(moneyRow, 0.5, Color3.fromRGB(220, 30,  35),  "🏛",  "CASH")

local function buildBar(yPos, fillColor, icon)
	local row = Instance.new("Frame", frame)
	row.Size = UDim2.new(1, -40, 0, 44)
	row.Position = UDim2.new(0, 20, 0, yPos)
	row.BackgroundTransparency = 1

	local barBg = Instance.new("Frame", row)
	barBg.Size = UDim2.new(1, -56, 1, 0)
	barBg.BackgroundColor3 = Color3.fromRGB(14, 14, 18)
	barBg.BorderSizePixel = 0

	local bgC = Instance.new("UICorner", barBg)
	bgC.CornerRadius = UDim.new(1, 0)

	local bgS = Instance.new("UIStroke", barBg)
	bgS.Color = Color3.fromRGB(35, 35, 40)
	bgS.Thickness = 1

	local fill = Instance.new("Frame", barBg)
	fill.Size = UDim2.new(1, 0, 1, 0)
	fill.BackgroundColor3 = fillColor
	fill.BorderSizePixel = 0

	local fillC = Instance.new("UICorner", fill)
	fillC.CornerRadius = UDim.new(1, 0)

	local iconCircle = Instance.new("Frame", row)
	iconCircle.Size = UDim2.new(0, 44, 0, 44)
	iconCircle.Position = UDim2.new(1, -44, 0, 0)
	iconCircle.BackgroundColor3 = Color3.fromRGB(12, 12, 14)
	iconCircle.BorderSizePixel = 0

	local circC = Instance.new("UICorner", iconCircle)
	circC.CornerRadius = UDim.new(1, 0)

	local circS = Instance.new("UIStroke", iconCircle)
	circS.Color = fillColor
	circS.Thickness = 1

	local iconLabel = Instance.new("TextLabel", iconCircle)
	iconLabel.Size = UDim2.new(1, 0, 1, 0)
	iconLabel.BackgroundTransparency = 1
	iconLabel.Text = icon
	iconLabel.Font = Enum.Font.GothamBold
	iconLabel.TextSize = 22
	iconLabel.TextColor3 = fillColor

	return { fill = fill, color = fillColor }
end

local stamina = buildBar(200, Color3.fromRGB(245, 245, 245), "🏃")
local hunger  = buildBar(254, Color3.fromRGB(255, 180, 40),  "🍔")
local health  = buildBar(308, Color3.fromRGB(220, 40,  40),  "❤️")
local energy  = buildBar(362, Color3.fromRGB(150, 90,  255), "🌙")

local previewBg = Instance.new("Frame", frame)
previewBg.Size = UDim2.new(1, -60, 0, 220)
previewBg.Position = UDim2.new(0, 30, 0, 420)
previewBg.BackgroundColor3 = Color3.fromRGB(14, 14, 16)
previewBg.BorderSizePixel = 0

local pBgC = Instance.new("UICorner", previewBg)
pBgC.CornerRadius = UDim.new(0, 18)

local pBgS = Instance.new("UIStroke", previewBg)
pBgS.Color = Color3.fromRGB(220, 30, 35)
pBgS.Thickness = 1
pBgS.Transparency = 0.5

local viewport = Instance.new("ViewportFrame", previewBg)
viewport.Size = UDim2.new(1, -10, 1, -10)
viewport.Position = UDim2.new(0, 5, 0, 5)
viewport.BackgroundTransparency = 1
viewport.LightDirection = Vector3.new(-0.5, -1, -0.4)
viewport.Ambient = Color3.fromRGB(180, 180, 200)
viewport.LightColor = Color3.fromRGB(255, 255, 255)

local camera = Instance.new("Camera")
viewport.CurrentCamera = camera

local function loadAvatar()
	for _, child in ipairs(viewport:GetChildren()) do child:Destroy() end
	local desc
	local ok = pcall(function()
		desc = Players:GetHumanoidDescriptionFromUserId(player.UserId)
	end)
	if not ok or not desc then return end
	local model = Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)
	model.Parent = viewport
	model:PivotTo(CFrame.new(0, 0, 0))
	local center = model:GetPivot().Position
	camera.CFrame = CFrame.new(center + Vector3.new(0, 1, 7), center + Vector3.new(0, 1, 0))
end

loadAvatar()

local statusBar = Instance.new("Frame", frame)
statusBar.Size = UDim2.new(1, -60, 0, 50)
statusBar.Position = UDim2.new(0, 30, 1, -70)
statusBar.BackgroundColor3 = Color3.fromRGB(14, 14, 16)
statusBar.BorderSizePixel = 0

local sC = Instance.new("UICorner", statusBar)
sC.CornerRadius = UDim.new(1, 0)

local sS = Instance.new("UIStroke", statusBar)
sS.Color = Color3.fromRGB(220, 30, 35)
sS.Thickness = 2

local statusIcon = Instance.new("TextLabel", statusBar)
statusIcon.Size = UDim2.new(0, 40, 1, 0)
statusIcon.Position = UDim2.new(0, 12, 0, 0)
statusIcon.BackgroundTransparency = 1
statusIcon.Text = "📷"
statusIcon.Font = Enum.Font.GothamBold
statusIcon.TextSize = 22
statusIcon.TextColor3 = Color3.fromRGB(220, 30, 35)

local statusText = Instance.new("TextLabel", statusBar)
statusText.Size = UDim2.new(1, -56, 1, 0)
statusText.Position = UDim2.new(0, 56, 0, 0)
statusText.BackgroundTransparency = 1
statusText.Text = "Reader Available"
statusText.Font = Enum.Font.GothamBold
statusText.TextSize = 18
statusText.TextColor3 = Color3.fromRGB(245, 245, 245)
statusText.TextXAlignment = Enum.TextXAlignment.Left

local function formatMoney(value)
	local formatted = tostring(math.floor(value))
	while true do
		local k
		formatted, k = formatted:gsub("^(-?%d+)(%d%d%d)", "%1,%2")
		if k == 0 then break end
	end
	return "$" .. formatted
end

-- ===== STAT LOGIC =====
local stats = {
	stamina = 1,
	hunger  = 1,
	energy  = 1,
	health  = 1,
	bank    = 0,
	cash    = 0,
}

local HUNGER_TICK          = 10    -- seconds between each 1% hunger drop
local ENERGY_TICK          = 10    -- seconds between each 1% energy drop
local HUNGER_DROP          = 0.01
local ENERGY_DROP          = 0.01
local STAMINA_WALK_DRAIN   = 0.05  -- per second while walking
local STAMINA_RUN_DRAIN    = 0.15  -- per second while sprinting
local STAMINA_JUMP_COST    = 0.10  -- flat cost per jump
local STAMINA_REGEN        = 0.10  -- per second while standing still
local STARVE_HEALTH_DRAIN  = 1     -- HP per second when hunger or energy = 0

local lastHunger = tick()
local lastEnergy = tick()
local previousMoney = { bank = 0, cash = 0 }

local function tweenBar(bar, value)
	local pct = math.clamp(value, 0, 1)
	TweenService:Create(bar.fill, TweenInfo.new(0.25, Enum.EasingStyle.Quart), {
		Size = UDim2.new(pct, 0, 1, 0)
	}):Play()
end

local function flashMoney(label, originalColor)
	label.TextColor3 = Color3.fromRGB(120, 255, 130)
	TweenService:Create(label, TweenInfo.new(0.6), { TextColor3 = originalColor }):Play()
end

local function updateUI()
	tweenBar(stamina, stats.stamina)
	tweenBar(hunger,  stats.hunger)
	tweenBar(health,  stats.health)
	tweenBar(energy,  stats.energy)

	if stats.bank ~= previousMoney.bank then
		flashMoney(bankValue, Color3.fromRGB(255, 255, 255))
		previousMoney.bank = stats.bank
	end
	if stats.cash ~= previousMoney.cash then
		flashMoney(cashValue, Color3.fromRGB(220, 30, 35))
		previousMoney.cash = stats.cash
	end

	bankValue.Text = formatMoney(stats.bank)
	cashValue.Text = formatMoney(stats.cash)
end

local currentHumanoid

local function bindCharacter(character)
	local humanoid = character:WaitForChild("Humanoid")
	currentHumanoid = humanoid
	stats.health = humanoid.Health / humanoid.MaxHealth

	humanoid.HealthChanged:Connect(function(h)
		stats.health = h / humanoid.MaxHealth
		updateUI()
	end)

	humanoid.Jumping:Connect(function(active)
		if active and stats.stamina > 0 then
			stats.stamina = math.clamp(stats.stamina - STAMINA_JUMP_COST, 0, 1)
			updateUI()
		end
	end)

	loadAvatar()
end

if player.Character then bindCharacter(player.Character) end
player.CharacterAdded:Connect(bindCharacter)

local stats_folder = player:WaitForChild("leaderstats", 5)
if stats_folder then
	local cash = stats_folder:FindFirstChild("Cash")
	if cash then
		stats.cash = cash.Value
		cash:GetPropertyChangedSignal("Value"):Connect(function()
			stats.cash = cash.Value
			updateUI()
		end)
	end
end

RunService.Heartbeat:Connect(function(dt)
	local now = tick()

	if now - lastHunger >= HUNGER_TICK then
		stats.hunger = math.clamp(stats.hunger - HUNGER_DROP, 0, 1)
		lastHunger = now
	end

	if now - lastEnergy >= ENERGY_TICK then
		stats.energy = math.clamp(stats.energy - ENERGY_DROP, 0, 1)
		lastEnergy = now
	end

	if currentHumanoid then
		local root = currentHumanoid.RootPart
		local speed = root and root.AssemblyLinearVelocity.Magnitude or 0

		if speed > 14 then
			stats.stamina = math.clamp(stats.stamina - STAMINA_RUN_DRAIN * dt, 0, 1)
		elseif speed > 1 then
			stats.stamina = math.clamp(stats.stamina - STAMINA_WALK_DRAIN * dt, 0, 1)
		else
			stats.stamina = math.clamp(stats.stamina + STAMINA_REGEN * dt, 0, 1)
		end

		if stats.hunger <= 0 or stats.energy <= 0 then
			currentHumanoid:TakeDamage(STARVE_HEALTH_DRAIN * dt)
		end

		currentHumanoid.WalkSpeed = stats.stamina <= 0 and 8 or 16
	end

	updateUI()
end)

updateUI()
