"""Chaos Mart Tycoon: lot, plaza and street props.

All props stand on z = 0 with a bottom-centre pivot and their front facing -Y.
Blank faces (sign boards, flags, leaderboard) are separate parts named Face or
Flag so the game can put a SurfaceGui on them.
"""

import math

import cm_common as cm


def exact(r, n):
    """Radius that makes an n-sided prism's flats measure 2r across."""
    return r / math.cos(math.pi / n)


# ---------------------------------------------------------------------------
# Vehicles
# ---------------------------------------------------------------------------


def car_body(b, paint):
    """Compact car 6 x 4 x 11, nose toward -Y."""
    w, L = 3.0, 5.5
    b.box((-w + 0.2, -L + 0.012, 0.7), (w - 0.2, L - 0.012, 2.2), paint, bevel=0.15)  # lower body
    b.hexa([(-w + 0.35, -2.4, 2.2), (w - 0.35, -2.4, 2.2), (w - 0.35, 3.6, 2.2), (-w + 0.35, 3.6, 2.2),
            (-w + 0.65, -0.9, 3.85), (w - 0.65, -0.9, 3.85), (w - 0.65, 3.0, 3.85), (-w + 0.65, 3.0, 3.85)], paint, bevel=0.12)  # fmt: skip
    b.box((-w + 0.8, -0.6, 3.85), (w - 0.8, 2.7, 4.0), "offwhite", bevel=0.05)  # roof panel
    # windows (decals on the cabin)
    b.poly([(-w + 0.6, -2.35, 2.35), (w - 0.6, -2.35, 2.35), (w - 0.8, -1.0, 3.7), (-w + 0.8, -1.0, 3.7)], "navy")  # windscreen
    b.poly([(w - 0.8, 2.95, 3.7), (-w + 0.8, 2.95, 3.7), (-w + 0.6, 3.55, 2.35), (w - 0.6, 3.55, 2.35)], "navy")  # rear
    for s in (-1, 1):
        x = s * (w - 0.35 + 0.012)
        xi = s * (w - 0.62)
        pts = [(x, -2.2, 2.3), (x, 3.4, 2.3), (xi + s * 0.04, 2.9, 3.7), (xi + s * 0.04, -0.85, 3.7)]
        b.poly(pts if s > 0 else pts[::-1], "navy")
        b.quad([(s * (w - 0.188), -L + 0.6, 1.35), (s * (w - 0.188), L - 0.6, 1.35), (s * (w - 0.188), L - 0.6, 1.55), (s * (w - 0.188), -L + 0.6, 1.55)][:: 1 if s > 0 else -1], "offwhite")  # fmt: skip
    for s in (-1, 1):  # lights
        b.front_quad(s * 2.1 - 0.5, 1.5, s * 2.1 + 0.5, 1.9, -L, "warm_light")
        b.quad([(s * 2.1 + 0.5, L, 1.5), (s * 2.1 - 0.5, L, 1.5), (s * 2.1 - 0.5, L, 1.9), (s * 2.1 + 0.5, L, 1.9)], "red")
    b.front_quad(-1.2, 0.85, 1.2, 1.2, -L, "dark")  # grille
    for x in (-w + 0.712, w - 0.712):  # wheels: flats touch the ground, hubs flush with the sides
        for y in (-3.4, 3.4):
            b.at((x, y, 0.9), rot_y_deg=90)
            b.cylinder((0, 0, -0.7), exact(0.9, 12), 1.4, "dark", segments=12, bevel=0)
            b.at()
            s = 1 if x > 0 else -1
            b.disc((x + s * 0.712, y, 0.9), 0.45, "metal", segments=8, facing="+X" if s > 0 else "-X")


def _register_car(name, paint):
    @cm.asset("props", "CM_Prop_ParkedCar_" + name, "Environment", (6, None, 11), budget="prop",
              notes="Stylised compact car, nose toward -Y; colour variant %s." % name)  # fmt: skip
    def _build(kit):
        with kit.part("Body") as b:
            car_body(b, paint)


for _n, _p in (("Red", "red"), ("Blue", "kiosk_blue"), ("Yellow", "yellow")):
    _register_car(_n, _p)


@cm.asset("props", "CM_Prop_DeliveryTruck", "Environment", (8, None, 22), budget="prop",
          notes="Box truck for the Surprise Delivery event; RearDoor is separate so it can roll up.")  # fmt: skip
