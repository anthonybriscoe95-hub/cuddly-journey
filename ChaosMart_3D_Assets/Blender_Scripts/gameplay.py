"""Chaos Mart Tycoon: tycoon gameplay objects and chaos-event props.

Visual assets only; Luau scripts implement the interactions. Parts the game
drives are separate and named for their job:
  Button       the pressable top of a pad (tween it down, recolour it)
  PriceBoard   blank board for the BillboardGui / SurfaceGui showing the price
  Face         any other blank surface for UI text
  Lid          hinged lids (pivot on the hinge line)
  Coin, Light, Hologram   spin / glow / fade targets
"""

import math

import cm_common as cm
import interiors as I


def exact(r, n):
    return r / math.cos(math.pi / n)


def price_board(kit, y=3.6, z0=0.0, width=6.0):
    """Post-mounted blank price board behind a pad (front faces -Y)."""
    with kit.part("Body") as b:
        for s in (-1, 1):
            b.box((s * (width / 2 - 0.4) - 0.15, y - 0.15, z0), (s * (width / 2 - 0.4) + 0.15, y + 0.15, z0 + 5.0), "slate", bevel=0)
    with kit.part("PriceBoard") as b:
        b.box((-width / 2, y - 0.2, z0 + 3.6), (width / 2, y + 0.2, z0 + 6.0), "navy", bevel=0.1)
        b.front_quad(-width / 2 + 0.25, z0 + 3.85, width / 2 - 0.25, z0 + 5.75, y - 0.212, "offwhite")


def pad_base(b, r=4.0, colour="navy", ring="teal"):
    b.cylinder((0, 0, 0), exact(r, 16), 0.5, colour, segments=16, bevel=0.08)
    b.ring((0, 0, 0.5), r - 0.15, r - 0.75, 0.15, ring, segments=16)


# ---------------------------------------------------------------------------
# Tycoon objects
# ---------------------------------------------------------------------------


@cm.asset("gameplay", "CM_Tycoon_PurchasePad", "Gameplay", (8, None, None), budget="prop", recentre=True,
          notes="Round purchase button: Button presses down; PriceBoard behind it shows the cost.")  # fmt: skip
def purchase_pad(kit):
    with kit.part("Base") as b:
        pad_base(b)
    with kit.part("Button", origin=(0, 0, 0.5)) as b:
        b.cylinder((0, 0, 0), exact(3.2, 16), 0.45, "cash_green", segments=16, bevel=0.1)
        b.star((0, 0, 0.462), 1.6, "yellow", facing="+Z")
    price_board(kit, y=4.6)


@cm.asset("gameplay", "CM_Tycoon_UpgradePad", "Gameplay", (8, None, None), budget="prop", recentre=True,
          notes="Square upgrade pad with an up-arrow Button and a PriceBoard.")  # fmt: skip
def upgrade_pad(kit):
    with kit.part("Base") as b:
        b.box((-4, -4, 0), (4, 4, 0.5), "navy", bevel=0.12)
        b.box((-3.6, -3.6, 0.5), (3.6, 3.6, 0.6), "kiosk_blue", bevel=0)
    with kit.part("Button", origin=(0, 0, 0.6)) as b:
        b.box((-3.0, -3.0, 0), (3.0, 3.0, 0.4), "teal", bevel=0.1)
        z = 0.412
        b.poly([(0, 2.2, z), (-1.8, 0.2, z), (-0.7, 0.2, z), (-0.7, -2.2, z), (0.7, -2.2, z), (0.7, 0.2, z), (1.8, 0.2, z)][::-1], "yellow")
    price_board(kit, y=4.6)


@cm.asset("gameplay", "CM_Tycoon_HireStation", "Gameplay", None, budget="prop", recentre=True,
          notes="Worker hiring desk with a clipboard, staff silhouette and a blank Face sign.")  # fmt: skip
