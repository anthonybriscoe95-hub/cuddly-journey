"""Chaos Mart Tycoon: shared mesh building, export, size report and preview helpers.

Units: 1 Blender unit = 1 Roblox stud. +Z is up, the customer-facing front is -Y.
"""

import json
import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

import palette

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # ChaosMart_3D_Assets/
FBX_DIR = os.path.join(ROOT, "Roblox_FBX")
TEXTURE_DIR = os.path.join(ROOT, "Textures")
PREVIEW_DIR = os.path.join(ROOT, "Previews")
SOURCE_DIR = os.path.join(ROOT, "Blender_Source")
MANIFEST_PATH = os.path.join(ROOT, "Documentation", "asset_manifest.json")

# Largest bevel in the brief. Each edge's bevel weight scales this, so one Bevel
# modifier per mesh gives every part its own 0.05-0.15 bevel.
MAX_BEVEL = 0.15
BEVEL_SEGMENTS = 1

# "mesh": Anchor is a tiny cube, which always survives the Roblox importer.
# "empty": Anchor is a Blender empty (FBX null), as the brief allows.
ANCHOR_MODE = "mesh"

# FBX axes from the brief. If assets arrive lying on their back in Studio,
# change these to the Blender defaults ("-Z", "Y").
FBX_FORWARD = "-Y"
FBX_UP = "Z"

SIZE_TOLERANCE = 0.01

BUDGETS = {
    "item": 300,  # raised from 150 for readable packaging (owner feedback)
    "fixture": 3000,
    "shell": 5000,
    "prop": 3000,
    "npc": 1500,
    "meshpart_max": 10000,
}


# ---------------------------------------------------------------------------
# Mesh building
# ---------------------------------------------------------------------------


