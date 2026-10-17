"""Chaos Mart Tycoon: roads, sidewalks, ground and plot pads.

Road pieces run along Y (traffic direction) and are 0.4 thick; sidewalks and
pads are 1.0 thick, so every curb is a 0.6 step. Pieces tile on a 4-stud grid
with no overlaps: a road segment is 24 x 32, an intersection 24 x 24, a
sidewalk run 8 x 32. Road markings are decals 0.003 above the asphalt.

Map-level sizes (plot pad, plaza pad, ground) come from map_layout.json so they
can be changed to match the blueprint without touching this file.
"""

import json
import os

import cm_common as cm

LAYOUT = json.load(open(os.path.join(cm.HERE, "map_layout.json")))
ROAD_W, SEG_L, ROAD_T = 24.0, 32.0, 0.4
WALK_W, WALK_T = 8.0, 1.0
EPS = 0.003  # decal height above the surface it sits on


def asphalt(b, x0, y0, x1, y1):
    b.box((x0, y0, 0), (x1, y1, ROAD_T), "asphalt", bevel=0)


@cm.asset("roads", "CM_Road_Straight", "Roads", (ROAD_W, ROAD_T, SEG_L), budget="prop",
          notes="Two-lane segment along Y: dashed yellow centre line, white edge lines.")  # fmt: skip
def road_straight(kit):
    x1, y1 = ROAD_W / 2, SEG_L / 2
    with kit.part("Road") as b:
        asphalt(b, -x1, -y1, x1, y1)
        for k in range(4):  # 4-stud dashes, 4-stud gaps
            y = -y1 + 2 + k * 8
            b.top_quad(-0.2, y, 0.2, y + 4, ROAD_T + EPS, "yellow")
        for s in (-1, 1):
            b.top_quad(s * 10.6 - 0.2, -y1, s * 10.6 + 0.2, y1, ROAD_T + EPS, "offwhite")


@cm.asset("roads", "CM_Road_Short", "Roads", (ROAD_W, ROAD_T, 10), budget="prop",
          notes="10-long filler: Short + Crosswalk (12) + Short = one 32 segment.")  # fmt: skip
def road_short(kit):
    x1, y1 = ROAD_W / 2, 5.0
    with kit.part("Road") as b:
        asphalt(b, -x1, -y1, x1, y1)
        b.top_quad(-0.2, -3, 0.2, 1, ROAD_T + EPS, "yellow")
        for s in (-1, 1):
            b.top_quad(s * 10.6 - 0.2, -y1, s * 10.6 + 0.2, y1, ROAD_T + EPS, "offwhite")


@cm.asset("roads", "CM_Road_Intersection", "Roads", (ROAD_W, ROAD_T, ROAD_W), budget="prop",
          notes="Plain 24 x 24 junction square with a manhole; joins four straights.")  # fmt: skip
def road_intersection(kit):
    h = ROAD_W / 2
    with kit.part("Road") as b:
        asphalt(b, -h, -h, h, h)
        b.disc((3, 3, ROAD_T + EPS), 1.1, "dark", segments=12, facing="+Z")
        b.disc((3, 3, ROAD_T + 2 * EPS), 0.8, "slate", segments=12, facing="+Z")


@cm.asset("roads", "CM_Road_Crosswalk", "Roads", (ROAD_W, ROAD_T, 12), budget="prop",
          notes="12-long segment with zebra bars and stop lines; put it where shoppers cross to a plot.")  # fmt: skip
def road_crosswalk(kit):
    x1, y1 = ROAD_W / 2, 6.0
    with kit.part("Road") as b:
        asphalt(b, -x1, -y1, x1, y1)
        bar, gap = 1.6, 1.1
        n = 8
        x = -(n * bar + (n - 1) * gap) / 2
        for _ in range(n):
            b.top_quad(x, -3.2, x + bar, 3.2, ROAD_T + EPS, "offwhite")
            x += bar + gap
        for s in (-1, 1):  # stop lines on the approach lanes
            xa, xb = (0.3, 10.6) if s > 0 else (-10.6, -0.3)
            yy = s * 4.6
            b.top_quad(xa, yy - 0.3, xb, yy + 0.3, ROAD_T + EPS, "offwhite")


@cm.asset("roads", "CM_Road_Parking", "Roads", (32, None, 20), budget="prop",
          notes="Asphalt parking strip: four 8 x 18 bays opening to -Y, with wheel stops.")  # fmt: skip
def road_parking(kit):
    x1, y1 = 16.0, 10.0
    with kit.part("Road") as b:
        asphalt(b, -x1, -y1, x1, y1)
        for i in range(5):  # bay lines
            x = -x1 + i * 8
            xa, xb = max(x - 0.15, -x1), min(x + 0.15, x1)
            b.top_quad(xa, -y1 + 2, xb, y1, ROAD_T + EPS, "offwhite")
        for i in range(4):  # wheel stops
            x = -x1 + 4 + i * 8
            b.box((x - 2, y1 - 2.2, ROAD_T), (x + 2, y1 - 1.6, ROAD_T + 0.35), "concrete", bevel=0.08)


