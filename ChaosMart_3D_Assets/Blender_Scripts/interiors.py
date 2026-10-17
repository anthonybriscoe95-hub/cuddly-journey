"""Chaos Mart Tycoon: store interior kit (everything that isn't a stocked fixture).

Carts, baskets, self-checkout, freezer, end-cap, stockroom racking, boxes,
signage, lighting, vending, staff furniture, security and cleaning props.
Same conventions as every other family: bottom-centre pivot, front faces -Y,
blank faces named Face, glowing parts named Light.
"""

import math

import cm_common as cm
import fixtures as F
import products as P


def exact(r, n):
    return r / math.cos(math.pi / n)


def wire_panel(b, corners, colour="metal", grid="slate", cells=(4, 3), out=None):
    """Thin flat panel with a wire grid drawn on its outward face.

    corners: four points (counter-clockwise seen from outside); out: outward normal offset.
    """
    p0, p1, p2, p3 = (cm.Vector(c) for c in corners)
    n = (p1 - p0).cross(p3 - p0).normalized()
    t = 0.06
    inner = [p - n * t for p in (p0, p1, p2, p3)]
    b._faces([tuple(v) for v in (p0, p1, p2, p3)] + [tuple(v) for v in inner],
             [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)], colour, 0.0)
    off = n * 0.012
    nu, nv = cells
    for i in range(1, nu):
        a = p0 + (p1 - p0) * (i / nu)
        c = p3 + (p2 - p3) * (i / nu)
        w = (p1 - p0).normalized() * 0.04
        b.poly([tuple(a - w + off), tuple(a + w + off), tuple(c + w + off), tuple(c - w + off)], grid)
    for j in range(1, nv):
        a = p0 + (p3 - p0) * (j / nv)
        c = p1 + (p2 - p1) * (j / nv)
        w = (p3 - p0).normalized() * 0.04
        b.poly([tuple(a - w + off), tuple(c - w + off), tuple(c + w + off), tuple(a + w + off)], grid)


# ---------------------------------------------------------------------------
# Shopping
# ---------------------------------------------------------------------------


def cart(b, frame="metal", handle="teal", body="metal"):
    """Shopping cart 3 x 3.6 x 5: handle at +Y, nose toward -Y."""
    z0, z1 = 1.5, 3.3
    # basket: narrower and lower at the nose
    fl, fr, bl, br = (-1.1, -2.3), (1.1, -2.3), (-1.4, 1.9), (1.4, 1.9)
    bot = [(fl[0], fl[1], z0), (fr[0], fr[1], z0), (br[0], br[1], z0), (bl[0], bl[1], z0)]
    top = [(-1.3, -2.5, z1), (1.3, -2.5, z1), (1.5, 2.0, z1), (-1.5, 2.0, z1)]
    b._faces(bot, [(0, 3, 2, 1)], body, 0.0)  # floor
    wire_panel(b, [bot[0], bot[1], top[1], top[0]], body, cells=(4, 2))  # nose
    wire_panel(b, [bot[1], bot[2], top[2], top[1]], body, cells=(6, 2))  # right
    wire_panel(b, [bot[3], bot[0], top[0], top[3]], body, cells=(6, 2))  # left
    wire_panel(b, [bot[2], bot[3], top[3], top[2]], body, cells=(4, 2))  # back gate
    rim = top + [top[0]]
    b.sweep(rim, [0.07] * 5, frame, sides=4)
    # chassis and handle
    for s in (-1, 1):
        b.sweep([(s * 1.0, -2.3, 0.45), (s * 1.0, 1.6, 0.45), (s * 1.3, 1.9, 1.5), (s * 1.45, 2.3, 3.4)], [0.07] * 4, frame, sides=4)
    b.sweep([(-1.45, 2.3, 3.4), (1.45, 2.3, 3.4)], [0.13, 0.13], handle, sides=6)
    b.box((-1.0, -2.3, 0.75), (1.0, 1.4, 0.85), frame, bevel=0)  # lower tray
    for x in (-1.0, 1.0):
        for y in (-2.1, 1.6):
            b.cylinder((x, y, 0.45), 0.12, 0.3, "slate", segments=6, bevel=0)  # caster fork
            b.at((x, y, 0.3), rot_y_deg=90)
            b.cylinder((0, 0, -0.1), exact(0.3, 8), 0.2, "dark", segments=8, bevel=0)
            b.at()


