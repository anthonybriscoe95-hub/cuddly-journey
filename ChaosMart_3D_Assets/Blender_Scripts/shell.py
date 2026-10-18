"""Chaos Mart Tycoon: modular store shell (kit-style building pieces).

Wall-type modules are exactly 1 stud thick (Y from -0.5 to +0.5) and 18 high.
The exterior faces -Y, the interior +Y. Widths tile exactly:
  Wall_Solid 4, Storefront 7, StaffDoor 8, DoorFrame 16
so a 132-stud front is  [S, SF x3, S, S, SF x3, S] + Door 16 + the mirror,
and a 132-stud back is 31 x Wall_Solid + StaffDoor (see map_assembly.py).

Every module shares one horizontal banding so neighbours line up:
  0-2.5 navy plinth | 2.5-12 field / glass | 12-13 teal band |
  13-15.4 field | 15.4-17.4 slate cornice | 17.4-18 off-white cap
Decals sit 0.012 off their surface and inside the module's bounds.
"""

import math

import cm_common as cm

H = 18.0
T = 0.5  # half wall thickness
SKIN = 0.45  # interior face of the wall core


def header(b, x0, x1, z0):
    """Wall banding from z0 up to the cap (shared by every module)."""
    b.box((x0, -T + 0.1, z0), (x1, SKIN, 17.4), "wall_warm", bevel=0.03)
    if z0 < 13:
        b.box((x0, -T + 0.02, max(z0, 12)), (x1, -T + 0.1, 13), "teal", bevel=0.03)
    b.box((x0, -T + 0.02, 15.4), (x1, -T + 0.1, 17.4), "slate", bevel=0.03)
    b.front_quad(x0, 15.55, x1, 15.75, -T + 0.008, "mint")  # pin-stripe in the cornice
    b.box((x0, -T, 17.4), (x1, T, H), "offwhite", bevel=0.05)  # cap
    b.box((x0, SKIN, z0), (x1, T, 17.4), "offwhite", bevel=0)  # interior skin


def plinth(b, x0, x1):
    b.box((x0, -T, 0), (x1, -T + 0.1, 2.5), "navy", bevel=0.03)
    b.box((x0, SKIN, 0), (x1, T, 0.6), "mint", bevel=0)  # interior skirting


def solid_field(b, x0, x1, z0=0.0, z1=12.0):
    """Wall from z0 to z1 with a recessed panel on the exterior."""
    b.box((x0, -T + 0.1, z0), (x1, SKIN, z1), "wall_warm", bevel=0.03)
    b.box((x0, SKIN, z0), (x1, T, z1), "offwhite", bevel=0)
    pad = 0.4
    if x1 - x0 > 2 * pad + 0.5:
        b.front_quad(x0 + pad, max(z0, 2.5) + 0.8, x1 - pad, z1 - 0.8, -T + 0.088, "wall_shade")


# ---------------------------------------------------------------------------
# Wall modules
# ---------------------------------------------------------------------------


@cm.asset("shell", "CM_Shell_Wall_Solid", "Buildings", (4, 18, 1), budget="shell",
          notes="4-stud solid wall module; exterior -Y with a recessed panel.")  # fmt: skip
def wall_solid(kit):
    with kit.part("Body") as b:
        plinth(b, -2, 2)
        solid_field(b, -2, 2, 0, 12)
        header(b, -2, 2, 12)


@cm.asset("shell", "CM_Shell_Storefront", "Buildings", (7, 18, 1), budget="shell",
          notes="Glass storefront: navy kick plate 0-2.5, glass 2.5-12 (separate Glass mesh), header 12-18.")  # fmt: skip
