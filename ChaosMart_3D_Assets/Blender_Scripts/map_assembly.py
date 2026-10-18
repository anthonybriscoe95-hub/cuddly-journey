"""Chaos Mart Tycoon: assemble the (provisional) map from the exported kit.

Places linked copies of the built assets, so the map uses exactly the meshes
that were exported. Everything is driven by map_layout.json. Writes:
  Map_Assembly/ChaosMart_Map.blend         the assembled scene
  Map_Assembly/placements.json             every placement for Roblox Studio
  Previews/map_*.png                       overhead, store exterior, interior

Placement convention (Blender): position of the asset's pivot (bottom centre)
and a rotation about +Z in degrees. See Documentation/IMPORT_GUIDE.md for
converting to Roblox CFrames.
"""

import json
import math
import os

import bpy
from mathutils import Matrix, Vector

import cm_common as cm
import stages

LAYOUT = json.load(open(os.path.join(cm.HERE, "map_layout.json")))
MAP_DIR = os.path.join(cm.ROOT, "Map_Assembly")

PAD_TOP = 1.0  # plot pad and plaza top
FLOOR_TOP = PAD_TOP + 0.4  # store floor slab top; walls stand on it


class Placer:
    def __init__(self, collection):
        self.collection = collection
        self.records = []

    def place(self, asset, loc, rot=0.0, group=""):
        """Link a copy of every object of `asset` at `loc`, rotated `rot` degrees about Z."""
        src = bpy.data.collections.get(asset)
        if src is None:
            raise KeyError("asset %s has not been built" % asset)
        m = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(math.radians(rot), 4, "Z")
        for o in src.objects:
            if cm.part_name(o).startswith("Anchor"):
                continue
            c = o.copy()  # shares the mesh data
            c.matrix_world = m @ o.matrix_world
            self.collection.objects.link(c)
        self.records.append({"asset": asset, "group": group, "position": [round(v, 3) for v in loc], "rotation_z": rot % 360})


def plot_frame(px, py, rot):
    """Map a plot-local point to world for a plot at (px, py) rotated `rot`."""
    r = Matrix.Rotation(math.radians(rot), 3, "Z")

    def to_world(x, y, z=0.0, local_rot=0.0):
        p = r @ Vector((x, y, 0))
        return (px + p.x, py + p.y, z), (rot + local_rot)

    return to_world


def asset_size(name):
    """(width, depth) of a built asset's footprint, from its collection."""
    col = bpy.data.collections[name]
    objs = [o for o in col.objects if not cm.part_name(o).startswith("Anchor")]
    lo, hi = cm.world_bbox(objs)
    return (hi.x - lo.x, hi.y - lo.y)


def place_stage(P, to_world, st, group, index):
    def put(asset, x, y, z=0.0, rot=0.0):
        loc, r = to_world(x, y, z, rot)
        P.place(asset, loc, r, group)

    stages.build_stage(st, put, index)


