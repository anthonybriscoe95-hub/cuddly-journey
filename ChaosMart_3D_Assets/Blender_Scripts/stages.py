"""Chaos Mart Tycoon: the five store progression stages.

  1 Corner Store   2 Mini Mart   3 Supermarket   4 Mega Mart   5 Luxury Shopping Center

Every stage is assembled from the modular kit (walls, storefronts, doors,
awnings...). This file adds what the stages need on top of the shell kit:
  - luxury facade modules (wall, glass curtain wall, door frame, entrance canopy)
  - a small sign for the corner store
  - a floor, a roof and a plot pad sized for each stage
and `build_stage()`, which places a whole stage (shell, stockroom, interior and
lot dressing) on a plot.

Plot-local coordinates: the plot is centred on the origin, its front (-Y) faces
the plaza. Every stage keeps its entrance at x = DOOR_X so the crosswalk in
front of a plot never moves when the player upgrades. Each stage's plot pad
paints the next stage's footprint as an "expansion zone".
"""

import json
import math
import os

import cm_common as cm
import shell as SH

LAYOUT = json.load(open(os.path.join(cm.HERE, "map_layout.json")))
PLOT_W, PLOT_D = LAYOUT["plot"]["width"], LAYOUT["plot"]["depth"]
DOOR_X = LAYOUT["plot"]["door_x"]
STORE_BACK = PLOT_D / 2 - 4  # every store's back wall sits 4 in from the plot's back edge
STOCK_W, STOCK_D = 51, 76
PARK_Y0, PARK_Y1 = -PLOT_D / 2 + 6, -PLOT_D / 2 + 66  # two rows of 18-deep bays and a 24 aisle
PARK_X0, PARK_X1 = -PLOT_W / 2 + 12, 60  # clear of the lawn trees on the left
PAD_TOP, FLOOR_TOP = 1.0, 1.4

WIDTHS = {"S": 4, "F": 7, "D": 16, "L": 4, "G": 8, "X": 16}
MODULES = {"S": "CM_Shell_Wall_Solid", "F": "CM_Shell_Storefront", "D": "CM_Shell_DoorFrame",
           "L": "CM_Shell_Wall_Luxury", "G": "CM_Shell_GlassCurtain", "X": "CM_Shell_DoorFrame_Luxury"}  # fmt: skip


def mirror(half, door):
    return half + [door] + half[::-1]


STAGES = [
    dict(n=1, name="CornerStore", title="Corner Store", depth=40, sign="CM_Shell_SignBoard_Small",
         front=mirror(["S", "F", "F"], "D")),
    dict(n=2, name="MiniMart", title="Mini Mart", depth=56, sign="CM_Shell_SignBoard",
         front=mirror(["S", "F", "F", "F", "F", "S"], "D")),
    dict(n=3, name="Supermarket", title="Supermarket", depth=88, sign="CM_Shell_SignBoard",
         front=mirror(["S", "F", "F", "F", "S", "S", "F", "F", "F", "S"], "D")),
    dict(n=4, name="MegaMart", title="Mega Mart", depth=104, sign="CM_Shell_SignBoard",
         front=mirror(["S", "S", "S", "F", "F", "F", "F", "S", "S", "F", "F", "F", "F", "S", "S"], "D")),
    dict(n=5, name="LuxuryCenter", title="Luxury Shopping Center", depth=112, sign="CM_Shell_SignBoard", luxury=True,
         front=mirror(["L", "L", "G", "G", "G", "G", "L", "G", "G", "G", "G", "L", "L"], "X")),
]  # fmt: skip

for _s in STAGES:
    _s["inner_w"] = sum(WIDTHS[m] for m in _s["front"])
    _s["w"] = _s["inner_w"] + 2  # outer width (side walls are 1 thick)
    assert (_s["inner_w"] - 8) % 4 == 0, "back wall must close with 4-wide modules plus the staff door"
    assert _s["depth"] % 4 == 0


def stage(n):
    return STAGES[n - 1]


def footprint(st):
    """Store outer rectangle (x0, y0, x1, y1) in plot-local coordinates."""
    return (DOOR_X - st["w"] / 2, STORE_BACK - st["depth"], DOOR_X + st["w"] / 2, STORE_BACK)


def stockroom_centre(st):
    x1 = footprint(st)[2]
    return (x1 + 8 + STOCK_W / 2, STORE_BACK - STOCK_D / 2)


