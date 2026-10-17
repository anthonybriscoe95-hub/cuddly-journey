"""Chaos Mart Tycoon: R6-proportioned NPC kit.

Each character file has six body-part meshes named like the R6 parts the game
welds (Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg), each pivoted at its
own centre, plus accessories (Hat, Hair, NameTag, Apron, Glasses, Bag...).
No armature, no skinning. Characters face -Y.

Layout matches R6 joint positions: torso 2 x 2 x 1 centred at z = 3, arms and
legs 1 x 2 x 1. The head is the classic rounded R6 head look (1.25 across,
sitting on the torso), not a literal 2 x 1 x 1 brick; see the import guide.
"""

import math

import cm_common as cm

SKIN = {"light": "skin_light", "mid": "skin_mid", "dark": "skin_dark"}


def face(b, y, skin, smile=True, z0=0.0):
    for s in (-1, 1):
        b.disc((s * 0.24, y, z0 + 0.12), 0.085, "dark", segments=8)
        b.disc((s * 0.24 + 0.03, y - 0.008, z0 + 0.15), 0.025, "offwhite", segments=4)
    if smile:
        pts = [(0.28 * math.cos(a), y, z0 - 0.2 + 0.14 * math.sin(a)) for a in [math.pi + math.pi * i / 6 for i in range(7)]]
        inner = [(0.2 * math.cos(a), y, z0 - 0.2 + 0.07 * math.sin(a)) for a in [math.pi + math.pi * i / 6 for i in range(7)]]
        for i in range(6):  # a thin smile made of quads along the arc
            b.poly([pts[i], pts[i + 1], inner[i + 1], inner[i]][::-1], "dark")


def character(kit, look):
    skin = SKIN[look.get("skin", "light")]
    shirt, pants = look["shirt"], look.get("pants", "denim")
    shoes = look.get("shoes", "dark")

    with kit.part("Head", origin=(0, 0, 4.625)) as b:
        b.box((-0.625, -0.625, -0.625), (0.625, 0.625, 0.625), skin, bevel=0.15)
        face(b, -0.637, skin, smile=look.get("smile", True))
    with kit.part("Torso", origin=(0, 0, 3)) as b:
        b.box((-1, -0.5, -1), (1, 0.5, 1), shirt, bevel=0.1)
        b.box((-1, -0.5, -1), (1, 0.5, -0.75), look.get("belt", pants), bevel=0.05)
        b.front_quad(-0.32, 0.72, 0.32, 0.92, -0.512, look.get("collar", "offwhite"))  # collar
        if look.get("stripe"):
            b.front_quad(-1, 0.1, 1, 0.35, -0.512, look["stripe"])
        if look.get("tie"):
            b.poly([(-0.1, -0.524, 0.72), (0.1, -0.524, 0.72), (0.14, -0.524, -0.35), (0, -0.524, -0.55), (-0.14, -0.524, -0.35)][::-1], look["tie"])
    for side, name in ((-1, "LeftArm"), (1, "RightArm")):
        # R6: the character's left arm is on its left, i.e. +X when it faces -Y
        x = -side * 1.5
        with kit.part(name, origin=(x, 0, 3)) as b:
            b.box((-0.5, -0.5, -0.2), (0.5, 0.5, 1), look.get("sleeve", shirt), bevel=0.1)
            b.box((-0.5, -0.5, -1), (0.5, 0.5, -0.2), skin, bevel=0.1)
    for side, name in ((-1, "LeftLeg"), (1, "RightLeg")):
        x = -side * 0.5
        with kit.part(name, origin=(x, 0, 1)) as b:
            b.box((-0.5, -0.5, -0.65), (0.5, 0.5, 1), pants, bevel=0.08)
            b.box((-0.5, -0.5, -1), (0.5, 0.5, -0.65), shoes, bevel=0.08)

    hat = look.get("hat")
    if hat:
        with kit.part("Hat", origin=(0, 0, 5.25)) as b:
            kind, colour = hat
            if kind == "cap":
                b.box((-0.68, -0.68, -0.25), (0.68, 0.68, 0.1), colour, bevel=0.12)
                b.box((-0.6, -1.2, -0.2), (0.6, -0.6, -0.12), colour, bevel=0.04)  # brim
                if look.get("badge"):
                    b.star((0, -0.692, -0.07), 0.14, look["badge"])
            elif kind == "beanie":
                b.cylinder((0, 0, -0.35), 0.72, 0.5, colour, segments=12, top_radius=0.55, bevel=0)
                b.cylinder((0, 0, -0.42), 0.74, 0.18, look.get("beanie_band", colour), segments=12, bevel=0)
                b.ellipsoid((0, 0, 0.3), (0.2, 0.2, 0.2), "offwhite", segments=6, rings=4)
            elif kind == "bun":
                b.box((-0.66, -0.4, -0.3), (0.66, 0.66, 0.06), colour, bevel=0.12)
                b.ellipsoid((0, 0.55, 0.15), (0.38, 0.32, 0.36), colour, segments=8, rings=5)
            elif kind == "hood":
                b.box((-0.75, -0.55, -1.25), (0.75, 0.72, 0.12), colour, bevel=0.15)
    for acc in look.get("extras", ()):
        if acc == "nametag":
            with kit.part("NameTag", origin=(0.5, -0.53, 3.5)) as b:
                b.box((-0.3, -0.02, -0.12), (0.3, 0.03, 0.12), "offwhite", bevel=0)
                b.front_quad(-0.28, -0.1, -0.12, 0.1, -0.032, "teal")
        elif acc == "apron":
            with kit.part("Apron", origin=(0, -0.53, 2.6)) as b:
                b.box((-0.85, -0.03, -1.0), (0.85, 0.03, 1.2), look.get("apron_colour", "offwhite"), bevel=0)
                b.front_quad(-0.4, -0.4, 0.4, 0.1, -0.042, look.get("pocket", "teal"))
        elif acc == "glasses":
            with kit.part("Glasses", origin=(0, -0.66, 4.75)) as b:
                for s in (-1, 1):
                    b.box((s * 0.24 - 0.2, -0.04, -0.1), (s * 0.24 + 0.2, 0.02, 0.1), "dark", bevel=0)
                b.box((-0.05, -0.04, 0.02), (0.05, 0.02, 0.06), "gold", bevel=0)
        elif acc == "chain":
            with kit.part("Chain", origin=(0, -0.53, 3.5)) as b:
                b.sweep([(-0.45, 0, 0.45), (-0.3, -0.02, 0.05), (0, -0.03, -0.12), (0.3, -0.02, 0.05), (0.45, 0, 0.45)], [0.05] * 5, "gold", sides=4)
                b.star((0, -0.06, -0.2), 0.16, "gold")
        elif acc == "vest":
            with kit.part("Vest", origin=(0, 0, 3)) as b:
                for s in (-1, 1):
                    b.box((min(s * 0.15, s * 1.0), -0.54, -0.7), (max(s * 0.15, s * 1.0), -0.5, 0.95), look.get("vest_colour", "yellow"), bevel=0)
                b.front_quad(-1.0, -0.3, 1.0, -0.15, -0.552, "offwhite")
        elif acc == "bag":
            with kit.part("Bag", origin=(0, 0.95, 3.0)) as b:  # delivery backpack
                b.box((-0.85, -0.43, -0.8), (0.85, 0.43, 0.85), "kiosk_orange", bevel=0.1)
                b.quad([(0.6, 0.442, -0.3), (-0.6, 0.442, -0.3), (-0.6, 0.442, 0.3), (0.6, 0.442, 0.3)], "offwhite")
        elif acc == "mask":
            with kit.part("Mask", origin=(0, -0.64, 4.45)) as b:
                b.box((-0.6, -0.02, -0.18), (0.6, 0.02, 0.12), "dark", bevel=0)