@cm.asset("interiors", "CM_Interior_ShoppingCart", "Interiors", None, budget="prop", recentre=True,
          notes="Shopping cart, handle at +Y; wire basket drawn as grid lines on thin panels.")  # fmt: skip
def shopping_cart(kit):
    with kit.part("Body") as b:
        cart(b)


@cm.asset("interiors", "CM_Interior_ShoppingBasket", "Interiors", None, budget="prop", recentre=True,
          notes="Hand basket with two folding handles.")  # fmt: skip
def shopping_basket(kit):
    with kit.part("Body") as b:
        b.box((-1.0, -0.6, 0), (1.0, 0.6, 0.12), "red", bevel=0.04)
        wire_panel(b, [(-1.0, -0.6, 0.1), (1.0, -0.6, 0.1), (1.1, -0.7, 1.0), (-1.1, -0.7, 1.0)], "red", "offwhite", (6, 2))
        wire_panel(b, [(1.0, 0.6, 0.1), (-1.0, 0.6, 0.1), (-1.1, 0.7, 1.0), (1.1, 0.7, 1.0)], "red", "offwhite", (6, 2))
        wire_panel(b, [(1.0, -0.6, 0.1), (1.0, 0.6, 0.1), (1.1, 0.7, 1.0), (1.1, -0.7, 1.0)], "red", "offwhite", (3, 2))
        wire_panel(b, [(-1.0, 0.6, 0.1), (-1.0, -0.6, 0.1), (-1.1, -0.7, 1.0), (-1.1, 0.7, 1.0)], "red", "offwhite", (3, 2))
        for y in (-0.45, 0.45):
            arc = [(-0.6, y, 1.0), (-0.45, y, 1.6), (0.45, y, 1.6), (0.6, y, 1.0)]
            b.sweep(arc, [0.05] * 4, "dark", sides=4)


@cm.asset("interiors", "CM_Interior_SelfCheckout", "Interiors", None, budget="prop", recentre=True,
          notes="Self-checkout kiosk: scanner bed, angled Screen, bagging shelf and a lane lamp.")  # fmt: skip
def self_checkout(kit):
    with kit.part("Body") as b:
        b.box((-2.0, -1.5, 0), (0.6, 1.5, 3.2), "teal", bevel=0.1)
        b.box((-2.0, -1.5, 3.2), (0.6, 1.5, 3.4), "offwhite", bevel=0.05)
        b.top_quad(-1.6, -1.1, 0.2, 1.1, 3.41, "dark")  # scanner glass
        b.top_quad(-1.2, -0.08, -0.2, 0.08, 3.415, "red")  # scan line
        b.box((0.6, -1.4, 2.8), (2.0, 1.4, 3.0), "metal", bevel=0)  # bagging shelf
        b.box((1.7, -1.3, 0), (1.9, -1.1, 2.8), "slate", bevel=0)
        b.box((1.7, 1.1, 0), (1.9, 1.3, 2.8), "slate", bevel=0)
        b.front_quad(-1.8, 0.3, 0.4, 0.6, -1.512, "navy")
        b.box((-0.9, 0.9, 3.4), (-0.6, 1.2, 6.6), "slate", bevel=0)  # screen post
        b.cylinder((-0.75, 1.05, 6.6), 0.35, 0.3, "warm_light", segments=8, bevel=0)
    with kit.part("Screen") as b:
        b.at((-0.75, 0.6, 4.6), rot_x_deg=-25)
        b.box((-1.1, -0.1, -0.75), (1.1, 0.1, 0.75), "navy", bevel=0.06)
        b.front_quad(-0.95, -0.62, 0.95, 0.62, -0.112, "kiosk_blue")
        b.at()


# ---------------------------------------------------------------------------
# Stocked extras (fixture conventions: Item slots, PriceTag, Anchor)
# ---------------------------------------------------------------------------


@cm.asset("interiors", "CM_Fixture_FreezerChest", "Interiors", (12, 3.6, 5), budget="fixture",
          notes="Chest freezer with sliding Glass lids; 6 Item slots of ice cream and frozen pizza.")  # fmt: skip