def storefront(kit):
    x0, x1 = -3.5, 3.5
    m = 0.3  # mullion width
    with kit.part("Body") as b:
        b.box((x0, -T, 0), (x1, T, 2.5), "navy", bevel=0.04)  # kick plate
        b.box((x0, -T, 2.35), (x1, 0.1, 2.5), "offwhite", bevel=0)  # sill
        for xa, xb in ((x0, x0 + m), (x1 - m, x1)):  # mullions
            b.box((xa, -0.35, 2.5), (xb, 0.35, 12), "slate", bevel=0.03)
        b.box((x0 + m, -0.3, 8.6), (x1 - m, 0.3, 8.85), "slate", bevel=0)  # transom bar
        b.box((x0, -T, 11.85), (x1, T, 12), "slate", bevel=0)  # head
        header(b, x0, x1, 12)
    with kit.part("Glass", material="glass") as b:
        b.box((x0 + m, -0.06, 2.5), (x1 - m, 0.06, 8.6), "glass", bevel=0)
        b.box((x0 + m, -0.06, 8.85), (x1 - m, 0.06, 11.85), "glass", bevel=0)


@cm.asset("shell", "CM_Shell_DoorFrame", "Buildings", (16, 18, 1), budget="shell",
          notes="16-wide module with a 14.4 x 12 clear opening (0.8 jambs) for CM_Shell_SlidingDoor.")  # fmt: skip
def door_frame(kit):
    x0, x1, j = -8, 8, 0.8
    with kit.part("Body") as b:
        for xa, xb in ((x0, x0 + j), (x1 - j, x1)):
            b.box((xa, -T + 0.02, 0), (xb, T, 12), "slate", bevel=0.05)
            b.front_quad(xa + 0.25, 0.4, xb - 0.25, 11.6, -T + 0.008, "teal")
        b.box((x0, -T, 11.6), (x1, T, 12), "slate", bevel=0.04)  # head
        b.front_quad(-2.2, 12.25, 2.2, 12.75, -T + 0.008, "yellow")  # entrance marker on the band
        header(b, x0, x1, 12)


@cm.asset("shell", "CM_Shell_SlidingDoor", "Buildings", (14.4, 12, 0.6), budget="shell",
          notes="Fits the DoorFrame opening. DoorLeft/DoorRight (+Glass) pivot at their own bottom centre "
                "so the game can tween them sideways.")  # fmt: skip
def sliding_door(kit):
    W, Hd = 14.4, 12.0
    track = 0.6
    with kit.part("Track") as b:
        b.box((-W / 2, -0.28, Hd - track), (W / 2, 0.3, Hd), "slate", bevel=0.05)
        b.box((-0.5, -0.295, Hd - track + 0.12), (0.5, -0.28, Hd - 0.12), "dark", bevel=0)
        b.disc((0, -0.3, Hd - 0.3), 0.12, "red", segments=6)  # motion sensor
    leaf_w, leaf_h, rim = W / 2, Hd - track, 0.28
    for side, name in ((-1, "DoorLeft"), (1, "DoorRight")):
        cx = side * leaf_w / 2
        with kit.part(name, origin=(cx, 0, 0)) as b:
            hw = leaf_w / 2
            b.box((-hw, -0.2, 0), (hw, 0.2, rim), "metal", bevel=0.04)
            b.box((-hw, -0.2, leaf_h - rim), (hw, 0.2, leaf_h), "metal", bevel=0.04)
            b.box((-hw, -0.2, rim), (-hw + rim, 0.2, leaf_h - rim), "metal", bevel=0.04)
            b.box((hw - rim, -0.2, rim), (hw, 0.2, leaf_h - rim), "metal", bevel=0.04)
            hx = -side * (hw - rim - 0.35)  # pull handle near the meeting edge
            b.box((hx - 0.08, -0.28, 3.2), (hx + 0.08, -0.2, 6.8), "slate", bevel=0)
            b.front_quad(-hw + rim, 4.6, hw - rim, 4.9, -0.212, "teal")  # safety stripe
        with kit.part(name + "Glass", origin=(cx, 0, 0), material="glass") as b:
            b.box((-hw + rim, -0.05, rim), (hw - rim, 0.05, leaf_h - rim), "glass", bevel=0)


