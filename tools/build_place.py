"""Builds ClickSimulator.rbxlx (a Roblox place file) from the scripts in this repo.

Run: python3 tools/build_place.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ref = 0


def next_ref():
    global ref
    ref += 1
    return f"RBX{ref}"


def cframe(x, y, z):
    return (f'<CoordinateFrame name="CFrame"><X>{x}</X><Y>{y}</Y><Z>{z}</Z>'
            "<R00>1</R00><R01>0</R01><R02>0</R02><R10>0</R10><R11>1</R11><R12>0</R12>"
            "<R20>0</R20><R21>0</R21><R22>1</R22></CoordinateFrame>")


def part(cls, name, pos, size, rgb, material=256):
    r, g, b = rgb
    color = (0xFF << 24) | (r << 16) | (g << 8) | b
    return f"""<Item class="{cls}" referent="{next_ref()}"><Properties>
<string name="Name">{name}</string>
<bool name="Anchored">true</bool>
<bool name="Locked">true</bool>
{cframe(*pos)}
<Vector3 name="size"><X>{size[0]}</X><Y>{size[1]}</Y><Z>{size[2]}</Z></Vector3>
<Color3uint8 name="Color3uint8">{color}</Color3uint8>
<token name="Material">{material}</token>
</Properties></Item>"""


def script(cls, name, path):
    source = (ROOT / path).read_text(encoding="utf-8")
    assert "]]>" not in source
    return f"""<Item class="{cls}" referent="{next_ref()}"><Properties>
<string name="Name">{name}</string>
<ProtectedString name="Source"><![CDATA[{source}]]></ProtectedString>
</Properties></Item>"""


place = f"""<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
<Item class="Workspace" referent="{next_ref()}"><Properties><string name="Name">Workspace</string></Properties>
{part("Part", "Baseplate", (0, -10, 0), (512, 20, 512), (91, 154, 76), 512)}
{part("SpawnLocation", "SpawnLocation", (0, 0.5, 0), (12, 1, 12), (255, 196, 0))}
</Item>
<Item class="ServerScriptService" referent="{next_ref()}"><Properties><string name="Name">ServerScriptService</string></Properties>
{script("Script", "GameServer", "ServerScriptService/GameServer.server.lua")}
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