def freezer_chest(kit):
    W, H, D = 12, 3.6, 5
    x1, y0, y1 = W / 2, -D / 2, D / 2
    with kit.part("Body") as b:
        b.box((-x1 + 0.2, y0 + 0.2, 0), (x1 - 0.2, y1 - 0.2, 0.4), "navy", bevel=0.05)
        wall = 0.4
        b.box((-x1, y0 + 0.012, 0.4), (x1, y0 + wall, 2.9), "offwhite", bevel=0.1)
        b.box((-x1, y1 - wall, 0.4), (x1, y1, 2.9), "offwhite", bevel=0.1)
        for s in (-1, 1):
            b.box((min(s * x1, s * (x1 - wall)), y0 + wall, 0.4), (max(s * x1, s * (x1 - wall)), y1 - wall, 2.9), "offwhite", bevel=0.1)
        b.box((-x1 + wall, y0 + wall, 0.4), (x1 - wall, y1 - wall, 1.0), "water", bevel=0)  # frosty floor
        b.front_quad(-x1 + 0.3, 0.8, x1 - 0.3, 1.2, y0, "kiosk_blue")
        b.box((-0.06, y0 + wall, 2.9), (0.06, y1 - wall, 3.0), "metal", bevel=0)  # lid rail
        for s in (-1, 1):
            b.box((s * 2.2 - 0.12, y1 - 0.35, 2.9), (s * 2.2 + 0.12, y1 - 0.15, 3.0), "slate", bevel=0)
        b.box((-2.6, y1 - 0.38, 2.9), (2.6, y1 - 0.12, 3.0), "navy", bevel=0)
    with kit.part("Glass", material="glass") as b:
        b.box((-x1 + wall, y0 + wall, 2.75), (-0.06, y1 - wall, 2.85), "glass", bevel=0)
        b.box((0.06, y0 + wall, 2.8), (x1 - wall, y1 - wall, 2.9), "glass", bevel=0)
    with kit.part("PriceTag") as b:
        b.box((-2.4, y1 - 0.34, 3.0), (2.4, y1 - 0.16, H), "yellow", bevel=0.03)
    pos = F.slot_positions(6, W - 1.6, (1.0, 1.0), (-0.95, 0.95))
    for i, p in enumerate(pos, start=1):
        with kit.part("Item%d" % i, origin=p) as b:
            if i % 2:
                for dx in (-0.8, 0.8):
                    b.at((dx, 0, 0), scale=0.85)
                    P.ice_cream_tub(b)
            else:
                b.at((0, 0, 0), scale=1.1)
                P.frozen_pizza(b)
                b.at((0, 0, 0.32), scale=1.0)
                P.frozen_pizza(b)
            b.at()
    kit.anchor((0, y0 - 1.2, 3.5))
    return F.stocked_checks(6)


@cm.asset("interiors", "CM_Fixture_Endcap", "Interiors", (6, 7.6, 5), budget="fixture",
          notes="End-of-aisle promo display; snaps onto a gondola end. 4 Item slots of cereal.")  # fmt: skip
def endcap(kit):
    W, H, D = 6, 7.6, 5
    x1, y0, y1 = W / 2, -D / 2, D / 2
    with kit.part("Body") as b:
        for s in (-1, 1):
            b.box((min(s * x1, s * (x1 - 0.4)), y0 + 0.1, 0), (max(s * x1, s * (x1 - 0.4)), y1, H - 1.2), "red", bevel=0.1)
        b.box((-x1 + 0.4, y1 - 0.3, 0), (x1 - 0.4, y1, H - 1.2), "yellow", bevel=0.04)
        b.box((-x1 + 0.4, y0 + 0.2, 0), (x1 - 0.4, y1 - 0.3, 0.7), "navy", bevel=0.05)
        for z in (0.7, 3.5):
            b.box((-x1 + 0.4, y0 + 0.1, z), (x1 - 0.4, y1 - 0.3, z + 0.25), "offwhite", bevel=0.05)
            b.box((-x1 + 0.4, y0, z - 0.2), (x1 - 0.4, y0 + 0.1, z + 0.3), "red", bevel=0)
        b.box((-x1, y0 + 0.1, H - 1.2), (x1, y1, H - 1.0), "offwhite", bevel=0.06)
    with kit.part("PriceTag") as b:  # big promo header
        b.box((-x1 + 0.2, y0 + 0.5, H - 1.0), (x1 - 0.2, y0 + 0.75, H), "yellow", bevel=0.06)
    pos = F.slot_positions(4, W - 1.4, (0.95, 3.75), -0.6)
    for i, p in enumerate(pos, start=1):
        with kit.part("Item%d" % i, origin=p) as b:
            P.cereal_box(b)
    kit.anchor((0, y0 - 1.2, 3.5))
    return F.stocked_checks(4)


