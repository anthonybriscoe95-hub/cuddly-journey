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
            if cm.part_name(o) == "Anchor":
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


def build_store(P, to_world, group):
    """Store shell + stockroom + interior on one plot (plot-local coordinates)."""
    st = LAYOUT["plot"]["store"]
    sr = LAYOUT["plot"]["stockroom"]
    sx, sy, sw, sd = st["x"], st["y"], st["w"], st["d"]
    x_left, x_right = sx - sw / 2, sx + sw / 2  # outer faces
    y_front, y_back = sy - sd / 2, sy + sd / 2

    def put(asset, x, y, z=0.0, rot=0.0):
        loc, r = to_world(x, y, z, rot)
        P.place(asset, loc, r, group)

    put("CM_Shell_Floor_Store", sx, sy, PAD_TOP)

    # front wall, left to right between the side walls
    front = ["S", "F", "F", "F", "S", "S", "F", "F", "F", "S", "D", "S", "F", "F", "F", "S", "S", "F", "F", "F", "S"]
    widths = {"S": 4, "F": 7, "D": 16}
    names = {"S": "CM_Shell_Wall_Solid", "F": "CM_Shell_Storefront", "D": "CM_Shell_DoorFrame"}
    assert sum(widths[m] for m in front) == sw - 2, "front modules must fill the wall exactly"
    x = x_left + 1
    yf = y_front + 0.5
    for m in front:
        cx = x + widths[m] / 2
        put(names[m], cx, yf, FLOOR_TOP)
        if m == "D":
            put("CM_Shell_SlidingDoor", cx, yf, FLOOR_TOP)
        x += widths[m]

    # back wall (exterior faces +Y): solids with the staff door nearest the stockroom
    n_back = int((sw - 2 - 8) / 4)
    staff_at = n_back - 3
    x = x_left + 1
    yb = y_back - 0.5
    for i in range(n_back + 1):
        if i == staff_at:
            put("CM_Shell_StaffDoor", x + 4, yb, FLOOR_TOP, 180)
            x += 8
        else:
            put("CM_Shell_Wall_Solid", x + 2, yb, FLOOR_TOP, 180)
            x += 4

    # side walls run the full depth and own the corners
    for i in range(int(sd / 4)):
        y = y_front + 2 + i * 4
        put("CM_Shell_Wall_Solid", x_left + 0.5, y, FLOOR_TOP, -90)
        put("CM_Shell_Wall_Solid", x_right - 0.5, y, FLOOR_TOP, 90)

    put("CM_Shell_Roof_Store", sx, sy, FLOOR_TOP + 17.4)

    # facade dressing
    put("CM_Shell_SignBoard", sx, y_front - 0.2, FLOOR_TOP + 12.9)
    awning_rise = 0.8 + 6.5 * math.tan(math.radians(16)) + 0.12
    for run_start in (x_left + 1 + 4, x_left + 1 + 4 + 21 + 8, sx + 8 + 4, sx + 8 + 4 + 21 + 8):
        for k in range(5):
            put("CM_Shell_Awning", run_start + 0.5 + 2 + k * 4, y_front - 3.25, FLOOR_TOP + 12 - awning_rise)
    for x in (x_left + 3, x_left + 1 + 29, x_left + 1 + 56, sx + 10, sx + 37, x_right - 3):  # on solid modules
        put("CM_Shell_WallLight", x, y_front - 0.45, FLOOR_TOP + 8.6)
    for s in (-1, 1):
        put("CM_Shell_Planter", sx + s * 10.5, y_front - 6.5, PAD_TOP)

    # stockroom, door facing the loading apron (+X)
    put("CM_Shell_Stockroom", sr["x"], sr["y"], PAD_TOP)
    put("CM_Shell_Dumpster", sr["x"] + sr["w"] / 2 + 6, sr["y"] + 30, PAD_TOP, 90)

    # interior: checkouts by the entrance, gondola aisles, coolers on the back wall
    yi0, yi1 = y_front + 1, y_back - 1  # interior faces
    for k in range(4):
        put("CM_Fixture_CheckoutLane", sx - 54 + k * 9, yi0 + 10, FLOOR_TOP)
    put("CM_Decor_CheckoutSign", sx - 40.5, yi0 + 16, FLOOR_TOP + 9.5)
    cols = (sx - 38, sx + 2)
    rows = (yi0 + 28, yi0 + 44, yi0 + 60)
    shelves = [["CM_Fixture_SnackShelf", "CM_Fixture_WaterShelf"], ["CM_Fixture_PremiumShelf", "CM_Fixture_ToyShelf"],
               ["CM_Fixture_SnackShelf", "CM_Fixture_WaterShelf"]]  # fmt: skip
    for r, y in enumerate(rows):
        for c, x in enumerate(cols):
            put(shelves[r][c], x, y, FLOOR_TOP)
    for x, a in ((sx - 44, "CM_Fixture_DrinkCooler"), (sx - 14, "CM_Fixture_DairyFridge"), (sx + 16, "CM_Fixture_ProduceFridge")):
        put(a, x, yi1 - 3.1, FLOOR_TOP)
    put("CM_Fixture_ProduceStand", x_right - 18, yi0 + 30, FLOOR_TOP)
    put("CM_Fixture_BakeryCase", x_right - 18, yi0 + 50, FLOOR_TOP)
    put("CM_Fixture_SnackBin", sx + 40, yi0 + 14, FLOOR_TOP)