def delivery_truck(kit):
    w = 4.0
    with kit.part("Body") as b:
        b.box((-w + 0.3, -10.9, 0.9), (w - 0.3, 10.7, 1.6), "dark", bevel=0.05)  # chassis
        b.box((-w + 0.2, -10.988, 1.6), (w - 0.2, -5, 4.2), "teal", bevel=0.2)  # cab
        b.hexa([(-w + 0.4, -10.988, 4.2), (w - 0.4, -10.988, 4.2), (w - 0.4, -6.4, 4.2), (-w + 0.4, -6.4, 4.2),
                (-w + 0.6, -9.6, 6.0), (w - 0.6, -9.6, 6.0), (w - 0.6, -6.4, 6.0), (-w + 0.6, -6.4, 6.0)], "teal", bevel=0.15)  # fmt: skip
        b.poly([(-w + 0.7, -10.97, 4.4), (w - 0.7, -10.97, 4.4), (w - 0.8, -9.74, 5.8), (-w + 0.8, -9.74, 5.8)], "navy")
        b.box((-w + 0.012, -4.8, 1.6), (w - 0.012, 10.75, 9.0), "offwhite", bevel=0.2)  # cargo box
        for zz, c in ((2.4, "teal"), (3.2, "yellow")):  # livery stripes on both sides
            for s in (-1, 1):
                pts = [(s * w, -4.2, zz), (s * w, 10.4, zz), (s * w, 10.4, zz + 0.6), (s * w, -4.2, zz + 0.6)]
                b.quad(pts if s > 0 else pts[::-1], c)
        for s in (-1, 1):
            b.star((s * w, 3.5, 6.2), 1.6, "yellow", facing="+X" if s > 0 else "-X")  # star logo
            b.front_quad(s * 2.6 - 0.5, 2.2, s * 2.6 + 0.5, 2.7, -11.0, "warm_light")
        b.front_quad(-1.6, 1.8, 1.6, 2.6, -11.0, "dark")
        for x in (-w + 0.812, w - 0.812):
            for y in (-8, 5, 8):
                b.at((x, y, 1.1), rot_y_deg=90)
                b.cylinder((0, 0, -0.8), exact(1.1, 12), 1.6, "dark", segments=12, bevel=0)
                b.at()
                s = 1 if x > 0 else -1
                b.disc((x + s * 0.812, y, 1.1), 0.55, "metal", segments=8, facing="+X" if s > 0 else "-X")
    with kit.part("RearDoor") as b:
        b.box((-w + 0.4, 10.75, 1.9), (w - 0.4, 10.988, 8.7), "metal", bevel=0)
        for k in range(8):
            z = 2.4 + k * 0.8
            b.quad([(w - 0.5, 11.0, z), (-w + 0.5, 11.0, z), (-w + 0.5, 11.0, z + 0.08), (w - 0.5, 11.0, z + 0.08)], "stockroom")


# ---------------------------------------------------------------------------
# Plants
# ---------------------------------------------------------------------------


@cm.asset("props", "CM_Prop_Tree_Round", "Environment", (10, 16, 10), budget="prop",
          notes="Broadleaf tree: canopy 10 across, 16 tall overall.")  # fmt: skip
def tree_round(kit):
    with kit.part("Trunk") as b:
        b.cylinder((0, 0, 0), 0.75, 7.5, "wood", segments=8, top_radius=0.5, bevel=0)
        for a in (40, 160, 280):  # root flare
            b.at((0, 0, 0), rot_z_deg=a)
            b.hexa([(0.3, -0.35, 0), (1.3, -0.25, 0), (1.3, 0.25, 0), (0.3, 0.35, 0),
                    (0.3, -0.25, 1.2), (0.5, -0.1, 0.25), (0.5, 0.1, 0.25), (0.3, 0.25, 1.2)], "wood")  # fmt: skip
        b.at()
    with kit.part("Canopy") as b:
        b.ellipsoid((0, 0, 10.4), (5, 5, 3.6), "shrub", segments=12, rings=6)
        b.ellipsoid((-1.2, 0.8, 13.0), (3.0, 3.0, 2.6), "leaf_green", segments=12, rings=6)
        b.ellipsoid((1.6, -0.9, 12.6), (2.6, 2.6, 2.2), "grass", segments=12, rings=6)
        b.ellipsoid((0.2, -0.2, 14.4), (1.8, 1.8, 1.6), "leaf_green", segments=8, rings=5)


@cm.asset("props", "CM_Prop_Tree_Pine", "Environment", (10, 16, 10), budget="prop",
          notes="Tiered pine: three stacked cones, 10 across at the base, 16 tall.")  # fmt: skip