def hire_station(kit):
    with kit.part("Body") as b:
        b.box((-4, -1.5, 0), (4, 1.5, 0.4), "navy", bevel=0.06)
        b.box((-4, -1.5, 0.4), (4, 1.5, 3.4), "yellow", bevel=0.12)
        b.box((-4.2, -1.7, 3.4), (4.2, 1.7, 3.7), "wood", bevel=0.08)
        b.front_quad(-3.6, 0.8, 3.6, 1.1, -1.512, "navy")
        b.disc((0, -1.512, 2.2), 0.45, "navy", segments=10)  # staff silhouette: head
        b.poly([(-0.8, -1.512, 1.2), (0.8, -1.512, 1.2), (0.6, -1.512, 1.8), (-0.6, -1.512, 1.8)][::-1], "navy")
        b.box((1.2, -0.8, 3.7), (2.8, 0.6, 3.8), "wood", bevel=0)  # clipboard
        b.top_quad(1.35, -0.65, 2.65, 0.4, 3.812, "offwhite")
        b.box((1.8, 0.35, 3.8), (2.2, 0.55, 3.9), "metal", bevel=0)
        for s in (-1, 1):
            b.box((s * 3.5 - 0.15, 1.1, 3.7), (s * 3.5 + 0.15, 1.4, 8.0), "slate", bevel=0)
        b.box((-4, 1.0, 8.0), (4, 1.5, 9.6), "navy", bevel=0.08)
    with kit.part("Face") as b:
        b.box((-3.7, 0.95, 8.15), (3.7, 1.0, 9.45), "offwhite", bevel=0)


@cm.asset("gameplay", "CM_Tycoon_DeliveryStation", "Gameplay", None, budget="prop", recentre=True,
          notes="Loading platform: Button pad to call a delivery, crates waiting, Face sign on a gantry.")  # fmt: skip
def delivery_station(kit):
    with kit.part("Body") as b:
        b.box((-6, -4, 0), (6, 4, 0.8), "stockroom", bevel=0.1)
        for k in range(6):  # hazard stripes on the platform edge
            x = -5.5 + k * 2
            b.poly([(x, -4.012, 0.1), (x + 1, -4.012, 0.1), (x + 1.4, -4.012, 0.7), (x + 0.4, -4.012, 0.7)], "yellow")
        for s in (-1, 1):
            b.box((s * 5.6 - 0.25, 3.0, 0.8), (s * 5.6 + 0.25, 3.5, 9.0), "slate", bevel=0.05)
        b.box((-6, 2.9, 9.0), (6, 3.6, 10.6), "navy", bevel=0.1)
        I.cardboard_box(b, w=1.0, d=0.9, h=1.6, x=3.2, y=1.0, z=0.8)
        I.cardboard_box(b, w=1.0, d=0.9, h=1.4, x=3.2, y=1.0, z=2.4)
        I.cardboard_box(b, w=0.9, d=0.8, h=1.5, x=4.4, y=-1.6, z=0.8)
    with kit.part("Button", origin=(-2.5, -1, 0.8)) as b:
        b.cylinder((0, 0, 0), exact(1.6, 12), 0.3, "kiosk_orange", segments=12, bevel=0.06)
        b.disc((0, 0, 0.312), 0.9, "offwhite", segments=4, facing="+Z")
    with kit.part("Face") as b:
        b.box((-5.6, 2.85, 9.15), (5.6, 2.9, 10.45), "offwhite", bevel=0)


@cm.asset("gameplay", "CM_Tycoon_ManagementTerminal", "Gameplay", None, budget="prop", recentre=True,
          notes="Store management terminal: pedestal with an angled touchscreen (Face).")  # fmt: skip