@cm.asset("shell", "CM_Shell_StaffDoor", "Buildings", (8, 18, 1), budget="shell", measure=["Body"],
          notes="8-wide wall module holding the 8 x 10 metal staff door (frame included). "
                "Door pivots at its hinge side bottom; SignPlate is blank for 'STAFF ONLY'.")  # fmt: skip
def staff_door(kit):
    x0, x1 = -4, 4
    fw = 0.8  # frame width; clear opening 6.4 x 9.6
    with kit.part("Body") as b:
        for xa, xb in ((x0, x0 + fw), (x1 - fw, x1)):
            b.box((xa, -T, 0), (xb, T, 10), "navy", bevel=0.05)
        b.box((x0, -T, 9.6), (x1, T, 10), "navy", bevel=0.05)
        solid_field(b, x0, x1, 10, 12)
        header(b, x0, x1, 12)
    hinge_x = x0 + fw
    with kit.part("Door", origin=(hinge_x, 0, 0)) as b:
        w, h = 6.4, 9.6
        b.box((0, -0.15, 0), (w, 0.15, h), "metal", bevel=0.05)
        b.front_quad(0.3, 0.2, w - 0.3, 1.4, -0.162, "slate")  # kick plate
        b.front_quad(2.2, 6.2, 4.2, 8.4, -0.162, "kiosk_blue")  # vision panel
        b.box((0.6, -0.4, 4.3), (w - 0.6, -0.15, 4.6), "slate", bevel=0)  # push bar
        b.box((0.6, -0.4, 4.0), (0.85, -0.15, 4.9), "slate", bevel=0)
        b.box((w - 0.85, -0.4, 4.0), (w - 0.6, -0.15, 4.9), "slate", bevel=0)
    with kit.part("SignPlate") as b:
        b.box((-1.6, -T - 0.06, 10.6), (1.6, -T + 0.1, 11.6), "yellow", bevel=0.04)


@cm.asset("shell", "CM_Shell_Wall_Window", "Buildings", (8, 18, 1), budget="shell",
          notes="8-wide wall module with a 5 x 5 window (sill at 5); Glass is separate. For side and back walls.")  # fmt: skip
def wall_window(kit):
    x0, x1 = -4, 4
    wx0, wx1, wz0, wz1 = -2.5, 2.5, 5.0, 10.0
    with kit.part("Body") as b:
        plinth(b, x0, x1)
        solid_field(b, x0, x1, 0, wz0)  # below the window
        for xa, xb in ((x0, wx0), (wx1, x1)):  # either side
            b.box((xa, -T + 0.1, wz0), (xb, SKIN, wz1), "wall_warm", bevel=0.03)
            b.box((xa, SKIN, wz0), (xb, T, wz1), "offwhite", bevel=0)
        b.box((x0, -T + 0.1, wz1), (x1, SKIN, 12), "wall_warm", bevel=0.03)  # above
        b.box((x0, SKIN, wz1), (x1, T, 12), "offwhite", bevel=0)
        # frame and sill
        b.box((wx0 - 0.25, -T, wz0 - 0.35), (wx1 + 0.25, T, wz0), "offwhite", bevel=0.05)
        b.box((wx0, -0.3, wz1 - 0.25), (wx1, 0.3, wz1), "slate", bevel=0)
        for xa, xb in ((wx0, wx0 + 0.25), (wx1 - 0.25, wx1), (-0.1, 0.1)):
            b.box((xa, -0.3, wz0), (xb, 0.3, wz1 - 0.25), "slate", bevel=0)
        header(b, x0, x1, 12)
    with kit.part("Glass", material="glass") as b:
        b.box((wx0 + 0.25, -0.05, wz0), (wx1 - 0.25, 0.05, wz1 - 0.25), "glass", bevel=0)


@cm.asset("shell", "CM_Shell_FacadePanel", "Buildings", (4, 18, 1), budget="shell",
          notes="Decorative 4-wide feature panel: teal field with off-white fins; tiles with the standard walls.")  # fmt: skip