def tree_pine(kit):
    with kit.part("Trunk") as b:
        b.cylinder((0, 0, 0), 0.6, 4.0, "wood", segments=8, top_radius=0.45, bevel=0)
    with kit.part("Canopy") as b:
        for z, r, h, c in ((3.0, 5.0, 6.0, "shrub"), (6.6, 3.9, 5.2, "grass_dark"), (9.8, 2.8, 6.2, "shrub")):
            b.cylinder((0, 0, z), exact(r, 12), h, c, segments=12, top_radius=0.0, bevel=0)


@cm.asset("props", "CM_Prop_Bush", "Environment", (4, None, 3), budget="prop", notes="Low clipped hedge bush.")
def bush(kit):
    with kit.part("Body") as b:
        b.ellipsoid((-0.8, 0, 1.3), (1.2, 1.5, 1.3), "shrub", segments=12, rings=6)
        b.ellipsoid((0.9, 0.1, 1.1), (1.1, 1.3, 1.1), "grass_dark", segments=12, rings=6)


@cm.asset("props", "CM_Prop_FlowerPlanter", "Environment", (4, None, 4), budget="prop",
          notes="Round planter with flowers; the flower heads are decals on the soil mound.")  # fmt: skip
def flower_planter(kit):
    with kit.part("Body") as b:
        b.ring((0, 0, 0), 2.0, 1.6, 1.6, "teal", segments=16)
        b.cylinder((0, 0, 0), exact(1.65, 16), 1.4, "bread_dark", segments=16, bevel=0)
        b.ellipsoid((0, 0, 1.4), (1.55, 1.55, 0.7), "shrub", segments=12, rings=5)
        for i, c in enumerate(("candy_pink", "yellow", "red", "offwhite", "candy_pink", "yellow")):
            a = 2 * math.pi * i / 6
            x, y = 0.95 * math.cos(a), 0.95 * math.sin(a)
            b.ellipsoid((x, y, 1.85), (0.28, 0.28, 0.16), c, segments=6, rings=3)
        b.ellipsoid((0, 0, 2.15), (0.32, 0.32, 0.18), "red", segments=6, rings=3)


# ---------------------------------------------------------------------------
# Street furniture
# ---------------------------------------------------------------------------


@cm.asset("props", "CM_Prop_StreetLamp", "Environment", (None, 12, None), budget="prop", recentre=True,
          notes="12-high street lamp; arm reaches toward -Y. Light is the lamp face (set Neon at night).")  # fmt: skip
def street_lamp(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), 0.7, 0.6, "navy", segments=8, top_radius=0.5, bevel=0)
        b.cylinder((0, 0, 0.6), 0.25, 10.9, "slate", segments=8, top_radius=0.18, bevel=0)
        b.sweep([(0, 0, 11.2), (0, -0.8, 11.65), (0, -2.0, 11.75)], [0.16, 0.14, 0.14], "slate", sides=6)
        b.box((-0.7, -3.4, 11.4), (0.7, -1.9, 12.0), "navy", bevel=0.1)  # head
    with kit.part("Light") as b:
        b.box((-0.55, -3.25, 11.35), (0.55, -2.05, 11.4), "warm_light", bevel=0)


@cm.asset("props", "CM_Prop_Bench", "Environment", (10, 2, 3), budget="prop",
          notes="Backless plaza bench, 10 x 2 x 3: wooden slats on two slate frames.")  # fmt: skip
def bench(kit):
    with kit.part("Body") as b:
        for s in (-1, 1):
            x = s * 3.8
            b.box((x - 0.25, -1.5, 0), (x + 0.25, 1.5, 0.3), "slate", bevel=0.05)
            b.box((x - 0.2, -1.2, 0.3), (x + 0.2, 1.2, 1.6), "slate", bevel=0.05)
        for k in range(4):
            y = -1.5 + k * 0.78
            b.box((-5, y, 1.6), (5, y + 0.66, 2.0), "wood", bevel=0.08)


@cm.asset("props", "CM_Prop_TrashCan", "Environment", (None, 3.6, None), budget="prop",
          notes="Round street bin with a domed lid and a teal band.")  # fmt: skip
def trash_can(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), 1.1, 2.8, "slate", segments=12, top_radius=1.2, bevel=0)
        b.cylinder((0, 0, 1.6), 1.17, 0.5, "teal", segments=12, top_radius=1.19, bevel=0, cap=False)
        b.cylinder((0, 0, 2.8), 1.3, 0.25, "navy", segments=12, bevel=0)
        b.ellipsoid((0, 0, 3.05), (1.1, 1.1, 0.55), "navy", segments=12, rings=4)
        b.front_quad(-0.45, 3.0, 0.45, 3.25, -1.06, "dark")  # slot