def walk_slab(b, x0, y0, x1, y1, joints_along="y"):
    b.box((x0, y0, 0), (x1, y1, WALK_T), "concrete", bevel=0)
    if joints_along == "y":
        y = y0 + 4
        while y < y1 - 0.1:
            b.top_quad(x0 + 0.6, y - 0.06, x1, y + 0.06, WALK_T + EPS, "concrete_joint")
            y += 4


@cm.asset("roads", "CM_Sidewalk_Straight", "Roads", (WALK_W, WALK_T, SEG_L), budget="prop",
          notes="8 x 32 sidewalk; the curb (lighter, bevelled) is on the -X side facing the road.")  # fmt: skip
def sidewalk_straight(kit):
    x1, y1 = WALK_W / 2, SEG_L / 2
    with kit.part("Sidewalk") as b:
        walk_slab(b, -x1 + 0.6, -y1, x1, y1)
        b.box((-x1, -y1, 0), (-x1 + 0.6, y1, WALK_T), "metal", bevel=0.08)  # curb


@cm.asset("roads", "CM_Sidewalk_Corner", "Roads", (WALK_W, WALK_T, WALK_W), budget="prop",
          notes="8 x 8 corner with curbs on -X and -Y (the two road sides).")  # fmt: skip
def sidewalk_corner(kit):
    h = WALK_W / 2
    with kit.part("Sidewalk") as b:
        b.box((-h + 0.6, -h + 0.6, 0), (h, h, WALK_T), "concrete", bevel=0)
        b.box((-h, -h, 0), (-h + 0.6, h, WALK_T), "metal", bevel=0.08)
        b.box((-h + 0.6, -h, 0), (h, -h + 0.6, WALK_T), "metal", bevel=0.08)
        b.top_quad(-h + 0.6, -0.06, h, 0.06, WALK_T + EPS, "concrete_joint")
        b.top_quad(-0.06, -h + 0.6, 0.06, -0.06, WALK_T + EPS, "concrete_joint")
        b.top_quad(-0.06, 0.06, 0.06, h, WALK_T + EPS, "concrete_joint")


@cm.asset("roads", "CM_Ground_PaverTile", "Environment", (16, WALK_T, 16), budget="prop",
          notes="Decorative plaza paving: sand field, terracotta border and a diamond inlay.")  # fmt: skip
def paver_tile(kit):
    h = 8.0
    z = WALK_T + EPS
    with kit.part("Paving") as b:
        b.box((-h, -h, 0), (h, h, WALK_T), "paver_sand", bevel=0)
        for lo, hi in (((-h, -h), (h, -h + 1)), ((-h, h - 1), (h, h)), ((-h, -h + 1), (-h + 1, h - 1)), ((h - 1, -h + 1), (h, h - 1))):
            b.top_quad(lo[0], lo[1], hi[0], hi[1], z, "paver_brick")
        b.poly([(0, -5, z), (5, 0, z), (0, 5, z), (-5, 0, z)], "paver_brick")
        b.poly([(0, -3, z + EPS), (3, 0, z + EPS), (0, 3, z + EPS), (-3, 0, z + EPS)], "paver_sand")


@cm.asset("roads", "CM_Ground_Grass", "Environment", (32, 0.6, 32), budget="prop",
          notes="32 x 32 lawn tile with a few darker mowing stripes.")  # fmt: skip
def grass_tile(kit):
    h = 16.0
    with kit.part("Grass") as b:
        b.box((-h, -h, 0), (h, h, 0.6), "grass", bevel=0)
        for k in range(4):
            x = -h + k * 8
            b.top_quad(x, -h, x + 4, h, 0.6 + EPS, "grass_dark")


def plot_dims():
    p = LAYOUT["plot"]
    return p["width"], p["depth"]


@cm.asset("roads", "CM_Plot_Pad", "Environment", None, budget="shell",
          notes="Player plot foundation sized by map_layout.json. Front (-Y) faces the plaza. Painted "
                "outlines show where the store shell and stockroom go; OwnerPad is the claim spot.")  # fmt: skip