def dress_plot(P, to_world, group, index):
    """Lot dressing on one plot: banner, cars, pads, delivery, trees (plot-local)."""
    st = LAYOUT["plot"]["store"]
    sr = LAYOUT["plot"]["stockroom"]
    pk = LAYOUT["plot"]["parking"]
    W, D = LAYOUT["plot"]["width"], LAYOUT["plot"]["depth"]
    sx = st["x"]

    def put(asset, x, y, z=PAD_TOP, rot=0.0):
        loc, r = to_world(x, y, z, rot)
        P.place(asset, loc, r, group)

    put("CM_Prop_PlotBanner", W / 2 - 8, -D / 2 + 6)
    put("CM_Tycoon_PurchasePad", sx - 20, -13)
    put("CM_Tycoon_UpgradePad", sx + 20, -13)
    put("CM_Tycoon_DeliveryStation", sr["x"] + sr["w"] / 2 + 7.5, sr["y"] - 26, rot=90)
    put("CM_Prop_DeliveryTruck", sr["x"] + sr["w"] / 2 + 7.5, sr["y"] + 4)
    # parked cars in a few bays (front row noses in toward the aisle)
    cars = ["CM_Prop_ParkedCar_Red", "CM_Prop_ParkedCar_Blue", "CM_Prop_ParkedCar_Yellow"]
    aisle_mid = (pk["y0"] + pk["y1"]) / 2
    bays = [pk["x0"] + 4.5 + 9 * k for k in range(int((pk["x1"] - pk["x0"]) / 9))]
    bays = [x for x in bays if abs(x - sx) > 10]
    for k, x in enumerate(bays):
        if (k * 7 + index * 3) % 5 in (0, 2):
            put(cars[(k + index) % 3], x, (pk["y0"] + aisle_mid - 12) / 2 + 0.5, rot=180)
        if (k * 5 + index) % 4 == 1:
            put(cars[(k + index + 1) % 3], x, (aisle_mid + 12 + pk["y1"]) / 2 - 0.5)
    for y in range(-70, 81, 30):  # trees on the side lawns
        put("CM_Prop_Tree_Round" if (y // 30) % 2 else "CM_Prop_Tree_Pine", -W / 2 + 2, y, z=PAD_TOP)
    for x in (-90, -60, -30, 0, 30):  # hedge along the back lawn, behind the store
        put("CM_Prop_Bush", x, D / 2 - 2)


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
    kiosks = ["CM_Prop_PlazaKiosk_Teal", "CM_Prop_PlazaKiosk_Orange", "CM_Prop_PlazaKiosk_Blue", "CM_Prop_PlazaKiosk_Purple"]
    for k, (x, y) in enumerate(((-150, 40), (150, 40), (-150, -40), (150, -40))):
        P.place(kiosks[k], (x, y, z), 0 if y > 0 else 180, "plaza")
    for k in range(6):  # benches facing the fountain
        a = 2 * math.pi * (k + 0.5) / 6
        P.place("CM_Prop_Bench", (34 * math.cos(a), 34 * math.sin(a), z), math.degrees(a) + 90, "plaza")
    for x in (-300, -230, -100, 100, 230, 300):
        for y in (-55, 55):
            P.place("CM_Prop_Tree_Round" if (x // 100 + y) % 2 else "CM_Prop_Tree_Pine", (x, y, z), 0, "plaza")
    for x in range(-336, 337, 64):  # street lamps on both plaza edges, arms over the road
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
    door_xs = {1: [c + LAYOUT["plot"]["store"]["x"] for c in rows["column_x"]],
               -1: [c - LAYOUT["plot"]["store"]["x"] for c in rows["column_x"]]}  # fmt: skip

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

    for side, row_y in ((1, rows["north_row_y"]), (-1, rows["south_row_y"])):
        rot = 0 if side > 0 else 180
        for i, cx in enumerate(rows["column_x"]):
            group = "plot_%s%d" % ("N" if side > 0 else "S", i + 1)
            P.place("CM_Plot_Pad", (cx, row_y, 0), rot, group)
            build_store(P, plot_frame(cx, row_y, rot), group)
            dress_plot(P, plot_frame(cx, row_y, rot), group, i + (0 if side > 0 else 3))

    os.makedirs(MAP_DIR, exist_ok=True)
    with open(os.path.join(MAP_DIR, "placements.json"), "w") as f:
        json.dump({"_status": LAYOUT["_status"], "convention": "Blender coordinates; position = asset pivot "
                   "(bottom centre); rotation_z in degrees about +Z. See Documentation/IMPORT_GUIDE.md.",
                   "count": len(P.records), "placements": P.records}, f, indent=1)  # fmt: skip
        f.write("\n")
    return col, P


def render_views(col):
    """Overhead, store-exterior and interior shots of the assembled map."""
    scene = bpy.context.scene
    for c in bpy.data.collections:  # only the map is visible
        c.hide_render = c is not col and c.name != "_preview"
    tmp, cam, world = cm._stage(ground_colour="grass")
    out = {}

    lo, hi = cm.world_bbox(list(col.objects))
    cm.frame_camera(cam, lo, hi, (2000, 1500), direction=(0.0, -0.35, 1.0), fill=0.62)
    out["map_overhead"] = cm._render(os.path.join(cm.PREVIEW_DIR, "map_overhead.png"), (2000, 1500), 128)

    rows = LAYOUT["rows"]
    st = LAYOUT["plot"]["store"]
    sx, sy = rows["column_x"][1] + st["x"], rows["north_row_y"] + st["y"]
    store_lo = Vector((sx - 75, sy - 44 - 30, 0))
    store_hi = Vector((sx + 105, sy + 44, 20))
    cm.frame_camera(cam, store_lo, store_hi, (1920, 1080), direction=(0.45, -1.0, 0.38), fill=0.55)
    out["map_store_exterior"] = cm._render(os.path.join(cm.PREVIEW_DIR, "map_store_exterior.png"), (1920, 1080), 64)

    # interior: hide this store's roofs, look down into the aisles
    roofs = [o for o in col.objects if (cm.part_name(o) == "Roof" or (cm.part_name(o) == "Glass" and o.matrix_world.translation.z > 18))
             and abs(o.matrix_world.translation.x - sx) < 70 and abs(o.matrix_world.translation.y - sy) < 50]  # fmt: skip
    for o in roofs:
        o.hide_render = True
    cm.frame_camera(cam, Vector((sx - 66, sy - 43, 0)), Vector((sx + 66, sy + 43, 10)), (1920, 1080),
                    direction=(0.25, -0.75, 1.0), fill=0.5)  # fmt: skip
    out["map_store_interior"] = cm._render(os.path.join(cm.PREVIEW_DIR, "map_store_interior.png"), (1920, 1080), 64)

    # close-ups from eye level inside the store: a stocked aisle and the checkouts
    yi0 = sy - st["d"] / 2 + 1
    ax, ay = sx - 38, yi0 + 28  # first gondola row, left column
    cm.aim_camera(cam, (ax + 9, ay - 12, 7.5), (ax - 2, ay, FLOOR_TOP + 3.2), lens=30)
    out["map_aisle"] = cm._render(os.path.join(cm.PREVIEW_DIR, "map_aisle.png"), (1920, 1080), 96)
    cx, cy = sx - 54 + 13.5, yi0 + 10
    cm.aim_camera(cam, (cx + 12, cy + 14, 11), (cx - 1, cy - 1, FLOOR_TOP + 3), lens=30)
    out["map_checkout"] = cm._render(os.path.join(cm.PREVIEW_DIR, "map_checkout.png"), (1920, 1080), 96)
    for o in roofs:
        o.hide_render = False

    # night: dark sky, moonlight, every lamp part glowing plus a light at each street lamp
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.02, 0.03, 0.07, 1.0)
    bg.inputs["Strength"].default_value = 0.6
    sun = bpy.data.objects["_sun"]
    sun.data.energy, sun.data.color = 0.25, (0.6, 0.7, 1.0)
    for m in bpy.data.materials:
        if m.name.startswith("_glow_"):
            m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 18.0
    lamps = []
    for o in col.objects:
        if cm.part_name(o) in ("Light", "LaneLamp") and o.type == "MESH":
            lo, hi = cm.world_bbox([o])
            ld = bpy.data.lights.new("_lamp", "POINT")
            ld.energy, ld.color, ld.shadow_soft_size = 2500 if hi.z > 8 else 300, (1.0, 0.85, 0.6), 1.0
            lamp = bpy.data.objects.new("_lamp", ld)
            lamp.location = ((lo + hi) / 2) - cm.Vector((0, 0, 0.6))
            tmp.objects.link(lamp)
            lamps.append(lamp)
    cm.frame_camera(cam, store_lo, store_hi, (1920, 1080), direction=(0.45, -1.0, 0.38), fill=0.55)
    out["map_night"] = cm._render(os.path.join(cm.PREVIEW_DIR, "map_night.png"), (1920, 1080), 128)

    cm._teardown(tmp, world)
    for c in bpy.data.collections:
        c.hide_render = False
    return out
