"""Chaos Mart Tycoon: shared palette atlas and materials.

Builds `CM_Palette.png`, a 256x256 image split into an 8x8 grid of flat 32px
cells, plus two materials every asset uses:

* `CM_Palette`  opaque, samples the atlas (one material per asset)
* `CM_Glass`    the same atlas on the glass cell, 60% transparent, only used by
                the separate `Glass` meshes so Roblox transparency can be set
                per part

Each face of every mesh has all its UVs on the centre of one cell, so a mesh
reads as flat colours with no image detail and no text.

Run on its own:  blender --background --python palette.py
"""

import os

import bpy

ATLAS_SIZE = 256
GRID = 8  # 8x8 cells of 32px
CELL = ATLAS_SIZE // GRID

# Order matters: the index is the cell (row-major from the bottom-left).
# The first ten are the brief's exact hex colours; the rest are product,
# kiosk and character colours named in the brief.
COLOURS = [
    # brief palette
    ("navy", "#12243C"),
    ("teal", "#16AC9B"),
    ("yellow", "#EFB548"),
    ("offwhite", "#F4F7FB"),
    ("red", "#E67565"),
    ("slate", "#3A5A70"),
    ("stockroom", "#7F93A8"),
    ("mint", "#8CE0D2"),
    ("wood", "#A97A4E"),
    ("glass", "#CDEFF0"),
    # kiosk variants
    ("kiosk_orange", "#E8924A"),
    ("kiosk_blue", "#4C7BD9"),
    ("kiosk_purple", "#9A6FC8"),
    # products
    ("chip_gold", "#D4952E"),  # chip-bag crimp / shading
    ("pastry", "#E2A23B"),
    ("water", "#9FD4F5"),
    ("toy_purple", "#8B5CC4"),
    ("candy_pink", "#F49AC1"),
    ("soda_red", "#D9473A"),
    ("apple_red", "#C8382E"),
    ("leaf_green", "#5DBB63"),
    ("bread", "#B87436"),
    ("bread_dark", "#8A5426"),
    ("milk", "#FFFFFF"),
    # materials and world
    ("dark", "#2A2F36"),  # tyres, rubber, belt
    ("metal", "#C9D3DD"),
    ("shrub", "#4E9E5A"),
    ("fountain_water", "#6FC7E8"),
    ("warm_light", "#FFE9A8"),
    ("asphalt", "#4A5058"),
    ("concrete", "#D9DEE4"),
    ("concrete_joint", "#B3BCC6"),
    ("grass", "#7CC46B"),
    ("grass_dark", "#62AD58"),
    ("paver_sand", "#EAD7B7"),
    ("paver_brick", "#D9926A"),
    ("wall_warm", "#F2E6D3"),
    ("wall_shade", "#E2D0B4"),
    ("floor_tile", "#E3F2EF"),
    ("cash_green", "#4FB36B"),
    ("gold", "#F2C230"),
    ("velvet", "#B8344A"),
    # characters
    ("skin_light", "#F1C7A0"),
    ("skin_mid", "#C68B59"),
    ("skin_dark", "#8D5A3B"),
    ("hair_brown", "#5A3A26"),
    ("hair_black", "#26211F"),
    ("denim", "#3D5A8C"),
    ("shirt_blue", "#4C7BD9"),
]

COLOUR_INDEX = {name: i for i, (name, _) in enumerate(COLOURS)}
HEX = dict(COLOURS)

assert len(COLOURS) <= GRID * GRID, "palette atlas is full"


def hex_to_rgb(hex_str):
    h = hex_str.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def uv_for(name):
    """UV coordinate at the centre of a colour's cell."""
    i = COLOUR_INDEX[name]
    col, row = i % GRID, i // GRID
    return ((col + 0.5) / GRID, (row + 0.5) / GRID)


def build_atlas_image(out_dir):
    """Create (or refresh) the CM_Palette image, save it as PNG and pack it."""
    img = bpy.data.images.get("CM_Palette")
    if img is None:
        img = bpy.data.images.new("CM_Palette", ATLAS_SIZE, ATLAS_SIZE, alpha=False)
    # unused cells are mid grey so a wrong UV is obvious
    pixels = [0.5, 0.5, 0.5, 1.0] * (ATLAS_SIZE * ATLAS_SIZE)
    for i, (_, hx) in enumerate(COLOURS):
        r, g, b = hex_to_rgb(hx)
        col, row = i % GRID, i // GRID
        for y in range(row * CELL, (row + 1) * CELL):
            base = (y * ATLAS_SIZE + col * CELL) * 4
            pixels[base : base + CELL * 4] = [r, g, b, 1.0] * CELL
    img.pixels[:] = pixels
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, "CM_Palette.png")
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    img.filepath = path
    img.pack()
    return img


def _principled(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    return nt, bsdf


def build_materials(img):
    mats = {}

    mat = bpy.data.materials.get("CM_Palette") or bpy.data.materials.new("CM_Palette")
    nt, bsdf = _principled(mat)
    tex = nt.nodes.get("Atlas") or nt.nodes.new("ShaderNodeTexImage")
    tex.name = "Atlas"
    tex.image = img
    tex.interpolation = "Closest"
    tex.location = (-400, 200)
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.55
    mats["palette"] = mat

    mat = bpy.data.materials.get("CM_Glass") or bpy.data.materials.new("CM_Glass")
    nt, bsdf = _principled(mat)
    tex = nt.nodes.get("Atlas") or nt.nodes.new("ShaderNodeTexImage")
    tex.name = "Atlas"
    tex.image = img
    tex.interpolation = "Closest"
    tex.location = (-400, 200)
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.08
    bsdf.inputs["Alpha"].default_value = 0.3  # set Transparency 0.6 on Glass parts in Roblox
    if hasattr(mat, "surface_render_method"):  # Blender 4.2+
        mat.surface_render_method = "BLENDED"
    else:
        mat.blend_method = "BLEND"
    mats["glass"] = mat

    return mats


def build(out_dir):
    img = build_atlas_image(out_dir)
    return build_materials(img)


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(os.path.dirname(here), "Textures"))
    print("CM_Palette.png written with %d colours" % len(COLOURS))