def management_terminal(kit):
    with kit.part("Body") as b:
        b.box((-1.6, -1.2, 0), (1.6, 1.2, 0.4), "navy", bevel=0.08)
        b.hexa([(-1.0, -0.7, 0.4), (1.0, -0.7, 0.4), (1.0, 0.8, 0.4), (-1.0, 0.8, 0.4),
                (-1.2, -0.4, 4.0), (1.2, -0.4, 4.0), (1.2, 1.0, 4.6), (-1.2, 1.0, 4.6)], "teal", bevel=0.1)  # fmt: skip
        b.front_quad(-0.8, 1.0, 0.8, 1.3, -0.65, "yellow")
    with kit.part("Face") as b:  # screen lies on the sloped top
        b.poly([(-1.0, -0.3, 4.06), (1.0, -0.3, 4.06), (1.0, 0.9, 4.58), (-1.0, 0.9, 4.58)], "kiosk_blue")


@cm.asset("gameplay", "CM_Tycoon_CashCollector", "Gameplay", None, budget="prop", recentre=True,
          notes="Money collection point: pedestal with stacked bills; Coin floats above (spin it).")  # fmt: skip
def cash_collector(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), exact(2.4, 16), 0.5, "navy", segments=16, bevel=0.08)
        b.cylinder((0, 0, 0.5), 1.6, 2.4, "offwhite", segments=12, top_radius=1.9, bevel=0)
        b.cylinder((0, 0, 2.9), exact(2.1, 12), 0.3, "gold", segments=12, bevel=0.05)
        for k, (x, y, rz) in enumerate(((-0.6, -0.3, 10), (0.6, 0.2, -15), (0.0, 0.5, 30))):
            for h in range(3 - k % 2):
                b.at((x, y, 3.2 + h * 0.3), rot_z_deg=rz)
                b.box((-0.75, -0.4, 0), (0.75, 0.4, 0.28), "cash_green", bevel=0.03)
                b.box((-0.2, -0.41, 0), (0.2, 0.41, 0.285), "offwhite", bevel=0)  # band
        b.at()
    with kit.part("Coin", origin=(0, 0, 6.0)) as b:
        b.at((0, 0, 0), rot_x_deg=90)
        b.cylinder((0, 0, -0.15), 1.0, 0.3, "gold", segments=16, bevel=0.04)
        b.at()
        b.star((0, -0.162, 0), 0.55, "chip_gold")


@cm.asset("gameplay", "CM_Tycoon_ExpansionSign", "Gameplay", None, budget="prop", recentre=True,
          notes="'Expand here' sign: big plus on a post with a blank Face for the price.")  # fmt: skip
def expansion_sign(kit):
    with kit.part("Body") as b:
        b.box((-0.18, -0.18, 0), (0.18, 0.18, 7.0), "slate", bevel=0.05)
        b.at((0, 0, 8.5), rot_x_deg=90)
        b.cylinder((0, 0, -0.25), exact(2.0, 16), 0.5, "cash_green", segments=16, bevel=0.06)
        b.at()
        b.front_quad(-1.3, 8.2, 1.3, 8.8, -0.262, "offwhite")
        b.front_quad(-0.3, 7.2, 0.3, 8.2, -0.262, "offwhite")  # plus: three pieces, no overlap
        b.front_quad(-0.3, 8.8, 0.3, 9.8, -0.262, "offwhite")
        b.box((-2.4, -0.2, 4.0), (2.4, 0.2, 5.6), "navy", bevel=0.06)
    with kit.part("Face") as b:
        b.box((-2.2, -0.25, 4.15), (2.2, -0.2, 5.45), "offwhite", bevel=0)


@cm.asset("gameplay", "CM_Tycoon_UpgradePreview", "Gameplay", (8, None, 8), budget="prop",
          notes="Ghost marker showing where an upgrade will appear: floor ring plus a Hologram frame (fade it).")  # fmt: skip
