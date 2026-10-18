--!strict
-- Builds the Chaos Mart map from the imported FBX models.
--
-- Setup (once):
--   1. Import the FBX files (File > Import 3D, Scale Unit = Stud) and put every imported Model in
--      ServerStorage > ChaosMartAssets (sub-folders are fine). Keep each Model's name = its file name,
--      e.g. "CM_Fixture_SnackShelf".
--   2. Put ChaosMartPlacements.lua in a ModuleScript named ChaosMartPlacements next to this script.
--   3. Run this Script once (or paste it into the command bar with the require path adjusted).
-- It creates Workspace > ChaosMartMap with one folder per plot / area and reports missing assets.

local ServerStorage = game:GetService("ServerStorage")

local placements = require(script.Parent:WaitForChild("ChaosMartPlacements"))
local source = ServerStorage:WaitForChild("ChaosMartAssets")

local map = workspace:FindFirstChild("ChaosMartMap")
if map then
	map:Destroy()
end
map = Instance.new("Folder")
map.Name = "ChaosMartMap"
map.Parent = workspace

local templates: { [string]: Model | false } = {}
local function template(name: string): Model?
	if templates[name] == nil then
		local found = source:FindFirstChild(name, true)
		templates[name] = if found and found:IsA("Model") then found else false
	end
	local t = templates[name]
	return if t then t else nil
end

local groups: { [string]: Folder } = {}
local function group(name: string): Folder
	local g = groups[name]
	if not g then
		g = Instance.new("Folder")
		g.Name = name
		g.Parent = map
		groups[name] = g
	end
	return g
end

local placed, missing = 0, {}
for _, p in placements.list do
	local name, x, y, z, rotY, groupName = p[1], p[2], p[3], p[4], p[5], p[6]
	local t = template(name)
	if not t then
		missing[name] = true
		continue
	end
	local model = t:Clone()
	local box = model:GetBoundingBox()
	model.WorldPivot = box -- pivot at the bounding-box centre, then offset back to the asset pivot
	local o = placements.offsets[name]
	local target = CFrame.new(x, y, z) * CFrame.Angles(0, math.rad(rotY), 0) * CFrame.new(o[1], o[2], o[3])
	model:PivotTo(target)
	for _, part in model:GetDescendants() do
		if part:IsA("BasePart") then
			part.Anchored = true
		end
	end
	model.Parent = group(groupName)
	placed += 1
end

print(("ChaosMartMap: placed %d models"):format(placed))
for name in missing do
	warn("ChaosMartMap: no model named " .. name .. " in ServerStorage.ChaosMartAssets")
end