LOOKS = {
    "Customer_TealCap": dict(shirt="teal", hat=("cap", "yellow"), skin="light"),
    "Customer_Yellow": dict(shirt="yellow", pants="slate", skin="mid", stripe="offwhite"),
    "Customer_CoralBun": dict(shirt="red", hat=("bun", "hair_brown"), skin="light", pants="denim"),
    "Customer_BlueBeanie": dict(shirt="shirt_blue", hat=("beanie", "red"), skin="dark", pants="slate"),
    "Staff_Cashier": dict(shirt="teal", hat=("cap", "navy"), badge="yellow", pants="navy", extras=("nametag",), collar="navy", skin="mid"),
    "Staff_Stocker": dict(shirt="yellow", hat=("beanie", "teal"), pants="navy", extras=("apron", "nametag"), apron_colour="teal", pocket="yellow", skin="light"),
    "Staff_Cleaner": dict(shirt="mint", hat=("cap", "teal"), pants="slate", extras=("apron",), apron_colour="water", pocket="offwhite", skin="dark"),
    "Staff_Security": dict(shirt="navy", hat=("cap", "dark"), badge="gold", pants="dark", extras=("vest",), vest_colour="slate", sleeve="navy", skin="mid"),
    "Staff_Delivery": dict(shirt="kiosk_orange", hat=("cap", "kiosk_orange"), pants="slate", extras=("bag",), stripe="offwhite", skin="light"),
    "Staff_Manager": dict(shirt="offwhite", tie="teal", pants="navy", extras=("nametag", "glasses"), collar="offwhite", skin="dark"),
    "Shoplifter": dict(shirt="dark", hat=("hood", "slate"), pants="slate", extras=("mask",), smile=False, skin="light"),
    "Celebrity": dict(shirt="kiosk_purple", pants="offwhite", shoes="gold", extras=("glasses", "chain"), hat=("bun", "gold"), skin="mid"),
}


def _register(name, look):
    @cm.asset("npcs", "CM_NPC_" + name, "Characters", (None, None, None), budget="npc", recentre=True,
              notes="R6-proportioned character (6 parts + accessories), each part pivoted at its own centre.")  # fmt: skip
    def _build(kit):
        character(kit, look)


for _n, _l in LOOKS.items():
    _register(_n, _l)


def build(mats, only=None):
    return cm.build_family("npcs", mats, only)
