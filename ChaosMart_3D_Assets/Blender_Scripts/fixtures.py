"""Chaos Mart Tycoon: product fixtures (shelves, coolers, bins, checkout).

Every stocked fixture file contains:
  Body       the fixture itself (one mesh, palette material)
  PriceTag   yellow front-facing board on top, blank (the game draws the text)
  Item1..N   one mesh per stock slot, so the game can show or hide each
  Anchor     1.2 studs in front of the fixture front, 3.5 up
  Glass      (glass fixtures only) separate mesh for Roblox transparency
  LightStrip (coolers only) separate mesh so the game can set Material = Neon

Items reuse the product builders in products.py, so a product looks the same
loose or on a shelf. Sizes are the brief's and are checked before export.
"""

import math

import cm_common as cm
import products as P

# ---------------------------------------------------------------------------
# Item layouts: what one stock slot holds (kept light so 10-12 slots fit the
# fixture budget)
# ---------------------------------------------------------------------------


def row_of(fn, n, spacing, scale=1.0, **kw):
    """`n` copies of a product in a row centred on the slot."""

    def build(b):
        for i in range(n):
            b.at(((i - (n - 1) / 2) * spacing * scale, 0, 0), scale=scale)
            fn(b, **kw)
        b.at()

    return build


def apples_on_tray(b):
    b.box((-1.3, -0.6, 0), (1.3, 0.6, 0.12), "wood", bevel=0)
    for x in (-0.82, 0.0, 0.82):
        b.at((x, 0.0, 0.12))
        P.apple(b, display=True, r=0.4)
    b.at()


def pastries_on_plate(b):
    b.cylinder((0, 0, 0), 1.35, 0.08, "offwhite", segments=10, bevel=0)
    b.at((0, 0, 0.08), scale=1.2)
    P.pastry(b)
    b.at()


def bread_on_board(b):
    b.box((-1.25, -0.75, 0), (1.25, 0.75, 0.1), "wood", bevel=0)
    b.at((0, 0, 0.1))
    P.bread_loaf(b)
    b.at()


ITEMS = {
    "chips": row_of(P.chip_bag, 2, 2.25, ridges=False),
    "pastries": pastries_on_plate,
    "water": row_of(P.water_bottle, 2, 0.8, scale=1.3),
    "toys": row_of(P.toy_box, 2, 2.0),
    "candy": row_of(P.candy_pieces, 1, 0, scale=1.6, count=3),
    "soda": row_of(P.soda_bottle, 2, 0.85, scale=1.35),
    "milk": row_of(P.milk_carton, 2, 1.05, scale=1.35),
    "apples": apples_on_tray,
    "bread": bread_on_board,
}