def upgrade_preview(kit):
    with kit.part("Body") as b:
        b.ring((0, 0, 0), 4.0, 3.5, 0.15, "mint", segments=24)
        for k in range(8):
            a = 2 * math.pi * k / 8
            b.disc((3.0 * math.cos(a), 3.0 * math.sin(a), 0.012), 0.2, "mint", segments=4, facing="+Z")
    with kit.part("Hologram", material="glass") as b:
        t = 0.12
        for x in (-2.5, 2.5):
            for y in (-2.5, 2.5):
                b.box((x - t, y - t, 0.15), (x + t, y + t, 5), "mint", bevel=0)
        for z in (0.15, 5 - t):
            b.box((-2.5 - t, -2.5 - t, z), (2.5 + t, -2.5 + t, z + t), "mint", bevel=0)
            b.box((-2.5 - t, 2.5 - t, z), (2.5 + t, 2.5 + t, z + t), "mint", bevel=0)
            b.box((-2.5 - t, -2.5 + t, z), (-2.5 + t, 2.5 - t, z + t), "mint", bevel=0)
            b.box((2.5 - t, -2.5 + t, z), (2.5 + t, 2.5 - t, z + t), "mint", bevel=0)


@cm.asset("gameplay", "CM_Tycoon_PrestigeTerminal", "Gameplay", None, budget="prop", recentre=True,
          notes="Prestige terminal: gold-trimmed obelisk with a star crown and a blank Face screen.")  # fmt: skip
def prestige_terminal(kit):
    with kit.part("Body") as b:
        b.box((-2.5, -2.5, 0), (2.5, 2.5, 0.6), "navy", bevel=0.1)
        b.box((-2.2, -2.2, 0.6), (2.2, 2.2, 1.0), "gold", bevel=0.06)
        b.hexa([(-1.6, -1.6, 1.0), (1.6, -1.6, 1.0), (1.6, 1.6, 1.0), (-1.6, 1.6, 1.0),
                (-1.2, -1.2, 9.0), (1.2, -1.2, 9.0), (1.2, 1.2, 9.0), (-1.2, 1.2, 9.0)], "kiosk_purple", bevel=0.1)  # fmt: skip
        b.box((-1.3, -1.3, 9.0), (1.3, 1.3, 9.4), "gold", bevel=0.06)
        b.at((0, 0, 10.6), rot_x_deg=90)
        b.cylinder((0, 0, -0.2), exact(0.9, 10), 0.4, "gold", segments=10, bevel=0.04)
        b.at()
        b.star((0, -0.212, 10.6), 0.7, "yellow")
    with kit.part("Face") as b:  # screen follows the tapering front face
        f = lambda x, z: (x, -(1.6 - 0.4 * (z - 1.0) / 8.0) - 0.012, z)  # noqa: E731
        b.poly([f(-1.0, 3.0), f(1.0, 3.0), f(0.9, 6.5), f(-0.9, 6.5)], "mint")


@cm.asset("gameplay", "CM_Tycoon_RewardChest", "Gameplay", (4, None, 3), budget="prop", recentre=True,
          notes="Treasure chest; Lid is separate and hinges on its back edge (+Y).")  # fmt: skip