# ---------------------------------------------------------------------------
# Stockroom
# ---------------------------------------------------------------------------


def cardboard_box(b, w=1.0, d=0.8, h=1.6, x=0.0, y=0.0, z=0.0):
    b.box((x - w, y - d, z), (x + w, y + d, z + h), "bread", bevel=0.05)
    b.top_quad(x - 0.15, y - d, x + 0.15, y + d, z + h + 0.012, "paver_sand")  # tape
    b.front_quad(x - w + 0.2, z + h - 0.55, x - w + 0.75, z + h - 0.2, y - d - 0.012, "offwhite")  # label


@cm.asset("interiors", "CM_Interior_CardboardBox", "Interiors", (2, None, 1.6), budget="item",
          notes="Taped shipping box with a blank label.")  # fmt: skip
def cardboard(kit):
    with kit.part("Body") as b:
        cardboard_box(b, d=0.794, h=1.588)


@cm.asset("interiors", "CM_Interior_Pallet", "Interiors", (4, 0.6, 4), budget="prop",
          notes="Wooden shipping pallet.")  # fmt: skip
def pallet(kit):
    with kit.part("Body") as b:
        for x in (-1.8, 0.0, 1.8):
            b.box((x - 0.2, -2, 0), (x + 0.2, 2, 0.4), "wood", bevel=0.03)
        for k in range(5):
            x = -2 + k * 0.95
            b.box((x, -2, 0.4), (x + 0.6 if k < 4 else 2, 2, 0.6), "wood", bevel=0.03)  # deck boards


@cm.asset("interiors", "CM_Interior_PalletStack", "Interiors", (4, None, 4), budget="prop",
          notes="Pallet loaded with a shrink-wrapped stack of boxes (a delivery).")  # fmt: skip
def pallet_stack(kit):
    with kit.part("Body") as b:
        for x in (-1.8, 0.0, 1.8):
            b.box((x - 0.2, -2, 0), (x + 0.2, 2, 0.4), "wood", bevel=0.03)
        b.box((-2, -2, 0.4), (2, 2, 0.6), "wood", bevel=0.03)
        for k in range(2):
            for i, (x, y) in enumerate(((-0.95, -0.95), (0.95, -0.95), (-0.95, 0.95), (0.95, 0.95))):
                cardboard_box(b, w=0.9, d=0.9, h=1.4, x=x, y=y, z=0.6 + k * 1.45)


@cm.asset("interiors", "CM_Interior_DeliveryCrate", "Interiors", (3, 1.6, 2), budget="prop",
          notes="Stackable plastic produce crate with hand holes.")  # fmt: skip
def delivery_crate(kit):
    with kit.part("Body") as b:
        b.box((-1.5, -1, 0), (1.5, 1, 0.15), "teal", bevel=0.04)
        X, Y = 1.488, 0.988
        wire_panel(b, [(-X, -Y, 0.15), (X, -Y, 0.15), (X, -Y, 1.6), (-X, -Y, 1.6)], "teal", "navy", (5, 2))
        wire_panel(b, [(X, Y, 0.15), (-X, Y, 0.15), (-X, Y, 1.6), (X, Y, 1.6)], "teal", "navy", (5, 2))
        wire_panel(b, [(X, -Y, 0.15), (X, Y, 0.15), (X, Y, 1.6), (X, -Y, 1.6)], "teal", "navy", (3, 2))
        wire_panel(b, [(-X, Y, 0.15), (-X, -Y, 0.15), (-X, -Y, 1.6), (-X, Y, 1.6)], "teal", "navy", (3, 2))


@cm.asset("interiors", "CM_Interior_StockroomShelf", "Interiors", (12, 10, 4), budget="fixture",
          notes="Heavy-duty racking, three levels loaded with boxes.")  # fmt: skip