def dress_plaza(P):
    """Central plaza: fountain, leaderboard, rewards, kiosks, benches, trees, lamps."""
    z = PAD_TOP
    hw, hd = LAYOUT["plaza"]["width"] / 2, LAYOUT["plaza"]["depth"] / 2
    rd = LAYOUT["roads"]
    P.place("CM_Prop_Fountain", (0, 0, z), 0, "plaza")
    P.place("CM_Prop_LeaderboardStage", (0, 52, z), 0, "plaza")
    P.place("CM_Tycoon_DailyRewardStand", (-70, 0, z), -90, "plaza")
    P.place("CM_Tycoon_EventCountdown", (70, 30, z), 90, "plaza")
    P.place("CM_Event_RedCarpet", (70, -10, z), 90, "plaza")
    P.place("CM_Prop_SpawnArch", (-hw + 30, 0, z), -90, "plaza")
    P.place("CM_Prop_BusStop", (hw - 60, -hd + 6, z), 180, "plaza")
    P.place("CM_Prop_Monument", (-170, 0, z), 0, "plaza")
    P.place("CM_Prop_EventStage", (250, 0, z), -90, "plaza")  # faces the fountain
    P.place("CM_Prop_PlazaSign", (-hw + 70, 40, z), 90, "plaza")
    kiosks = ["CM_Prop_PlazaKiosk_Teal", "CM_Prop_PlazaKiosk_Orange", "CM_Prop_PlazaKiosk_Blue", "CM_Prop_PlazaKiosk_Purple"]
    for k, (x, y) in enumerate(((-150, 40), (150, 40), (-150, -40), (150, -40))):
        P.place(kiosks[k], (x, y, z), 0 if y > 0 else 180, "plaza")
    for k in range(6):  # benches facing the fountain
        a = 2 * math.pi * (k + 0.5) / 6
        P.place("CM_Prop_Bench", (34 * math.cos(a), 34 * math.sin(a), z), math.degrees(a) + 90, "plaza")
    for x in (-300, -230, -100, 100, 230, 300):
        for y in (-55, 55):
            P.place("CM_Prop_Tree_Round" if (x // 100 + y) % 2 else "CM_Prop_Tree_Pine", (x, y, z), 0, "plaza")
    for x in range(int(-hw + 32), int(hw - 31), 64):  # street lamps on both plaza edges, arms over the road
        P.place("CM_Prop_StreetLamp", (x, hd - 4, z), 180, "plaza")
        P.place("CM_Prop_StreetLamp", (x, -hd + 4, z), 0, "plaza")
    for sx_ in (-1, 1):
        for sy_ in (-1, 1):
            P.place("CM_Prop_TrafficLight", (sx_ * (rd["side_road_x"] - 16), sy_ * (hd - 6), z), 180 if sy_ > 0 else 0, "plaza")
    for x in (-200, 0, 200):
        P.place("CM_Prop_TrashCan", (x + 20, hd - 8, z), 0, "plaza")
        P.place("CM_Prop_TrashCan", (x - 20, -hd + 8, z), 0, "plaza")


def assemble():
    scene = bpy.context.scene
    col = cm.new_collection("ChaosMart_Map")
    P = Placer(col)
    rows = LAYOUT["rows"]
    rd = LAYOUT["roads"]
    seg = rd["segment"]
    half_row = LAYOUT["plaza"]["width"] / 2

    P.place("CM_Ground_Base", (0, 0, -0.2), group="ground")
    P.place("CM_Plaza_Pad", (0, 0, 0), group="plaza")

    # door x positions (world) decide where the crosswalks go
    door_xs = {1: [c + stages.DOOR_X for c in rows["column_x"]], -1: [c - stages.DOOR_X for c in rows["column_x"]]}

    for side in (1, -1):  # 1 = north row, -1 = south row
        y_road = side * rd["plaza_road_y"]
        n = int(round(2 * half_row / seg))
        for k in range(n):
            x = -half_row + seg / 2 + k * seg
            if any(abs(x - d) < 0.5 for d in door_xs[side]):
                P.place("CM_Road_Short", (x - 11, y_road, 0), 90, "roads")
                P.place("CM_Road_Crosswalk", (x, y_road, 0), 90, "roads")
                P.place("CM_Road_Short", (x + 11, y_road, 0), 90, "roads")
            else:
                P.place("CM_Road_Straight", (x, y_road, 0), 90, "roads")
            P.place("CM_Sidewalk_Straight", (x, side * (rd["plaza_road_y"] + 16), 0), 90 if side > 0 else -90, "sidewalks")
        for sx_ in (-1, 1):
            P.place("CM_Road_Intersection", (sx_ * rd["side_road_x"], y_road, 0), 0, "roads")

    for sx_ in (-1, 1):  # side roads closing the loop around the plaza
        for k in range(int(LAYOUT["plaza"]["depth"] / seg)):
            y = -LAYOUT["plaza"]["depth"] / 2 + seg / 2 + k * seg
            P.place("CM_Road_Straight", (sx_ * rd["side_road_x"], y, 0), 0, "roads")

    dress_plaza(P)

    problems = []
    for st in stages.STAGES:
        problems += stages.check_layout(st, asset_size) + stages.check_lot(st, asset_size)
    plot_stages = LAYOUT["plot_stages"]
    k = 0
    for side, row_y in ((1, rows["north_row_y"]), (-1, rows["south_row_y"])):
        rot = 0 if side > 0 else 180
        for i, cx in enumerate(rows["column_x"]):
            st = stages.stage(plot_stages[k])
            group = "plot_%s%d_%s" % ("N" if side > 0 else "S", i + 1, st["name"])
            place_stage(P, plot_frame(cx, row_y, rot), st, group, k)
            k += 1

    os.makedirs(MAP_DIR, exist_ok=True)
    with open(os.path.join(MAP_DIR, "placements.json"), "w") as f:
        json.dump({"_status": LAYOUT["_status"], "convention": "Blender coordinates; position = asset pivot "
                   "(bottom centre); rotation_z in degrees about +Z. See Documentation/IMPORT_GUIDE.md.",
                   "count": len(P.records), "placements": P.records}, f, indent=1)  # fmt: skip
        f.write("\n")
    write_roblox_scripts(P)
    return col, P, problems


def to_roblox(x, y, z):
    """Blender (X right, Y forward, Z up) to Roblox (X right, Y up, Z back), the importer's usual mapping."""
    return (x, z, -y)


def write_roblox_scripts(P):
    """Map_Assembly/ChaosMartPlacements.lua (data) and BuildChaosMartMap.server.lua (builder)."""
    used = sorted({r["asset"] for r in P.records})
    lines = ["-- Generated by Blender_Scripts/map_assembly.py from map_layout.json. Do not edit by hand.",
             "-- Positions are each asset's pivot (bottom centre) in studs; rotY is degrees about the up axis.",
             "-- offsets: where the asset's bounding-box centre sits relative to its pivot, before rotation.",
             "return {", "\toffsets = {"]  # fmt: skip
    for name in used:
        objs = [o for o in bpy.data.collections[name].objects if not cm.part_name(o).startswith("Anchor")]
        lo, hi = cm.world_bbox(objs)
        c = (lo + hi) / 2
        ox, oy, oz = to_roblox(c.x, c.y, c.z)
        lines.append("\t\t%s = { %.3f, %.3f, %.3f }," % (name, ox, oy, oz))
    lines += ["\t},", "\tlist = {"]
    for r in P.records:
        x, y, z = to_roblox(*r["position"])
        lines.append('\t\t{ "%s", %.3f, %.3f, %.3f, %g, "%s" },' % (r["asset"], x, y, z, r["rotation_z"], r["group"]))
    lines += ["\t},", "}", ""]
    with open(os.path.join(MAP_DIR, "ChaosMartPlacements.lua"), "w") as f:
        f.write("\n".join(lines))
    with open(os.path.join(MAP_DIR, "BuildChaosMartMap.server.lua"), "w") as f:
        f.write(BUILD_SCRIPT)


BUILD_SCRIPT = """--!strict
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
"""


def plot_store_box(k):
    """World bounding box (lo, hi) of plot k's store and its forecourt, and the view direction from the plaza."""
    rows = LAYOUT["rows"]
    st = stages.stage(LAYOUT["plot_stages"][k])
    north = k < 3
    px = rows["column_x"][k % 3]
    py = rows["north_row_y"] if north else rows["south_row_y"]
    fx0, fy0, fx1, fy1 = stages.footprint(st)
    sx1 = stages.stockroom_centre(st)[0] + stages.STOCK_W / 2
    corners = [(fx0 - 6, fy0 - 26), (sx1, fy1)]
    if north:
        lo = Vector((px + corners[0][0], py + corners[0][1], 0))
        hi = Vector((px + corners[1][0], py + corners[1][1], 20))
        view = (-0.4, -1.0, 0.42)  # from the left, so the stockroom stays behind the store
    else:
        lo = Vector((px - corners[1][0], py - corners[1][1], 0))
        hi = Vector((px - corners[0][0], py - corners[0][1], 20))
        view = (0.4, 1.0, 0.42)
    return st, lo, hi, view


def render_views(col):
    """Overhead, stage lineup, store exterior and interior shots, and night, of the assembled map."""
    from PIL import Image, ImageDraw

    for c in bpy.data.collections:  # only the map is visible
        c.hide_render = c is not col and c.name != "_preview"
    tmp, cam, world = cm._stage(ground_colour="grass")
    out = {}
    P = lambda name: os.path.join(cm.PREVIEW_DIR, name)  # noqa: E731

    lo, hi = cm.world_bbox(list(col.objects))
    cm.frame_camera(cam, lo, hi, (2000, 1500), direction=(0.0, -0.35, 1.0), fill=0.62)
    out["map_overhead"] = cm._render(P("map_overhead.png"), (2000, 1500), 128)

    # the central plaza: fountain, monument, event stage, kiosks and leaderboard
    cm.frame_camera(cam, Vector((-260, -80, 0)), Vector((260, 80, 16)), (1920, 1080), direction=(0.0, -1.0, 0.55), fill=0.48)
    out["map_plaza"] = cm._render(P("map_plaza.png"), (1920, 1080), 96)

    # one exterior per progression stage, then a labelled lineup sheet
    shots = {}
    for k, n in enumerate(LAYOUT["plot_stages"]):
        if n in shots:
            continue
        st, lo, hi, view = plot_store_box(k)
        cm.frame_camera(cam, lo, hi, (1280, 720), direction=view, fill=0.5)
        shots[n] = (st, cm._render(P("stage_%d_%s.png" % (n, st["name"])), (1280, 720), 64))
    sheet = Image.new("RGB", (1280 * 2, (720 + 40) * 3), (18, 36, 60))
    draw = ImageDraw.Draw(sheet)
    for i, n in enumerate(sorted(shots)):
        st, path = shots[n]
        x, y = (i % 2) * 1280, (i // 2) * 760
        sheet.paste(Image.open(path).convert("RGB"), (x, y))
        draw.text((x + 16, y + 728), "Stage %d: %s  (%g x %g store)" % (n, st["title"], st["w"], st["depth"]), fill=(244, 247, 251))
    sheet.save(P("stages_lineup.png"))
    out["stages_lineup"] = P("stages_lineup.png")

    # the supermarket plot for the exterior, interior and close-ups
    k3 = LAYOUT["plot_stages"].index(3)
    st, store_lo, store_hi, view = plot_store_box(k3)
    north = k3 < 3
    px = LAYOUT["rows"]["column_x"][k3 % 3]
    py = LAYOUT["rows"]["north_row_y"] if north else LAYOUT["rows"]["south_row_y"]
    fx0, fy0, fx1, fy1 = stages.footprint(st)
    sgn = 1 if north else -1
    sx, sy = px + sgn * stages.DOOR_X, py + sgn * (fy0 + fy1) / 2
    cm.frame_camera(cam, store_lo, store_hi, (1920, 1080), direction=view, fill=0.55)
    out["map_store_exterior"] = cm._render(P("map_store_exterior.png"), (1920, 1080), 64)

    hw_, hd_ = st["w"] / 2, st["depth"] / 2
    roofs = [o for o in col.objects if (cm.part_name(o) == "Roof" or (cm.part_name(o) == "Glass" and o.matrix_world.translation.z > 18))
             and abs(o.matrix_world.translation.x - sx) < hw_ + 2 and abs(o.matrix_world.translation.y - sy) < hd_ + 2]  # fmt: skip
    for o in roofs:
        o.hide_render = True
    cm.frame_camera(cam, Vector((sx - hw_, sy - hd_, 0)), Vector((sx + hw_, sy + hd_, 10)), (1920, 1080),
                    direction=(0.25 * sgn, -0.75 * sgn, 1.0), fill=0.5)  # fmt: skip
    out["map_store_interior"] = cm._render(P("map_store_interior.png"), (1920, 1080), 64)

    # eye-level close-ups: first gondola row (left column) and the checkouts, seen from inside
    def local(x, y):
        return (sx + sgn * x, sy + sgn * y)

    yi0 = -hd_ + 1
    ax, ay = local(-38, yi0 + 28 - 1 + 0.0)
    ex, ey = local(-38 + 9, yi0 + 28 - 13)
    cm.aim_camera(cam, (ex, ey, 7.5), (ax - 2 * sgn, ay, FLOOR_TOP + 3.2), lens=30)
    out["map_aisle"] = cm._render(P("map_aisle.png"), (1920, 1080), 96)
    cx, cy = local(-40.5, yi0 + 10)
    ex, ey = local(-40.5 + 12, yi0 + 10 + 14)
    cm.aim_camera(cam, (ex, ey, 11), (cx, cy, FLOOR_TOP + 3), lens=30)
    out["map_checkout"] = cm._render(P("map_checkout.png"), (1920, 1080), 96)
    for o in roofs:
        o.hide_render = False

    # night: dark sky, moonlight, every lamp part glowing plus a light at each lamp
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.02, 0.03, 0.07, 1.0)
    bg.inputs["Strength"].default_value = 0.6
    sun = bpy.data.objects["_sun"]
    sun.data.energy, sun.data.color = 0.25, (0.6, 0.7, 1.0)
    for m in bpy.data.materials:
        if m.name.startswith("_glow_"):
            m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 18.0
    for o in col.objects:
        if cm.part_name(o) in ("Light", "LaneLamp") and o.type == "MESH":
            lo, hi = cm.world_bbox([o])
            ld = bpy.data.lights.new("_lamp", "POINT")
            ld.energy, ld.color, ld.shadow_soft_size = 2500 if hi.z > 8 else 300, (1.0, 0.85, 0.6), 1.0
            lamp = bpy.data.objects.new("_lamp", ld)
            lamp.location = ((lo + hi) / 2) - Vector((0, 0, 0.6))
            tmp.objects.link(lamp)
    st5 = LAYOUT["plot_stages"].index(5)
    _, lo, hi, view = plot_store_box(st5)
    cm.frame_camera(cam, lo, hi, (1920, 1080), direction=view, fill=0.5)
    out["map_night"] = cm._render(P("map_night.png"), (1920, 1080), 128)

    cm._teardown(tmp, world)
    for c in bpy.data.collections:
        c.hide_render = False
    return out
