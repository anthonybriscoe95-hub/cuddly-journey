"""Builds ClickSimulator.rbxlx (a Roblox place file) from the scripts in this repo.

The map (island, plaza, coin statue, trees, lamps, portal) is generated here so it
shows up in Studio's editor and can be moved around by hand.

Run: python3 tools/build_place.py
"""
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ref = 0

# Enum.Material values
GRASS, SAND, COBBLE, WOOD, SLATE, NEON, SMOOTH, METAL, FORCEFIELD, PLANKS = (
    1280, 1296, 880, 512, 800, 288, 272, 1088, 1584, 528)
# Enum.PartType values
BALL, BLOCK, CYLINDER = 0, 1, 2

IDENTITY = (1, 0, 0, 0, 1, 0, 0, 0, 1)
UPRIGHT = (0, -1, 0, 1, 0, 0, 0, 0, 1)  # cylinder axis pointing up (flat disc / pole)
FACING = (0, 0, 1, 0, 1, 0, -1, 0, 0)   # cylinder axis pointing along Z (standing coin)


def next_ref():
    global ref
    ref += 1
    return f"RBX{ref}"


def yaw(degrees):
    c, s = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
    return (round(c, 6), 0, round(s, 6), 0, 1, 0, round(-s, 6), 0, round(c, 6))


def cframe(pos, rot=IDENTITY):
    x, y, z = pos
    r = "".join(f"<R{i // 3}{i % 3}>{v}</R{i // 3}{i % 3}>" for i, v in enumerate(rot))
    return f'<CoordinateFrame name="CFrame"><X>{x}</X><Y>{y}</Y><Z>{z}</Z>{r}</CoordinateFrame>'


def part(name, pos, size, rgb, material=SMOOTH, shape=BLOCK, rot=IDENTITY,
         cls="Part", locked=False, transparency=0, collide=True, children=""):
    r, g, b = rgb
    color = (0xFF << 24) | (r << 16) | (g << 8) | b
    shape_xml = f'<token name="shape">{shape}</token>' if cls == "Part" else ""
    return f"""<Item class="{cls}" referent="{next_ref()}"><Properties>
<string name="Name">{name}</string>
<bool name="Anchored">true</bool>
<bool name="Locked">{str(locked).lower()}</bool>
<bool name="CanCollide">{str(collide).lower()}</bool>
<float name="Transparency">{transparency}</float>
{cframe(pos, rot)}
<Vector3 name="size"><X>{size[0]}</X><Y>{size[1]}</Y><Z>{size[2]}</Z></Vector3>
<Color3uint8 name="Color3uint8">{color}</Color3uint8>
<token name="Material">{material}</token>
<token name="TopSurface">0</token>
<token name="BottomSurface">0</token>
{shape_xml}
</Properties>{children}</Item>"""


def model(name, children):
    return f"""<Item class="Model" referent="{next_ref()}"><Properties>
<string name="Name">{name}</string>
</Properties>
{"".join(children)}
</Item>"""


def script(cls, name, path):
    source = (ROOT / path).read_text(encoding="utf-8")
    assert "]]>" not in source
    return f"""<Item class="{cls}" referent="{next_ref()}"><Properties>
<string name="Name">{name}</string>
<ProtectedString name="Source"><![CDATA[{source}]]></ProtectedString>
</Properties></Item>"""


# ---------------------------------------------------------------- map pieces
def ground():
    return model("Ground", [
        part("Water", (0, -3, 0), (2048, 2, 2048), (40, 140, 220), transparency=0.15, locked=True),
        part("Beach", (0, -1.4, 0), (440, 2, 440), (240, 215, 150), SAND, locked=True),
        part("Grass", (0, -1, 0), (400, 2, 400), (90, 170, 70), GRASS, locked=True),
    ])


def plaza():
    pieces = [
        part("PlazaRim", (0, 0.4, 0), (0.8, 74, 74), (110, 110, 120), SLATE, CYLINDER, UPRIGHT),
        part("Plaza", (0, 0.6, 0), (0.8, 68, 68), (170, 170, 180), COBBLE, CYLINDER, UPRIGHT),
        part("SpawnLocation", (0, 1.2, 0), (14, 1, 14), (255, 196, 0), NEON, cls="SpawnLocation"),
    ]
    # Four stone paths out to the edge of the island
    for i, name in enumerate(["NorthPath", "EastPath", "SouthPath", "WestPath"]):
        angle = i * 90
        dx, dz = math.sin(math.radians(angle)), -math.cos(math.radians(angle))
        pieces.append(part(name, (round(dx * 110, 2), 0.1, round(dz * 110, 2)), (14, 0.4, 150),
                           (150, 150, 155), COBBLE, rot=yaw(angle)))
    return model("Plaza", pieces)


def coin_statue():
    return model("CoinStatue", [
        part("Pedestal", (0, 3, -50), (20, 6, 12), (80, 80, 90), SLATE),
        part("PedestalTrim", (0, 6.3, -50), (22, 0.6, 14), (255, 196, 0), NEON),
        # The script MapEffects spins this part and puts the title above it
        part("GiantCoin", (0, 22, -50), (4, 30, 30), (255, 200, 30), METAL, CYLINDER, FACING),
        part("CoinFace", (0, 22, -50), (4.4, 22, 22), (255, 225, 90), NEON, CYLINDER, FACING, collide=False),
    ])