# ---------------------------------------------------------------------------
# Luxury facade modules (same banding heights as the standard kit)
# ---------------------------------------------------------------------------

T = SH.T


def lux_header(b, x0, x1, z0):
    b.box((x0, -T + 0.1, z0), (x1, SH.SKIN, 17.4), "offwhite", bevel=0.03)
    if z0 < 13:
        b.box((x0, -T + 0.02, max(z0, 12)), (x1, -T + 0.1, 13), "gold", bevel=0.03)
    b.box((x0, -T + 0.02, 15.4), (x1, -T + 0.1, 17.4), "navy", bevel=0.03)
    b.front_quad(x0, 15.55, x1, 15.7, -T + 0.008, "gold")
    b.box((x0, -T, 17.4), (x1, T, 18), "gold", bevel=0.05)
    b.box((x0, SH.SKIN, z0), (x1, T, 17.4), "offwhite", bevel=0)


@cm.asset("stages", "CM_Shell_Wall_Luxury", "Buildings", (4, 18, 1), budget="shell",
          notes="Luxury 4-wide wall: navy plinth, cream stone field with a gold-framed panel, gold band.")  # fmt: skip
def wall_luxury(kit):
    with kit.part("Body") as b:
        b.box((-2, -T, 0), (2, -T + 0.1, 2.5), "navy", bevel=0.03)
        b.box((-2, SH.SKIN, 0), (2, T, 0.6), "gold", bevel=0)
        b.box((-2, -T + 0.1, 0), (2, SH.SKIN, 12), "offwhite", bevel=0.03)
        b.box((-2, SH.SKIN, 0.6), (2, T, 12), "offwhite", bevel=0)
        b.front_quad(-1.6, 3.2, 1.6, 11.3, -T + 0.088, "gold")  # frame
        b.front_quad(-1.45, 3.35, 1.45, 11.15, -T + 0.076, "wall_shade")  # panel
        lux_header(b, -2, 2, 12)


@cm.asset("stages", "CM_Shell_GlassCurtain", "Buildings", (8, 18, 1), budget="shell",
          notes="Full-height glass curtain wall module (8 wide) with slim gold mullions; Glass is separate.")  # fmt: skip
def glass_curtain(kit):
    x0, x1, m = -4, 4, 0.2
    with kit.part("Body") as b:
        b.box((x0, -T, 0), (x1, T, 0.8), "navy", bevel=0.03)
        for xa, xb in ((x0, x0 + m), (x1 - m, x1)):
            b.box((xa, -0.3, 0.8), (xb, 0.3, 17.4), "gold", bevel=0)
        for z in (6.4, 12.0):  # transoms
            b.box((x0 + m, -0.25, z), (x1 - m, 0.25, z + 0.2), "gold", bevel=0)
        b.box((x0, -T, 17.4), (x1, T, 18), "gold", bevel=0.05)
    with kit.part("Glass", material="glass") as b:
        for z0, z1 in ((0.8, 6.4), (6.6, 12.0), (12.2, 17.4)):
            b.box((x0 + m, -0.06, z0), (x1 - m, 0.06, z1), "glass", bevel=0)


@cm.asset("stages", "CM_Shell_DoorFrame_Luxury", "Buildings", (16, 18, 1), budget="shell",
          notes="Luxury entrance module: gold jambs, same 14.4 x 12 opening as the standard door frame.")  # fmt: skip
def door_frame_luxury(kit):
    x0, x1, j = -8, 8, 0.8
    with kit.part("Body") as b:
        for xa, xb in ((x0, x0 + j), (x1 - j, x1)):
            b.box((xa, -T + 0.02, 0), (xb, T, 12), "gold", bevel=0.05)
            b.front_quad(xa + 0.3, 0.4, xb - 0.3, 11.6, -T + 0.008, "navy")
        b.box((x0, -T, 11.6), (x1, T, 12), "gold", bevel=0.04)
        lux_header(b, x0, x1, 12)


@cm.asset("stages", "CM_Shell_EntranceCanopy", "Buildings", (24, 13, 10), budget="shell",
          notes="Luxury entrance canopy: 24 wide, projects 10 from the wall (+Y edge mounts on the wall), "
                "underside at 12 on two gold columns. Light is the soffit strip.")  # fmt: skip