def stockroom_shelf(kit):
    with kit.part("Body") as b:
        for x in (-5.9, 0.0, 5.9):
            for y in (-1.85, 1.85):
                xa = min(max(-6, x - 0.15), 5.7)
                b.box((xa, y - 0.15, 0), (xa + 0.3, y + 0.15, 10), "kiosk_blue", bevel=0)
        for z in (0.3, 3.6, 6.9):
            for y in (-1.85, 1.85):
                b.box((-6, y - 0.15, z), (6, y + 0.15, z + 0.4), "kiosk_orange", bevel=0)
            b.box((-5.85, -1.75, z + 0.4), (5.85, 1.75, z + 0.5), "metal", bevel=0)
            for i, x in enumerate((-4.2, -1.6, 1.6, 4.2)):
                if (i + int(z)) % 3 != 2:
                    cardboard_box(b, w=1.1, d=1.2, h=2.2 if i % 2 else 1.7, x=x, y=0, z=z + 0.5)


# ---------------------------------------------------------------------------
# Signage and lighting
# ---------------------------------------------------------------------------


@cm.asset("interiors", "CM_Interior_AisleSign", "Interiors", (8, 2.4, 0.3), budget="prop", measure=["Body", "Face"],
          notes="Hanging aisle sign; Face is blank on both sides (aisle number / category). Rods rise 3 above.")  # fmt: skip
def aisle_sign(kit):
    with kit.part("Body") as b:
        b.box((-4, -0.1, 0), (4, 0.1, 2.4), "navy", bevel=0.1)
        b.box((-4, -0.1, 0), (-3.2, 0.1, 2.4), "teal", bevel=0.08)
    with kit.part("Face") as b:
        b.box((-3.0, -0.15, 0.3), (3.8, -0.1, 2.1), "offwhite", bevel=0)
        b.box((-3.0, 0.1, 0.3), (3.8, 0.15, 2.1), "offwhite", bevel=0)
    with kit.part("Rods") as b:
        for x in (-3, 3):
            b.cylinder((x, 0, 2.4), 0.05, 3.0, "metal", segments=6, bevel=0)


@cm.asset("interiors", "CM_Interior_CeilingLight", "Interiors", (8, 0.5, 1.6), budget="prop",
          notes="Linear ceiling light; hang its top at the ceiling. Light is the diffuser (set Neon).")  # fmt: skip
def ceiling_light(kit):
    with kit.part("Body") as b:
        b.box((-4, -0.8, 0.15), (4, 0.8, 0.5), "offwhite", bevel=0.06)
        b.box((-4, -0.8, 0.0), (-3.85, 0.8, 0.15), "slate", bevel=0)
        b.box((3.85, -0.8, 0.0), (4, 0.8, 0.15), "slate", bevel=0)
    with kit.part("Light") as b:
        b.box((-3.85, -0.65, 0.05), (3.85, 0.65, 0.15), "warm_light", bevel=0)


@cm.asset("interiors", "CM_Interior_DigitalAdScreen", "Interiors", (4, 7, 1.6), budget="prop",
          notes="Freestanding digital advert totem; Face is the blank screen for an ImageLabel.")  # fmt: skip
def digital_ad(kit):
    with kit.part("Body") as b:
        b.box((-1.6, -0.8, 0), (1.6, 0.8, 0.3), "navy", bevel=0.08)
        b.box((-2, -0.25, 0.3), (2, 0.25, 7), "navy", bevel=0.12)
        b.front_quad(-1.7, 0.55, 1.7, 0.75, -0.262, "teal")
    with kit.part("Face") as b:
        b.box((-1.75, -0.3, 1.1), (1.75, -0.25, 6.7), "kiosk_blue", bevel=0)


@cm.asset("interiors", "CM_Interior_WallDecal", "Interiors", (6, 4, None), budget="prop", recentre=True,
          notes="Framed wall decoration (fresh-produce motif) for interior walls.")  # fmt: skip
def wall_decor(kit):
    with kit.part("Body") as b:
        b.box((-3, -0.1, 0), (3, 0.1, 4), "wood", bevel=0.08)
        b.front_quad(-2.7, 0.3, 2.7, 3.7, -0.112, "mint")
        b.disc((-1.2, -0.124, 2.0), 0.9, "apple_red", segments=12)
        b.disc((-0.95, -0.136, 2.95), 0.3, "leaf_green", segments=6, radius2=0.15)
        b.disc((1.1, -0.124, 1.7), 0.85, "kiosk_orange", segments=12)
        b.disc((0.6, -0.124, 2.9), 0.5, "yellow", segments=10)


# ---------------------------------------------------------------------------
# Machines, staff and services
# ---------------------------------------------------------------------------


@cm.asset("interiors", "CM_Interior_VendingMachine", "Interiors", (4, 8, 3), budget="prop",
          notes="Drinks vending machine; Glass front over six rows of cans, keypad and pickup slot.")  # fmt: skip