class MeshBuilder:
    """Accumulates flat-coloured, bevel-weighted pieces into one bmesh."""

    def __init__(self, origin=(0, 0, 0)):
        """`origin` is where this mesh's pivot sits in asset space; pieces are
        given in the mesh's own local space around it."""
        self.origin = Vector(origin)
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.new("UVMap")
        self.bw = self.bm.edges.layers.float.new("bevel_weight_edge")
        self.colours = set()
        self.decals = set()  # open single faces: keep their winding as authored
        self.transform = Matrix.Identity(4)

    # every piece goes through here -------------------------------------
    def _faces(self, verts, faces, colour, bevel, smooth_sides=False):
        palette.COLOUR_INDEX[colour]  # fail fast on a typo
        self.colours.add(colour)
        uv = palette.uv_for(colour)
        bverts = [self.bm.verts.new(self.transform @ Vector(v)) for v in verts]
        new_faces = []
        for f in faces:
            face = self.bm.faces.new([bverts[i] for i in f])
            for loop in face.loops:
                loop[self.uv].uv = uv
            new_faces.append(face)
        if bevel > 0:
            w = min(bevel, MAX_BEVEL) / MAX_BEVEL
            for face in new_faces:
                for e in face.edges:
                    e[self.bw] = w
        elif not smooth_sides:
            for face in new_faces:
                for e in face.edges:
                    e.smooth = False  # crisp, flat-shaded edge
        return new_faces

    def hexa(self, corners, colour, bevel=0.0):
        """Eight corners: bottom ring (-x-y, +x-y, +x+y, -x+y) then top ring."""
        faces = [
            (0, 3, 2, 1),  # bottom
            (4, 5, 6, 7),  # top
            (0, 1, 5, 4),  # front (-Y)
            (1, 2, 6, 5),  # +X
            (2, 3, 7, 6),  # back (+Y)
            (3, 0, 4, 7),  # -X
        ]
        return self._faces(corners, faces, colour, bevel)

    def box(self, lo, hi, colour, bevel=0.08):
        (x0, y0, z0), (x1, y1, z1) = lo, hi
        # never let a bevel eat more than 40% of the thinnest side
        bevel = min(bevel, 0.4 * min(x1 - x0, y1 - y0, z1 - z0))
        corners = [
            (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
            (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
        ]  # fmt: skip
        return self.hexa(corners, colour, bevel)

    def quad(self, corners, colour):
        """A single one-sided face (decals such as labels). Wind it to face out."""
        faces = self._faces(corners, [(0, 1, 2, 3)], colour, 0.0)
        self.decals.update(faces)
        return faces

    def cylinder(self, base, radius, height, colour, segments=8, bevel=0.05, top_radius=None, cap=True):
        """Upright prism (or frustum, with `top_radius`) along +Z from `base`."""
        bx, by, bz = base
        rt = radius if top_radius is None else top_radius
        n = segments
        angles = [2 * math.pi * (i + 0.5) / n for i in range(n)]
        verts = [(bx + radius * math.cos(a), by + radius * math.sin(a), bz) for a in angles]
        verts += [(bx + rt * math.cos(a), by + rt * math.sin(a), bz + height) for a in angles]
        if rt <= 1e-6:  # cone: single apex
            verts = verts[:n] + [(bx, by, bz + height)]
            faces = [tuple(reversed(range(n)))] + [(i, (i + 1) % n, n) for i in range(n)]
            return self._faces(verts, faces, colour, min(bevel, 0.4 * radius))
        faces = [tuple(reversed(range(n))), tuple(range(n, 2 * n))] if cap else []
        faces += [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
        bevel = min(bevel, 0.4 * min(radius, rt, height))
        made = self._faces(verts, faces, colour, bevel, smooth_sides=True)
        if bevel <= 0:
            for f in made:
                for e in f.edges:
                    if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6 or not cap:
                        e.smooth = False
        return made

    def ellipsoid(self, centre, radii, colour, segments=6, rings=4):
        """Low-poly smooth-shaded lat-long ellipsoid (6x4 = 36 tris)."""
        cx, cy, cz = centre
        rx, ry, rz = radii
        n = segments
        verts = [(cx, cy, cz - rz)]
        for r in range(1, rings):
            phi = math.pi * r / rings - math.pi / 2
            for i in range(n):
                a = 2 * math.pi * i / n
                verts.append((cx + rx * math.cos(phi) * math.cos(a), cy + ry * math.cos(phi) * math.sin(a), cz + rz * math.sin(phi)))
        verts.append((cx, cy, cz + rz))
        top = len(verts) - 1
        faces = [(0, 1 + (i + 1) % n, 1 + i) for i in range(n)]
        for r in range(rings - 2):
            a0, b0 = 1 + r * n, 1 + (r + 1) * n
            faces += [(a0 + i, a0 + (i + 1) % n, b0 + (i + 1) % n, b0 + i) for i in range(n)]
        last = 1 + (rings - 2) * n
        faces += [(last + i, last + (i + 1) % n, top) for i in range(n)]
        return self._faces(verts, faces, colour, 0.0, smooth_sides=True)

    def star(self, centre, radius, colour, facing="-Y", inner=0.45, points=5):
        """Flat five-point star decal, one point straight up (or toward +Y on top faces)."""
        cx, cy, cz = centre
        pts = []
        for i in range(points * 2):
            a = math.pi / 2 + math.pi * i / points
            r = radius if i % 2 == 0 else radius * inner
            u, v = r * math.cos(a), r * math.sin(a)
            if facing == "-Y":
                pts.append((cx - u, cy, cz + v))
            elif facing == "+Z":
                pts.append((cx + u, cy + v, cz))
            elif facing == "+X":
                pts.append((cx, cy + u, cz + v))
            else:  # -X
                pts.append((cx, cy - u, cz + v))
        if facing == "-Y":
            pts.reverse()
        return self.poly(pts, colour)

    def sweep(self, path, radii, colour, sides=6, flat=1.0):
        """Smooth tube along a polyline with a radius per point (0 = pointed tip).

        `flat` squashes the cross-section's vertical axis (0.6 = oval).
        One closed mesh with no internal overlaps: used for bananas, carrots,
        handles and headphone bands.
        """
        pts = [Vector(p) for p in path]
        rings, tips = [], []
        verts = []
        for k, (p, r) in enumerate(zip(pts, radii)):
            fwd = (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
            side = fwd.cross(Vector((0, 0, 1)))
            if side.length < 1e-4:
                side = fwd.cross(Vector((0, 1, 0)))
            side.normalize()
            up = side.cross(fwd).normalized()
            if r <= 1e-6:
                tips.append((k, len(verts)))
                verts.append(tuple(p))
                rings.append(None)
                continue
            ring = []
            for i in range(sides):
                a = 2 * math.pi * (i + 0.5) / sides
                ring.append(len(verts))
                verts.append(tuple(p + side * (r * math.cos(a)) + up * (r * flat * math.sin(a))))
            rings.append(ring)
        faces = []
        for k in range(len(pts) - 1):
            a, b = rings[k], rings[k + 1]
            if a and b:
                faces += [(a[i], a[(i + 1) % sides], b[(i + 1) % sides], b[i]) for i in range(sides)]
            elif a and b is None:
                tip = dict(tips)[k + 1]
                faces += [(a[i], a[(i + 1) % sides], tip) for i in range(sides)]
            elif a is None and b:
                tip = dict(tips)[k]
                faces += [(tip, b[(i + 1) % sides], b[i]) for i in range(sides)]
        if rings[0]:
            faces.append(tuple(reversed(rings[0])))
        if rings[-1]:
            faces.append(tuple(rings[-1]))
        made = self._faces(verts, faces, colour, 0.0, smooth_sides=True)
        for f in made:
            if len(f.verts) == sides and f.verts[0].index >= 0 and len(f.verts) > 4:
                for e in f.edges:
                    e.smooth = False  # crisp end caps
        return made

    def disc(self, centre, radius, colour, segments=8, facing="-Y", radius2=None):
        """Flat n-gon decal. facing: '-Y' (front), '+Z' (top), '+X', '-X'."""
        cx, cy, cz = centre
        r2 = radius if radius2 is None else radius2
        pts = []
        for i in range(segments):
            a = 2 * math.pi * (i + 0.5) / segments
            u, v = radius * math.cos(a), r2 * math.sin(a)
            if facing == "-Y":
                pts.append((cx + u, cy, cz + v))
            elif facing == "+Z":
                pts.append((cx + u, cy + v, cz))
            elif facing == "+X":
                pts.append((cx, cy + u, cz + v))
            else:
                pts.append((cx, cy - u, cz + v))
        faces = self._faces(pts, [tuple(range(segments))], colour, 0.0)
        self.decals.update(faces)
        return faces

    def ring(self, base, r_out, r_in, height, colour, segments=24, exact=True):
        """Hollow upright ring (basin rim, planter wall). `exact` makes the outer
        flats reach r_out so the footprint measures exactly 2 * r_out."""
        bx, by, bz = base
        n = segments
        k = 1 / math.cos(math.pi / n) if exact else 1.0
        angles = [2 * math.pi * (i + 0.5) / n for i in range(n)]
        verts = []
        for z in (bz, bz + height):
            verts += [(bx + r_out * k * math.cos(a), by + r_out * k * math.sin(a), z) for a in angles]
            verts += [(bx + r_in * k * math.cos(a), by + r_in * k * math.sin(a), z) for a in angles]
        ob, ib, ot, it = 0, n, 2 * n, 3 * n
        faces = []
        for i in range(n):
            j = (i + 1) % n
            faces += [(ob + i, ob + j, ot + j, ot + i),  # outer wall
                      (ib + j, ib + i, it + i, it + j),  # inner wall
                      (ot + i, ot + j, it + j, it + i),  # top
                      (ob + j, ob + i, ib + i, ib + j)]  # bottom  # fmt: skip
        made = self._faces(verts, faces, colour, 0.0, smooth_sides=True)
        for f in made:  # crisp rims, smooth walls
            for e in f.edges:
                if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6:
                    e.smooth = False
        return made

    def poly(self, points, colour):
        """Flat n-gon decal through `points` (counter-clockwise seen from outside)."""
        faces = self._faces(points, [tuple(range(len(points)))], colour, 0.0)
        self.decals.update(faces)
        return faces

    def front_quad(self, x0, z0, x1, z1, y, colour):
        """Rectangle decal facing -Y at depth y."""
        return self.quad([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], colour)

    def top_quad(self, x0, y0, x1, y1, z, colour):
        """Rectangle decal facing +Z at height z."""
        return self.quad([(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], colour)

    # placement ----------------------------------------------------------
    def at(self, location=(0, 0, 0), rot_z_deg=0.0, rot_x_deg=0.0, rot_y_deg=0.0, scale=1.0):
        """Set the transform used for the following pieces (local to the part)."""
        self.transform = (
            Matrix.Translation(Vector(location))
            @ Matrix.Rotation(math.radians(rot_z_deg), 4, "Z")
            @ Matrix.Rotation(math.radians(rot_y_deg), 4, "Y")
            @ Matrix.Rotation(math.radians(rot_x_deg), 4, "X")
            @ Matrix.Scale(scale, 4)
        )
        return self

    # output -------------------------------------------------------------
    def to_object(self, name, collection, material):
        """Make an object at `origin` and apply a Bevel modifier."""
        solids = [f for f in self.bm.faces if f not in self.decals]
        bmesh.ops.recalc_face_normals(self.bm, faces=solids)
        mesh = bpy.data.meshes.new(name)
        self._weights = [e[self.bw] for e in self.bm.edges]
        self.bm.to_mesh(mesh)
        self.bm.free()
        mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))
        mesh.materials.append(material)

        obj = bpy.data.objects.new(name, mesh)
        obj.location = self.origin
        collection.objects.link(obj)

        if not any(w > 0 for w in self._weights):
            obj["cm_colours"] = sorted(self.colours)
            return obj
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = MAX_BEVEL
        mod.segments = BEVEL_SEGMENTS
        mod.limit_method = "WEIGHT"
        mod.harden_normals = True
        mod.use_clamp_overlap = False
        apply_modifiers(obj)
        obj["cm_colours"] = sorted(self.colours)
        return obj


def recentre(obj):
    """Shift a mesh so its origin is at its own bottom centre."""
    lo, hi = world_bbox([obj])
    shift = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z)) - obj.location
    for v in obj.data.vertices:
        v.co -= shift
    bpy.context.view_layer.update()


def apply_modifiers(obj):
    with bpy.context.temp_override(
        object=obj, active_object=obj, selected_objects=[obj], selected_editable_objects=[obj]
    ):
        for mod in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=mod.name)


