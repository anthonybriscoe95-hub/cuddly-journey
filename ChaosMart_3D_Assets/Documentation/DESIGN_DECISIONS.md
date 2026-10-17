# Design decisions and assumptions

Where the briefs didn't specify something, or the two briefs disagreed, this records what was chosen
and why, so nothing contradicts the reference material silently.

## Missing reference documents

The Developer Bible (PDF), the Overhead Map Blueprint (PNG) and the Map Blueprint (PDF) were **not
supplied**. Everything blueprint-dependent lives in `Blender_Scripts/map_layout.json`, marked
provisional:

- **Plots:** 224 × 176, three per side of the plaza, fronts facing it (north row unrotated, south row
  turned 180°). Column centres x = −256, 0, 256 and row centres y = ±200.
- **Store on each plot:** the 132 × 86 interior shell (134 × 88 with walls) at the back, the 51 × 76
  stockroom beside it with its roll-up door facing a loading apron, and parking with 9-wide bays and a
  24-wide aisle in front.
- **Plaza:** 736 × 160 in the middle, a road loop around it (24-wide two-lane roads, 32-long segments),
  and 8-wide sidewalks on the plot side.
- **Crosswalks** sit exactly in front of each store entrance, because store x positions are chosen
  on the 32-stud road grid.

When the blueprint arrives, edit `map_layout.json` and rebuild; the pads, plaza and assembly follow it.

## Where the two briefs differ

| Topic | Asset-pack brief | Master brief | Chosen |
|---|---|---|---|
| File names | `CM_Fixture_SnackShelf` etc. | `CM_Shelf_Double_Aisle` etc. | The asset-pack names, because the existing game code expects them. New assets use `CM_<Category>_<Name>` |
| Folders | `export/` | `ChaosMart_3D_Assets/…` | The master brief's layout |
| Triangle budgets | items ≤ 150, fixtures ≤ 3,000 | "no arbitrary limits" | Fixtures ≤ 3,000 and shell ≤ 5,000 kept. Standalone products raised to ≤ 300 after owner feedback that products should look clearly designed |
| NPCs | 6 separate R6 part meshes | prefer standard avatars + accessories | Built the R6 part meshes the game code uses. Roblox Accessory versions are still to do |

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

## Style

- Flat palette colours only, from one atlas (`CM_Palette.png`), with no PBR maps and no text in any
  texture.
- All product branding is invented: colour blocks, stripes, stars and simple illustrations, with no
  real logos.
- Bevels of 0.03–0.15 come from one Bevel modifier per mesh, weighted per edge and applied before
  export, with hardened normals so flat faces stay flat and edges catch the light. Curved shapes
  (fruit, bottles, tubes) are smooth-shaded with no bevel.