@cm.asset("props", "CM_Prop_TrafficLight", "Environment", (None, 14, None), budget="prop", recentre=True,
          notes="Pole with an arm reaching -Y and a three-lamp head. LampRed/Amber/Green are separate parts.")  # fmt: skip
def traffic_light(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), 0.6, 0.4, "navy", segments=8, bevel=0)
        b.cylinder((0, 0, 0.4), 0.28, 13.6, "slate", segments=8, bevel=0)
        b.box((-0.18, -8.0, 12.4), (0.18, 0, 12.8), "slate", bevel=0)  # arm
        b.box((-0.75, -8.4, 9.4), (0.75, -7.4, 13.6), "navy", bevel=0.12)  # head
        b.box((-0.35, -0.6, 3.2), (0.35, -0.28, 4.4), "navy", bevel=0.05)  # push button box
        b.disc((0, -0.61, 3.9), 0.15, "yellow", segments=6)
    for name, z, c in (("LampRed", 12.8, "red"), ("LampAmber", 11.5, "yellow"), ("LampGreen", 10.2, "leaf_green")):
        with kit.part(name) as b:
            b.disc((0, -8.42, z), 0.45, c, segments=10)
            b.box((-0.5, -8.75, z + 0.35), (0.5, -8.4, z + 0.45), "navy", bevel=0)  # visor


@cm.asset("props", "CM_Prop_StreetSign", "Environment", (None, 10, None), budget="prop", recentre=True,
          notes="Directional signpost with three blank arrow blades (Blade1-3) for SurfaceGui text.")  # fmt: skip
def street_sign(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), 0.5, 0.3, "navy", segments=8, bevel=0)
        b.cylinder((0, 0, 0.3), 0.2, 9.7, "slate", segments=8, bevel=0)
    for i, (z, ang, c) in enumerate(((8.6, 0, "teal"), (7.4, 180, "yellow"), (6.2, 90, "red")), start=1):
        with kit.part("Blade%d" % i) as b:
            b.at((0, 0, z), rot_z_deg=ang)
            L = 4.2
            b.hexa([(0.25, -0.1, -0.45), (L - 0.6, -0.1, -0.45), (L - 0.6, 0.1, -0.45), (0.25, 0.1, -0.45),
                    (0.25, -0.1, 0.45), (L - 0.6, -0.1, 0.45), (L - 0.6, 0.1, 0.45), (0.25, 0.1, 0.45)], c, bevel=0.04)  # fmt: skip
            b.hexa([(L - 0.6, -0.1, -0.45), (L, -0.1, 0.0), (L, 0.1, 0.0), (L - 0.6, 0.1, -0.45),
                    (L - 0.6, -0.1, 0.45), (L, -0.1, 0.0), (L, 0.1, 0.0), (L - 0.6, 0.1, 0.45)], c)  # fmt: skip
            b.at()


@cm.asset("props", "CM_Prop_BusStop", "Environment", (12, 8, 4), budget="prop",
          notes="Bus shelter with a glass back (Glass), bench and a blank advert panel (Face).")  # fmt: skip
def bus_stop(kit):
    W, Hb, D = 12, 8, 4
    with kit.part("Body") as b:
        b.box((-6, -2, 0), (6, 2, 0.3), "concrete", bevel=0.05)
        for x in (-5.7, 5.7):
            for y in (-1.7, 1.7):
                b.box((x - 0.2, y - 0.2, 0.3), (x + 0.2, y + 0.2, 7.4), "slate", bevel=0)
        b.hexa([(-6, -2, 7.4), (6, -2, 7.4), (6, 2, 7.6), (-6, 2, 7.6),
                (-6, -2, 7.8), (6, -2, 7.8), (6, 2, 8.0), (-6, 2, 8.0)], "teal", bevel=0.08)  # fmt: skip
        b.box((-4.5, 0.7, 1.6), (4.5, 1.6, 1.95), "wood", bevel=0.06)  # bench
        for x in (-4, 4):
            b.box((x - 0.15, 1.0, 0.3), (x + 0.15, 1.4, 1.6), "slate", bevel=0)
        b.box((5.0, -1.5, 1.2), (5.5, 1.5, 6.6), "navy", bevel=0.06)  # advert frame
    with kit.part("Face") as b:
        b.box((4.95, -1.3, 1.4), (5.0, 1.3, 6.4), "offwhite", bevel=0)
    with kit.part("Glass", material="glass") as b:
        b.box((-5.5, 1.62, 0.9), (5.5, 1.72, 7.2), "glass", bevel=0)