def reward_chest(kit):
    with kit.part("Body") as b:
        b.box((-2, -1.47, 0), (2, 1.47, 2.0), "wood", bevel=0.1)
        for x in (-1.4, 1.4):
            b.box((x - 0.2, -1.5, 0), (x + 0.2, 1.5, 2.0), "gold", bevel=0.04)
        b.front_quad(-0.4, 1.0, 0.4, 1.8, -1.482, "gold")  # lock plate
        b.disc((0, -1.494, 1.35), 0.12, "dark", segments=6)
    # Lid hinges on the back edge: its pivot is on the hinge line, the dome spans -Y
    r, depth = 1.0, 2.94

    def arc(t, lift=0.0):  # point across the dome, t in 0..1 from front to back
        a = math.pi * t
        return (-depth / 2 - 0.03 - (depth / 2) * math.cos(a), (r + lift) * math.sin(a))

    with kit.part("Lid", origin=(0, 1.47, 2.0)) as b:
        n = 8
        for k in range(n):
            (y0, z0), (y1, z1) = arc(k / n), arc((k + 1) / n)
            b.hexa([(-2, y0, z0), (2, y0, z0), (2, y1, z1), (-2, y1, z1),
                    (-2, y0, z0 + 0.02), (2, y0, z0 + 0.02), (2, y1, z1 + 0.02), (-2, y1, z1 + 0.02)], "wood")  # fmt: skip
        b.box((-2, -depth - 0.03 + 0.0, 0), (2, -0.03, 0.05), "wood", bevel=0)
        for x in (-1.4, 1.4):
            path = [arc(t / 6, lift=0.06) for t in range(7)]
            path = [(y if 0 < t < 6 else y + (0.05 if t == 0 else -0.05), z) for t, (y, z) in enumerate(path)]
            b.sweep([(x, y, z) for y, z in path], [0.2] * 7, "gold", sides=4, flat=0.25)


@cm.asset("gameplay", "CM_Tycoon_DailyRewardStand", "Gameplay", None, budget="prop", recentre=True,
          notes="Daily reward podium with a gift on top and a blank calendar Face board.")  # fmt: skip
def daily_reward_stand(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), exact(3.0, 16), 0.5, "navy", segments=16, bevel=0.08)
        b.cylinder((0, 0, 0.5), 2.2, 2.6, "teal", segments=12, top_radius=1.8, bevel=0)
        b.cylinder((0, 0, 3.1), exact(2.1, 12), 0.3, "gold", segments=12, bevel=0.05)
        b.at((0, 0, 3.4), scale=1.6)
        b.box((-0.75, -0.55, 0), (0.75, 0.55, 0.9), "red", bevel=0.05)
        b.box((-0.8, -0.6, 0.9), (0.8, 0.6, 1.1), "red", bevel=0)
        b.box((-0.12, -0.61, 0), (0.12, 0.61, 1.12), "gold", bevel=0)
        b.box((-0.81, -0.12, 0), (0.81, 0.12, 1.12), "gold", bevel=0)
        b.ellipsoid((-0.15, 0, 1.2), (0.18, 0.1, 0.1), "gold", segments=4, rings=3)
        b.ellipsoid((0.15, 0, 1.2), (0.18, 0.1, 0.1), "gold", segments=4, rings=3)
        b.at()
        b.box((-0.2, 2.6, 0.5), (0.2, 3.0, 7.0), "slate", bevel=0)
        b.box((-3, 2.5, 7.0), (3, 3.1, 10.4), "navy", bevel=0.1)
    with kit.part("Face") as b:
        b.box((-2.75, 2.45, 7.25), (2.75, 2.5, 10.15), "offwhite", bevel=0)


@cm.asset("gameplay", "CM_Tycoon_EventCountdown", "Gameplay", (14, None, None), budget="prop", recentre=True,
          notes="Event countdown display: lit frame on twin legs; Face is blank for the timer.")  # fmt: skip
def event_countdown(kit):
    with kit.part("Body") as b:
        for x in (-5, 5):
            b.box((x - 0.4, -1, 0), (x + 0.4, 1, 0.4), "navy", bevel=0.05)
            b.box((x - 0.25, -0.25, 0.4), (x + 0.25, 0.25, 6.0), "slate", bevel=0)
        b.box((-7, -0.4, 6.0), (7, 0.4, 11.0), "navy", bevel=0.15)
        for k in range(10):  # marquee bulbs along the top
            b.disc((-6.3 + k * 1.4, -0.412, 10.6), 0.18, "warm_light", segments=6)
    with kit.part("Face") as b:
        b.box((-6.4, -0.45, 6.5), (6.4, -0.4, 10.1), "dark", bevel=0)