def vending(kit):
    yf = -1.476  # front face of the cabinet frame
    with kit.part("Body") as b:
        b.box((-2, -0.9, 0), (2, 1.5, 8), "red", bevel=0.15)  # cabinet behind the display
        b.box((-2, yf, 0), (-1.85, -0.9, 8), "red", bevel=0.04)  # frame: left stile
        b.box((0.95, yf, 0), (2, -0.9, 8), "red", bevel=0.06)  # keypad panel
        b.box((-1.85, yf, 0), (0.95, -0.9, 1.55), "red", bevel=0.04)  # base
        b.box((-1.85, yf, 7.65), (0.95, -0.9, 8), "red", bevel=0.04)  # head
        b.box((-1.85, -1.0, 1.55), (0.95, -0.9, 7.65), "offwhite", bevel=0)  # bright back of the display
        for r in range(5):
            z = 2.0 + r * 1.1
            b.box((-1.85, -1.4, z - 0.08), (0.95, -1.0, z), "metal", bevel=0)  # spiral shelf
            for k in range(5):
                x = -1.5 + k * 0.5
                b.cylinder((x, -1.2, z), exact(0.17, 6), 0.7, ("soda_red", "kiosk_blue", "yellow", "leaf_green", "offwhite")[(r + k) % 5],
                           segments=6, bevel=0)  # fmt: skip
        b.front_quad(1.05, 4.5, 1.85, 6.6, yf - 0.012, "slate")  # keypad
        for i in range(3):
            for j in range(4):
                b.front_quad(1.12 + i * 0.25, 4.7 + j * 0.45, 1.3 + i * 0.25, 4.95 + j * 0.45, -1.5, "metal")
        b.front_quad(1.15, 3.6, 1.75, 4.1, yf - 0.012, "dark")  # coin slot
        b.front_quad(-1.6, 0.5, 0.6, 1.2, yf - 0.012, "dark")  # pickup
        b.front_quad(1.05, 7.65, 1.85, 7.9, yf - 0.012, "offwhite")
    with kit.part("Glass", material="glass") as b:
        b.box((-1.85, -1.46, 1.55), (0.95, -1.42, 7.65), "glass", bevel=0)


@cm.asset("interiors", "CM_Interior_StaffLocker", "Interiors", (6, 7, 2), budget="prop",
          notes="Bank of three staff lockers; Door1-3 are separate and hinge on their left edge.")  # fmt: skip
def staff_locker(kit):
    with kit.part("Body") as b:
        b.box((-3, -0.976, 0), (3, 1, 7), "slate", bevel=0.08)
        b.box((-3, -0.976, 0), (3, 1, 0.4), "navy", bevel=0.05)
    for i in range(3):
        x0 = -3 + 0.1 + i * 1.95
        with kit.part("Door%d" % (i + 1), origin=(x0, -0.976, 0.5)) as b:
            b.front_quad(0, 0, 1.8, 6.3, -0.012, "teal" if i != 1 else "mint")
            for k in range(3):
                b.front_quad(0.4, 5.2 + k * 0.25, 1.4, 5.3 + k * 0.25, -0.024, "navy")  # vents
            b.front_quad(1.4, 3.0, 1.6, 3.6, -0.024, "metal")  # handle


@cm.asset("interiors", "CM_Interior_EmployeeDesk", "Interiors", (6, None, 3), budget="prop",
          notes="Office desk with a monitor, keyboard and drawer pedestal.")  # fmt: skip
def employee_desk(kit):
    with kit.part("Body") as b:
        b.box((-3, -1.5, 2.4), (3, 1.5, 2.7), "wood", bevel=0.08)
        b.box((1.4, -1.3, 0), (2.8, 1.3, 2.4), "slate", bevel=0.06)
        for k in range(3):
            b.front_quad(1.55, 0.2 + k * 0.75, 2.65, 0.8 + k * 0.75, -1.312, "metal")
        b.box((-2.9, -1.3, 0), (-2.6, 1.3, 2.4), "slate", bevel=0)
        b.box((-0.9, 0.6, 2.7), (0.9, 0.9, 2.8), "dark", bevel=0)  # monitor foot
        b.box((-0.08, 0.7, 2.8), (0.08, 0.85, 3.4), "dark", bevel=0)
        b.box((-1.3, 0.55, 3.2), (1.3, 0.72, 4.6), "navy", bevel=0.05)
        b.front_quad(-1.2, 3.3, 1.2, 4.5, 0.538, "kiosk_blue")
        b.box((-0.9, -0.6, 2.7), (0.9, -0.1, 2.76), "dark", bevel=0)  # keyboard