@cm.asset("props", "CM_Prop_BikeRack", "Environment", (8, 3, 1.2), budget="prop",
          notes="Five hoop bike rack on a rail.")  # fmt: skip
def bike_rack(kit):
    with kit.part("Body") as b:
        b.box((-4, -0.6, 0), (4, 0.6, 0.2), "slate", bevel=0.05)
        for k in range(5):
            x = -3.2 + k * 1.6
            top = [(x + 0.6 * math.cos(math.pi * (1 - t / 4)), 0, 2.3 + 0.6 * math.sin(math.pi * t / 4)) for t in range(1, 4)]
            arc = [(x - 0.6, 0, 0.2), (x - 0.6, 0, 2.3)] + top + [(x + 0.6, 0, 2.3), (x + 0.6, 0, 0.2)]
            b.sweep(arc, [0.1] * len(arc), "teal", sides=6)


@cm.asset("props", "CM_Prop_Fence", "Environment", (8, 3, 0.4), budget="prop",
          notes="8-long decorative picket fence module; tiles end to end.")  # fmt: skip
def fence(kit):
    with kit.part("Body") as b:
        for x in (-3.85, 3.85):
            b.box((x - 0.15, -0.2, 0), (x + 0.15, 0.2, 3), "navy", bevel=0.05)
        for z in (0.7, 2.1):
            b.box((-3.7, -0.08, z), (3.7, 0.08, z + 0.25), "offwhite", bevel=0)
        for k in range(9):
            x = -3.2 + k * 0.8
            b.hexa([(x - 0.2, -0.12, 0.3), (x + 0.2, -0.12, 0.3), (x + 0.2, 0.12, 0.3), (x - 0.2, 0.12, 0.3),
                    (x - 0.2, -0.12, 2.6), (x + 0.2, -0.12, 2.6), (x + 0.2, 0.12, 2.6), (x - 0.2, 0.12, 2.6)], "offwhite")  # fmt: skip
            b.cylinder((x, 0, 2.6), exact(0.2, 4) * 0.98, 0.35, "offwhite", segments=4, top_radius=0.0, bevel=0)


@cm.asset("props", "CM_Prop_AdBillboard", "Environment", (16, 14, 1), budget="prop",
          notes="Roadside billboard on two legs; Face is blank for in-game adverts.")  # fmt: skip
def ad_billboard(kit):
    with kit.part("Body") as b:
        for x in (-5, 5):
            b.box((x - 0.4, -0.4, 0), (x + 0.4, 0.4, 6), "slate", bevel=0.08)
        b.box((-8, -0.3, 6), (8, 0.5, 14), "navy", bevel=0.15)
        b.box((-7.6, -0.5, 6.15), (7.6, -0.3, 6.4), "metal", bevel=0)  # catwalk lip
        for x in (-4, 0, 4):
            b.box((x - 0.15, -0.5, 13.6), (x + 0.15, -0.3, 14.0), "slate", bevel=0)
    with kit.part("Face") as b:
        b.box((-7.5, -0.4, 6.5), (7.5, -0.3, 13.5), "offwhite", bevel=0)


# ---------------------------------------------------------------------------
# Plaza and lot landmarks
# ---------------------------------------------------------------------------


@cm.asset("props", "CM_Prop_PlotBanner", "Environment", (None, 24, None), budget="prop", recentre=True,
          notes="Plot banner: 24-high pole, Flag 12 x 7 (blank face, hangs toward +X).")  # fmt: skip
def plot_banner(kit):
    with kit.part("Pole") as b:
        b.cylinder((0, 0, 0), 0.9, 0.5, "navy", segments=8, bevel=0)
        b.cylinder((0, 0, 0.5), 0.3, 23.1, "metal", segments=8, bevel=0)
        b.ellipsoid((0, 0, 23.7), (0.3, 0.3, 0.3), "yellow", segments=8, rings=4)
        for z in (22.5, 15.5):
            b.box((0.2, -0.1, z - 0.15), (12.4, 0.1, z), "slate", bevel=0)
    with kit.part("Flag") as b:
        b.box((0.4, -0.06, 15.5), (12.4, 0.06, 22.35), "teal", bevel=0)
        b.front_quad(0.4, 15.5, 12.4, 15.9, -0.072, "yellow")