def facade_panel(kit):
    with kit.part("Body") as b:
        plinth(b, -2, 2)
        b.box((-2, -T + 0.1, 0), (2, SKIN, 12), "teal", bevel=0.03)
        b.box((-2, SKIN, 0), (2, T, 12), "offwhite", bevel=0)
        for x in (-1.2, 0.0, 1.2):  # fins
            b.box((x - 0.12, -T + 0.02, 2.5), (x + 0.12, -T + 0.1, 12), "offwhite", bevel=0)
        b.star((0, -T + 0.008, 13.9), 0.7, "yellow")
        header(b, -2, 2, 12)


# ---------------------------------------------------------------------------
# Facade dressing
# ---------------------------------------------------------------------------


@cm.asset("shell", "CM_Shell_Awning", "Buildings", (4, None, 6.5), budget="shell",
          notes="4-wide awning projecting 6.5, tilted 16 degrees down; eight alternating teal / off-white "
                "stripes so modules tile seamlessly. The back edge (+Y) mounts on the wall.")  # fmt: skip
def awning(kit):
    W, P = 4.0, 6.5
    drop = P * math.tan(math.radians(16))
    t = 0.12
    val = 0.8  # valance height
    y_wall, y_front = P / 2, -P / 2
    z_front = val  # canvas underside at the front
    z_back = z_front + drop
    stripes = 8
    with kit.part("Body") as b:
        sw = W / stripes
        for i in range(stripes):
            xa, xb = -W / 2 + i * sw, -W / 2 + (i + 1) * sw
            c = "teal" if i % 2 == 0 else "offwhite"
            b.hexa([(xa, y_front, z_front), (xb, y_front, z_front), (xb, y_wall, z_back), (xa, y_wall, z_back),
                    (xa, y_front, z_front + t), (xb, y_front, z_front + t), (xb, y_wall, z_back + t), (xa, y_wall, z_back + t)], c)  # fmt: skip
            b.box((xa, y_front + 0.02, 0), (xb, y_front + 0.12, z_front), c, bevel=0)  # valance
            b.front_quad(xa, 0.0, xb, 0.12, y_front + 0.008, "navy")  # hem
        b.box((-W / 2, y_wall - 0.25, z_back - 0.35), (W / 2, y_wall, z_back + t), "slate", bevel=0.04)  # wall rail


@cm.asset("shell", "CM_Shell_SignBoard", "Buildings", (34, 4.6, 0.4), budget="shell",
          notes="Main store sign. Face is blank (the game draws the store name); Neon is the outline tube.")  # fmt: skip
def sign_board(kit):
    W, Hs, D = 34, 4.6, 0.4
    x1, y0 = W / 2, -D / 2
    with kit.part("Body") as b:
        b.box((-x1, y0 + 0.08, 0), (x1, D / 2, Hs), "navy", bevel=0.15)
        for s in (-1, 1):  # star end caps
            b.star((s * (x1 - 1.2), y0 + 0.068, Hs / 2), 0.7, "yellow")
    with kit.part("Face") as b:
        b.box((-x1 + 2.4, y0 + 0.02, 0.5), (x1 - 2.4, y0 + 0.08, Hs - 0.5), "teal", bevel=0)
    with kit.part("Neon") as b:
        t, xo, zo, zt = 0.1, x1 - 2.2, 0.32, Hs - 0.32
        for lo, hi in (((-xo, y0, zo - t), (xo, y0 + 0.08, zo)), ((-xo, y0, zt), (xo, y0 + 0.08, zt + t)),
                       ((-xo - t, y0, zo - t), (-xo, y0 + 0.08, zt + t)), ((xo, y0, zo - t), (xo + t, y0 + 0.08, zt + t))):  # fmt: skip
            b.box(lo, hi, "yellow", bevel=0)


@cm.asset("shell", "CM_Shell_Planter", "Buildings", (2.6, 2, 12), budget="shell", measure=["Body"],
          notes="Planter box 2.6 x 2 x 12 (long along Y); Shrub sits on the soil above it.")  # fmt: skip