@cm.asset("gameplay", "CM_Tycoon_VIPRope", "Gameplay", (8, None, None), budget="prop", recentre=True,
          notes="VIP decoration: two gold stanchions joined by a velvet rope.")  # fmt: skip
def vip_rope(kit):
    with kit.part("Body") as b:
        for x in (-3.6, 3.6):
            b.cylinder((x, 0, 0), exact(0.4, 10), 0.2, "gold", segments=10, bevel=0)
            b.cylinder((x, 0, 0.2), 0.1, 3.0, "gold", segments=8, bevel=0)
            b.ellipsoid((x, 0, 3.35), (0.22, 0.22, 0.22), "gold", segments=8, rings=4)
        rope = [(-3.5 + 7.0 * t / 8, 0, 3.0 - 0.9 * math.sin(math.pi * t / 8)) for t in range(9)]
        b.sweep(rope, [0.09] * 9, "velvet", sides=6)


# ---------------------------------------------------------------------------
# Chaos events
# ---------------------------------------------------------------------------


@cm.asset("gameplay", "CM_Event_GoldenCart", "Events", None, budget="prop", recentre=True,
          notes="Golden Shopping Cart event: the standard cart in gold.")  # fmt: skip
def golden_cart(kit):
    with kit.part("Body") as b:
        I.cart(b, frame="chip_gold", handle="red", body="gold")


@cm.asset("gameplay", "CM_Event_EmergencyLight", "Events", None, budget="item", recentre=True,
          notes="Rotating beacon for Power Outage / Shoplifter Chase; Light is the dome (spin + Neon).")  # fmt: skip
def emergency_light(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), exact(0.7, 10), 0.4, "dark", segments=10, bevel=0.04)
    with kit.part("Light") as b:
        b.cylinder((0, 0, 0.4), 0.55, 0.5, "red", segments=10, bevel=0)
        b.ellipsoid((0, 0, 0.9), (0.55, 0.55, 0.45), "red", segments=10, rings=4)


@cm.asset("gameplay", "CM_Event_SaleBanner", "Events", (16, None, 0.3), budget="prop",
          notes="Hanging Black Friday sale banner with zig-zag edges; Face is blank.")  # fmt: skip
def sale_banner(kit):
    with kit.part("Body") as b:
        b.box((-8, -0.138, 0.6), (8, 0.15, 4.4), "dark", bevel=0.05)
        for k in range(16):  # zig-zag fringe top and bottom
            x = -8 + k
            b.poly([(x, -0.138, 0.6), (x + 1, -0.138, 0.6), (x + 0.5, -0.138, 0.0)], "yellow")
            b.poly([(x + 0.5, -0.138, 5.0), (x + 1, -0.138, 4.4), (x, -0.138, 4.4)], "yellow")
        for x in (-6, 6):
            b.cylinder((x, 0, 4.4), 0.05, 3.0, "metal", segments=6, bevel=0)
    with kit.part("Face") as b:
        b.front_quad(-7.4, 1.0, 7.4, 4.0, -0.15, "red")


@cm.asset("gameplay", "CM_Event_CashStack", "Events", None, budget="item", recentre=True,
          notes="Double Cash collectible: a banded bundle of bills.")  # fmt: skip
def cash_stack(kit):
    with kit.part("Body") as b:
        for h in range(4):
            b.at((0.04 * (h % 2), 0, h * 0.26), rot_z_deg=4 * (h % 2))
            b.box((-1.0, -0.5, 0), (1.0, 0.5, 0.25), "cash_green", bevel=0.03)
        b.at()
        b.box((-0.25, -0.52, 0), (0.25, 0.52, 1.05), "gold", bevel=0)
        b.disc((0.6, -0.512, 0.9), 0.15, "offwhite", segments=6)


@cm.asset("gameplay", "CM_Event_SurpriseCrate", "Events", (3, None, 3), budget="prop",
          notes="Surprise Delivery crate: purple box with star decals; Lid lifts off.")  # fmt: skip