def kiosk(b, paint):
    """Booth 14 x 7 x 8: counter in front (-Y), roof with a striped edge."""
    b.box((-7, -4, 0), (7, 4, 0.4), "concrete", bevel=0.06)
    b.box((-6.6, 1.6, 0.4), (6.6, 3.8, 5.6), paint, bevel=0.1)  # back wall
    for s in (-1, 1):  # side walls
        b.box((min(s * 6.2, s * 7.0), -3.8, 0.4), (max(s * 6.2, s * 7.0), 3.8, 5.6), paint, bevel=0.1)
    b.box((-6.2, -3.8, 0.4), (6.2, -2.4, 3.4), paint, bevel=0.1)  # counter
    b.box((-6.4, -4.0, 3.4), (6.4, -2.2, 3.7), "wood", bevel=0.06)  # counter top
    b.front_quad(-5.6, 1.2, 5.6, 2.4, -3.812, "offwhite")
    b.box((-7, -4, 5.6), (7, 4, 6.4), "offwhite", bevel=0.1)  # roof slab
    for i in range(14):  # scalloped stripe edge
        x = -7 + i
        c = paint if i % 2 == 0 else "offwhite"
        b.box((x, -4, 5.0), (x + 1, -3.8, 5.6), c, bevel=0)
    b.box((-6.6, 1.4, 1.6), (6.6, 1.6, 1.8), "wood", bevel=0)  # back shelf


def _register_kiosk(name, paint):
    @cm.asset("props", "CM_Prop_PlazaKiosk_" + name, "Environment", (14, 7, 8), budget="prop",
              notes="Plaza booth 14 x 7 x 8, %s. Face is the blank sign board on the roof." % name)  # fmt: skip
    def _build(kit):
        with kit.part("Body") as b:
            kiosk(b, paint)
        with kit.part("Face") as b:
            b.box((-4.5, -0.15, 6.4), (4.5, 0.15, 7.0), "navy", bevel=0.05)
            b.front_quad(-4.3, 6.48, 4.3, 6.92, -0.162, "offwhite")


for _n, _p in (("Teal", "teal"), ("Orange", "kiosk_orange"), ("Blue", "kiosk_blue"), ("Purple", "kiosk_purple")):
    _register_kiosk(_n, _p)


@cm.asset("props", "CM_Prop_Fountain", "Environment", (26, 10, 26), budget="prop",
          notes="Plaza fountain: rim diameter 26 and 2.4 high, centre spire 10 high; Water is separate.")  # fmt: skip
def fountain(kit):
    with kit.part("Body") as b:
        b.ring((0, 0, 0), 13, 11.6, 2.4, "paver_brick", segments=32)
        b.cylinder((0, 0, 0), exact(11.6, 32), 1.0, "slate", segments=32, bevel=0)  # basin floor
        b.cylinder((0, 0, 1.0), 2.2, 2.0, "offwhite", segments=12, top_radius=1.4, bevel=0)  # pedestal
        b.cylinder((0, 0, 3.0), 1.0, 2.2, "teal", segments=12, top_radius=4.2, bevel=0)  # lower bowl
        b.cylinder((0, 0, 5.2), 0.8, 2.0, "offwhite", segments=10, top_radius=0.6, bevel=0)
        b.cylinder((0, 0, 7.2), 0.5, 1.2, "teal", segments=10, top_radius=2.0, bevel=0)  # upper bowl
        b.cylinder((0, 0, 8.4), 0.45, 0.9, "offwhite", segments=8, top_radius=0.25, bevel=0)
        b.ellipsoid((0, 0, 9.65), (0.35, 0.35, 0.35), "yellow", segments=8, rings=4)
    with kit.part("Water", material="glass") as b:
        b.cylinder((0, 0, 1.0), exact(11.6, 32) - 0.02, 0.9, "fountain_water", segments=32, bevel=0)
        b.cylinder((0, 0, 4.8), 3.9, 0.3, "fountain_water", segments=12, bevel=0)
        b.cylinder((0, 0, 8.1), 1.85, 0.2, "fountain_water", segments=10, bevel=0)


@cm.asset("props", "CM_Prop_SpawnArch", "Environment", (48, 20, 3), budget="prop",
          notes="Spawn gate: two 3 x 15 x 3 pillars with centres 44 apart and a 48 x 5 x 2 header (Face blank).")  # fmt: skip