@cm.asset("interiors", "CM_Interior_OfficeChair", "Interiors", None, budget="prop", recentre=True,
          notes="Swivel office chair facing -Y.")  # fmt: skip
def office_chair(kit):
    with kit.part("Body") as b:
        for k in range(5):
            a = 2 * math.pi * k / 5 + math.pi / 2
            b.sweep([(0, 0, 0.35), (1.0 * math.cos(a), 1.0 * math.sin(a), 0.25)], [0.08, 0.06], "dark", sides=4)
            b.ellipsoid((1.0 * math.cos(a), 1.0 * math.sin(a), 0.12), (0.12, 0.12, 0.12), "dark", segments=6, rings=3)
        b.cylinder((0, 0, 0.3), 0.12, 1.4, "metal", segments=8, bevel=0)
        b.box((-1.1, -1.1, 1.7), (1.1, 1.0, 2.1), "teal", bevel=0.15)
        b.box((-1.0, 0.85, 2.1), (1.0, 1.15, 4.0), "teal", bevel=0.15)


@cm.asset("interiors", "CM_Interior_ServiceDesk", "Interiors", (10, None, 4), budget="prop",
          notes="Customer service desk with a raised counter; Face is the blank 'HELP' sign above.")  # fmt: skip
def service_desk(kit):
    with kit.part("Body") as b:
        b.box((-5, -2, 0), (5, 2, 0.4), "navy", bevel=0.06)
        b.box((-5, -1.988, 0.4), (5, -1.0, 3.6), "teal", bevel=0.12)
        b.box((-5.0, -2.0, 3.6), (5.0, -0.8, 3.9), "wood", bevel=0.08)
        b.box((-5, -1.0, 0.4), (5, 2, 2.6), "offwhite", bevel=0.08)
        for s in (-1, 1):
            b.box((s * 4.6 - 0.15, 1.4, 2.6), (s * 4.6 + 0.15, 1.7, 8.0), "slate", bevel=0)
        b.box((-5, 1.3, 7.9), (5, 1.8, 9.2), "navy", bevel=0.08)
        b.front_quad(-4.6, 1.2, 4.6, 1.6, -2.0, "yellow")
        b.box((-3.2, -0.4, 2.6), (-1.6, 0.6, 3.5), "slate", bevel=0.05)  # register
    with kit.part("Face") as b:
        b.box((-4.4, 1.25, 8.05), (4.4, 1.3, 9.05), "offwhite", bevel=0)


@cm.asset("interiors", "CM_Interior_SecurityCamera", "Interiors", None, budget="item", recentre=True,
          notes="Wall-mounted bullet camera; mount the back plate (+Y) on a wall. Lens is the red LED part.")  # fmt: skip
def security_camera(kit):
    with kit.part("Body") as b:
        b.box((-0.35, 0.8, 0), (0.35, 0.95, 0.7), "slate", bevel=0.04)
        b.box((-0.08, 0.2, 0.3), (0.08, 0.8, 0.45), "slate", bevel=0)
        b.at((0, 0.0, 0.45), rot_x_deg=-20)
        b.box((-0.25, -0.75, -0.22), (0.25, 0.35, 0.22), "offwhite", bevel=0.06)
        b.box((-0.32, -0.85, 0.2), (0.32, 0.35, 0.28), "offwhite", bevel=0)  # hood
        b.at()
    with kit.part("Lens") as b:
        b.at((0, 0.0, 0.45), rot_x_deg=-20)
        b.disc((0, -0.762, 0), 0.16, "dark", segments=8)
        b.disc((0.14, -0.774, 0.12), 0.04, "red", segments=4)
        b.at()


@cm.asset("interiors", "CM_Interior_SecurityGate", "Interiors", (5, 5, 1), budget="prop",
          notes="Anti-theft gate pair 4 apart; Alarm is the light bar on top (flash it when a shoplifter passes).")  # fmt: skip