def part_name(obj):
    """The name an object is exported under (Blender names carry an asset prefix)."""
    return obj.get("cm_name", obj.name)


def prefixed(collection, name):
    return "%s:%s" % (collection.name, name)


def make_anchor(collection, location, material):
    if ANCHOR_MODE == "empty":
        obj = bpy.data.objects.new(prefixed(collection, "Anchor"), None)
        obj["cm_name"] = "Anchor"
        obj.empty_display_type = "PLAIN_AXES"
        obj.empty_display_size = 0.5
        obj.location = location
        collection.objects.link(obj)
        return obj
    b = MeshBuilder(origin=location)
    s = 0.1
    b.box((-s, -s, -s), (s, s, s), "mint", bevel=0)
    obj = b.to_object(prefixed(collection, "Anchor"), collection, material)
    obj["cm_name"] = "Anchor"
    return obj


def new_collection(name, parent=None):
    col = bpy.data.collections.get(name)
    if col is not None:
        for obj in list(col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
    else:
        col = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(col)
    return col


# ---------------------------------------------------------------------------
# Measuring
# ---------------------------------------------------------------------------


def tri_count(obj):
    if obj.type != "MESH":
        return 0
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


def world_bbox(objs):
    lo = Vector((math.inf,) * 3)
    hi = Vector((-math.inf,) * 3)
    for obj in objs:
        if obj.type != "MESH":
            continue
        for v in obj.data.vertices:
            w = obj.matrix_world @ v.co
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi


def wxh_d(lo, hi):
    """Blender (X, Z, Y) extents, i.e. the brief's W x H x D."""
    d = hi - lo
    return (d.x, d.z, d.y)


def fmt3(t):
    return " x ".join("%.2f" % v for v in t)


# ---------------------------------------------------------------------------
# Asset record, checks and report
# ---------------------------------------------------------------------------


class Asset:
    """One exported file: its objects plus what the checks expect of it."""

    def __init__(self, file_name, category, collection, expected_size, budget, notes="", folder="Interiors"):
        self.file_name = file_name
        self.category = category
        self.folder = folder  # sub-folder of Roblox_FBX/
        self.collection = collection
        self.expected_size = expected_size  # (W, H, D) or None
        self.budget = budget
        self.notes = notes
        self.checks = []
        self.measure = None  # object names that define the size; default all but Anchor

    @property
    def objects(self):
        return list(self.collection.objects)

    def sized_objects(self):
        if self.measure:
            return [o for o in self.objects if part_name(o) in self.measure]
        return [o for o in self.objects if part_name(o) != "Anchor"]

    def check(self, ok, label):
        self.checks.append((bool(ok), label))

    def run_checks(self):
        self.checks = []
        lo, hi = world_bbox(self.sized_objects())
        actual = wxh_d(lo, hi)
        self.actual_size = actual
        if self.expected_size:
            ok = all(e is None or abs(a - e) <= SIZE_TOLERANCE for a, e in zip(actual, self.expected_size))
            expected = " x ".join("any" if e is None else "%.2f" % e for e in self.expected_size)
            what = "" if not self.measure else " of " + "+".join(self.measure)
            self.check(ok, "size%s %s (expected %s)" % (what, fmt3(actual), expected))
        centre = (lo + hi) / 2
        self.check(
            abs(lo.z) <= SIZE_TOLERANCE and abs(centre.x) <= SIZE_TOLERANCE and abs(centre.y) <= SIZE_TOLERANCE,
            "pivot at bottom centre (min z %.3f, centre x %.3f, y %.3f)" % (lo.z, centre.x, centre.y),
        )
        total = sum(tri_count(o) for o in self.objects)
        self.total_tris = total
        self.check(total <= self.budget, "%d tris (budget %d)" % (total, self.budget))
        biggest = max((tri_count(o) for o in self.objects), default=0)
        self.check(biggest <= BUDGETS["meshpart_max"], "largest mesh %d tris (MeshPart limit 10,000)" % biggest)
        for o in self.objects:
            if o.matrix_world.to_scale() != Vector((1, 1, 1)) or o.rotation_euler.to_quaternion().angle > 1e-6:
                self.check(False, "%s has unapplied rotation/scale" % part_name(o))
        return all(ok for ok, _ in self.checks)

    def check_items_inside(self, body_objs, item_objs):
        blo, bhi = world_bbox(body_objs)
        for item in item_objs:
            ilo, ihi = world_bbox([item])
            inside = all(blo[i] - 1e-4 <= ilo[i] and ihi[i] <= bhi[i] + 1e-4 for i in range(3))
            self.check(inside, "%s inside fixture (%s)" % (part_name(item), fmt3(wxh_d(ilo, ihi))))
            self.check(tri_count(item) <= BUDGETS["item"], "%s %d tris (item budget %d)" % (part_name(item), tri_count(item), BUDGETS["item"]))

    def manifest_entry(self):
        colours = sorted({c for o in self.objects for c in o.get("cm_colours", [])})
        return {
            "file": "Roblox_FBX/%s/%s.fbx" % (self.folder, self.file_name),
            "category": self.category,
            "size_wxhxd": [round(v, 3) for v in self.actual_size],
            "expected_size_wxhxd": list(self.expected_size) if self.expected_size else None,
            "size_measured_on": self.measure or "all objects except Anchor",
            "triangles": self.total_tris,
            "triangles_per_object": {part_name(o): tri_count(o) for o in self.objects},
            "pivot": "bottom-centre (0, 0, 0)",
            "fbx_folder": "Roblox_FBX/" + self.folder,
            "children": [part_name(o) for o in self.objects],
            "colour_slots": {c: palette.HEX[c] for c in colours},
            "checks_passed": all(ok for ok, _ in self.checks),
            "notes": self.notes,
        }


def print_report(assets):
    print("\n" + "=" * 78)
    print("CHAOS MART SIZE REPORT  (W x H x D in studs; W = X, H = Z, D = Y)")
    print("=" * 78)
    failures = 0
    for a in assets:
        status = "PASS" if all(ok for ok, _ in a.checks) else "FAIL"
        print("\n[%s] %s" % (status, a.file_name))
        for ok, label in a.checks:
            if not ok:
                failures += 1
            print("   %s %s" % ("ok  " if ok else "FAIL", label))
        for o in a.objects:
            print("       - %-10s %5d tris" % (part_name(o), tri_count(o)))
    print("\n%d asset(s), %d failed check(s)\n" % (len(assets), failures))
    return failures


# ---------------------------------------------------------------------------
# Export and manifest
# ---------------------------------------------------------------------------


def export_fbx(asset):
    out_dir = os.path.join(FBX_DIR, asset.folder)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, asset.file_name + ".fbx")
    view_layer = bpy.context.view_layer
    for o in view_layer.objects:
        o.select_set(False)
    objs = asset.objects
    for o in objs:
        o.select_set(True)
    view_layer.objects.active = objs[0]
    types = {"MESH", "EMPTY"} if ANCHOR_MODE == "empty" else {"MESH"}
    # export under the clean part names (Item1, Body, Anchor...), then restore
    originals = [(o, o.name) for o in objs]
    for o in objs:
        o.name = "__export_%s" % o.name
    for o, _ in originals:
        o.name = part_name(o)
        assert o.name == part_name(o), "name clash exporting %s" % o.name
    bpy.ops.export_scene.fbx(
        filepath=path,
        use_selection=True,
        object_types=types,
        axis_forward=FBX_FORWARD,
        axis_up=FBX_UP,
        apply_scale_options="FBX_SCALE_ALL",
        apply_unit_scale=True,
        use_mesh_modifiers=True,
        mesh_smooth_type="OFF",
        use_triangles=True,
        use_custom_props=False,
        add_leaf_bones=False,
        bake_anim=False,
        path_mode="COPY",
        embed_textures=True,
    )
    for o, name in originals:
        o.name = name
    for o in objs:
        o.select_set(False)
    return path


