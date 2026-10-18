# Design decisions and assumptions

Where the briefs didn't specify something, or the two briefs disagreed, this records what was chosen
and why, so nothing contradicts the reference material silently.

## Missing reference documents

The Developer Bible (PDF), the Overhead Map Blueprint (PNG) and the Map Blueprint (PDF) were **not
supplied**. Everything blueprint-dependent lives in `Blender_Scripts/map_layout.json`, marked
provisional:

- **Plots:** 288 × 208, three per side of the plaza, fronts facing it (north row unrotated, south row
  turned 180°). Column centres x = −320, 0, 320 and row centres y = ±216. The plot is sized so the
  largest stage (Luxury Shopping Center) plus its stockroom and loading apron fit.
- **Store stages:** all five stages share one entrance position (plot-local x = −48) and one back line,
  and grow sideways and toward the plaza. The stockroom always sits 8 studs to the right of the store,
  so it moves when the store grows (in game, move it when the player upgrades).
- **Parking:** two rows of 9-wide bays either side of a 24-wide aisle, the same on every stage, with
  the walkway to the door running through the lot.
- **Plaza:** 960 × 160 in the middle, a road loop around it (24-wide two-lane roads, 32-long segments),
  and 8-wide sidewalks on the plot side.
- **Crosswalks** sit exactly in front of each store entrance, because the entrance x is chosen on the
  32-stud road grid.
- **Which stage stands on which plot** in the assembled map is `plot_stages` in `map_layout.json`
  (it currently shows all five stages, so the map doubles as a progression showcase).

When the blueprint arrives, edit `map_layout.json` and rebuild; the pads, plaza and assembly follow it.

## Where the two briefs differ

| Topic | Asset-pack brief | Master brief | Chosen |
|---|---|---|---|
| File names | `CM_Fixture_SnackShelf` etc. | `CM_Shelf_Double_Aisle` etc. | The asset-pack names, because the existing game code expects them. New assets use `CM_<Category>_<Name>` |
| Folders | `export/` | `ChaosMart_3D_Assets/…` | The master brief's layout |
| Triangle budgets | items ≤ 150, fixtures ≤ 3,000 | "no arbitrary limits" | Fixtures ≤ 3,000 and shell ≤ 5,000 kept. Standalone products raised to ≤ 300 after owner feedback that products should look clearly designed |
| NPCs | 6 separate R6 part meshes | prefer standard avatars + accessories | Both: the R6 part meshes the game code uses, and every outfit piece as a Roblox accessory mesh (`Handle`, pivot on its attachment point) |

## Store progression stages

| Stage | Store (outer) | Front modules | Inside |
|---|---|---|---|
| 1 Corner Store | 54 × 40 | 4 storefronts, door | 1 checkout, 2 gondolas, wall cooler, vending machine |
| 2 Mini Mart | 90 × 56 | 8 storefronts, door | 2 checkouts, 4 gondolas, 3 coolers, produce stand |
| 3 Supermarket | 134 × 88 | 12 storefronts, door | 4 checkouts, 6 gondolas, 3 coolers, produce, bakery, candy bin |
| 4 Mega Mart | 186 × 104 | 16 storefronts, door | 6 checkouts, 3 self-checkouts, service desk, 12 gondolas, 6 end-caps, 5 coolers, 2 freezers, produce, bakery |
| 5 Luxury Shopping Center | 186 × 112 | glass curtain walls, luxury door, canopy | as Mega Mart with premium shelves, two bakeries, 4 self-checkouts, ad screens; rooftop prestige sign, red carpet and VIP ropes outside |

Every stage is assembled from the same modules and is checked on every build: fixtures stay inside the
walls, clear of each other and of the entrance aisle, and everything on the lot stays on the plot and
clear of everything else.

## Geometry choices

- **Price board inside the fixture height.** Gondolas are 7.6 tall *including* the yellow price board,
  so the shelf body tops out at 6.2 and the board fills 6.45–7.6. A board above 7.6 would break the
  fixed size.
- **Anchor is a 0.2 cube mesh**, not an empty, because the Roblox importer reliably keeps meshes.
  Set `ANCHOR_MODE = "empty"` in `cm_common.py` to export FBX nulls instead.
- **Door frame:** the module is 16 wide × 18 tall to fill a 16-stud wall gap; 0.8 jambs give a
  14.4 × 12 clear opening, which `CM_Shell_SlidingDoor` fills exactly.
- **Staff door:** an 8-wide wall module holding the 8 × 10 door including its frame
  (6.4 × 9.6 leaf).
- **Planter:** the 2.6 × 2 × 12 size is the box; the shrub rises above it.
- **Checkout lane:** the 3 × 3.6 × 9 size is the counter; the belt, register, screen and lane post sit
  on top of it.
- **Checkout sign / aisle sign:** the size is the board; the rods rise above it.
- **Spawn arch:** pillar centres are 44 apart (outer faces ±23.5), so the 48-wide header overhangs
  each pillar by 0.5.
- **Leaderboard:** the 40 × 14 × 1 board sits 6 up on posts over a 40 × 1.2 × 8 stage.
- **NPC head:** classic rounded R6 head (1.25 cube with bevels), not a literal 2 × 1 × 1 brick.
- **Decals** (labels, stripes, markings) are single faces 0.012 studs off their surface, kept inside
  each asset's bounds so neighbouring modules never overlap. Decals stacked on decals step out
  another 0.012.
- **Shelf stock** uses lighter versions of the same products (fewer crimp ridges, lower-poly apples)
  so 10–12 stocked slots stay inside the 3,000-triangle fixture budget.
- **Pivots:** every asset is checked to have its bounding box's bottom centre at the origin. Props
  with an offset arm or flag (street lamp, traffic light, signpost, banner, carts, NPCs) are
  re-centred to that point, so the pole base is not exactly at the pivot.

## Performance

- Every MeshPart uses the same 256 × 256 palette texture, so all assets share one texture in memory.
- Fixtures stay at or under 3,000 triangles with all their stock, and buildings at or under 5,000 per
  module. The whole map, with 1,300 placements, is built from 92 distinct assets reused across every plot.
- Stocked fixtures have `_Far` versions (one or two MeshParts, 20–50% of the triangles) for distant
  stores; see the import guide.

## Style

- Flat palette colours only, from one atlas (`CM_Palette.png`), with no PBR maps and no text in any
  texture.
- All product branding is invented: colour blocks, stripes, stars and simple illustrations, with no
  real logos.
- Bevels of 0.03–0.15 come from one Bevel modifier per mesh, weighted per edge and applied before
  export, with hardened normals so flat faces stay flat and edges catch the light. Curved shapes
  (fruit, bottles, tubes) are smooth-shaded with no bevel.