def slot_positions(count, inner_w, tier_zs, y, rows=None):
    """Two rows (one per tier), evenly spaced across the width."""
    per_row = rows or [math.ceil(count / 2), count // 2]
    out = []
    for row, n in enumerate(per_row):
        step = inner_w / n
        for i in range(n):
            out.append((-inner_w / 2 + step * (i + 0.5), y[row] if isinstance(y, tuple) else y, tier_zs[row]))
    return out


def add_items(kit, item, positions):
    for i, pos in enumerate(positions, start=1):
        with kit.part("Item%d" % i, origin=pos) as b:
            ITEMS[item](b)


def price_tag(kit, x_half, z0, z1, y_front):
    """The yellow board the game writes the price on (front face = -Y)."""
    with kit.part("PriceTag") as b:
        b.box((-x_half, y_front, z0), (x_half, y_front + 0.15, z1), "yellow", bevel=0.05)


def stocked_checks(count):
    def check(a):
        name = cm.part_name
        body = [o for o in a.objects if name(o) in ("Body", "Glass")]
        items = sorted((o for o in a.objects if name(o).startswith("Item")), key=lambda o: int(name(o)[4:]))
        a.check_items_inside(body, items)
        a.check(len(items) == count, "%d item slots (expected %d)" % (len(items), count))

    return check


# ---------------------------------------------------------------------------
# Gondola shelf (Snack, Premium, Water, Toy)
# ---------------------------------------------------------------------------


def gondola(kit, W, H, D, items, item, upright, trim, back, shelf, playful=False):
    x1, y0, y1 = W / 2, -D / 2, D / 2
    up = 0.6
    xi = x1 - up
    cap_z = H - 1.4  # the price board fills the top of H
    with kit.part("Body") as b:
        for s in (-1, 1):
            lo_x, hi_x = sorted((s * x1, s * xi))
            b.box((lo_x + 0.02 * (s < 0), y0 + 0.12, 0), (hi_x - 0.02 * (s > 0), y1, cap_z), upright, bevel=0.12)
            b.box((lo_x + 0.05, y0, 0.3), (hi_x - 0.05, y0 + 0.12, cap_z - 0.2), trim, bevel=0.04)
            if playful:  # polka dots on the end panels
                for k, z in enumerate((1.3, 2.9, 4.5)):
                    b.disc((s * (x1 - 0.008), 0.6 * (-1) ** k, z), 0.45, "yellow" if k % 2 else "mint",
                           segments=10, facing="+X" if s > 0 else "-X")  # fmt: skip
        b.box((-xi, y0 + 0.2, 0), (xi, y1 - 0.2, 0.7), "navy", bevel=0.06)  # kick plinth
        b.box((-xi, y1 - 0.3, 0.7), (xi, y1, cap_z), back, bevel=0.04)  # back panel
        b.front_quad(-xi, cap_z - 0.9, xi, cap_z - 0.7, y1 - 0.312, "mint" if back != "mint" else "offwhite")
        tiers = []
        for z in (0.7, 3.45):
            top = z + 0.25
            b.box((-xi, y0 + 0.12, z), (xi, y1 - 0.3, top), shelf, bevel=0.05)
            b.box((-xi, y0, z - 0.2), (xi, y0 + 0.12, top + 0.05), "navy", bevel=0.04)  # price channel
            tiers.append(top)
        b.box((-x1, y0, cap_z), (x1, y1, cap_z + 0.25), "offwhite", bevel=0.08)  # top cap
        b.box((-4.0, y0 + 0.45, cap_z + 0.25), (4.0, y0 + 0.7, H), "navy", bevel=0.06)  # board backing
    price_tag(kit, 3.7, cap_z + 0.45, H - 0.15, y0 + 0.3)
    add_items(kit, item, slot_positions(items, 2 * xi - 0.4, tiers, -0.55))
    kit.anchor((0, y0 - 1.2, 3.5))


GONDOLAS = {
    "SnackShelf": dict(items=10, item="chips", upright="slate", trim="teal", back="teal", shelf="offwhite"),
    "PremiumShelf": dict(items=7, item="pastries", upright="navy", trim="chip_gold", back="navy", shelf="wood"),
    "WaterShelf": dict(items=12, item="water", upright="slate", trim="kiosk_blue", back="water", shelf="offwhite"),
    "ToyShelf": dict(items=7, item="toys", upright="kiosk_purple", trim="yellow", back="mint", shelf="offwhite", playful=True),
}


def _register_gondola(name, spec):
    notes = "Two-tier gondola; the price board fills the top 1.15 studs so the asset stays 7.6 high."

    @cm.asset("fixtures", "CM_Fixture_" + name, "Interiors", (28, 7.6, 5), budget="fixture", notes=notes)
    def _build(kit):
        gondola(kit, 28, 7.6, 5, **spec)
        return stocked_checks(spec["items"])


for _n, _s in GONDOLAS.items():
    _register_gondola(_n, _s)


@cm.asset("fixtures", "CM_Shelf_Double_Aisle", "Interiors", (28, 7.6, 10), budget="fixture",
          notes="Double-sided gondola 28 x 7.6 x 10: Item1-10 face the front (-Y, chips), Item11-20 face the "
                "back (+Y, cereal). Anchor is in front, AnchorBack behind; PriceTag and PriceTagBack likewise.")  # fmt: skip
def double_aisle(kit):
    W, H, D = 28, 7.6, 10
    x1, y1 = W / 2, D / 2
    up, cap_z = 0.6, H - 1.4
    xi = x1 - up
    with kit.part("Body") as b:
        for s_ in (-1, 1):
            lo_x, hi_x = sorted((s_ * x1, s_ * xi))
            b.box((lo_x + 0.02 * (s_ < 0), -y1 + 0.12, 0), (hi_x - 0.02 * (s_ > 0), y1 - 0.12, cap_z), "slate", bevel=0.12)
            for face in (-1, 1):  # trim strips on both faces of each end
                ya, yb = sorted((face * y1, face * (y1 - 0.12)))
                b.box((lo_x + 0.05, ya, 0.3), (hi_x - 0.05, yb, cap_z - 0.2), "teal", bevel=0)
        b.box((-xi, -y1 + 0.2, 0), (xi, y1 - 0.2, 0.7), "navy", bevel=0.06)
        b.box((-xi, -0.15, 0.7), (xi, 0.15, cap_z), "teal", bevel=0.04)  # central spine
        for face in (-1, 1):
            b.quad([(-xi, face * 0.162, cap_z - 0.9), (xi, face * 0.162, cap_z - 0.9), (xi, face * 0.162, cap_z - 0.7), (-xi, face * 0.162, cap_z - 0.7)][:: -face], "mint")
            for z in (0.7, 3.45):
                ya, yb = sorted((face * 0.15, face * (y1 - 0.12)))
                b.box((-xi, ya, z), (xi, yb, z + 0.25), "offwhite", bevel=0.05)
                ya, yb = sorted((face * (y1 - 0.12), face * y1))
                b.box((-xi, ya, z - 0.2), (xi, yb, z + 0.3), "navy", bevel=0.04)
        b.box((-x1, -y1, cap_z), (x1, y1, cap_z + 0.25), "offwhite", bevel=0.08)
        b.box((-4.0, -0.15, cap_z + 0.25), (4.0, 0.15, H), "navy", bevel=0.06)  # board spine
    for name, face in (("PriceTag", -1), ("PriceTagBack", 1)):
        with kit.part(name) as b:
            ya, yb = sorted((face * 0.15, face * 0.3))
            b.box((-3.7, ya, cap_z + 0.45), (3.7, yb, H - 0.15), "yellow", bevel=0.03)
    inner = 2 * xi - 0.4
    for i, (x, _, z) in enumerate(slot_positions(10, inner, (0.95, 3.7), -2.4), start=1):
        with kit.part("Item%d" % i, origin=(x, -2.4, z)) as b:
            P.chip_bag(b, ridges=False)
    for i, (x, _, z) in enumerate(slot_positions(10, inner, (0.95, 3.7), 2.4), start=11):
        with kit.part("Item%d" % i, origin=(x, 2.4, z)) as b:
            b.at((0, 0, 0), rot_z_deg=180)
            P.cereal_box(b)
            b.at()
    kit.anchor((0, -y1 - 1.2, 3.5))
    kit.anchor((0, y1 + 1.2, 3.5), name="AnchorBack")
    return stocked_checks(20)


# ---------------------------------------------------------------------------
# Snack bin
# ---------------------------------------------------------------------------


@cm.asset("fixtures", "CM_Fixture_SnackBin", "Interiors", (28, 3.4, 5), budget="fixture",
          notes="Low open bin, six compartments per row; price board on a raised back rail.")  # fmt: skip
def snack_bin(kit):
    W, H, D = 28, 3.4, 5
    x1, y0, y1 = W / 2, -D / 2, D / 2
    floor_z = 1.0
    with kit.part("Body") as b:
        b.box((-x1 + 0.3, y0 + 0.3, 0), (x1 - 0.3, y1 - 0.3, 0.5), "navy", bevel=0.06)  # plinth
        b.box((-x1, y0, 0.5), (x1, y1, floor_z), "candy_pink", bevel=0.1)  # tub floor
        wall = 0.35
        b.box((-x1, y0 + 0.02, floor_z), (x1, y0 + wall, 2.0), "candy_pink", bevel=0.1)  # front lip
        b.box((-x1, y1 - wall, floor_z), (x1, y1, 2.0), "candy_pink", bevel=0.1)
        for s in (-1, 1):
            b.box((s * x1 - (wall if s > 0 else 0), y0 + wall, floor_z), (s * x1 + (0 if s > 0 else wall), y1 - wall, 2.0), "candy_pink", bevel=0.08)
        b.front_quad(-x1 + 0.3, 1.2, x1 - 0.3, 1.5, y0 + 0.008, "offwhite")  # stripe on the lip
        for i in range(1, 6):  # dividers: 6 compartments across
            x = -x1 + W * i / 6
            b.box((x - 0.08, y0 + wall, floor_z), (x + 0.08, y1 - wall, 1.7), "offwhite", bevel=0)
        b.box((-x1 + wall, -0.08, floor_z), (x1 - wall, 0.08, 1.5), "offwhite", bevel=0)  # long divider
        # back rail carrying the price board
        for s in (-1, 1):
            b.box((s * 4.2 - 0.12, y1 - 0.3, 2.0), (s * 4.2 + 0.12, y1 - 0.06, H - 0.1), "slate", bevel=0)
        b.box((-4.5, y1 - 0.34, 2.15), (4.5, y1 - 0.02, H), "navy", bevel=0.06)
    price_tag(kit, 4.2, 2.3, H - 0.15, y1 - 0.49)
    add_items(kit, "candy", slot_positions(12, W - 0.7, (floor_z, floor_z), (-1.25, 1.2)))
    kit.anchor((0, y0 - 1.2, 3.5))
    return stocked_checks(12)


# ---------------------------------------------------------------------------
# Glass-door coolers (Drink, Dairy, Produce)
# ---------------------------------------------------------------------------


def cooler(kit, W, H, D, items, item, shell, accent, doors, deluxe=False):
    x1, y0, y1 = W / 2, -D / 2, D / 2
    side = 0.5
    base_top, head_z = 1.0, H - 1.5
    frame_y = y0 + 0.25  # front plane of the door frames
    with kit.part("Body") as b:
        for s in (-1, 1):
            lo_x, hi_x = sorted((s * x1, s * (x1 - side)))
            b.box((lo_x, y0, 0), (hi_x, y1, H), shell, bevel=0.12)
        b.box((-x1 + side, y0 + 0.3, 0), (x1 - side, y1, base_top), "navy", bevel=0.06)  # base
        b.box((-x1 + side, y1 - 0.4, base_top), (x1 - side, y1, head_z), "offwhite", bevel=0)  # bright liner
        b.box((-x1 + side, y0 + 0.2, head_z), (x1 - side, y1, H), shell, bevel=0.1)  # header
        b.box((-x1 + side, y0 + 0.2, base_top), (x1 - side, y1 - 0.4, base_top + 0.1), "metal", bevel=0)  # floor
        tiers = [base_top + 0.1]
        mid = base_top + 0.1 + (head_z - base_top) * 0.48
        b.box((-x1 + side, y0 + 0.8, mid - 0.12), (x1 - side, y1 - 0.4, mid), "metal", bevel=0.03)
        tiers.append(mid)
        # door frames: outer frame plus mullions between doors
        b.box((-x1 + side, frame_y, base_top), (x1 - side, frame_y + 0.2, base_top + 0.18), "slate", bevel=0)
        b.box((-x1 + side, frame_y, head_z - 0.18), (x1 - side, frame_y + 0.2, head_z), "slate", bevel=0)
        dw = (W - 2 * side) / doors
        for i in range(doors + 1):
            x = -x1 + side + i * dw
            b.box((x - 0.12, frame_y, base_top), (x + 0.12, frame_y + 0.2, head_z), "slate", bevel=0)
        for i in range(doors):  # chrome handles
            x = -x1 + side + (i + 0.5) * dw + (dw / 2 - 0.55) * (1 if i % 2 else -1)
            b.box((x - 0.07, frame_y - 0.22, 2.6), (x + 0.07, frame_y - 0.02, 5.6), "metal", bevel=0)
        if deluxe:  # wood-clad base and header trim
            b.front_quad(-x1 + side, 0.2, x1 - side, base_top - 0.2, y0 + 0.288, "wood")
            b.front_quad(-x1 + side, H - 0.35, x1 - side, H - 0.15, y0 + 0.188, "chip_gold")
        else:
            b.front_quad(-x1 + side, 0.35, x1 - side, 0.55, y0 + 0.288, accent)
    with kit.part("Glass", material="glass") as b:
        for i in range(doors):
            xa = -x1 + side + i * dw + 0.12
            b.box((xa, frame_y + 0.05, base_top + 0.18), (xa + dw - 0.24, frame_y + 0.12, head_z - 0.18), "glass", bevel=0)
    with kit.part("LightStrip") as b:
        b.box((-x1 + side + 0.2, y0 + 0.05, head_z - 0.35), (x1 - side - 0.2, y0 + 0.2, head_z - 0.2), "mint", bevel=0)
    price_tag(kit, min(4.0, x1 - 1.5), head_z + 0.2, H - 0.25, y0 + 0.05)
    add_items(kit, item, slot_positions(items, W - 2 * side - 0.6, tiers, 0.4))
    kit.anchor((0, y0 - 1.2, 3.5))


COOLERS = {
    "DrinkCooler": dict(size=(24, 9, 6), items=10, item="soda", shell="navy", accent="red", doors=4),
    "DairyFridge": dict(size=(22, 9, 6), items=7, item="milk", shell="slate", accent="water", doors=4),
    "ProduceFridge": dict(size=(24, 9, 6), items=10, item="apples", shell="navy", accent="leaf_green", doors=3, deluxe=True),
}


def _register_cooler(name, spec):
    spec = dict(spec)
    size = spec.pop("size")
    notes = "Glass-door cooler: Glass is a separate mesh, LightStrip is the mint strip to set to Neon."

    @cm.asset("fixtures", "CM_Fixture_" + name, "Interiors", size, budget="fixture", notes=notes)
    def _build(kit):
        cooler(kit, *size, **spec)
        return stocked_checks(spec["items"])


for _n, _s in COOLERS.items():
    _register_cooler(_n, _s)


# ---------------------------------------------------------------------------
# Produce stand and bakery case
# ---------------------------------------------------------------------------


@cm.asset("fixtures", "CM_Fixture_ProduceStand", "Interiors", (24, 3.6, 5), budget="fixture",
          notes="Wooden stand with crates tilted 12 degrees toward the shopper.")  # fmt: skip
def produce_stand(kit):
    W, H, D = 24, 3.6, 5
    x1, y0, y1 = W / 2, -D / 2, D / 2
    tilt = math.radians(12)
    deck = 1.3
    with kit.part("Body") as b:
        for x in (-x1 + 0.4, 0.0, x1 - 0.4):  # legs, flush with the ends
            for y in (y0 + 0.4, y1 - 0.4):
                b.box((x - 0.4, y - 0.3, 0), (x + 0.4, y + 0.3, deck), "wood", bevel=0)
        b.box((-x1, y0, deck - 0.25), (x1, y1, deck), "wood", bevel=0.08)  # deck
        b.box((-x1 + 0.2, y0 + 0.02, 0.3), (x1 - 0.2, y1 - 0.02, 0.45), "bread", bevel=0)  # lower rail
        # tilted crates: front edge low, back edge high
        rise = (D - 0.6) * math.tan(tilt)
        cw = W / 5
        for i in range(5):
            xa, xb = -x1 + i * cw + 0.1, -x1 + (i + 1) * cw - 0.1
            ya, yb = y0 + 0.1, y1 - 0.5
            za, zb = deck, deck + rise
            t = 0.5  # crate wall height
            b.hexa([(xa, ya, za), (xb, ya, za), (xb, yb, zb), (xa, yb, zb),
                    (xa, ya, za + 0.15), (xb, ya, za + 0.15), (xb, yb, zb + 0.15), (xa, yb, zb + 0.15)], "bread", bevel=0)  # fmt: skip
            b.box((xa, ya, za), (xb, ya + 0.15, za + t), "wood", bevel=0.04)  # front slat
            b.box((xa, yb - 0.15, zb), (xb, yb, zb + t), "wood", bevel=0)  # back slat
            b.front_quad(xa + 0.6, za + 0.15, xb - 0.6, za + 0.35, ya - 0.012, "paver_sand")
        b.box((-x1, y1 - 0.5, deck), (x1, y1, deck + rise + 0.6), "wood", bevel=0.06)  # back riser
        for s in (-1, 1):  # posts carrying the price board
            b.box((s * 3.6 - 0.12, y1 - 0.35, deck + rise + 0.6), (s * 3.6 + 0.12, y1 - 0.15, H - 0.2), "wood", bevel=0)
        b.box((-4.0, y1 - 0.4, H - 0.95), (4.0, y1 - 0.1, H), "leaf_green", bevel=0.06)
    price_tag(kit, 3.7, H - 0.85, H - 0.1, y1 - 0.55)
    # crates hold two apple trays each, front and back, following the tilt
    positions = []
    for row, (yy, frac) in enumerate(((-1.1, 0.25), (0.6, 0.62))):
        for i in range(5):
            x = -x1 + (i + 0.5) * cw
            positions.append((x, yy, deck + 0.15 + rise * frac))
    add_items(kit, "apples", positions)
    kit.anchor((0, y0 - 1.2, 3.5))
    return stocked_checks(10)


@cm.asset("fixtures", "CM_Fixture_BakeryCase", "Interiors", (22, 4.6, 5), budget="fixture",
          notes="Counter with a sloped glass front; loaves on two stepped decks.")  # fmt: skip
def bakery_case(kit):
    W, H, D = 22, 4.6, 5
    x1, y0, y1 = W / 2, -D / 2, D / 2
    deck_z = 2.0
    with kit.part("Body") as b:
        b.box((-x1, y0 + 0.3, 0), (x1, y1, 0.4), "navy", bevel=0.06)  # kick
        b.box((-x1, y0 + 0.02, 0.4), (x1, y1, deck_z), "wood", bevel=0.1)  # counter body
        for i in range(6):  # vertical panel grooves
            x = -x1 + W * (i + 0.5) / 6
            b.front_quad(x - 0.06, 0.7, x + 0.06, deck_z - 0.3, y0 + 0.008, "bread")
        b.box((-x1, y0, deck_z), (x1, y1, deck_z + 0.15), "offwhite", bevel=0.05)  # deck
        b.box((-x1 + 0.4, 0.2, deck_z + 0.15), (x1 - 0.4, y1 - 0.2, deck_z + 0.7), "offwhite", bevel=0.05)  # rear step
        for s in (-1, 1):  # end frames of the glass hood
            lo_x, hi_x = sorted((s * x1, s * (x1 - 0.3)))
            b.hexa([(lo_x, y0, deck_z + 0.15), (hi_x, y0, deck_z + 0.15), (hi_x, y1, deck_z + 0.15), (lo_x, y1, deck_z + 0.15),
                    (lo_x, y0 + 1.6, H - 0.3), (hi_x, y0 + 1.6, H - 0.3), (hi_x, y1, H - 0.3), (lo_x, y1, H - 0.3)], "slate", bevel=0.05)  # fmt: skip
        b.box((-x1, y0 + 1.6, H - 0.3), (x1, y1, H - 0.15), "slate", bevel=0.05)  # hood top
        b.box((-x1 + 0.3, y0 + 1.75, H - 0.45), (x1 - 0.3, y0 + 1.95, H - 0.3), "warm_light", bevel=0)  # light bar
        b.box((-4.0, y1 - 0.4, H - 0.15), (4.0, y1 - 0.1, H), "slate", bevel=0)
    with kit.part("Glass", material="glass") as b:
        g = 0.08
        b.hexa([(-x1 + 0.3, y0 + 0.02, deck_z + 0.15), (x1 - 0.3, y0 + 0.02, deck_z + 0.15), (x1 - 0.3, y0 + 0.02 + g, deck_z + 0.15), (-x1 + 0.3, y0 + 0.02 + g, deck_z + 0.15),
                (-x1 + 0.3, y0 + 1.6, H - 0.3), (x1 - 0.3, y0 + 1.6, H - 0.3), (x1 - 0.3, y0 + 1.6 + g, H - 0.3), (-x1 + 0.3, y0 + 1.6 + g, H - 0.3)], "glass")  # fmt: skip
    with kit.part("PriceTag") as b:  # strip on the hood's front edge, facing the shopper
        b.box((-3.7, y0 + 1.45, H - 0.3), (3.7, y0 + 1.6, H), "yellow", bevel=0.03)
    positions = slot_positions(7, W - 1.6, (deck_z + 0.15, deck_z + 0.7), (-0.6, 1.25), rows=[4, 3])
    add_items(kit, "bread", positions)
    kit.anchor((0, y0 - 1.2, 3.5))
    return stocked_checks(7)


# ---------------------------------------------------------------------------
# Checkout lane and sign
# ---------------------------------------------------------------------------


@cm.asset("fixtures", "CM_Fixture_CheckoutLane", "Interiors", (3, 3.6, 9), budget="fixture", measure=["Body"],
          notes="Counter is 3 x 3.6 x 9 along Y; Belt, Register, Screen and LanePost are separate parts. "
                "LanePlate is the blank lane-number face; LaneLamp can be set to Neon.")  # fmt: skip
def checkout_lane(kit):
    W, H, D = 3, 3.6, 9
    x1, y0, y1 = W / 2, -D / 2, D / 2
    with kit.part("Body") as b:
        b.box((-x1 + 0.15, y0 + 0.15, 0), (x1 - 0.15, y1 - 0.15, 0.4), "navy", bevel=0.06)  # kick
        b.box((-x1 + 0.02, y0, 0.4), (x1 - 0.02, y1, H - 0.25), "teal", bevel=0.12)
        b.box((-x1, y0, H - 0.25), (x1, y1, H), "offwhite", bevel=0.08)  # worktop
        b.quad([(-x1 + 0.008, y1 - 0.4, 1.0), (-x1 + 0.008, y0 + 0.4, 1.0), (-x1 + 0.008, y0 + 0.4, 1.4), (-x1 + 0.008, y1 - 0.4, 1.4)], "yellow")
        b.quad([(x1 - 0.008, y0 + 0.4, 1.0), (x1 - 0.008, y1 - 0.4, 1.0), (x1 - 0.008, y1 - 0.4, 1.4), (x1 - 0.008, y0 + 0.4, 1.4)], "yellow")
    with kit.part("Belt") as b:
        b.box((-x1 + 0.3, -0.6, H), (x1 - 0.3, y1 - 0.3, H + 0.12), "dark", bevel=0)
        for k in range(6):
            y = -0.4 + k * (y1 - 0.5 + 0.4) / 6
            b.top_quad(-x1 + 0.35, y, x1 - 0.35, y + 0.08, H + 0.125, "slate")
        b.box((-x1 + 0.2, -0.7, H), (x1 - 0.2, -0.55, H + 0.3), "metal", bevel=0)  # divider bar
    with kit.part("Register") as b:
        b.box((-x1 + 0.4, y0 + 0.5, H), (x1 - 0.4, y0 + 2.0, H + 0.55), "slate", bevel=0.08)
        b.box((-x1 + 0.55, y0 + 0.6, H + 0.55), (x1 - 0.55, y0 + 1.3, H + 0.62), "dark", bevel=0)  # keypad
        for i in range(3):
            for j in range(2):
                b.top_quad(-0.6 + i * 0.45, y0 + 0.68 + j * 0.3, -0.3 + i * 0.45, y0 + 0.9 + j * 0.3, H + 0.625, "metal")
        b.box((-x1 + 0.45, y0 + 2.0, H), (x1 - 0.45, y0 + 2.3, H + 0.2), "metal", bevel=0)  # scanner plate
        b.top_quad(-0.6, y0 + 2.04, 0.6, y0 + 2.26, H + 0.205, "red")
    with kit.part("Screen") as b:
        b.box((-0.1, y0 + 1.6, H + 0.55), (0.1, y0 + 1.8, H + 1.2), "slate", bevel=0)  # neck
        b.at((0, y0 + 1.7, H + 1.4), rot_x_deg=-20)
        b.box((-0.8, -0.08, -0.5), (0.8, 0.08, 0.5), "navy", bevel=0.05)
        b.front_quad(-0.7, -0.42, 0.7, 0.42, -0.095, "kiosk_blue")
        b.at()
    with kit.part("LanePost") as b:
        b.cylinder((x1 - 0.35, y1 - 0.4, H), 0.12, 4.0, "metal", segments=8, bevel=0)
        b.box((x1 - 0.75, y1 - 0.65, H + 4.0), (x1 + 0.05, y1 - 0.15, H + 5.2), "navy", bevel=0.06)
    with kit.part("LanePlate") as b:  # blank face for the lane number
        b.box((x1 - 0.65, y1 - 0.7, H + 4.12), (x1 - 0.05, y1 - 0.65, H + 5.08), "offwhite", bevel=0)
    with kit.part("LaneLamp") as b:
        b.cylinder((x1 - 0.35, y1 - 0.4, H + 5.2), 0.3, 0.3, "warm_light", segments=8, bevel=0)
        b.cylinder((x1 - 0.35, y1 - 0.4, H + 5.5), 0.3, 0.12, "navy", segments=8, top_radius=0.1, bevel=0)
    kit.anchor((x1 + 1.2, 0, 3.5))


@cm.asset("fixtures", "CM_Decor_CheckoutSign", "Interiors", (14, 3, 0.5), budget="fixture", measure=["Body", "Face", "Neon"],
          notes="Board is 14 x 3 x 0.5 with its bottom at the pivot; Rods rise 4.4 above it. Face is blank.")  # fmt: skip
def checkout_sign(kit):
    W, H, D = 14, 3, 0.5
    x1, y0, y1 = W / 2, -D / 2, D / 2
    with kit.part("Body") as b:
        b.box((-x1, y0 + 0.1, 0), (x1, y1, H), "navy", bevel=0.15)
    with kit.part("Face") as b:  # the game draws "CHECKOUT" here
        b.box((-x1 + 0.45, y0 + 0.02, 0.45), (x1 - 0.45, y0 + 0.1, H - 0.45), "teal", bevel=0)
    with kit.part("Neon") as b:  # outline tube: set to Neon in Roblox
        t = 0.1
        xo, zo, zt = x1 - 0.22, 0.22, H - 0.22
        for lo, hi in (((-xo, y0, zo - t), (xo, y0 + 0.1, zo)), ((-xo, y0, zt), (xo, y0 + 0.1, zt + t)),
                       ((-xo - t, y0, zo - t), (-xo, y0 + 0.1, zt + t)), ((xo, y0, zo - t), (xo + t, y0 + 0.1, zt + t))):  # fmt: skip
            b.box(lo, hi, "yellow", bevel=0)
    with kit.part("Rods") as b:
        for s in (-1, 1):
            b.cylinder((s * (x1 - 1.5), 0.05, H), 0.06, 4.4, "metal", segments=6, bevel=0)
            b.cylinder((s * (x1 - 1.5), 0.05, H + 4.3), 0.3, 0.1, "metal", segments=8, bevel=0)


def build(mats, only=None):
    return cm.build_family("fixtures", mats, only)