def surprise_crate(kit):
    with kit.part("Body") as b:
        b.box((-1.488, -1.488, 0), (1.488, 1.488, 2.6), "kiosk_purple", bevel=0.1)
        b.star((0, -1.5, 1.3), 0.8, "yellow")
        for s in (-1, 1):
            b.star((s * 1.5, 0, 1.3), 0.7, "gold", facing="+X" if s > 0 else "-X")
    with kit.part("Lid", origin=(0, 0, 2.6)) as b:
        b.box((-1.5, -1.5, 0), (1.5, 1.5, 0.4), "gold", bevel=0.08)
        b.ellipsoid((-0.35, 0, 0.6), (0.45, 0.25, 0.25), "red", segments=6, rings=4)
        b.ellipsoid((0.35, 0, 0.6), (0.45, 0.25, 0.25), "red", segments=6, rings=4)


@cm.asset("gameplay", "CM_Event_Spill", "Events", None, budget="item", recentre=True,
          notes="Supermarket Cleanup spill puddle: flat, 0.05 high, lay it on the floor.")  # fmt: skip
def spill(kit):
    with kit.part("Body") as b:
        pts = []
        for k in range(12):
            a = 2 * math.pi * k / 12
            r = 2.0 + 0.5 * math.sin(3 * a) + 0.25 * math.cos(5 * a)
            pts.append((r * math.cos(a), r * 0.75 * math.sin(a)))
        verts = [(x, y, 0) for x, y in pts] + [(x, y, 0.05) for x, y in pts]
        n = len(pts)
        faces = [tuple(reversed(range(n))), tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
        b._faces(verts, faces, "fountain_water", 0.0)
        b.disc((-0.6, 0.3, 0.062), 0.35, "offwhite", segments=6, facing="+Z")


@cm.asset("gameplay", "CM_Event_RedCarpet", "Events", (6, None, 20), budget="prop",
          notes="Celebrity Shopper red carpet runner with gold edging.")  # fmt: skip
def red_carpet(kit):
    with kit.part("Body") as b:
        b.box((-3, -10, 0), (3, 10, 0.1), "velvet", bevel=0)
        for s in (-1, 1):
            b.top_quad(s * 2.7 - 0.12, -10, s * 2.7 + 0.12, 10, 0.112, "gold")
        for k in range(3):
            b.star((0, -6 + 6 * k, 0.112), 1.0, "gold", facing="+Z")


@cm.asset("gameplay", "CM_Event_Generator", "Events", None, budget="prop", recentre=True,
          notes="Power Outage generator with a work Light on a mast.")  # fmt: skip
def generator(kit):
    with kit.part("Body") as b:
        b.box((-2, -1.2, 0.3), (2, 1.2, 2.6), "yellow", bevel=0.15)
        for k in range(5):
            b.front_quad(-1.6, 1.0 + k * 0.28, 0.4, 1.12 + k * 0.28, -1.212, "slate")
        b.front_quad(0.8, 1.0, 1.6, 2.0, -1.212, "dark")
        for x in (-1.6, 1.6):
            b.box((x - 0.3, -1.2, 0), (x + 0.3, 1.2, 0.3), "dark", bevel=0)
        b.sweep([(-2.0, -1.0, 2.6), (-2.0, -1.0, 3.2), (2.0, -1.0, 3.2), (2.0, -1.0, 2.6)], [0.07] * 4, "dark", sides=4)
        b.cylinder((1.4, 0.8, 2.6), 0.08, 3.2, "metal", segments=6, bevel=0)
        b.box((1.0, 0.5, 5.8), (1.8, 1.1, 6.4), "dark", bevel=0.05)
    with kit.part("Light") as b:
        b.front_quad(1.1, 5.9, 1.7, 6.3, 0.488, "warm_light")


@cm.asset("gameplay", "CM_Event_TrafficCone", "Events", (1.4, 2.2, 1.4), budget="item",
          notes="Cone for chase barriers and cleanup zones.")  # fmt: skip
def traffic_cone(kit):
    with kit.part("Body") as b:
        b.box((-0.7, -0.7, 0), (0.7, 0.7, 0.15), "dark", bevel=0.04)
        b.cylinder((0, 0, 0.15), 0.5, 2.05, "kiosk_orange", segments=10, top_radius=0.08, bevel=0)
        b.cylinder((0, 0, 0.85), 0.36 + 0.012, 0.35, "offwhite", segments=10, top_radius=0.3 + 0.012, bevel=0, cap=False)


@cm.asset("gameplay", "CM_Event_CelebrityStar", "Events", None, budget="item", recentre=True,
          notes="Floor star marking the Celebrity Shopper's spot.")  # fmt: skip
def celebrity_star(kit):
    with kit.part("Body") as b:
        b.cylinder((0, 0, 0), exact(2.0, 16), 0.1, "velvet", segments=16, bevel=0)
        b.star((0, 0, 0.112), 1.6, "gold", facing="+Z")
        b.star((0, 0, 0.124), 0.9, "yellow", facing="+Z")


@cm.asset("gameplay", "CM_Event_Coin", "Events", (2, 2, None), budget="item",
          notes="Double Cash collectible coin standing on its edge, star on both faces; spin it.")  # fmt: skip
def coin(kit):
    with kit.part("Body") as b:
        b.at((0, 0, 1.0), rot_x_deg=90)
        b.cylinder((0, 0, -0.15), exact(1.0, 16), 0.3, "gold", segments=16, bevel=0.05)
        b.at()
        b.star((0, -0.162, 1.0), 0.55, "chip_gold")
        b.poly([(0.55 * math.cos(math.pi / 2 + math.pi * i / 5) * (1 if i % 2 == 0 else 0.45), 0.162,
                 1.0 + 0.55 * math.sin(math.pi / 2 + math.pi * i / 5) * (1 if i % 2 == 0 else 0.45)) for i in range(10)][::-1], "chip_gold")  # back face


@cm.asset("gameplay", "CM_Event_TrashBagPile", "Events", None, budget="prop", recentre=True,
          notes="Supermarket Cleanup: a pile of three tied rubbish bags.")  # fmt: skip
def trash_pile(kit):
    with kit.part("Body") as b:
        for x, y, r, c in ((-0.9, 0.0, 1.0, "dark"), (0.9, 0.2, 0.9, "slate"), (0.0, 0.9, 0.85, "dark")):
            b.ellipsoid((x, y, r * 0.9), (r, r * 0.9, r * 0.9), c, segments=10, rings=6)
            b.cylinder((x, y, r * 1.75), 0.15, 0.25, c, segments=6, top_radius=0.05, bevel=0)
            b.ellipsoid((x, y, r * 2.05), (0.18, 0.1, 0.12), "yellow", segments=4, rings=3)


@cm.asset("gameplay", "CM_Event_SaleStandee", "Events", (3, 6, None), budget="prop", recentre=True,
          notes="Black Friday doorbuster standee: red board, yellow burst, blank Face for the deal.")  # fmt: skip
def sale_standee(kit):
    with kit.part("Body") as b:
        b.box((-1.5, -0.6, 0), (1.5, 0.6, 0.2), "dark", bevel=0.04)
        b.box((-1.4, -0.08, 0.2), (1.4, 0.08, 6), "red", bevel=0.08)
        b.star((0, -0.092, 4.6), 1.3, "yellow", inner=0.62, points=12)
        b.box((-0.15, 0.08, 0.2), (0.15, 0.5, 4.0), "dark", bevel=0)  # back strut
    with kit.part("Face") as b:
        b.front_quad(-1.15, 0.8, 1.15, 3.0, -0.092, "offwhite")


def build(mats, only=None):
    return cm.build_family("gameplay", mats, only)