def write_manifest(assets):
    data = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH) as f:
            data = json.load(f)
    data.setdefault("units", "1 Blender unit = 1 Roblox stud; +Z up; front faces -Y")
    data.setdefault("palette", "Textures/CM_Palette.png")
    data.setdefault("assets", {})
    for a in assets:
        data["assets"][a.file_name] = a.manifest_entry()
    data["assets"] = dict(sorted(data["assets"].items()))
    with open(MANIFEST_PATH, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


# ---------------------------------------------------------------------------
# Preview render
# ---------------------------------------------------------------------------


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "NONE"
    return scene


def _stage(ground_colour="stockroom", ground_size=3000):
    """Ground, sky, soft sun and a camera in a temporary collection."""
    scene = bpy.context.scene
    tmp = new_collection("_preview")
    b = MeshBuilder()
    g = ground_size / 2
    b.box((-g, -g, -0.2), (g, g, -0.001), ground_colour, bevel=0)
    b.to_object("_ground", tmp, bpy.data.materials["CM_Palette"])

    world = bpy.data.worlds.new("_sky")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.62, 0.78, 0.95, 1.0)
    bg.inputs["Strength"].default_value = 0.9
    scene.world = world
    sun_data = bpy.data.lights.new("_sun", "SUN")
    sun_data.energy = 3.2
    sun_data.angle = math.radians(9)  # crisp but not hard-edged shadows
    sun = bpy.data.objects.new("_sun", sun_data)
    sun.rotation_euler = (math.radians(50), 0, math.radians(-35))
    tmp.objects.link(sun)

    cam_data = bpy.data.cameras.new("_cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("_cam", cam_data)
    tmp.objects.link(cam)
    scene.camera = cam

    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.use_denoising = True
    scene.view_settings.view_transform = "Standard"
    scene.render.film_transparent = False
    _glow(True)
    return tmp, cam, world


GLOW_PARTS = {"LightStrip": "mint", "Neon": "yellow", "LaneLamp": "warm_light", "Light": "warm_light"}


def _glow(on):
    """Previews only: swap glowing parts to an emissive copy of their colour."""
    for o in bpy.data.objects:
        colour = GLOW_PARTS.get(part_name(o))
        if o.type != "MESH" or not colour:
            continue
        if on:
            mat = bpy.data.materials.get("_glow_" + colour)
            if mat is None:
                mat = bpy.data.materials.new("_glow_" + colour)
                mat.use_nodes = True
                bsdf = mat.node_tree.nodes["Principled BSDF"]
                rgb = palette.hex_to_rgb(palette.HEX[colour])
                lin = tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb)
                bsdf.inputs["Base Color"].default_value = (*lin, 1)
                bsdf.inputs["Emission Color"].default_value = (*lin, 1)
                bsdf.inputs["Emission Strength"].default_value = 4.0
            o["_mat"] = o.data.materials[0].name
            o.data.materials[0] = mat
        elif "_mat" in o:
            o.data.materials[0] = bpy.data.materials[o["_mat"]]
            del o["_mat"]


