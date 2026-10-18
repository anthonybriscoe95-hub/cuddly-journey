"""Chaos Mart Tycoon: distant-detail ("Far") versions of the stocked fixtures.

For every fixture with Item slots, `CM_<name>_Far` is built from the
full-detail asset of the same build:
  Body   the fixture and its price tag merged into one mesh, with every stock
         slot replaced by a single block in that product's main colour
  Glass  the glass merged into one mesh (glass fixtures only)

One or two MeshParts and a fraction of the triangles instead of a dozen parts,
for shelves seen from across the store or the plaza. Swap to the full-detail
asset when the player is close (or let StreamingEnabled / a distance check do it).
"""

from collections import defaultdict

import bmesh
import bpy
from mathutils import Matrix

import cm_common as cm
import fixtures  # noqa: F401  (registers the source assets)
import interiors  # noqa: F401
import palette

SOURCE_FAMILIES = ("fixtures", "interiors")


def sources():
    out = []
    for fam in SOURCE_FAMILIES:
        for spec in cm.REGISTRY.get(fam, []):
            if spec["file_name"].startswith(("CM_Fixture_", "CM_Shelf_")) and spec["file_name"] != "CM_Fixture_CheckoutLane":
                out.append(spec)
    return out


CELL_TO_COLOUR = {palette.COLOUR_INDEX[name]: name for name, _ in palette.COLOURS}


def dominant_colour(obj):
    """The palette colour covering the most surface area of a mesh."""
    area = defaultdict(float)
    uv = obj.data.uv_layers.active.data
    for poly in obj.data.polygons:
        u, v = uv[poly.loop_start].uv
        cell = int(v * palette.GRID) * palette.GRID + int(u * palette.GRID)
        area[CELL_TO_COLOUR.get(cell, "slate")] += poly.area
    return max(area, key=area.get)


def append_mesh(b, obj):
    """Copy obj's mesh (in asset space) into builder b, keeping its faces' winding and colours."""
    tmp = bmesh.new()
    tmp.from_mesh(obj.data)
    bmesh.ops.transform(tmp, matrix=Matrix(obj.matrix_world), verts=tmp.verts)
    mesh = bpy.data.meshes.new("_tmp")
    tmp.to_mesh(mesh)
    tmp.free()
    before = set(b.bm.faces)
    b.bm.from_mesh(mesh)
    bpy.data.meshes.remove(mesh)
    for f in b.bm.faces:
        if f not in before:
            b.decals.add(f)  # keep the source winding, don't recompute
    for e in b.bm.edges:
        e[b.bw] = 0.0  # already bevelled once
    b.colours.update(obj.get("cm_colours", []))


def _register(spec):
    src_name = spec["file_name"]

    @cm.asset("lods", src_name + "_Far", spec["folder"], spec["size"], budget="fixture", measure=spec["measure"],
              notes="Distant-detail version of %s: one Body mesh, stock shown as coloured blocks." % src_name)  # fmt: skip
    def _build(kit):
        src = bpy.data.collections.get(src_name)
        if src is None:
            raise RuntimeError("%s must be built in the same run (build the fixtures and interiors families too)" % src_name)
        body, glass = cm.MeshBuilder(), None
        for o in src.objects:
            name = cm.part_name(o)
            if name.startswith("Anchor"):
                continue
            if name.startswith("Item"):
                lo, hi = cm.world_bbox([o])
                body.box(tuple(lo), tuple(hi), dominant_colour(o), bevel=0)
            elif "Glass" in name:
                glass = glass or cm.MeshBuilder()
                append_mesh(glass, o)
            else:
                append_mesh(body, o)
        body.to_object(cm.prefixed(kit.collection, "Body"), kit.collection, kit.mats["palette"])["cm_name"] = "Body"
        if glass:
            glass.to_object(cm.prefixed(kit.collection, "Glass"), kit.collection, kit.mats["glass"])["cm_name"] = "Glass"
        for o in src.objects:  # keep the stand point(s) so the game logic still works
            if cm.part_name(o).startswith("Anchor"):
                kit.anchor(tuple(o.matrix_world.translation), name=cm.part_name(o))

        def check(a):
            full = sum(cm.tri_count(o) for o in src.objects)
            a.check(a.total_tris < full, "%d tris vs %d full detail (%d%%)" % (a.total_tris, full, 100 * a.total_tris // max(full, 1)))

        return check


for _spec in sources():
    _register(_spec)


def build(mats, only=None):
    return cm.build_family("lods", mats, only)