def planter(kit):
    W, Hp, D = 2.6, 2.0, 12
    with kit.part("Body") as b:
        b.box((-W / 2, -D / 2, 0), (W / 2, D / 2, Hp - 0.2), "wood", bevel=0.1)
        b.box((-W / 2, -D / 2, Hp - 0.2), (W / 2, D / 2, Hp), "slate", bevel=0.06)  # rim
        for k in range(5):  # board lines on both long faces
            z = 0.35 + k * 0.3
            for s in (-1, 1):
                b.quad([(s * (W / 2 + 0.0) - s * 0.008, -s * (D / 2 - 0.3), z),
                        (s * (W / 2) - s * 0.008, s * (D / 2 - 0.3), z),
                        (s * (W / 2) - s * 0.008, s * (D / 2 - 0.3), z + 0.04),
                        (s * (W / 2) - s * 0.008, -s * (D / 2 - 0.3), z + 0.04)], "bread")  # fmt: skip
        b.top_quad(-W / 2 + 0.25, -D / 2 + 0.25, W / 2 - 0.25, D / 2 - 0.25, Hp + 0.001, "bread_dark")  # soil
    with kit.part("Shrub") as b:
        for k in range(5):
            y = -D / 2 + 1.3 + k * (D - 2.6) / 4
            r = 1.05 if k % 2 == 0 else 0.9
            b.ellipsoid((0, y, Hp + r * 0.75), (r, r * 1.15, r * 0.9), "shrub" if k % 2 == 0 else "grass_dark", segments=8, rings=5)


@cm.asset("shell", "CM_Shell_Pillar", "Buildings", (2, 18, 2), budget="shell",
          notes="Decorative corner pillar matching the wall banding.")  # fmt: skip
def pillar(kit):
    with kit.part("Body") as b:
        b.box((-1, -1, 0), (1, 1, 2.5), "navy", bevel=0.08)
        b.box((-0.85, -0.85, 2.5), (0.85, 0.85, 15.4), "wall_warm", bevel=0.06)
        b.box((-1, -1, 12), (1, 1, 13), "teal", bevel=0.06)
        b.box((-1, -1, 15.4), (1, 1, 17.4), "slate", bevel=0.08)
        b.box((-1, -1, 17.4), (1, 1, 18), "offwhite", bevel=0.08)
        for s in (-1, 1):  # vertical flutes on the front and side faces
            b.front_quad(s * 0.35 - 0.08, 3.2, s * 0.35 + 0.08, 11.3, -0.862, "wall_shade")


@cm.asset("shell", "CM_Shell_WallLight", "Buildings", (1, 1.4, 0.9), budget="prop",
          notes="Exterior wall sconce; mount the back (+Y) on the wall. Light is the warm lamp part (set Neon).")  # fmt: skip
def wall_light(kit):
    with kit.part("Body") as b:
        b.box((-0.5, 0.3, 0), (0.5, 0.45, 1.4), "slate", bevel=0.05)  # back plate
        b.box((-0.08, 0.0, 0.95), (0.08, 0.3, 1.1), "slate", bevel=0)  # arm
        b.cylinder((0, 0, 0.75), 0.45 / math.cos(math.pi / 8), 0.45, "navy", segments=8, top_radius=0.18, bevel=0)  # shade
    with kit.part("Light") as b:  # glowing disc under the shade
        b.cylinder((0, 0, 0.6), 0.34, 0.15, "warm_light", segments=8, bevel=0)


@cm.asset("shell", "CM_Shell_Dumpster", "Buildings", (6, 4.4, 4), budget="prop",
          notes="Exterior trash container with a separate Lid (hinged at the back).")  # fmt: skip
