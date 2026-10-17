"""Chaos Mart Tycoon: build, check, export and preview every asset family.

  blender --background --python build_all.py -- [--families fixtures,shell]
                                                 [--only SnackShelf] [--no-render]
  # or, with the `bpy` pip module:
  python build_all.py [same flags]

Writes FBX files to Roblox_FBX/<folder>/, the palette to Textures/, previews
to Previews/, the editable scene to Blender_Source/ChaosMart_Assets.blend and
Documentation/asset_manifest.json. Exits non-zero if any check fails.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import cm_common as cm  # noqa: E402
import palette  # noqa: E402

FAMILIES = ["products", "fixtures"]


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
    p = argparse.ArgumentParser()
    p.add_argument("--families", default=",".join(FAMILIES))
    p.add_argument("--only", default="", help="comma-separated asset names, e.g. SnackShelf")
    p.add_argument("--no-render", action="store_true")
    return p.parse_args(argv)


def main():
    args = parse_args()
    families = [f for f in args.families.split(",") if f]
    only = [n for n in args.only.split(",") if n] or None

    cm.reset_scene()
    mats = palette.build(cm.TEXTURE_DIR)

    all_assets = []
    for fam in families:
        module = __import__(fam)
        assets = module.build(mats, only)
        all_assets += assets
        for a in assets:
            if all(ok for ok, _ in a.checks):
                print("exported", cm.export_fbx(a))
        if assets and not args.no_render:
            print("rendered", cm.render_preview([a.objects for a in assets], "preview_%s.png" % fam))
            print("rendered", cm.render_contact_sheet(assets, "catalog_%s.png" % fam))

    failures = cm.print_report(all_assets)
    cm.write_manifest(all_assets)
    os.makedirs(cm.SOURCE_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(cm.SOURCE_DIR, "ChaosMart_Assets.blend"), compress=True)
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
