"""Chaos Mart Tycoon: roads, sidewalks, ground and plot pads.

Road pieces run along Y (traffic direction) and are 0.4 thick; sidewalks and
pads are 1.0 thick, so every curb is a 0.6 step. Pieces tile on a 4-stud grid
with no overlaps: a road segment is 24 x 32, an intersection 24 x 24, a
sidewalk run 8 x 32. Road markings are decals 0.003 above the asphalt.

Map-level sizes (plot pad, plaza pad, ground) come from map_layout.json so they
can be changed to match the blueprint without touching this file.
"""

import json
import math
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


def arc_strip(b, cx, cy, r, width, a0, a1, colour, z, segments=12, dashed=False):
    """Flat marking along a circular arc (angles in degrees), optionally dashed."""
    for k in range(segments):
        if dashed and k % 2:
            continue
        t0 = math.radians(a0 + (a1 - a0) * k / segments)
        t1 = math.radians(a0 + (a1 - a0) * (k + 1) / segments)
        ri, ro = r - width / 2, r + width / 2
        pts = [(cx + ri * math.cos(t0), cy + ri * math.sin(t0), z), (cx + ro * math.cos(t0), cy + ro * math.sin(t0), z),
               (cx + ro * math.cos(t1), cy + ro * math.sin(t1), z), (cx + ri * math.cos(t1), cy + ri * math.sin(t1), z)]  # fmt: skip
        if (a1 - a0) < 0:
            pts.reverse()
        b.poly(pts, colour)


@cm.asset("roads", "CM_Road_Corner", "Roads", (ROAD_W, ROAD_T, ROAD_W), budget="prop",
          notes="90-degree bend joining a road from -Y to a road toward +X, with curved lane markings.")  # fmt: skip
def road_corner(kit):
    h = ROAD_W / 2
    z = ROAD_T + EPS
    with kit.part("Road") as b:
        asphalt(b, -h, -h, h, h)
        cx, cy = h, -h  # the bend's centre is the inside corner
        arc_strip(b, cx, cy, h, 0.4, 180, 90, "yellow", z, segments=12, dashed=True)
        arc_strip(b, cx, cy, h + 10.6, 0.4, 180, 90 + 26, "offwhite", z, segments=10)
        arc_strip(b, cx, cy, h - 10.6, 0.4, 180, 90, "offwhite", z, segments=6)


@cm.asset("roads", "CM_Road_TJunction", "Roads", (ROAD_W, ROAD_T, ROAD_W), budget="prop",
          notes="T-junction: the road runs along Y, a branch leaves toward +X (stop line on its inbound lane).")  # fmt: skip
def road_tjunction(kit):
    h = ROAD_W / 2
    z = ROAD_T + EPS
    with kit.part("Road") as b:
        asphalt(b, -h, -h, h, h)
        b.top_quad(-10.6 - 0.2, -h, -10.6 + 0.2, h, z, "offwhite")  # far edge line, unbroken
        for k in range(3):
            y = -h + 2 + k * 8
            b.top_quad(-0.2, y, 0.2, y + 4, z, "yellow")
        b.top_quad(10.5, -10.6, 11.3, -0.3, z, "offwhite")  # stop line on the branch's inbound lane
        b.disc((-4, 4, z), 1.1, "dark", segments=12, facing="+Z")


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


@cm.asset("roads", "CM_Road_ParkingDivider", "Roads", (4, None, 20), budget="prop",
          notes="Planted island between parking rows: curb, lawn and two clipped shrubs.")  # fmt: skip
def parking_divider(kit):
    with kit.part("Body") as b:
        b.box((-2, -10, 0), (2, 10, 0.6), "metal", bevel=0.12)
        b.top_quad(-1.6, -9.6, 1.6, 9.6, 0.6 + EPS, "grass")
        for y in (-5, 5):
            b.ellipsoid((0, y, 1.5), (1.3, 1.6, 1.1), "shrub", segments=10, rings=5)


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