def entrance_canopy(kit):
    W, P = 24, 10
    y_wall, y_front = P / 2, -P / 2
    with kit.part("Body") as b:
        b.box((-W / 2, y_front, 12), (W / 2, y_wall, 12.6), "navy", bevel=0.1)
        b.box((-W / 2, y_front, 12.6), (W / 2, y_front + 0.4, 13), "gold", bevel=0.05)  # fascia
        b.box((-W / 2, y_wall - 0.4, 12.6), (W / 2, y_wall, 13), "gold", bevel=0.05)
        for s in (-1, 1):
            x = s * (W / 2 - 1.2)
            b.cylinder((x, y_front + 1.2, 0), cm_exact(0.9, 12), 0.5, "navy", segments=12, bevel=0)
            b.cylinder((x, y_front + 1.2, 0.5), 0.55, 11.5, "gold", segments=12, bevel=0)
    with kit.part("Light") as b:
        b.box((-W / 2 + 2.5, y_front + 1.5, 11.9), (W / 2 - 2.5, y_wall - 1.5, 12.0), "warm_light", bevel=0)


def cm_exact(r, n):
    return r / math.cos(math.pi / n)


@cm.asset("stages", "CM_Shell_SignBoard_Small", "Buildings", (20, 3.6, 0.4), budget="shell",
          notes="Corner-store sign 20 x 3.6; Face is blank, Neon is the outline.")  # fmt: skip
def sign_small(kit):
    W, Hs, D = 20, 3.6, 0.4
    x1, y0 = W / 2, -D / 2
    with kit.part("Body") as b:
        b.box((-x1, y0 + 0.08, 0), (x1, D / 2, Hs), "navy", bevel=0.12)
        for s in (-1, 1):
            b.star((s * (x1 - 1.0), y0 + 0.068, Hs / 2), 0.6, "yellow")
    with kit.part("Face") as b:
        b.box((-x1 + 2.0, y0 + 0.02, 0.4), (x1 - 2.0, y0 + 0.08, Hs - 0.4), "teal", bevel=0)
    with kit.part("Neon") as b:
        t, xo, zo, zt = 0.1, x1 - 1.8, 0.25, Hs - 0.25
        for lo, hi in (((-xo, y0, zo - t), (xo, y0 + 0.08, zo)), ((-xo, y0, zt), (xo, y0 + 0.08, zt + t)),
                       ((-xo - t, y0, zo - t), (-xo, y0 + 0.08, zt + t)), ((xo, y0, zo - t), (xo + t, y0 + 0.08, zt + t))):  # fmt: skip
            b.box(lo, hi, "yellow", bevel=0)


# ---------------------------------------------------------------------------
# Per-stage floor, roof and plot pad
# ---------------------------------------------------------------------------