def security_gate(kit):
    with kit.part("Body") as b:
        for x in (-2, 2):
            b.box((x - 0.5, -0.5, 0), (x + 0.5, 0.5, 0.3), "slate", bevel=0.05)
            b.box((x - 0.2, -0.4, 0.3), (x + 0.2, 0.4, 4.6), "offwhite", bevel=0.08)
            b.front_quad(x - 0.12, 0.8, x + 0.12, 4.2, -0.412, "metal")
    with kit.part("Alarm") as b:
        for x in (-2, 2):
            b.box((x - 0.22, -0.42, 4.6), (x + 0.22, 0.42, 5.0), "red", bevel=0.05)


@cm.asset("interiors", "CM_Interior_WetFloorSign", "Interiors", None, budget="item", recentre=True,
          notes="Yellow A-frame caution sign (Supermarket Cleanup event).")  # fmt: skip
def wet_floor(kit):
    with kit.part("Body") as b:
        for s in (-1, 1):
            b.hexa([(-0.8, s * 0.7 - (0.1 if s > 0 else 0), 0), (0.8, s * 0.7 - (0.1 if s > 0 else 0), 0),
                    (0.8, s * 0.7 + (0.1 if s < 0 else 0), 0), (-0.8, s * 0.7 + (0.1 if s < 0 else 0), 0),
                    (-0.6, s * 0.06 - (0.06 if s > 0 else 0), 2.5), (0.6, s * 0.06 - (0.06 if s > 0 else 0), 2.5),
                    (0.6, s * 0.06 + (0.06 if s < 0 else 0), 2.5), (-0.6, s * 0.06 + (0.06 if s < 0 else 0), 2.5)], "yellow", bevel=0.04)  # fmt: skip
        b.box((-0.25, -0.12, 2.45), (0.25, 0.12, 2.6), "dark", bevel=0)
        # warning triangle on the front face (follows its slope)
        f = lambda x, z: (x, -(0.7 - 0.64 * z / 2.5) - 0.012, z)  # noqa: E731
        b.poly([f(-0.45, 0.9), f(0.45, 0.9), f(0.0, 1.75)], "dark")


@cm.asset("interiors", "CM_Interior_MopBucket", "Interiors", (2.4, None, 1.6), budget="item",
          notes="Mop bucket with wringer and mop (cleaner prop).")  # fmt: skip
def mop_bucket(kit):
    with kit.part("Body") as b:
        b.box((-1.2, -0.8, 0.25), (1.2, 0.8, 1.6), "yellow", bevel=0.12)
        b.top_quad(-1.0, -0.6, 1.0, 0.6, 1.612, "water")  # water surface
        b.box((0.2, -0.75, 1.6), (1.1, 0.75, 2.2), "slate", bevel=0.05)  # wringer
        for x in (-0.9, 0.9):
            for y in (-0.55, 0.55):
                b.cylinder((x, y, 0), exact(0.12, 6), 0.25, "dark", segments=6, bevel=0)
        b.sweep([(-0.4, 0.0, 0.6), (-0.4, 0.05, 2.5), (-0.4, 0.1, 4.2)], [0.07] * 3, "wood", sides=5)  # mop handle
        b.cylinder((-0.4, 0.0, 0.5), 0.25, 0.6, "offwhite", segments=8, top_radius=0.12, bevel=0)


@cm.asset("interiors", "CM_Interior_RestroomDoor", "Interiors", (4, 8, 0.5), budget="prop",
          notes="Restroom door in its frame; SignPlate is blank (draw the icon in-game). Door hinges on the left.")  # fmt: skip
def restroom_door(kit):
    with kit.part("Body") as b:
        b.box((-2, -0.25, 0), (-1.6, 0.25, 8), "navy", bevel=0.05)
        b.box((1.6, -0.25, 0), (2, 0.25, 8), "navy", bevel=0.05)
        b.box((-2, -0.25, 7.6), (2, 0.25, 8), "navy", bevel=0.05)
    with kit.part("Door", origin=(-1.6, 0, 0)) as b:
        b.box((0, -0.1, 0), (3.2, 0.1, 7.6), "mint", bevel=0.04)
        b.front_quad(0.3, 0.2, 2.9, 0.6, -0.112, "teal")
        b.box((2.6, -0.24, 3.4), (2.8, -0.1, 3.9), "metal", bevel=0)
    with kit.part("SignPlate") as b:
        b.box((-0.6, -0.22, 5.2), (0.6, -0.1, 6.4), "offwhite", bevel=0.04)


def build(mats, only=None):
    return cm.build_family("interiors", mats, only)