def _teardown(tmp, world):
    _glow(False)
    for o in list(tmp.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(tmp)
    bpy.data.worlds.remove(world)


def frame_camera(cam, lo, hi, resolution, direction=(0.5, -1.0, 0.42), fill=0.75, ortho=False):
    """Point `cam` at the box lo..hi from `direction` so it fills the frame."""
    centre = (lo + hi) / 2
    size = hi - lo
    direction = Vector(direction).normalized()
    cam_data = cam.data
    aspect = resolution[0] / resolution[1]
    radius = 0.5 * max(size.length, 0.5)
    if ortho:
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = 2 * radius * max(1.0, aspect) / (fill / 0.75)
        dist = radius * 4 + 50
    else:
        cam_data.type = "PERSP"
        cam_data.lens = 50
        fov_h = 2 * math.atan(cam_data.sensor_width / (2 * cam_data.lens))
        fov_v = 2 * math.atan(math.tan(fov_h / 2) / aspect)
        dist = radius / math.sin(min(fov_h, fov_v) / 2) * fill
    cam.location = centre + direction * dist
    cam.rotation_euler = (-direction).to_track_quat("-Z", "Y").to_euler()
    cam_data.clip_end = dist * 4 + 1000


def aim_camera(cam, eye, target, lens=35):
    """Place `cam` at `eye` looking at `target` (perspective)."""
    cam.data.type = "PERSP"
    cam.data.lens = lens
    cam.location = Vector(eye)
    cam.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y").to_euler()


def _render(path, resolution, samples):
    scene = bpy.context.scene
    scene.cycles.samples = samples
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return path


def _solo(objects):
    """Hide every other object from the render; returns a function that undoes it."""
    keep = set(objects)
    hidden = [o for o in bpy.context.scene.objects if o not in keep and not o.name.startswith("_") and not o.hide_render]
    for o in hidden:
        o.hide_render = True

    def restore():
        for o in hidden:
            o.hide_render = False

    return restore


def render_preview(asset_groups, out_name, resolution=(1600, 900), samples=48, direction=(0.5, -1.0, 0.42)):
    """Render each list of objects together in a grid under soft daylight.

    Objects are moved for the shot and put back afterwards; nothing else is visible.
    """
    restore = _solo([o for objs in asset_groups for o in objs])
    moved = []
    boxes = [world_bbox(objs) for objs in asset_groups]
    gap = 3.0
    area = sum((hi.x - lo.x + gap) * (hi.y - lo.y + gap) for lo, hi in boxes)
    row_w = max(max(hi.x - lo.x for lo, hi in boxes), math.sqrt(area) * 1.6)
    cursor_x = cursor_y = row_d = 0.0
    for objs, (lo, hi) in zip(asset_groups, boxes):
        if cursor_x > 0 and cursor_x + (hi.x - lo.x) > row_w:
            cursor_x, cursor_y, row_d = 0.0, cursor_y + row_d + gap, 0.0
        shift = Vector((cursor_x - lo.x, cursor_y - lo.y, 0))
        for o in objs:
            moved.append((o, o.location.copy()))
            o.location += shift
            o.hide_render = part_name(o) == "Anchor"
        cursor_x += (hi.x - lo.x) + gap
        row_d = max(row_d, hi.y - lo.y)
    bpy.context.view_layer.update()

    tmp, cam, world = _stage()
    lo, hi = world_bbox([o for objs in asset_groups for o in objs])
    frame_camera(cam, lo, hi, resolution, direction)
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    path = _render(os.path.join(PREVIEW_DIR, out_name), resolution, samples)

    for o, loc in moved:
        o.location = loc
    bpy.context.view_layer.update()
    _teardown(tmp, world)
    restore()
    return path


def render_contact_sheet(assets, out_name, tile=(420, 320), samples=24, columns=6):
    """One framed render per asset, tiled into a labelled sheet."""
    from PIL import Image, ImageDraw

    tile_dir = os.path.join(PREVIEW_DIR, "tiles")
    os.makedirs(tile_dir, exist_ok=True)
    tmp, cam, world = _stage()
    paths = []
    for a in assets:
        restore = _solo([o for o in a.objects if part_name(o) != "Anchor"])
        lo, hi = world_bbox(a.sized_objects())
        frame_camera(cam, lo, hi, tile, direction=(0.35, -1.0, 0.4), fill=1.0)
        png = _render(os.path.join(tile_dir, a.file_name + ".png"), tile, samples)
        restore()
        jpg = png[:-4] + ".jpg"  # keep the per-asset tiles small
        Image.open(png).convert("RGB").save(jpg, quality=90)
        os.remove(png)
        paths.append(jpg)
    _teardown(tmp, world)

    label_h = 26
    rows = math.ceil(len(paths) / columns)
    sheet = Image.new("RGB", (columns * tile[0], rows * (tile[1] + label_h)), (18, 36, 60))
    draw = ImageDraw.Draw(sheet)
    for i, (a, p) in enumerate(zip(assets, paths)):
        x, y = (i % columns) * tile[0], (i // columns) * (tile[1] + label_h)
        sheet.paste(Image.open(p).convert("RGB"), (x, y))
        draw.text((x + 8, y + tile[1] + 6), "%s  (%d tris)" % (a.file_name, a.total_tris), fill=(244, 247, 251))
    path = os.path.join(PREVIEW_DIR, out_name)
    sheet.save(path)
    return path


# ---------------------------------------------------------------------------
# Asset registry: families declare assets with @asset and build them with Kit
# ---------------------------------------------------------------------------

REGISTRY = {}  # family -> list of spec dicts


def asset(family, file_name, folder, size, budget="prop", notes="", measure=None, category=None, recentre=False):
    """Register a builder `fn(kit)` that creates one exported asset.

    `recentre` shifts the whole asset so its bounding box's bottom centre sits on
    the origin (for asymmetric props such as a lamp with an arm)."""

    def deco(fn):
        REGISTRY.setdefault(family, []).append(
            dict(fn=fn, file_name=file_name, folder=folder, size=size, budget=budget,
                 notes=notes, measure=measure, category=category or family, recentre=recentre)
        )  # fmt: skip
        return fn

    return deco


class Kit:
    """Handed to each asset builder: makes named parts in the asset's collection."""

    def __init__(self, collection, mats):
        self.collection = collection
        self.mats = mats

    def part(self, name, origin=(0, 0, 0), material="palette"):
        return _Part(self, name, origin, material)

    def anchor(self, location):
        return make_anchor(self.collection, location, self.mats["palette"])


class _Part:
    def __init__(self, kit, name, origin, material):
        self.kit, self.name, self.material = kit, name, material
        self.builder = MeshBuilder(origin)

    def __enter__(self):
        return self.builder

    def __exit__(self, exc_type, *_):
        if exc_type is None:
            col = self.kit.collection
            self.obj = self.builder.to_object(prefixed(col, self.name), col, self.kit.mats[self.material])
            self.obj["cm_name"] = self.name


def short_name(file_name):
    return file_name.split("_", 2)[-1]


def build_family(family, mats, only=None):
    out = []
    for spec in REGISTRY.get(family, []):
        if only and spec["file_name"] not in only and short_name(spec["file_name"]) not in only:
            continue
        col = new_collection(spec["file_name"])
        extra = spec["fn"](Kit(col, mats))
        bpy.context.view_layer.update()  # matrix_world of new parts is stale until this
        if spec["recentre"]:
            objs = [o for o in col.objects if part_name(o) != "Anchor"]
            lo, hi = world_bbox(objs)
            shift = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
            for o in col.objects:
                o.location -= shift
            bpy.context.view_layer.update()
        a = Asset(spec["file_name"], spec["category"], col, spec["size"], BUDGETS[spec["budget"]], spec["notes"], spec["folder"])
        a.measure = spec["measure"]
        a.run_checks()
        if callable(extra):  # builders may return a function adding their own checks
            extra(a)
        out.append(a)
    return out


# ---------------------------------------------------------------------------
# FBX round-trip validation
# ---------------------------------------------------------------------------


def validate_exports():
    """Re-import every exported FBX into an empty scene and compare it with the manifest.

    Checks: file exists, the same part names come back (no '.001' suffixes),
    triangle counts match, the size matches, and the palette texture is embedded.
    Returns a list of problems (empty when everything round-trips).
    """
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)["assets"]
    problems = []
    for name, entry in sorted(manifest.items()):
        path = os.path.join(ROOT, entry["file"])
        if not os.path.exists(path):
            problems.append("%s: missing %s" % (name, entry["file"]))
            continue
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.fbx(filepath=path, use_manual_orientation=True, axis_forward=FBX_FORWARD, axis_up=FBX_UP)
        objs = [o for o in bpy.context.scene.objects if o.type in ("MESH", "EMPTY")]
        got = sorted(o.name for o in objs)
        want = sorted(entry["children"])
        if got != want:
            problems.append("%s: parts %s != %s" % (name, got, want))
            continue
        tris = sum(tri_count(o) for o in objs)
        if tris != entry["triangles"]:
            problems.append("%s: %d tris after import, %d built" % (name, tris, entry["triangles"]))
        measured = entry["size_measured_on"]
        sized = [o for o in objs if (o.name in measured if isinstance(measured, list) else o.name != "Anchor")]
        size = wxh_d(*world_bbox(sized))
        if any(abs(a - b) > 0.02 for a, b in zip(size, entry["size_wxhxd"])):
            problems.append("%s: size %s after import, %s built" % (name, fmt3(size), entry["size_wxhxd"]))
        if not any(img.packed_file or (img.filepath and os.path.exists(bpy.path.abspath(img.filepath))) for img in bpy.data.images):
            problems.append("%s: palette texture not found after import" % name)
    return problems