def spawn_arch(kit):
    with kit.part("Body") as b:
        for s in (-1, 1):
            x = s * 22
            b.box((x - 1.5, -1.5, 0), (x + 1.5, 1.5, 1.2), "navy", bevel=0.12)
            b.box((x - 1.3, -1.3, 1.2), (x + 1.3, 1.3, 14.2), "offwhite", bevel=0.1)
            b.box((x - 1.5, -1.5, 9.0), (x + 1.5, 1.5, 9.8), "teal", bevel=0.08)
            b.box((x - 1.5, -1.5, 14.2), (x + 1.5, 1.5, 15.0), "slate", bevel=0.08)
        b.box((-24, -1, 15), (24, 1, 20), "navy", bevel=0.15)  # header
        for s in (-1, 1):
            b.star((s * 21.6, -1.012, 17.5), 1.4, "yellow")
    with kit.part("Face") as b:
        b.box((-19, -1.0, 15.6), (19, -0.9, 19.4), "teal", bevel=0)


@cm.asset("props", "CM_Prop_LeaderboardStage", "Environment", (40, 20, None), budget="prop",
          notes="Leaderboard: 40 x 14 x 1 board on two posts over a low stage; Face is blank for the scores.")  # fmt: skip
def leaderboard_stage(kit):
    with kit.part("Body") as b:
        b.box((-20, -4, 0), (20, 4, 1.2), "slate", bevel=0.12)  # stage
        b.front_quad(-19.5, 0.4, 19.5, 0.8, -4.012, "teal")
        for x in (-14, 14):
            b.box((x - 0.8, -0.8, 1.2), (x + 0.8, 0.8, 6.0), "navy", bevel=0.1)
    with kit.part("Board", origin=(0, 0, 6.0)) as b:
        b.box((-20, -0.5, 0), (20, 0.5, 14), "navy", bevel=0.15)
        b.star((0, -0.512, 13.0), 1.0, "yellow")  # crown star
    with kit.part("Face") as b:
        b.box((-19, -0.6, 7.0), (19, -0.5, 18.4), "offwhite", bevel=0)


@cm.asset("props", "CM_Prop_MiniMartSign", "Environment", (36, 7, 1), budget="prop",
          notes="Rooftop prestige sign 36 x 7 with a star motif; Face blank, Neon is the outline tube.")  # fmt: skip
def minimart_sign(kit):
    with kit.part("Body") as b:
        b.box((-18, -0.3, 0), (18, 0.5, 7), "navy", bevel=0.15)
        for s in (-1, 1):  # big stars at each end
            b.star((s * 15.4, -0.312, 3.5), 2.3, "yellow")
            b.star((s * 15.4, -0.324, 3.5), 1.2, "chip_gold")
    with kit.part("Face") as b:
        b.box((-12.6, -0.4, 0.8), (12.6, -0.3, 6.2), "teal", bevel=0)
    with kit.part("Neon") as b:
        t = 0.12
        for lo, hi in (((-17.6, -0.5, 0.3), (17.6, -0.3, 0.3 + t)), ((-17.6, -0.5, 6.7 - t), (17.6, -0.3, 6.7)),
                       ((-17.6, -0.5, 0.3), (-17.6 + t, -0.3, 6.7)), ((17.6 - t, -0.5, 0.3), (17.6, -0.3, 6.7))):  # fmt: skip
            b.box(lo, hi, "candy_pink", bevel=0)


@cm.asset("props", "CM_Prop_ShoppingBag", "Products", (1.1, None, 0.7), budget="item", measure=["Bag"],
          notes="Carried bag 1.1 x 1.3 x 0.7 (Bag); Handles arch above it.")  # fmt: skip
def shopping_bag(kit):
    with kit.part("Bag") as b:
        b.box((-0.55, -0.34, 0), (0.55, 0.35, 1.3), "paver_sand", bevel=0.04)
        b.front_quad(-0.5, 1.02, 0.5, 1.22, -0.352, "teal")
        b.star((0, -0.352, 0.55), 0.25, "yellow")
    with kit.part("Handles") as b:
        for y in (-0.3, 0.3):
            b.sweep([(-0.3, y, 1.25), (-0.25, y, 1.6), (0.25, y, 1.6), (0.3, y, 1.25)], [0.035] * 4, "teal", sides=4)


@cm.asset("props", "CM_Prop_PlazaSign", "Environment", (6, 8, 1.2), budget="prop",
          notes="Plaza directory board on two posts; Face is blank for the map or store list.")  # fmt: skip
