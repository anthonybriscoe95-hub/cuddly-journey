"""Re-render the family previews and contact sheets from Blender_Source/ChaosMart_Assets.blend.

Use it after changing only lighting or framing, without rebuilding any geometry:
  blender --background --python render_previews.py -- [--families props,npcs]
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import build_all  # noqa: E402
import cm_common as cm  # noqa: E402


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
    p = argparse.ArgumentParser()
    p.add_argument("--families", default=",".join(build_all.FAMILIES))
    args = p.parse_args(argv)

    bpy.ops.wm.open_mainfile(filepath=os.path.join(cm.SOURCE_DIR, "ChaosMart_Assets.blend"))
    for fam in [f for f in args.families.split(",") if f]:
        __import__(fam)  # registers the family's assets
        assets = []
        for spec in cm.REGISTRY.get(fam, []):
            col = bpy.data.collections.get(spec["file_name"])
            if col is None:
                print("not built:", spec["file_name"])
                continue
            a = cm.Asset(spec["file_name"], spec["category"], col, spec["size"], cm.BUDGETS[spec["budget"]], spec["notes"], spec["folder"])
            a.measure = spec["measure"]
            a.run_checks()
            assets.append(a)
        if assets:
            print("rendered", cm.render_preview([a.objects for a in assets], "preview_%s.png" % fam))
            print("rendered", cm.render_contact_sheet(assets, "catalog_%s.png" % fam))


if __name__ == "__main__":
    main()