def _register_stage_assets(st):
    W, D, name = st["w"], st["depth"], st["name"]
    lux = st.get("luxury", False)

    @cm.asset("stages", "CM_Shell_Floor_" + name, "Buildings", (W, 0.4, D), budget="shell",
              notes="%s floor slab under the whole %g x %g shell; 4-stud tiles." % (st["title"], W, D))  # fmt: skip
    def floor(kit):
        with kit.part("Floor") as b:
            b.box((-W / 2, -D / 2, 0), (W / 2, D / 2, 0.4), "offwhite" if not lux else "wall_shade", bevel=0)
            tile = "floor_tile" if not lux else "offwhite"
            nx, ny = int((W - 2) // 4), int((D - 2) // 4)
            x0, y0 = -(W - 2) / 2, -(D - 2) / 2
            for i in range(nx):
                for j in range(ny):
                    if (i + j) % 2 == 0:
                        b.top_quad(x0 + i * 4, y0 + j * 4, x0 + i * 4 + 4, y0 + j * 4 + 4, 0.401, tile)
            b.top_quad(-12, -D / 2 + 0.6, 12, -D / 2 + 6, 0.402, "teal" if not lux else "velvet")  # entrance mat

    rw, rd = W - 2, D - 2

    @cm.asset("stages", "CM_Shell_Roof_" + name, "Buildings", (rw, None, rd), budget="shell",
              notes="%s roof; pivot at z = 17.4 inside the walls. Glass is the skylights." % st["title"])  # fmt: skip
    def roof(kit):
        n_sky = max(1, int(rw // 44))
        with kit.part("Roof") as b:
            b.box((-rw / 2, -rd / 2, 0), (rw / 2, rd / 2, 0.6), "stockroom" if not lux else "slate", bevel=0)
            for k in range(n_sky):
                x = -rw / 2 + rw * (k + 0.5) / n_sky
                b.box((x - 5, -6, 0.6), (x + 5, 6, 1.1), "slate" if not lux else "gold", bevel=0.05)
            for k in range(max(1, n_sky - 1)):  # HVAC units along the back
                x = -rw / 2 + rw * (k + 1) / (n_sky + 1) if n_sky > 1 else rw / 4
                y = rd / 2 - 8
                b.box((x - 2.5, y - 2, 0.6), (x + 2.5, y + 2, 0.9), "slate", bevel=0)
                b.box((x - 2.3, y - 1.8, 0.9), (x + 2.3, y + 1.8, 3.2), "metal", bevel=0.1)
                b.cylinder((x + 1.25, y, 3.2), 0.85, 0.4, "slate", segments=10, bevel=0)
                b.disc((x + 1.25, y, 3.6), 0.72, "dark", segments=10, facing="+Z")
        with kit.part("Glass", material="glass") as b:
            for k in range(n_sky):
                x = -rw / 2 + rw * (k + 0.5) / n_sky
                b.hexa([(x - 4.6, -5.6, 1.1), (x + 4.6, -5.6, 1.1), (x + 4.6, 5.6, 1.1), (x - 4.6, 5.6, 1.1),
                        (x - 4.6, -5.6, 1.1), (x + 4.6, -5.6, 1.1), (x + 4.6, 0, 2.4), (x - 4.6, 0, 2.4)], "glass")  # fmt: skip
                b.hexa([(x - 4.6, 0, 1.1), (x + 4.6, 0, 1.1), (x + 4.6, 5.6, 1.1), (x - 4.6, 5.6, 1.1),
                        (x - 4.6, 0, 2.4), (x + 4.6, 0, 2.4), (x + 4.6, 5.6, 1.1), (x - 4.6, 5.6, 1.1)], "glass")  # fmt: skip

    nxt = STAGES[st["n"]] if st["n"] < len(STAGES) else None

    @cm.asset("stages", "CM_Plot_Pad_" + name, "Environment", (PLOT_W, 1.0, PLOT_D), budget="shell",
              notes="%s plot foundation %g x %g: parking, walkway to the door, loading apron%s." % (
                  st["title"], PLOT_W, PLOT_D, ", and the next stage's footprint painted as an expansion zone" if nxt else ""))  # fmt: skip
    def pad(kit):
        x1, y1 = PLOT_W / 2, PLOT_D / 2
        z = 1.0 + 0.003
        fx0, fy0, fx1, fy1 = footprint(st)
        with kit.part("Pad") as b:
            b.box((-x1, -y1, 0), (x1, y1, 1.0), "concrete", bevel=0.1)
            b.top_quad(-x1, -y1, -x1 + 4, y1, z, "grass")
            b.top_quad(x1 - 4, -y1, x1, y1, z, "grass")
            b.top_quad(-x1 + 4, y1 - 4, x1 - 4, y1, z, "grass")
            # parking: 9-wide bays either side of a 24-wide aisle, skipping the walkway
            px0, px1 = PARK_X0, PARK_X1
            b.top_quad(px0, PARK_Y0, px1, PARK_Y1, z, "asphalt")
            mid = (PARK_Y0 + PARK_Y1) / 2
            x = px0
            while x <= px1 + 0.01:
                if abs(x - DOOR_X) > 9.5:
                    xa, xb = max(x - 0.15, px0), min(x + 0.15, px1)
                    b.top_quad(xa, PARK_Y0 + 1, xb, mid - 12, z + 0.003, "offwhite")
                    b.top_quad(xa, mid + 12, xb, PARK_Y1 - 1, z + 0.003, "offwhite")
                x += 9
            # walkway from the plot front to the door, over the lot
            b.top_quad(DOOR_X - 9, -y1, DOOR_X + 9, PARK_Y0, z, "paver_sand")
            b.top_quad(DOOR_X - 9, PARK_Y0, DOOR_X + 9, PARK_Y1, z + 0.006, "paver_sand")
            b.top_quad(DOOR_X - 9, PARK_Y1, DOOR_X + 9, fy0, z, "paver_sand")
            # loading apron in front of the stockroom's roll-up door
            sx_, sy_ = stockroom_centre(st)
            b.top_quad(sx_ + STOCK_W / 2, sy_ - 16, x1 - 4, sy_ + 16, z, "asphalt")
            for k in range(5):  # chevrons guiding the truck in
                yy = sy_ - 12 + k * 6
                b.top_quad(sx_ + STOCK_W / 2 + 3, yy, sx_ + STOCK_W / 2 + 9, yy + 0.6, z + 0.003, "yellow")
            if nxt:  # dashed outline of the next stage's footprint
                nx0, ny0, nx1, ny1 = footprint(nxt)
                ny0 = max(ny0, PARK_Y1 + 2)
                t, dash = 0.6, 4.0
                for (ax, ay, bx, by) in ((nx0, ny0, nx1, ny0), (nx0, ny0, nx0, ny1), (nx1, ny0, nx1, ny1)):
                    length = math.hypot(bx - ax, by - ay)
                    k = 0
                    while k * 2 * dash < length:
                        s0, s1 = k * 2 * dash / length, min(1.0, (k * 2 * dash + dash) / length)
                        xa, ya = ax + (bx - ax) * s0, ay + (by - ay) * s0
                        xb, yb = ax + (bx - ax) * s1, ay + (by - ay) * s1
                        inside_store = fx0 - 0.5 < (xa + xb) / 2 < fx1 + 0.5 and fy0 - 0.5 < (ya + yb) / 2
                        if not inside_store:
                            b.top_quad(min(xa, xb) - t / 2 * (ay != by), min(ya, yb) - t / 2 * (ax != bx),
                                       max(xa, xb) + t / 2 * (ay != by), max(ya, yb) + t / 2 * (ax != bx), z + 0.003, "teal")  # fmt: skip
                        k += 1


for _s in STAGES:
    _register_stage_assets(_s)


# ---------------------------------------------------------------------------
# Interiors (store-local: origin at the store centre, front wall at -depth/2)
# ---------------------------------------------------------------------------

GONDOLA = {"Snack": "CM_Fixture_SnackShelf", "Water": "CM_Fixture_WaterShelf",
           "Premium": "CM_Fixture_PremiumShelf", "Toy": "CM_Fixture_ToyShelf"}  # fmt: skip


def interior(st):
    """[(asset, x, y, z_offset, rot)] for the stage's fixtures (store-local)."""
    hw, hd = st["inner_w"] / 2, st["depth"] / 2 - 1
    yb = hd - 3.1  # back-wall cooler centre
    n = st["n"]
    out = []

    def add(a, x, y, rot=0.0, z=0.0):
        out.append((a, x, y, z, rot))

    if n == 1:
        add("CM_Fixture_CheckoutLane", -14, -hd + 7)
        add("CM_Fixture_SnackShelf", 6, -1)
        add("CM_Fixture_WaterShelf", 6, 9)
        add("CM_Fixture_DrinkCooler", -hw + 3.1, 0, rot=90)  # on the left wall, facing in
        add("CM_Interior_VendingMachine", 21, -hd + 2.5)
        add("CM_Interior_WallDecal", 6, hd - 0.1, z=6.5, rot=180)
    elif n == 2:
        for k, x in enumerate((-31, -22)):
            add("CM_Fixture_CheckoutLane", x, -hd + 9)
        add("CM_Decor_CheckoutSign", -26.5, -hd + 15, z=9.5)
        for (x, y, g) in ((-24, -3, "Snack"), (24, -3, "Water"), (-24, 9, "Premium"), (24, 9, "Toy")):
            add(GONDOLA[g], x, y)
        for x, a in ((-26, "CM_Fixture_DrinkCooler"), (0, "CM_Fixture_DairyFridge"), (26, "CM_Fixture_ProduceFridge")):
            add(a, x, yb)
        add("CM_Fixture_ProduceStand", 26, -hd + 9)
    elif n == 3:
        for k in range(4):
            add("CM_Fixture_CheckoutLane", -54 + k * 9, -hd + 10)
        add("CM_Decor_CheckoutSign", -40.5, -hd + 16, z=9.5)
        rows = [("Snack", "Water"), ("Premium", "Toy"), ("Snack", "Water")]
        for r, y in enumerate((-hd + 28, -hd + 44, -hd + 60)):
            for c, x in enumerate((-38, 2)):
                add(GONDOLA[rows[r][c]], x, y)
        for x, a in ((-44, "CM_Fixture_DrinkCooler"), (-14, "CM_Fixture_DairyFridge"), (16, "CM_Fixture_ProduceFridge")):
            add(a, x, yb)
        add("CM_Fixture_ProduceStand", hw - 17, -hd + 30)
        add("CM_Fixture_BakeryCase", hw - 17, -hd + 50)
        add("CM_Fixture_SnackBin", 40, -hd + 14)
    else:
        lux = n == 5
        for k in range(6):
            add("CM_Fixture_CheckoutLane", -80 + k * 9, -hd + 12)
        add("CM_Decor_CheckoutSign", -71.5, -hd + 18, z=9.5)
        add("CM_Decor_CheckoutSign", -48.5, -hd + 18, z=9.5)
        for k in range(4 if lux else 3):
            add("CM_Interior_SelfCheckout", 18 + k * 7, -hd + 8)
        add("CM_Interior_ServiceDesk", 72, -hd + 6)
        kinds = [("Premium", "Snack", "Water", "Premium"), ("Toy", "Water", "Snack", "Toy"), ("Snack", "Premium", "Toy", "Water")] if lux \
            else [("Snack", "Water", "Snack", "Water"), ("Premium", "Toy", "Premium", "Toy"), ("Water", "Snack", "Water", "Snack")]  # fmt: skip
        y_rows = (-hd + 32, -hd + 48, -hd + 64)
        for r, y in enumerate(y_rows):
            for c, x in enumerate((-62, -28, 28, 62)):
                add("CM_Shelf_Double_Aisle" if r == 1 else GONDOLA[kinds[r][c]], x, y)  # middle row is shopped from both sides
            for s in (-1, 1):
                add("CM_Fixture_Endcap", s * 80.5, y)
        coolers = ["CM_Fixture_DrinkCooler", "CM_Fixture_DairyFridge", "CM_Fixture_ProduceFridge", "CM_Fixture_DrinkCooler", "CM_Fixture_DairyFridge"]
        for x, a in zip((-74, -46, -18, 10, 38), coolers):
            add(a, x, yb)
        for x in (66, 80):
            add("CM_Fixture_FreezerChest", x, yb + 0.5)
        mid_y = (y_rows[-1] + 2.5 + yb - 3) / 2
        add("CM_Fixture_ProduceStand", -50, mid_y)
        add("CM_Fixture_BakeryCase", -20, mid_y)
        add("CM_Fixture_BakeryCase" if lux else "CM_Fixture_SnackBin", 18 if lux else 20, mid_y)
        add("CM_Fixture_ProduceStand", 55, mid_y)
        if lux:
            for s in (-1, 1):
                add("CM_Interior_DigitalAdScreen", s * 14, -hd + 4)
            add("CM_Interior_VendingMachine", 86, -hd + 22, rot=90)
    return out


def fixture_rect(asset, x, y, rot, size_of):
    """Floor rectangle (x0, y0, x1, y1) of a placed fixture (rotations in 90 degree steps)."""
    w, d = size_of(asset)
    if int(round(rot / 90)) % 2:
        w, d = d, w
    return (x - w / 2, y - d / 2, x + w / 2, y + d / 2)


HANGING = {"CM_Decor_CheckoutSign", "CM_Interior_WallDecal"}


def check_layout(st, size_of):
    """Fixtures must stay inside the walls, clear of each other and of the entrance aisle."""
    hw, hd = st["inner_w"] / 2, st["depth"] / 2 - 1
    rects = [(a, fixture_rect(a, x, y, r, size_of)) for a, x, y, z, r in interior(st) if a not in HANGING]
    problems = []
    entrance = (-9, -hd, 9, -hd + 14)
    for i, (a, (x0, y0, x1, y1)) in enumerate(rects):
        if x0 < -hw - 1e-6 or x1 > hw + 1e-6 or y0 < -hd - 1e-6 or y1 > hd + 1e-6:
            problems.append("%s: %s outside the walls" % (st["name"], a))
        if x0 < entrance[2] and x1 > entrance[0] and y0 < entrance[3] and y1 > entrance[1]:
            problems.append("%s: %s blocks the entrance" % (st["name"], a))
        for b_, (u0, v0, u1, v1) in rects[i + 1:]:
            if x0 < u1 - 1e-6 and x1 > u0 + 1e-6 and y0 < v1 - 1e-6 and y1 > v0 + 1e-6:
                problems.append("%s: %s overlaps %s" % (st["name"], a, b_))
    return problems


# ---------------------------------------------------------------------------
# Placing a whole stage on a plot
# ---------------------------------------------------------------------------


def build_stage(st, put, index=0):
    """Place stage `st` on a plot. put(asset, x, y, z, rot) takes plot-local coordinates."""
    fx0, fy0, fx1, fy1 = footprint(st)
    W, D = st["w"], st["depth"]
    cx, cy = DOOR_X, (fy0 + fy1) / 2
    lux = st.get("luxury", False)
    solid = "L" if lux else "S"
    yf, yb = fy0 + 0.5, fy1 - 0.5

    put("CM_Plot_Pad_" + st["name"], 0, 0, 0, 0)
    put("CM_Shell_Floor_" + st["name"], cx, cy, PAD_TOP, 0)

    x = fx0 + 1
    for m in st["front"]:
        mx = x + WIDTHS[m] / 2
        put(MODULES[m], mx, yf, FLOOR_TOP, 0)
        if m in "DX":
            put("CM_Shell_SlidingDoor", mx, yf, FLOOR_TOP, 0)
        x += WIDTHS[m]

    n_back = int((st["inner_w"] - 8) / 4)
    staff_at = n_back - 2
    x = fx0 + 1
    for i in range(n_back + 1):
        if i == staff_at:
            put("CM_Shell_StaffDoor", x + 4, yb, FLOOR_TOP, 180)
            x += 8
        else:
            put(MODULES[solid], x + 2, yb, FLOOR_TOP, 180)
            x += 4
    for i in range(int(D / 4)):
        y = fy0 + 2 + i * 4
        put(MODULES[solid], fx0 + 0.5, y, FLOOR_TOP, -90)
        put(MODULES[solid], fx1 - 0.5, y, FLOOR_TOP, 90)
    put("CM_Shell_Roof_" + st["name"], cx, cy, FLOOR_TOP + 17.4, 0)

    # facade
    put(st["sign"], cx, fy0 - 0.2, FLOOR_TOP + (13.2 if st["n"] == 1 else 12.9), 0)
    if lux:
        put("CM_Shell_EntranceCanopy", cx, fy0 - 5, PAD_TOP, 0)
        put("CM_Prop_MiniMartSign", cx, fy0 + 12, FLOOR_TOP + 17.4 + 0.6, 0)  # stands on the roof slab
        for s in (-1, 1):
            put("CM_Shell_Pillar", (fx0 - 1) if s < 0 else (fx1 + 1), fy0 - 1, PAD_TOP, 0)
            put("CM_Tycoon_VIPRope", cx + s * 7, fy0 - 9, PAD_TOP, 90)  # lines the walk under the canopy
        put("CM_Event_RedCarpet", cx, fy0 - 14, PAD_TOP, 0)
    else:
        awning_rise = 0.8 + 6.5 * math.tan(math.radians(16)) + 0.12
        x = fx0 + 1
        run = []
        for m in st["front"] + ["S"]:
            if m == "F":
                run.append(x)
            elif run:
                start, width = run[0], 7 * len(run)
                n_aw = int(width // 4)
                pad = (width - 4 * n_aw) / 2
                for k in range(n_aw):
                    put("CM_Shell_Awning", start + pad + 2 + 4 * k, fy0 - 3.25, FLOOR_TOP + 12 - awning_rise, 0)
                run = []
            x += WIDTHS[m]
        x = fx0 + 1
        for m in st["front"]:
            if m == "S":
                put("CM_Shell_WallLight", x + 2, fy0 - 0.45, FLOOR_TOP + 8.6, 0)
            x += WIDTHS[m]
    for s in (-1, 1):
        put("CM_Shell_Planter", cx + s * (14.5 if lux else 10.5), fy0 - (12.5 if lux else 6.5), PAD_TOP, 0)

    # stockroom, loading and lot dressing
    sx_, sy_ = stockroom_centre(st)
    put("CM_Shell_Stockroom", sx_, sy_, PAD_TOP, 0)
    put("CM_Shell_Dumpster", sx_ + STOCK_W / 2 + 6, sy_ + 30, PAD_TOP, 90)
    put("CM_Prop_DeliveryTruck", sx_ + STOCK_W / 2 + 7.5, sy_ + 4, PAD_TOP, 0)
    put("CM_Tycoon_DeliveryStation", sx_ + STOCK_W / 2 + 7.5, sy_ - 26, PAD_TOP, 90)
    put("CM_Tycoon_PurchasePad", cx - 22, fy0 - 9 if not lux else fy0 - 20, PAD_TOP, 0)
    put("CM_Tycoon_UpgradePad", cx + 22, fy0 - 9 if not lux else fy0 - 20, PAD_TOP, 0)
    if st["n"] < len(STAGES):  # stands inside the next stage's footprint, clear of this stage
        nx0, ny0, nx1, ny1 = footprint(STAGES[st["n"]])
        if nx0 < fx0 - 8:
            put("CM_Tycoon_ExpansionSign", (nx0 + fx0) / 2, max(ny0, PARK_Y1 + 2) + 6, PAD_TOP, 0)
        else:
            put("CM_Tycoon_ExpansionSign", DOOR_X + 40, (ny0 + fy0) / 2, PAD_TOP, 0)
    put("CM_Prop_PlotBanner", PLOT_W / 2 - 10, -PLOT_D / 2 + 6, PAD_TOP, 0)

    cars = ["CM_Prop_ParkedCar_Red", "CM_Prop_ParkedCar_Blue", "CM_Prop_ParkedCar_Yellow"]
    mid = (PARK_Y0 + PARK_Y1) / 2
    bays = [PARK_X0 + 4.5 + 9 * k for k in range(int((PARK_X1 - PARK_X0) / 9))]
    bays = [b for b in bays if abs(b - DOOR_X) > 10]
    busy = st["n"] + 1  # bigger stores, busier lots
    for k, bx in enumerate(bays):
        if (k * 7 + index * 3) % 7 < busy:
            put(cars[(k + index) % 3], bx, (PARK_Y0 + mid - 12) / 2 + 0.5, PAD_TOP, 180)
        if (k * 5 + index) % 9 < busy:
            put(cars[(k + index + 1) % 3], bx, (mid + 12 + PARK_Y1) / 2 - 0.5, PAD_TOP, 0)
    tree_x = -PLOT_W / 2 + 5  # canopy reaches the plot edge
    for y in range(-90, 91, 30):  # side-lawn trees, wherever the store isn't
        if tree_x + 5 < fx0 or y + 5 < fy0:
            put("CM_Prop_Tree_Round" if (y // 30) % 2 else "CM_Prop_Tree_Pine", tree_x, y, PAD_TOP, 0)

    # interior
    for a, x, y, z, rot in interior(st):
        put(a, cx + x, cy + y, FLOOR_TOP + z, rot)


def build(mats, only=None):
    return cm.build_family("stages", mats, only)


GROUND_SKIP = ("CM_Plot_Pad_", "CM_Shell_Floor_", "CM_Event_RedCarpet", "CM_Shell_EntranceCanopy")  # flat, or overhead


def check_lot(st, size_of):
    """Everything standing on the plot must stay on the plot and clear of everything else."""
    placed = []
    build_stage(st, lambda a, x, y, z, rot: placed.append((a, x, y, z, rot)))
    fx0, fy0, fx1, fy1 = footprint(st)
    rects = [("store", (fx0, fy0, fx1, fy1))]
    for a, x, y, z, rot in placed:
        if abs(z - PAD_TOP) > 1e-6 or a.startswith(GROUND_SKIP):
            continue
        rects.append((a, fixture_rect(a, x, y, rot, size_of)))
    problems = []
    for i, (a, (x0, y0, x1, y1)) in enumerate(rects):
        if x0 < -PLOT_W / 2 - 1e-6 or x1 > PLOT_W / 2 + 1e-6 or y0 < -PLOT_D / 2 - 1e-6 or y1 > PLOT_D / 2 + 1e-6:
            problems.append("%s lot: %s off the plot" % (st["name"], a))
        for b_, (u0, v0, u1, v1) in rects[i + 1:]:
            if x0 < u1 - 1e-6 and x1 > u0 + 1e-6 and y0 < v1 - 1e-6 and y1 > v0 + 1e-6:
                problems.append("%s lot: %s overlaps %s" % (st["name"], a, b_))
    return problems
