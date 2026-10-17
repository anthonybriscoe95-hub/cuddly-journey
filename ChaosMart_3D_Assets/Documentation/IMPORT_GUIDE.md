# Importing into Roblox Studio

## First import: confirm the orientation once

The FBX files are exported with the axes the brief asked for (**Forward −Y, Up Z**, Apply Scalings
"FBX All", 1 Blender unit = 1 stud). This has not been tested in Studio yet, so check it on one asset
before importing the rest:

1. **File → Import 3D**, choose `Roblox_FBX/Interiors/CM_Fixture_SnackShelf.fbx`.
2. In the importer set **Scale Unit = Stud** and leave **Anchored** on.
3. Check that the shelf stands upright, is 28 studs wide and 7.6 tall, and that the yellow `PriceTag`
   is on the same side as the products (the customer side).

If it arrives lying on its back or facing the wrong way, change `FBX_FORWARD` / `FBX_UP` at the top of
`Blender_Scripts/cm_common.py` to the Blender defaults (`"-Z"`, `"Y"`) and run
`build_all.py -- --no-render` to re-export everything (about 2 minutes).

## Bulk import

Import a folder's FBX files with the same settings. Each file becomes a **Model** whose children are
MeshParts named after the parts in the inventory.

| Part name | What the game does with it |
|---|---|
| `Body`, `Base` | the main mesh |
| `Item1` … `ItemN` | one per stock slot; show or hide each one as stock changes |
| `Anchor` | small cube 1.2 studs in front of a fixture at 3.5 high: the NPC / player stand point. Set `Transparency = 1`, `CanCollide = false` |
| `PriceTag`, `PriceBoard`, `Face`, `Flag`, `SignPlate`, `LanePlate`, `Blade1-3` | blank surfaces: add a SurfaceGui (Face = Front) for text. No text is baked into any texture |
| `Glass`, `DoorLeftGlass`, `DoorRightGlass`, `Hologram`, `Water` | set `Transparency = 0.6` (glass) or to taste |
| `LightStrip`, `Neon`, `Light`, `LaneLamp`, `Alarm`, `LampRed/Amber/Green` | set `Material = Neon` (optionally add a PointLight) |
| `DoorLeft`, `DoorRight`, `Door`, `Door1-3`, `Lid`, `RollUpDoor`, `RearDoor` | moving parts, pivoted at their own hinge or centre |
| `Button` | pressable top of a pad: tween it down, recolour it |
| `Coin` | spin it |
| `Roof` | hide it when the camera goes inside |

## Texture and materials

Every mesh uses one material that samples `CM_Palette.png` (flat colour cells, no PBR maps), and the
texture is embedded in each FBX. If a MeshPart comes in white, upload `Textures/CM_Palette.png`
once and set it as the `TextureID` of the MeshParts. Because all assets share one 256 × 256 texture,
they share one texture in memory.

## Collision

No collision meshes are included (the brief handles collision with simple boxes). Recommended:
`CollisionFidelity = Box` on everything except walls, floors and pads (`Hull`), and
`CanCollide = false` on products, glass, decorations and `Anchor`.

## Placing the map

`Map_Assembly/placements.json` lists every placed asset: the asset name, the position of its pivot
(bottom centre) in Blender coordinates, and a rotation about the up axis in degrees. With the
default axis mapping the Roblox equivalents are:

```
Roblox X = Blender X
Roblox Y = Blender Z
Roblox Z = −Blender Y
CFrame = CFrame.new(x, z, −y) * CFrame.Angles(0, math.rad(rotation_z), 0)
```

Confirm the sign of the rotation on the first plot (the store entrance should face the plaza) before
scripting the rest. **The layout is provisional** until the overhead blueprint is supplied; see
`DESIGN_DECISIONS.md`.

## NPCs

Each `CM_NPC_*.fbx` has `Head`, `Torso`, `LeftArm`, `RightArm`, `LeftLeg`, `RightLeg` (pivot at each
part's centre) plus accessories. Body parts follow R6 sizes (torso 2 × 2 × 1, limbs 1 × 2 × 1). The head
is the classic rounded R6 look (1.25 across, sitting on the torso). If your code sets
`Head.Size = Vector3.new(2, 1, 1)`, the mesh will be stretched to that box, so keep the MeshPart's
own size instead. These have **not** been tested with Roblox animations or the avatar system.

## Still to verify in Studio (not tested here)

- the axis setting above (one test import),
- embedded textures appear without a manual `TextureID`,
- part names come through unchanged (they do in Blender's own re-import, which `build_all.py` checks),
- triangle counts as reported by Studio match the manifest,
- the NPC parts weld and animate as expected.