def dumpster(kit):
    with kit.part("Body") as b:
        b.hexa([(-3, -1.7, 0.5), (3, -1.7, 0.5), (3, 2, 0.5), (-3, 2, 0.5),
                (-3, -2, 3.9), (3, -2, 3.9), (3, 2, 3.9), (-3, 2, 3.9)], "teal", bevel=0.12)  # fmt: skip
        b.front_quad(-2.6, 2.2, 2.6, 2.5, -1.92, "offwhite")
        for s in (-1, 1):
            b.box((s * 2.4 - 0.5, -1.4, 0), (s * 2.4 + 0.5, 1.6, 0.5), "dark", bevel=0)  # skids
            b.box((s * 3 - (0.1 if s > 0 else 0), -1.0, 2.0), (s * 3 + (0 if s > 0 else 0.1), 1.0, 2.3), "slate", bevel=0)
    with kit.part("Lid", origin=(0, 2, 3.9)) as b:
        b.hexa([(-3, -4, 0), (3, -4, 0), (3, 0, 0), (-3, 0, 0),
                (-3, -4, 0.2), (3, -4, 0.2), (3, 0, 0.5), (-3, 0, 0.5)], "slate", bevel=0.06)  # fmt: skip


@cm.asset("shell", "CM_Shell_RoofAC", "Buildings", (5, 3, 4), budget="prop",
          notes="Rooftop HVAC unit.")  # fmt: skip
def roof_ac(kit):
    with kit.part("Body") as b:
        b.box((-2.5, -2, 0), (2.5, 2, 0.3), "slate", bevel=0)  # curb
        b.box((-2.3, -1.8, 0.3), (2.3, 1.8, 2.6), "metal", bevel=0.1)
        for k in range(6):  # louvres
            z = 0.7 + k * 0.28
            b.front_quad(-2.0, z, 0.4, z + 0.12, -1.812, "stockroom")
        b.cylinder((1.25, 0, 2.6), 0.85, 0.4, "slate", segments=10, bevel=0)  # fan shroud
    with kit.part("Fan") as b:
        b.disc((1.25, 0, 3.0), 0.72, "dark", segments=10, facing="+Z")


# ---------------------------------------------------------------------------
# Stockroom (floors and roofs are per stage, in stages.py)
# ---------------------------------------------------------------------------


@cm.asset("shell", "CM_Shell_Stockroom", "Buildings", (51, 16, 76), budget="shell",
          notes="Loading-dock building 51 x 16 x 76. RollUpDoor (22 x 12) is on the +X long side with "
                "the LightStrip above it; Roof is separate so the game can hide it.")  # fmt: skip
