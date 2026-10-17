"""Write Documentation/ASSET_INVENTORY.md from Documentation/asset_manifest.json.

Plain Python (no Blender needed). build_all.py runs it at the end; run it by
hand with `python write_inventory.py` after editing the manifest.
"""

import json
import os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = os.path.join(ROOT, "Documentation", "asset_manifest.json")
OUT = os.path.join(ROOT, "Documentation", "ASSET_INVENTORY.md")

FOLDER_ORDER = ["Buildings", "Interiors", "Products", "Roads", "Environment", "Characters", "Gameplay", "Events"]


def fmt_size(v):
    return " × ".join("%g" % round(x, 2) for x in v)


def main():
    with open(MANIFEST) as f:
        data = json.load(f)
    assets = data["assets"]
    by_folder = defaultdict(list)
    for name, a in assets.items():
        by_folder[a["file"].split("/")[1]].append((name, a))

    lines = [
        "# Chaos Mart Tycoon: asset inventory",
        "",
        "Generated from `asset_manifest.json` by `Blender_Scripts/write_inventory.py`; do not edit by hand.",
        "",
        "Sizes are W × H × D in studs (W along X, H up, D along Y; the front faces −Y). Every asset's pivot",
        "is its bottom centre. **Parts** are the objects inside the FBX (they become MeshParts in Roblox).",
        "",
        "| Folder | Assets | Triangles |",
        "|---|---:|---:|",
    ]
    total_tris = 0
    for folder in FOLDER_ORDER:
        items = by_folder.get(folder, [])
        tris = sum(a["triangles"] for _, a in items)
        total_tris += tris
        lines.append("| %s | %d | %s |" % (folder, len(items), format(tris, ",")))
    lines.append("| **Total** | **%d** | **%s** |" % (len(assets), format(total_tris, ",")))
    lines.append("")
    failed = [n for n, a in assets.items() if not a["checks_passed"]]
    lines.append("All size, pivot and budget checks passed." if not failed else "Checks FAILED for: " + ", ".join(failed))
    lines.append("")

    for folder in FOLDER_ORDER:
        items = sorted(by_folder.get(folder, []))
        if not items:
            continue
        lines += ["## %s (%d)" % (folder, len(items)), "", "| File | Size (W × H × D) | Tris | Parts | Notes |", "|---|---|---:|---|---|"]
        for name, a in items:
            parts = a["children"]
            if sum(p.startswith("Item") for p in parts) > 2:
                n = sum(p.startswith("Item") for p in parts)
                parts = [p for p in parts if not p.startswith("Item")] + ["Item1…Item%d" % n]
            lines.append("| `%s.fbx` | %s | %s | %s | %s |" % (
                name, fmt_size(a["size_wxhxd"]), format(a["triangles"], ","), ", ".join(parts), a["notes"].replace("|", "/")))
        lines.append("")

    with open(OUT, "w") as f:
        f.write("\n".join(lines))
    print("wrote", OUT, "(%d assets)" % len(assets))


if __name__ == "__main__":
    main()