def plot_pad(kit):
    W, D = plot_dims()
    x1, y1 = W / 2, D / 2
    st = LAYOUT["plot"]["store"]  # store footprint (centre and size, plot-local)
    sr = LAYOUT["plot"]["stockroom"]
    z = WALK_T + EPS
    with kit.part("Pad") as b:
        b.box((-x1, -y1, 0), (x1, y1, WALK_T), "concrete", bevel=0.1)
        # lawn border on the sides and back
        b.top_quad(-x1, -y1, -x1 + 4, y1, z, "grass")
        b.top_quad(x1 - 4, -y1, x1, y1, z, "grass")
        b.top_quad(-x1 + 4, y1 - 4, x1 - 4, y1, z, "grass")

        def outline(cx, cy, w, d, colour, t=0.5):
            xa, xb, ya, yb = cx - w / 2, cx + w / 2, cy - d / 2, cy + d / 2
            b.top_quad(xa, ya, xb, ya + t, z, colour)
            b.top_quad(xa, yb - t, xb, yb, z, colour)
            b.top_quad(xa, ya + t, xa + t, yb - t, z, colour)
            b.top_quad(xb - t, ya + t, xb, yb - t, z, colour)

        outline(st["x"], st["y"], st["w"], st["d"], "teal")
        outline(sr["x"], sr["y"], sr["w"], sr["d"], "yellow")
        # parking lot in front of the store: asphalt, bays both sides of an aisle
        pk = LAYOUT["plot"]["parking"]
        px0, px1, py0, py1 = pk["x0"], pk["x1"], pk["y0"], pk["y1"]
        b.top_quad(px0, py0, px1, py1, z, "asphalt")
        aisle_mid = (py0 + py1) / 2
        x = px0
        while x <= px1 + 0.01:  # 9-wide bays either side of a 24-wide aisle
            if abs(x - st["x"]) > 9.5:
                xa, xb = max(x - 0.15, px0), min(x + 0.15, px1)
                b.top_quad(xa, py0 + 1, xb, aisle_mid - 12, z + EPS, "offwhite")
                b.top_quad(xa, aisle_mid + 12, xb, py1 - 1, z + EPS, "offwhite")
            x += 9
        # walkway from the plot front, through the lot, to the store door
        b.top_quad(st["x"] - 9, -y1, st["x"] + 9, py0, z, "paver_sand")
        b.top_quad(st["x"] - 9, py0, st["x"] + 9, py1, z + 2 * EPS, "paver_sand")
        b.top_quad(st["x"] - 9, py1, st["x"] + 9, st["y"] - st["d"] / 2, z, "paver_sand")
        # loading apron beside the stockroom door
        b.top_quad(sr["x"] + sr["w"] / 2, sr["y"] - 14, x1 - 4, sr["y"] + 14, z, "asphalt")
    op = LAYOUT["plot"]["owner_pad"]
    with kit.part("OwnerPad", origin=(op["x"], op["y"], WALK_T)) as b:
        b.cylinder((0, 0, 0), 4.0, 0.3, "navy", segments=16, bevel=0.06)
        b.cylinder((0, 0, 0.3), 3.3, 0.1, "teal", segments=16, bevel=0)
        b.star((0, 0, 0.4 + EPS), 1.6, "yellow", facing="+Z")


@cm.asset("roads", "CM_Plaza_Pad", "Environment", None, budget="shell",
          notes="Central plaza paving sized by map_layout.json, with a lawn ring around the fountain spot.")  # fmt: skip
def plaza_pad(kit):
    pz = LAYOUT["plaza"]
    W, D = pz["width"], pz["depth"]
    x1, y1 = W / 2, D / 2
    z = WALK_T + EPS
    with kit.part("Paving") as b:
        b.box((-x1, -y1, 0), (x1, y1, WALK_T), "paver_sand", bevel=0.1)
        x = -x1 + 16
        while x < x1 - 1:  # paving bands
            b.top_quad(x - 0.5, -y1 + 2, x + 0.5, y1 - 2, z, "paver_brick")
            x += 32
        b.top_quad(-x1 + 2, -y1 + 2, x1 - 2, -y1 + 3, z, "paver_brick")
        b.top_quad(-x1 + 2, y1 - 3, x1 - 2, y1 - 2, z, "paver_brick")
        b.disc((0, 0, z + EPS), 26, "grass", segments=24, facing="+Z")
        b.disc((0, 0, z + 2 * EPS), 18, "paver_brick", segments=24, facing="+Z")
        b.disc((0, 0, z + 3 * EPS), 16, "paver_sand", segments=24, facing="+Z")


@cm.asset("roads", "CM_Ground_Base", "Environment", None, budget="shell",
          notes="One grass slab under the whole map (sized by map_layout.json); place it at z = -0.2.")  # fmt: skip
def ground_base(kit):
    g = LAYOUT["ground"]
    with kit.part("Ground", origin=(0, 0, 0)) as b:
        b.box((-g["width"] / 2, -g["depth"] / 2, 0), (g["width"] / 2, g["depth"] / 2, 0.2), "grass", bevel=0)


def build(mats, only=None):
    return cm.build_family("roads", mats, only)