def tree(name, x, z, scale):
    trunk_h = 14 * scale
    leaves = 18 * scale
    return model(name, [
        part("Trunk", (x, trunk_h / 2, z), (trunk_h, 3 * scale, 3 * scale), (110, 75, 45), WOOD, CYLINDER, UPRIGHT),
        part("Leaves", (x, trunk_h + leaves * 0.3, z), (leaves, leaves, leaves), (60, 160, 60), GRASS, BALL),
        part("Leaves2", (x + 3 * scale, trunk_h + leaves * 0.1, z + 2 * scale),
             (leaves * 0.7,) * 3, (75, 180, 70), GRASS, BALL),
    ])


def lamp(name, x, z):
    return model(name, [
        part("Pole", (x, 6, z), (12, 1, 1), (40, 40, 45), METAL, CYLINDER, UPRIGHT),
        part("LampBulb", (x, 12.5, z), (2.5, 2.5, 2.5), (255, 230, 150), NEON, BALL),
    ])


def portal():
    z = 190
    purple, dark = (170, 60, 255), (60, 30, 90)
    return model("RebirthPortal", [
        part("Base", (0, 1, z), (34, 2, 10), dark, SLATE),
        part("LeftPillar", (-14, 14, z), (4, 26, 4), dark, SLATE),
        part("RightPillar", (14, 14, z), (4, 26, 4), dark, SLATE),
        part("Top", (0, 28, z), (34, 4, 6), dark, SLATE),
        part("LeftGlow", (-11.6, 14, z), (0.8, 24, 3), purple, NEON),
        part("RightGlow", (11.6, 14, z), (0.8, 24, 3), purple, NEON),
        part("TopGlow", (0, 25.6, z), (24, 0.8, 3), purple, NEON),
        part("PortalSwirl", (0, 14, z), (22, 22, 1), purple, FORCEFIELD, collide=False, transparency=0.2),
    ])


def scenery():
    rng = random.Random(7)
    items = []
    # Trees in a ring around the plaza, skipping the paths
    for i in range(22):
        angle = i * (360 / 22) + rng.uniform(-5, 5)
        off = angle % 90  # keep trees at least 15 degrees away from the paths
        if off < 15:
            angle += 15 - off
        elif off > 75:
            angle -= off - 75
        dist = rng.uniform(85, 185)
        x = round(math.sin(math.radians(angle)) * dist, 2)
        z = round(-math.cos(math.radians(angle)) * dist, 2)
        items.append(tree(f"Tree{i + 1}", x, z, round(rng.uniform(0.8, 1.4), 2)))
    # Lamps along both sides of each path
    n = 0
    for angle in (0, 90, 180, 270):
        for d in (70, 105, 140, 175):
            for side in (-11, 11):
                a = math.radians(angle)
                x = math.sin(a) * d + math.cos(a) * side
                z = -math.cos(a) * d + math.sin(a) * side
                n += 1
                items.append(lamp(f"Lamp{n}", round(x, 2), round(z, 2)))
    # Flower patches and rocks
    flower_colors = [(255, 90, 120), (255, 220, 60), (120, 160, 255), (255, 140, 40), (230, 120, 255)]
    flowers, rocks = [], []
    for i in range(140):
        angle, dist = rng.uniform(0, 360), rng.uniform(45, 190)
        x = round(math.sin(math.radians(angle)) * dist, 2)
        z = round(-math.cos(math.radians(angle)) * dist, 2)
        if min(abs(x), abs(z)) < 12:  # keep paths clear
            continue
        flowers.append(part("Flower", (x, 1, z), (2, 2, 2), rng.choice(flower_colors), SMOOTH, BALL, collide=False))
    for i in range(10):
        angle, dist = rng.uniform(0, 360), rng.uniform(120, 195)
        x = round(math.sin(math.radians(angle)) * dist, 2)
        z = round(-math.cos(math.radians(angle)) * dist, 2)
        s = round(rng.uniform(4, 9), 2)
        rocks.append(part("Rock", (x, s * 0.3, z), (s, s * 0.8, s * 1.1), (120, 120, 125), SLATE,
                          rot=yaw(rng.uniform(0, 360))))
    items.append(model("Flowers", flowers))
    items.append(model("Rocks", rocks))
    # Benches by the plaza
    for i, angle in enumerate((45, 135, 225, 315)):
        a = math.radians(angle)
        x, z = round(math.sin(a) * 44, 2), round(-math.cos(a) * 44, 2)
        items.append(model(f"Bench{i + 1}", [
            part("Seat", (x, 2, z), (10, 0.8, 3), (150, 100, 60), PLANKS, rot=yaw(-angle)),
            part("Legs", (x, 1, z), (8, 2, 2), (60, 60, 65), METAL, rot=yaw(-angle)),
        ]))
    return items


place = f"""<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
<Item class="Workspace" referent="{next_ref()}"><Properties><string name="Name">Workspace</string></Properties>
{model("Map", [ground(), plaza(), coin_statue(), portal(), *scenery()])}
</Item>
<Item class="ServerScriptService" referent="{next_ref()}"><Properties><string name="Name">ServerScriptService</string></Properties>
{script("Script", "GameServer", "ServerScriptService/GameServer.server.lua")}
{script("Script", "MapEffects", "ServerScriptService/MapEffects.server.lua")}
</Item>
<Item class="StarterPlayer" referent="{next_ref()}"><Properties><string name="Name">StarterPlayer</string></Properties>
<Item class="StarterPlayerScripts" referent="{next_ref()}"><Properties><string name="Name">StarterPlayerScripts</string></Properties>
{script("LocalScript", "GameClient", "StarterPlayerScripts/GameClient.client.lua")}
</Item>
</Item>
</roblox>
"""

(ROOT / "ClickSimulator.rbxlx").write_text(place, encoding="utf-8")
print("Wrote ClickSimulator.rbxlx")
