--[[
	CLICK SIMULATOR - MAP EFFECTS
	Put this in: ServerScriptService (as a normal Script)

	Makes the map look nice: sunny lighting, a spinning giant coin with the game
	title over it, glowing lamps, and a sign on the rebirth portal.
	It's safe to delete this script if you build your own map.
]]

local Lighting = game:GetService("Lighting")
local RunService = game:GetService("RunService")

local map = workspace:WaitForChild("Map")

----------------------------------------------------------------
-- LIGHTING (bright, colorful, "simulator" look)
----------------------------------------------------------------
Lighting.ClockTime = 14
Lighting.Brightness = 3
Lighting.Ambient = Color3.fromRGB(110, 110, 130)
Lighting.OutdoorAmbient = Color3.fromRGB(150, 150, 170)
Lighting.GlobalShadows = true

local function addEffect(className, props)
	local effect = Lighting:FindFirstChildOfClass(className) or Instance.new(className)
	for key, value in props do
		effect[key] = value
	end
	effect.Parent = Lighting
end

addEffect("Atmosphere", { Density = 0.3, Color = Color3.fromRGB(200, 225, 255), Decay = Color3.fromRGB(120, 170, 230), Glare = 0.3, Haze = 1 })
addEffect("BloomEffect", { Intensity = 0.6, Size = 30, Threshold = 1.2 })
addEffect("ColorCorrectionEffect", { Saturation = 0.25, Contrast = 0.1, Brightness = 0.03 })
addEffect("SunRaysEffect", { Intensity = 0.08, Spread = 0.6 })

----------------------------------------------------------------
-- FLOATING SIGNS
----------------------------------------------------------------
local function sign(part, text, color, height, width)
	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.new(0, width, 0, 90)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, height, 0)
	billboard.MaxDistance = 400
	billboard.LightInfluence = 0
	billboard.Parent = part

	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Font = Enum.Font.FredokaOne
	label.TextScaled = true
	label.TextColor3 = color
	label.Text = text
	label.Parent = billboard

	local stroke = Instance.new("UIStroke")
	stroke.Thickness = 4
	stroke.Parent = label
end

----------------------------------------------------------------
-- GIANT SPINNING COIN
----------------------------------------------------------------
local statue = map:WaitForChild("CoinStatue")
local coin = statue:WaitForChild("GiantCoin")
local coinFace = statue:WaitForChild("CoinFace")

sign(coin, "CLICK SIMULATOR", Color3.fromRGB(255, 210, 40), 22, 500)

local sparkles = Instance.new("ParticleEmitter")
sparkles.Texture = "rbxasset://textures/particles/sparkles_main.dds"
sparkles.Color = ColorSequence.new(Color3.fromRGB(255, 230, 90))
sparkles.LightEmission = 1
sparkles.Size = NumberSequence.new(1.5, 0)
sparkles.Lifetime = NumberRange.new(1, 2)
sparkles.Rate = 15
sparkles.Speed = NumberRange.new(3, 6)
sparkles.SpreadAngle = Vector2.new(180, 180)
sparkles.Parent = coin

local center = coin.CFrame
local angle = 0
RunService.Heartbeat:Connect(function(dt)
	angle += dt * 1.2
	local bob = math.sin(angle * 1.5) * 1.5
	local spin = CFrame.new(center.Position + Vector3.new(0, bob, 0))
		* CFrame.Angles(0, angle, 0)
		* center.Rotation
	coin.CFrame = spin
	coinFace.CFrame = spin
end)

----------------------------------------------------------------
-- GLOWING LAMPS + PORTAL
----------------------------------------------------------------
for _, part in map:GetDescendants() do
	if part:IsA("BasePart") and part.Name == "LampBulb" then
		local light = Instance.new("PointLight")
		light.Color = Color3.fromRGB(255, 220, 150)
		light.Range = 18
		light.Brightness = 1.5
		light.Parent = part
	end
end

local portal = map:FindFirstChild("RebirthPortal")
if portal then
	local top = portal:FindFirstChild("Top")
	if top then
		sign(top, "🔁 REBIRTH 🔁", Color3.fromRGB(200, 120, 255), 8, 300)
	end
	local swirl = portal:FindFirstChild("PortalSwirl")
	if swirl then
		local light = Instance.new("PointLight")
		light.Color = Color3.fromRGB(170, 60, 255)
		light.Range = 30
		light.Brightness = 3
		light.Parent = swirl
	end
end
