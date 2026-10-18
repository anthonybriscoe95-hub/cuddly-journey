# Chaos Mart Tycoon: 3D asset pack

An original, mobile-friendly asset library for the Roblox game **Chaos Mart Tycoon**, built entirely by
Blender Python scripts so any number can be changed and the whole pack rebuilt in one command.

| | |
|---|---|
| Assets | 230 FBX files (see [`Documentation/ASSET_INVENTORY.md`](Documentation/ASSET_INVENTORY.md)) |
| Editable source | `Blender_Source/ChaosMart_Assets.blend` (every asset in its own collection) |
| Assembled map | `Map_Assembly/ChaosMart_Map.blend`, `placements.json`, and a Roblox Studio script that builds it (**provisional layout**, see below) |
| Texture | one 256 × 256 palette atlas, `Textures/CM_Palette.png`, embedded in every FBX |
| Previews | `Previews/` (per-family sheets, per-asset tiles, map shots by day and night) |

## Folder layout

```
ChaosMart_3D_Assets/
├── Blender_Source/        ChaosMart_Assets.blend (all assets, editable)
├── Blender_Scripts/       the generators (run build_all.py)
├── Roblox_FBX/
│   ├── Buildings/         store shell kit, luxury facade, per-stage floors and roofs, stockroom, signage
│   ├── Interiors/         shelves, coolers, checkouts, carts, stockroom, staff, security
│   ├── Products/          every product as its own file (+ the carried shopping bag)
│   ├── Roads/             road, crosswalk, parking and sidewalk modules
│   ├── Environment/       per-stage plot pads, plaza pad, trees, lamps, vehicles, kiosks, landmarks
│   ├── Characters/        R6-proportioned NPCs, and their outfits as Roblox accessories
│   ├── Gameplay/          purchase / upgrade pads, stations, terminals, rewards
│   └── Events/            chaos-event props
├── Textures/              CM_Palette.png
├── Previews/              catalog_<family>.png, preview_<family>.png, map_*.png, tiles/
├── Map_Assembly/          ChaosMart_Map.blend, placements.json, BuildChaosMartMap.server.lua + ChaosMartPlacements.lua
└── Documentation/         ASSET_INVENTORY.md, IMPORT_GUIDE.md, DESIGN_DECISIONS.md, asset_manifest.json
```

## Rebuilding

Blender 4.2 or newer (tested with Blender 5.2 LTS):

```bash
cd ChaosMart_3D_Assets/Blender_Scripts
blender --background --python build_all.py                       # everything (about 40 min with renders on 4 CPU cores)
blender --background --python build_all.py -- --no-render        # geometry, FBX and checks only (about 2 min)
blender --background --python build_all.py -- --families products --only ChipBag,Apple
```

The same commands work without the Blender app through the `bpy` Python module (`pip install bpy`, then
`python build_all.py ...`). Flags: `--families` (comma list), `--only` (asset names), `--no-render`,
`--no-map`, `--no-validate`.

Every run:
1. builds each asset into its own collection,
2. checks it: size against the brief, bottom-centre pivot, triangle budget, no unapplied transforms,
   and for stocked fixtures that every `Item` sits fully inside the fixture,
3. exports `Roblox_FBX/<folder>/<name>.fbx` (only if its checks passed), with clean part names,
4. renders the previews, assembles the map and saves both `.blend` files,
5. re-imports every FBX into an empty scene and confirms the part names, triangle counts, size and
   embedded texture survived the round trip,
6. prints a size report, writes `Documentation/asset_manifest.json` and regenerates the inventory.

It exits with an error if any check fails.

## What to tweak

| To change | Edit |
|---|---|
| Colours | `palette.py` (`COLOURS`): the atlas and every asset follow |
| A fixture's size, item count or product | `fixtures.py` (`GONDOLAS`, `COOLERS`, the `@cm.asset` sizes) |
| What a stock slot holds | `fixtures.py` (`ITEMS`) |
| A product's look | its function in `products.py` |
| Map layout: plot size, entrance position, plaza, roads, which stage is on which plot | `map_layout.json` |
| A stage's size, front modules or interior | `stages.py` (`STAGES`, `interior()`) |
| Bevel size, triangle budgets, FBX axes, Anchor as mesh or empty | top of `cm_common.py` |

## Status

Done and verified in Blender (built, checked, exported, re-imported):
- the full product-fixture set from the brief (12) plus a chest freezer and an end-cap,
- 32 individual products, reused as the shelves' stock,
- the modular store shell (walls, storefront, door frame, sliding doors, staff door, awning, signs,
  floor, roof, stockroom, planters, lights, bins),
- roads, sidewalks, crosswalks, parking, plot and plaza pads,
- lot and plaza props, vehicles and landmarks, tycoon gameplay objects, event props,
- 12 R6-proportioned NPCs, and 17 outfit accessories (caps, beanies, aprons, badges, vest, backpack...)
  pivoted on Roblox avatar attachment points so standard avatars can wear them,
- a double-sided aisle (used in the Mega Mart and Luxury stores), and T-junction and curved road pieces,
- advanced-store merchandise (clothing rack, electronics table, phones, laptops, upright freezer),
  checkout and office extras, window and feature-panel wall modules, a parking divider, the plaza
  monument, event stage and directory sign, and more event props,
- a `_Far` distant-detail version of every stocked fixture,
- a Roblox Studio script that builds the whole map from the imported models,
- the five store progression stages (Corner Store, Mini Mart, Supermarket, Mega Mart, Luxury Shopping
  Center), each built from the modular kit with its own floor, roof and plot pad, and checked for
  overlaps inside and outside the store,
- a provisional map: six plots around a central plaza showing all five stages.

Not done yet (next milestones):
- **The blueprint and Developer Bible were not supplied**, so the map is a documented assumption:
  `map_layout.json` holds every layout number and is marked provisional.
- **Nothing has been imported into Roblox Studio yet** (Studio isn't available in this environment).
  [`Documentation/IMPORT_GUIDE.md`](Documentation/IMPORT_GUIDE.md) lists what to check on the first import.
