"""Chaos Mart Tycoon: product library.

Every product is built at its own bottom centre with its front facing -Y, and
is exported as its own file `CM_Product_<Name>.fbx` (one mesh named after the
product, <= 150 tris). Fixtures reuse these same builders for their Item slots,
so a product looks identical loose or on a shelf.

Packaging is original and text-free: colour blocks, stripes and simple shapes.
Sizes are game-scale (an R6 character is 5 studs tall), not real-world scale.
"""

import math

import cm_common as cm

# ---------------------------------------------------------------------------
# Packaged food
# ---------------------------------------------------------------------------


def chip_bag(b, body="yellow", crimp="chip_gold", band="red", ridges=True):
    """Puffy chip bag: pillow body, crimped seals top and bottom, badge and chips."""
    w, h, d_mid, d_end = 0.95, 2.0, 0.42, 0.12
    z0, z1 = 0.16, h - 0.16  # pillow between the two seals
    zm = (z0 + z1) / 2
    # one closed pillow, fattest in the middle; the middle crease stays soft
    rings = [(z0, d_end, w), (zm, d_mid, w * 1.02), (z1, d_end, w)]
    verts = [(sx * ww, sy * d, z) for z, d, ww in rings for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    faces = [(0, 3, 2, 1), (8, 9, 10, 11)]
    for r in (0, 4):
        faces += [(r + i, r + (i + 1) % 4, r + 4 + (i + 1) % 4, r + 4 + i) for i in range(4)]
    made = b._faces(verts, faces, body, 0.1)
    for f in made:
        for e in f.edges:
            if all(abs(v.co.z - zm) < 1e-5 for v in e.verts):
                e[b.bw] = 0.0
    for zc in (0.0, z1):  # crimped seals with a serrated edge
        b.box((-w * 1.04, -0.07, zc), (w * 1.04, 0.07, zc + 0.16), crimp, bevel=0)
        for i in range(8 if ridges else 0):  # vertical crimp ridges
            x = -w + 0.12 + i * (2 * w - 0.24) / 7
            b.front_quad(x - 0.025, zc + 0.02, x + 0.025, zc + 0.14, -0.085, "chip_gold" if crimp != "chip_gold" else "bread")

    def front(u, z, out=0.012):  # a point on the front surface at height z
        t = 1 - abs(z - zm) / (zm - z0)
        return (u, -(d_end + (d_mid - d_end) * t) - out, z)

    # colour band across the top third
    b.quad([front(-w + 0.06, z1 - 0.55), front(w - 0.06, z1 - 0.55), front(w - 0.06, z1 - 0.08), front(-w + 0.06, z1 - 0.08)], band)
    # round brand badge overlapping the band
    cx, cz = 0.0, z1 - 0.5
    pts = [front(cx + 0.36 * math.cos(a), cz + 0.3 * math.sin(a), 0.03) for a in [2 * math.pi * (i + 0.5) / 10 for i in range(10)]]
    b.poly(pts, "offwhite")
    # three golden chips in the window below
    for x, z, rot in ((-0.38, 0.62, 0.3), (0.05, 0.5, -0.2), (0.42, 0.66, 0.5)):
        pts = [front(x + 0.24 * math.cos(a + rot), z + 0.15 * math.sin(a + rot), 0.02) for a in [2 * math.pi * i / 8 for i in range(8)]]
        b.poly(pts, "chip_gold")


def candy_bag(b):
    chip_bag(b, body="candy_pink", crimp="red", band="kiosk_purple")


def cereal_box(b, body="red", accent="yellow"):
    """Cereal box: title banner, bowl of flakes with a spoon, nutrition side panel."""
    w, h, d = 0.8, 2.3, 0.32
    b.box((-w, -d, 0), (w, d, h), body, bevel=0.05)
    y = -d - 0.012
    # banner with a white logo lozenge
    b.front_quad(-w + 0.1, 1.7, w - 0.1, 2.15, y, accent)
    b.disc((0, y - 0.015, 1.93), 0.5, "offwhite", segments=10, radius2=0.15)
    b.front_quad(-0.32, 1.9, 0.32, 1.96, y - 0.03, body)
    # bowl: lower half-ellipse with a rim, flakes heaped above it
    bowl = [(0.6 * math.cos(a), y - 0.015, 0.8 + 0.42 * math.sin(a)) for a in [math.pi + math.pi * i / 8 for i in range(9)]]
    b.poly(bowl, "offwhite")
    b.front_quad(-0.62, 0.8, 0.62, 0.86, y - 0.03, "kiosk_blue")
    for x, z in ((-0.35, 0.95), (-0.1, 1.02), (0.15, 0.97), (0.38, 0.92), (0.0, 1.13), (-0.25, 1.12), (0.27, 1.1)):
        b.disc((x, y - 0.02, z), 0.12, "pastry", segments=6, radius2=0.08)
    b.quad([(0.3, y - 0.035, 0.95), (0.38, y - 0.035, 0.98), (0.72, y - 0.035, 1.48), (0.64, y - 0.035, 1.5)], "metal")
    # side nutrition panel on +X
    b.quad([(w + 0.012, -0.22, 0.3), (w + 0.012, 0.22, 0.3), (w + 0.012, 0.22, 1.6), (w + 0.012, -0.22, 1.6)], "offwhite")
    b.quad([(w + 0.02, -0.18, 1.3), (w + 0.02, 0.18, 1.3), (w + 0.02, 0.18, 1.5), (w + 0.02, -0.18, 1.5)], accent)


def cookie_box(b):
    w, h, d = 0.95, 0.85, 0.4
    b.box((-w, -d, 0), (w, d, h), "kiosk_blue", bevel=0.06)
    y = -d - 0.01
    b.front_quad(-w + 0.1, 0.62, w - 0.1, 0.76, y, "yellow")
    for x in (-0.5, 0.0, 0.5):
        b.disc((x, y, 0.33), 0.22, "bread", segments=8)
        b.disc((x + 0.05, y - 0.02, 0.37), 0.05, "bread_dark", segments=4)


def bread_loaf(b):
    """Bloomer loaf: a crisp base with a rounded crown and pale score marks."""
    w, d, cz, ch = 1.05, 0.6, 0.42, 0.5
    rx, ry = w * 0.98, d * 0.98
    b.box((-w, -d, 0), (w, d, 0.45), "bread", bevel=0.12)
    b.ellipsoid((0, 0, cz), (rx, ry, ch), "bread", segments=10, rings=5)

    def on_crown(x, y):
        k = max(0.0, 1 - (x / rx) ** 2 - (y / ry) ** 2)
        return (x, y, cz + ch * math.sqrt(k) + 0.015)

    for x in (-0.5, 0.0, 0.5):  # slanted score marks lying on the crown
        b.poly([on_crown(x - 0.13, -0.3), on_crown(x + 0.06, 0.0), on_crown(x + 0.13, 0.3), on_crown(x - 0.06, 0.0)], "paver_sand")


def milk_carton(b, body="milk", band="water"):
    w, h, d = 0.45, 1.45, 0.45
    b.box((-w, -d, 0), (w, d, h), body, bevel=0.04)
    ridge = 0.35
    b.hexa(
        [
            (-w, -d, h), (w, -d, h), (w, d, h), (-w, d, h),
            (-w, -0.03, h + ridge), (w, -0.03, h + ridge), (w, 0.03, h + ridge), (-w, 0.03, h + ridge),
        ],
        body,
    )  # fmt: skip
    b.box((-w * 0.9, -0.06, h + ridge - 0.02), (w * 0.9, 0.06, h + ridge + 0.14), body, bevel=0)
    y = -d - 0.01
    b.front_quad(-w + 0.05, 0.25, w - 0.05, 0.85, y, band)
    b.disc((0, y - 0.02, 0.55), 0.18, "offwhite", segments=6)


def juice_carton(b):
    milk_carton(b, body="kiosk_orange", band="leaf_green")


def egg_carton(b):
    w, h, d = 1.05, 0.45, 0.55
    b.box((-w, -d, 0), (w, d, h), "paver_sand", bevel=0)
    for i in range(3):
        for j in range(2):
            x, y = -0.66 + i * 0.66, -0.26 + j * 0.52
            b.cylinder((x, y, h - 0.02), 0.22, 0.2, "offwhite", segments=6, top_radius=0.14, bevel=0)
    b.front_quad(-0.6, 0.12, 0.6, 0.34, -d - 0.01, "yellow")


def cheese_wedge(b):
    """Wedge of cheese seen point-first, holes on the cut faces, red wax rind."""
    h = 0.8
    tri = [(-1.0, 0.0), (0.7, -0.62), (0.7, 0.62)]  # tip, front-right, back-right (CCW)
    verts = [(x, y, 0) for x, y in tri] + [(x, y, h) for x, y in tri]
    faces = [(0, 2, 1), (3, 4, 5), (0, 1, 4, 3), (1, 2, 5, 4), (2, 0, 3, 5)]
    b._faces(verts, faces, "yellow", 0.05)
    # wax rind on the curved back (+X) face
    b.quad([(0.72, -0.62, 0.0), (0.72, 0.62, 0.0), (0.72, 0.62, h), (0.72, -0.62, h)], "red")
    # holes on the top face
    for x, y, r in ((-0.25, 0.0, 0.12), (0.3, 0.25, 0.1), (0.35, -0.25, 0.08)):
        b.disc((x, y, h + 0.012), r, "chip_gold", segments=8, facing="+Z")
    # holes on the front cut face (tip -> front-right)
    ax, ay = tri[0]
    bx, by = tri[1]
    nx, ny = by - ay, -(bx - ax)
    ln = math.hypot(nx, ny)
    nx, ny = nx / ln * 0.012, ny / ln * 0.012
    for t, z, r in ((0.45, 0.3, 0.13), (0.75, 0.55, 0.09), (0.25, 0.6, 0.07)):
        px, py = ax + (bx - ax) * t + nx, ay + (by - ay) * t + ny
        ux, uy = (bx - ax) / 1.81, (by - ay) / 1.81
        pts = [(px + ux * r * math.cos(a), py + uy * r * math.cos(a), z + r * math.sin(a)) for a in [2 * math.pi * i / 8 for i in range(8)]]
        b.poly(pts, "chip_gold")


def frozen_pizza(b):
    w, h, d = 1.1, 0.28, 1.1
    b.box((-w, -d, 0), (w, d, h), "kiosk_blue", bevel=0.05)
    z = h + 0.01
    b.disc((0, 0, z), 0.85, "pastry", segments=10, facing="+Z")
    b.disc((0, 0, z + 0.02), 0.7, "red", segments=10, facing="+Z")
    for x, y in ((-0.3, 0.2), (0.3, 0.25), (0.0, -0.3), (0.35, -0.2), (-0.35, -0.25)):
        b.disc((x, y, z + 0.04), 0.1, "yellow", segments=6, facing="+Z")


def ice_cream_tub(b):
    """Ice-cream tub: tapered body, pink lid and a wrap-around label band."""
    r0, r1, h = 0.62, 0.7, 0.85
    b.cylinder((0, 0, 0), r0, h, "offwhite", segments=12, top_radius=r1, bevel=0)
    r_at = lambda z: r0 + (r1 - r0) * z / h + 0.012  # noqa: E731
    b.cylinder((0, 0, 0.28), r_at(0.28), 0.3, "candy_pink", segments=12, top_radius=r_at(0.58), bevel=0, cap=False)
    b.cylinder((0, 0, h), r1 + 0.04, 0.14, "candy_pink", segments=12, bevel=0)
    b.disc((0, 0, h + 0.155), 0.35, "offwhite", segments=10, facing="+Z")


def pastry(b):
    """Croissant: a curled crescent with rolled, segmented layers."""
    n = 9
    path = [(math.cos(math.pi * (0.15 + 0.7 * t / (n - 1))) * 0.9, math.sin(math.pi * (0.15 + 0.7 * t / (n - 1))) * 0.55 - 0.3, 0.0) for t in range(n)]
    radii = [0.0, 0.17, 0.26, 0.36, 0.27, 0.36, 0.26, 0.17, 0.0]
    path = [(x, y, max(r, 0.1) * 0.95) for (x, y, _), r in zip(path, radii)]
    b.sweep(path, radii, "pastry", sides=8, flat=0.95)


def candy_pieces(b, count=4):
    """Wrapped sweets laid out without touching, twists left and right."""
    spots = ((-0.38, -0.22, "candy_pink"), (0.38, -0.22, "kiosk_purple"), (-0.38, 0.24, "yellow"), (0.38, 0.24, "candy_pink"))
    for x, y, c in spots[:count]:
        b.ellipsoid((x, y, 0.18), (0.2, 0.16, 0.16), c, segments=6, rings=4)
        for s in (-1, 1):
            b.sweep([(x + s * 0.18, y, 0.18), (x + s * 0.34, y, 0.18)], [0.03, 0.11], c, sides=4)


def apple(b, colour="apple_red", r=0.4, display=False):
    """Round apple: smooth sphere, stem and leaf. `display` is the lighter shelf version."""
    if display:
        b.ellipsoid((0, 0, r), (r, r, r * 0.94), colour, segments=8, rings=5)
        b.cylinder((0, 0, r * 1.75), 0.03, r * 0.42, "bread_dark", segments=3, bevel=0, cap=False)
        return
    b.ellipsoid((0, 0, r), (r, r, r * 0.94), colour, segments=10, rings=7)
    b.cylinder((0, 0, r * 1.75), 0.03, r * 0.42, "bread_dark", segments=4, bevel=0)
    b.ellipsoid((0.13, 0, r * 2.0), (0.13, 0.06, 0.025), "leaf_green", segments=4, rings=3)


def orange(b):
    """Round orange: smooth 10x7 sphere with a small green calyx."""
    r = 0.42
    b.ellipsoid((0, 0, r), (r, r, r), "kiosk_orange", segments=10, rings=7)
    b.ellipsoid((0, 0, 2 * r), (0.08, 0.08, 0.025), "leaf_green", segments=4, rings=3)


def banana_bunch(b):
    """Three curved bananas sharing one stem, each a single smooth tube."""
    for k, dy in enumerate((-0.3, 0.0, 0.3)):
        lift = 0.06 * k
        path = [(-0.95, dy * 0.5, 0.55 + lift), (-0.7, dy * 0.8, 0.32 + lift), (-0.25, dy, 0.17 + lift),
                (0.25, dy, 0.17 + lift), (0.7, dy * 0.85, 0.32 + lift), (0.95, dy * 0.7, 0.55 + lift)]  # fmt: skip
        b.sweep(path, [0.06, 0.13, 0.16, 0.16, 0.12, 0.05], "yellow", sides=5, flat=0.85)
    b.cylinder((-1.0, 0, 0.5), 0.1, 0.18, "bread_dark", segments=4, bevel=0)


def carrot_bunch(b):
    """Three tapered carrots lying side by side, green tops at the back."""
    for x in (-0.36, 0.0, 0.36):
        path = [(x, 0.7, 0.2), (x, 0.3, 0.2), (x, -0.3, 0.16), (x, -0.8, 0.1)]
        b.sweep(path, [0.17, 0.19, 0.13, 0.0], "kiosk_orange", sides=6)
        b.sweep([(x, 0.7, 0.2), (x, 0.95, 0.32), (x, 1.15, 0.5)], [0.08, 0.06, 0.0], "leaf_green", sides=4)


def lettuce(b):
    """Round head of lettuce: a smooth core with a pale heart on top."""
    b.ellipsoid((0, 0, 0.55), (0.6, 0.6, 0.55), "leaf_green", segments=10, rings=6)
    b.ellipsoid((0, 0, 0.9), (0.32, 0.32, 0.22), "mint", segments=6, rings=4)


def water_bottle(b):
    b.cylinder((0, 0, 0), 0.3, 1.25, "water", segments=8, bevel=0)
    b.cylinder((0, 0, 1.25), 0.3, 0.3, "water", segments=8, top_radius=0.12, bevel=0)
    b.cylinder((0, 0, 1.55), 0.13, 0.15, "navy", segments=6, bevel=0)
    b.cylinder((0, 0, 0.45), 0.315, 0.4, "offwhite", segments=8, bevel=0, cap=False)


def soda_can(b, body="soda_red", stripe="offwhite"):
    b.cylinder((0, 0, 0), 0.32, 0.9, body, segments=8, bevel=0.04)
    b.cylinder((0, 0, 0.9), 0.3, 0.06, "metal", segments=8, bevel=0)
    b.cylinder((0, 0, 0.42), 0.325, 0.12, stripe, segments=8, bevel=0, cap=False)


def soda_bottle(b):
    b.cylinder((0, 0, 0), 0.36, 1.35, "soda_red", segments=8, bevel=0)
    b.cylinder((0, 0, 1.35), 0.36, 0.4, "soda_red", segments=8, top_radius=0.13, bevel=0)
    b.cylinder((0, 0, 1.75), 0.14, 0.16, "offwhite", segments=6, bevel=0)
    b.cylinder((0, 0, 0.5), 0.375, 0.45, "yellow", segments=8, bevel=0, cap=False)


def energy_drink(b):
    b.cylinder((0, 0, 0), 0.24, 1.15, "navy", segments=8, bevel=0.03)
    b.cylinder((0, 0, 1.15), 0.22, 0.05, "metal", segments=8, bevel=0)
    # lightning bolt decal
    y = -0.245
    b.quad([(-0.1, y, 0.75), (0.08, y, 0.95), (0.02, y, 0.62), (-0.04, y, 0.6)], "mint")
    b.quad([(-0.02, y, 0.62), (0.12, y, 0.6), (-0.08, y, 0.3), (-0.04, y, 0.55)], "mint")


def coffee_cup(b):
    b.cylinder((0, 0, 0), 0.26, 0.9, "offwhite", segments=8, top_radius=0.34, bevel=0.02)
    b.cylinder((0, 0, 0.3), 0.3, 0.3, "wood", segments=8, top_radius=0.315, bevel=0, cap=False)
    b.cylinder((0, 0, 0.9), 0.36, 0.1, "dark", segments=8, top_radius=0.3, bevel=0)


# ---------------------------------------------------------------------------
# General merchandise (advanced stores)
# ---------------------------------------------------------------------------


def toy_box(b):
    w, h, d = 0.9, 1.7, 0.5
    b.box((-w, -d, 0), (w, d, h), "toy_purple", bevel=0.08)
    y = -d - 0.01
    b.front_quad(-0.7, 0.3, 0.7, 1.35, y, "mint")  # window
    b.star((0, y - 0.02, 0.85), 0.32, "yellow")  # star toy
    b.front_quad(-0.7, 1.45, 0.7, 1.6, y, "yellow")


def headphones(b):
    """Over-ear headphones: padded arched band, sliders and round cushioned cups."""
    cup_r, cup_z, half = 0.38, 0.42, 0.62
    for s in (-1, 1):
        x = s * half
        b.at((x, 0, cup_z), rot_y_deg=90)
        b.cylinder((0, 0, -0.14), cup_r, 0.28, "navy", segments=10, bevel=0)
        b.at((x, 0, cup_z), rot_y_deg=90)  # soft cushion on the inner face
        b.cylinder((0, 0, -0.2 * s - 0.06), cup_r * 0.85, 0.12, "dark", segments=10, bevel=0)
        b.at()  # teal badge on the outer face
        b.disc((x + s * 0.155, 0, cup_z), cup_r * 0.55, "teal", segments=8, facing="+X" if s > 0 else "-X")
        b.box((x - 0.06, -0.07, cup_z + cup_r - 0.04), (x + 0.06, 0.07, cup_z + cup_r + 0.28), "metal", bevel=0)  # slider
    b.at()
    arc = [(math.cos(math.pi * t / 6) * half, 0, cup_z + cup_r + 0.24 + math.sin(math.pi * t / 6) * 0.62) for t in range(7)]
    b.sweep(arc, [0.07] * 7, "slate", sides=5, flat=0.6)
    b.sweep([(x, y, z - 0.06) for x, y, z in arc[1:6]], [0.0, 0.09, 0.1, 0.09, 0.0], "teal", sides=5, flat=0.7)


def game_controller(b):
    """Gamepad: body with two angled grips, thumbsticks, d-pad and face buttons."""
    b.box((-0.55, -0.3, 0.05), (0.55, 0.3, 0.32), "slate", bevel=0.1)
    for s in (-1, 1):
        b.sweep([(s * 0.42, -0.05, 0.2), (s * 0.62, 0.2, 0.17), (s * 0.7, 0.45, 0.13)], [0.2, 0.19, 0.15], "slate", sides=8, flat=0.75)
    z = 0.33
    b.cylinder((-0.2, 0.1, z - 0.01), 0.1, 0.1, "dark", segments=8, bevel=0)  # sticks
    b.cylinder((0.2, 0.1, z - 0.01), 0.1, 0.1, "dark", segments=8, bevel=0)
    b.top_quad(-0.47, -0.17, -0.27, -0.11, z, "dark")  # d-pad
    b.top_quad(-0.4, -0.24, -0.34, -0.04, z + 0.005, "dark")
    for x, y, c in ((0.37, -0.2, "red"), (0.45, -0.13, "teal"), (0.29, -0.13, "yellow"), (0.37, -0.06, "kiosk_blue")):
        b.disc((x, y, z), 0.045, c, segments=6, facing="+Z")


def television(b):
    w, h = 2.2, 1.35
    b.box((-0.45, -0.35, 0), (0.45, 0.35, 0.1), "dark", bevel=0.04)  # foot
    b.box((-0.1, 0.0, 0.1), (0.1, 0.12, 0.5), "dark", bevel=0)  # neck
    b.box((-w, -0.08, 0.45), (w, 0.12, 0.45 + 2 * h), "navy", bevel=0.06)
    y = -0.09
    b.front_quad(-w + 0.12, 0.57, w - 0.12, 0.45 + 2 * h - 0.12, y, "kiosk_blue")
    y -= 0.02  # diagonal screen glint
    b.quad([(-1.9, y, 0.7), (-1.5, y, 0.7), (-0.8, y, 2.9), (-1.2, y, 2.9)], "water")


def cleaning_spray(b):
    b.cylinder((0, 0, 0), 0.3, 1.1, "mint", segments=8, bevel=0)
    b.cylinder((0, 0, 1.1), 0.3, 0.2, "mint", segments=8, top_radius=0.15, bevel=0)
    b.box((-0.12, -0.42, 1.3), (0.12, 0.15, 1.55), "teal", bevel=0)
    b.box((-0.06, -0.3, 1.05), (0.06, -0.15, 1.3), "teal", bevel=0)
    b.cylinder((0, 0, 0.35), 0.31, 0.4, "offwhite", segments=8, bevel=0, cap=False)


def detergent_jug(b):
    b.box((-0.55, -0.35, 0), (0.55, 0.35, 1.3), "kiosk_blue", bevel=0.12)
    b.box((0.05, -0.12, 1.3), (0.5, 0.12, 1.65), "kiosk_blue", bevel=0.06)  # handle
    b.cylinder((-0.28, 0, 1.3), 0.14, 0.2, "yellow", segments=6, bevel=0)
    b.front_quad(-0.4, 0.3, 0.4, 0.9, -0.36, "offwhite")
    b.disc((0, -0.365, 0.6), 0.2, "water", segments=6)


def honey_jar(b):
    """Premium grocery: a gold-lidded jar."""
    b.cylinder((0, 0, 0), 0.4, 0.85, "chip_gold", segments=8, bevel=0)
    b.cylinder((0, 0, 0.85), 0.42, 0.18, "navy", segments=8, bevel=0)
    b.cylinder((0, 0, 0.3), 0.405, 0.35, "offwhite", segments=8, bevel=0, cap=False)


def premium_gift_box(b):
    b.box((-0.75, -0.55, 0), (0.75, 0.55, 0.9), "navy", bevel=0.05)
    b.box((-0.8, -0.6, 0.9), (0.8, 0.6, 1.1), "navy", bevel=0)
    b.box((-0.12, -0.61, 0), (0.12, 0.61, 1.12), "chip_gold", bevel=0)
    b.box((-0.81, -0.12, 0), (0.81, 0.12, 1.12), "chip_gold", bevel=0)
    b.ellipsoid((-0.15, 0, 1.2), (0.18, 0.1, 0.1), "chip_gold", segments=4, rings=3)
    b.ellipsoid((0.15, 0, 1.2), (0.18, 0.1, 0.1), "chip_gold", segments=4, rings=3)


def tshirt_display(b):
    """Folded T-shirt stack for clothing displays."""
    for k, c in enumerate(("teal", "red", "yellow")):
        z = k * 0.22
        b.box((-0.8, -0.55, z), (0.8, 0.55, z + 0.2), c, bevel=0.05)
    b.front_quad(-0.25, 0.48, 0.25, 0.6, -0.56, "offwhite")


# ---------------------------------------------------------------------------
# Registry: one exported file per product
# ---------------------------------------------------------------------------

PRODUCTS = {
    "ChipBag": chip_bag, "CandyBag": candy_bag, "CandyPieces": candy_pieces,
    "CerealBox": cereal_box, "CookieBox": cookie_box, "BreadLoaf": bread_loaf,
    "MilkCarton": milk_carton, "JuiceCarton": juice_carton, "EggCarton": egg_carton,
    "CheeseWedge": cheese_wedge, "FrozenPizza": frozen_pizza, "IceCreamTub": ice_cream_tub,
    "Pastry": pastry, "Apple": apple, "Orange": orange, "BananaBunch": banana_bunch,
    "CarrotBunch": carrot_bunch, "Lettuce": lettuce, "WaterBottle": water_bottle,
    "SodaCan": soda_can, "SodaBottle": soda_bottle, "EnergyDrink": energy_drink,
    "CoffeeCup": coffee_cup, "ToyBox": toy_box, "Headphones": headphones,
    "GameController": game_controller, "Television": television, "CleaningSpray": cleaning_spray,
    "DetergentJug": detergent_jug, "HoneyJar": honey_jar, "PremiumGiftBox": premium_gift_box,
    "TShirtStack": tshirt_display,
}  # fmt: skip


def _register(name, fn):
    @cm.asset("products", "CM_Product_" + name, "Products", None, budget="item")
    def _build(kit):
        with kit.part(name) as b:
            fn(b)
        cm.recentre(kit.collection.objects[cm.prefixed(kit.collection, name)])


for _name, _fn in PRODUCTS.items():
    _register(_name, _fn)


def build(mats, only=None):
    return cm.build_family("products", mats, only)