def stockroom(kit):
    W, D = 51, 76
    x1, y1 = W / 2, D / 2
    wall_top, wt = 14.8, 1.0
    xo, yo = x1 - 0.02, y1 - 0.02  # outer wall faces, leaving room for decals
    door_half, door_h = 11, 12
    with kit.part("Body") as b:
        b.box((-x1, -y1, 0), (x1, y1, 0.4), "concrete", bevel=0.05)  # slab
        walls = [
            ((-xo, -yo, 0.4), (xo, -yo + wt, wall_top)),  # front (-Y)
            ((-xo, yo - wt, 0.4), (xo, yo, wall_top)),  # back
            ((-xo, -yo + wt, 0.4), (-xo + wt, yo - wt, wall_top)),  # -X
            ((xo - wt, -yo + wt, 0.4), (xo, -door_half, wall_top)),  # +X, either side of the door
            ((xo - wt, door_half, 0.4), (xo, yo - wt, wall_top)),
            ((xo - wt, -door_half, door_h), (xo, door_half, wall_top)),  # over the door
        ]
        for lo, hi in walls:
            b.box(lo, hi, "stockroom", bevel=0.04)
        # parapet trim
        b.box((-xo, -yo, wall_top), (xo, -yo + wt, wall_top + 0.6), "navy", bevel=0.05)
        b.box((-xo, yo - wt, wall_top), (xo, yo, wall_top + 0.6), "navy", bevel=0.05)
        b.box((-xo, -yo + wt, wall_top), (-xo + wt, yo - wt, wall_top + 0.6), "navy", bevel=0.05)
        b.box((xo - wt, -yo + wt, wall_top), (xo, yo - wt, wall_top + 0.6), "navy", bevel=0.05)
        # vertical cladding ribs on the long faces (decals, inside the bounds)
        for y in range(-36, 37, 4):
            if abs(y) > door_half + 0.5:
                b.quad([(xo + 0.012, y - 0.15, 0.6), (xo + 0.012, y + 0.15, 0.6), (xo + 0.012, y + 0.15, wall_top - 0.2), (xo + 0.012, y - 0.15, wall_top - 0.2)], "slate")
            b.quad([(-xo - 0.012, y + 0.15, 0.6), (-xo - 0.012, y - 0.15, 0.6), (-xo - 0.012, y - 0.15, wall_top - 0.2), (-xo - 0.012, y + 0.15, wall_top - 0.2)], "slate")
        for x in range(-22, 23, 4):  # ribs on the short faces
            for s_ in (-1, 1):
                yy = s_ * (yo + 0.012)
                pts = [(x - 0.15, yy, 0.6), (x + 0.15, yy, 0.6), (x + 0.15, yy, wall_top - 0.2), (x - 0.15, yy, wall_top - 0.2)]
                b.quad(pts if s_ < 0 else pts[::-1], "slate")
        # hazard jambs and dock bumpers either side of the door
        for s in (-1, 1):
            y = s * (door_half + 0.4)
            b.quad([(xo + 0.012, y - 0.4, 0.4), (xo + 0.012, y + 0.4, 0.4), (xo + 0.012, y + 0.4, door_h), (xo + 0.012, y - 0.4, door_h)], "yellow")
            yb = s * (door_half + 1.6)
            b.quad([(xo + 0.012, yb - 0.5, 1.0), (xo + 0.012, yb + 0.5, 1.0), (xo + 0.012, yb + 0.5, 3.2), (xo + 0.012, yb - 0.5, 3.2)], "dark")
        # stacked crates inside, visible through the door
        for i, (y, levels) in enumerate(((-6, 3), (-1.5, 2), (3, 3), (7.5, 1))):
            for k in range(levels):
                x = x1 - 9 - (k % 2) * 0.2
                b.box((x - 2, y - 2, 0.4 + k * 2.6), (x + 2, y + 2, 0.4 + (k + 1) * 2.6 - 0.05), "wood", bevel=0.08)
                b.front_quad(x - 1.5, 0.4 + k * 2.6 + 0.9, x + 1.5, 0.4 + k * 2.6 + 1.5, y - 2.012, "bread")
    with kit.part("RollUpDoor") as b:
        x = xo - 0.6
        b.box((x - 0.3, -door_half, 0.4), (x, door_half, door_h), "metal", bevel=0)
        for k in range(14):  # slat grooves
            z = 0.4 + (k + 1) * (door_h - 0.4) / 15
            b.quad([(x + 0.012, -door_half + 0.1, z), (x + 0.012, door_half - 0.1, z),
                    (x + 0.012, door_half - 0.1, z + 0.08), (x + 0.012, -door_half + 0.1, z + 0.08)], "stockroom")  # fmt: skip
        b.quad([(x + 0.012, -door_half + 0.1, 0.4), (x + 0.012, door_half - 0.1, 0.4),
                (x + 0.012, door_half - 0.1, 0.8), (x + 0.012, -door_half + 0.1, 0.8)], "yellow")  # fmt: skip
    with kit.part("LightStrip") as b:
        b.box((xo - 0.15, -door_half + 1, door_h + 0.6), (xo, door_half - 1, door_h + 1.0), "yellow", bevel=0)
    with kit.part("Roof") as b:
        b.box((-xo + wt, -yo + wt, wall_top - 0.4), (xo - wt, yo - wt, wall_top), "slate", bevel=0)
        for y in (-20, 0, 20):
            b.cylinder((-10, y, wall_top), 0.7, 0.9, "metal", segments=8, bevel=0)
            b.cylinder((-10, y, wall_top + 0.9), 0.95, 0.3, "metal", segments=8, top_radius=0.3, bevel=0)
        b.box((5, 18, wall_top), (10, 22, 16), "metal", bevel=0.08)  # AC unit, top at exactly 16


def build(mats, only=None):
    return cm.build_family("shell", mats, only)