def plaza_sign(kit):
    with kit.part("Body") as b:
        for x in (-2.6, 2.6):
            b.box((x - 0.3, -0.3, 0), (x + 0.3, 0.3, 7.0), "navy", bevel=0.06)
        b.box((-3, -0.6, 0), (3, 0.6, 0.4), "slate", bevel=0.08)
        b.box((-2.3, -0.2, 2.0), (2.3, 0.2, 7.0), "teal", bevel=0.08)
        b.box((-3, -0.35, 7.0), (3, 0.35, 7.4), "navy", bevel=0.06)
        b.at((0, 0, 8.0 - exact(0.3, 10)), rot_x_deg=90)  # medallion on the top bar, top at exactly 8
        b.cylinder((0, 0, -0.1), exact(0.3, 10), 0.2, "yellow", segments=10, bevel=0)
        b.at()
    with kit.part("Face") as b:
        b.box((-2.0, -0.25, 2.3), (2.0, -0.2, 6.7), "offwhite", bevel=0)


@cm.asset("props", "CM_Prop_EventStage", "Environment", (30, 16, 16), budget="prop",
          notes="Plaza event stage: raised deck with steps, truss frame, speaker stacks, a blank backdrop "
                "(Face) and spotlights (Light).")  # fmt: skip
def event_stage(kit):
    W, D = 30, 16
    x1, y1 = W / 2, D / 2
    deck = 1.6
    with kit.part("Body") as b:
        b.box((-x1, -y1 + 2.5, 0), (x1, y1, deck), "navy", bevel=0.12)  # deck
        b.box((-x1, -y1 + 2.5, deck - 0.3), (x1, -y1 + 2.8, deck), "gold", bevel=0)  # nosing
        for k in range(3):  # front steps
            z = deck * (k + 1) / 4
            step = 2.5 / 3
            y = -y1 + 2.5 - (3 - k) * step
            b.box((-4, y, 0), (4, y + step, z), "slate", bevel=0.04)
        for x in (-x1 + 0.6, x1 - 0.6):  # truss towers
            for y in (-y1 + 3.1, y1 - 0.6):
                b.box((x - 0.6, y - 0.6, deck), (x + 0.6, y + 0.6, 16), "metal", bevel=0)
        for y in (-y1 + 3.1, y1 - 0.6):  # top trusses
            b.box((-x1, y - 0.6, 14.8), (x1, y + 0.6, 16), "metal", bevel=0)
        for x in (-x1 + 0.6, x1 - 0.6):
            b.box((x - 0.6, -y1 + 3.1, 14.8), (x + 0.6, y1 - 0.6, 16), "metal", bevel=0)
        for s_ in (-1, 1):  # speaker stacks
            x = s_ * (x1 - 3.0)
            for k in range(2):
                b.box((x - 1.2, -y1 + 3.6, deck + k * 2.2), (x + 1.2, -y1 + 5.2, deck + k * 2.2 + 2.1), "dark", bevel=0.08)
                b.disc((x, -y1 + 3.588, deck + k * 2.2 + 1.05), 0.7, "slate", segments=10)
        b.box((-x1 + 2, y1 - 1.6, deck), (x1 - 2, y1 - 1.2, 14.2), "dark", bevel=0)  # backdrop frame
    with kit.part("Face") as b:
        b.box((-x1 + 2.4, y1 - 1.7, deck + 0.4), (x1 - 2.4, y1 - 1.6, 13.8), "kiosk_purple", bevel=0)
    with kit.part("Light") as b:
        for x in (-9, -3, 3, 9):
            b.at((x, -y1 + 3.1, 14.6), rot_x_deg=35)
            b.cylinder((0, 0, -0.9), 0.45, 0.9, "warm_light", segments=8, bevel=0)
        b.at()


@cm.asset("props", "CM_Prop_Monument", "Environment", (16, None, 16), budget="prop",
          notes="Central plaza monument: tiered plinth carrying a giant golden shopping cart; Face is the blank plaque.")  # fmt: skip
def monument(kit):
    import interiors

    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), exact(8, 16), 0.8, "paver_brick", segments=16, bevel=0.06)
        b.cylinder((0, 0, 0.8), exact(6.5, 16), 1.2, "offwhite", segments=16, bevel=0.06)
        b.box((-4, -4, 2.0), (4, 4, 6.0), "navy", bevel=0.15)
        b.box((-4.4, -4.4, 6.0), (4.4, 4.4, 6.6), "gold", bevel=0.08)
        for s_ in (-1, 1):
            b.star((s_ * 2.6, -4.012, 4.0), 0.6, "gold")
        b.at((0, 0, 6.6), rot_z_deg=-30, scale=2.4)
        interiors.cart(b, frame="gold", handle="red", body="gold")
        b.at()
    with kit.part("Face") as b:
        b.front_quad(-1.8, 3.2, 1.8, 4.8, -4.012, "chip_gold")


def build(mats, only=None):
    return cm.build_family("props", mats, only)
