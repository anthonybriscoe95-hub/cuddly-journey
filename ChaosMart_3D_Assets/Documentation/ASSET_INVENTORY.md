# Chaos Mart Tycoon: asset inventory

Generated from `asset_manifest.json` by `Blender_Scripts/write_inventory.py`; do not edit by hand.

Sizes are W × H × D in studs (W along X, H up, D along Y; the front faces −Y). Every asset's pivot
is its bottom centre. **Parts** are the objects inside the FBX (they become MeshParts in Roblox).

| Folder | Assets | Triangles |
|---|---:|---:|
| Buildings | 28 | 11,488 |
| Interiors | 37 | 33,599 |
| Products | 33 | 4,097 |
| Roads | 9 | 568 |
| Environment | 35 | 10,306 |
| Characters | 29 | 8,459 |
| Gameplay | 13 | 4,987 |
| Events | 10 | 1,550 |
| **Total** | **194** | **75,054** |

All size, pivot and budget checks passed.

## Buildings (28)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Shell_Awning.fbx` | 4 × 2.78 × 6.5 | 252 | Body | 4-wide awning projecting 6.5, tilted 16 degrees down; eight alternating teal / off-white stripes so modules tile seamlessly. The back edge (+Y) mounts on the wall. |
| `CM_Shell_DoorFrame.fbx` | 16 × 18 × 1 | 328 | Body | 16-wide module with a 14.4 x 12 clear opening (0.8 jambs) for CM_Shell_SlidingDoor. |
| `CM_Shell_DoorFrame_Luxury.fbx` | 16 × 18 × 1 | 326 | Body | Luxury entrance module: gold jambs, same 14.4 x 12 opening as the standard door frame. |
| `CM_Shell_Dumpster.fbx` | 6 × 4.4 × 4 | 138 | Body, Lid | Exterior trash container with a separate Lid (hinged at the back). |
| `CM_Shell_EntranceCanopy.fbx` | 24 × 13 × 10 | 320 | Body, Light | Luxury entrance canopy: 24 wide, projects 10 from the wall (+Y edge mounts on the wall), underside at 12 on two gold columns. Light is the soffit strip. |
| `CM_Shell_Floor_CornerStore.fbx` | 54 × 0.4 × 40 | 132 | Floor | Corner Store floor slab under the whole 54 x 40 shell; 4-stud tiles. |
| `CM_Shell_Floor_LuxuryCenter.fbx` | 186 × 0.4 × 112 | 1,256 | Floor | Luxury Shopping Center floor slab under the whole 186 x 112 shell; 4-stud tiles. |
| `CM_Shell_Floor_MegaMart.fbx` | 186 × 0.4 × 104 | 1,164 | Floor | Mega Mart floor slab under the whole 186 x 104 shell; 4-stud tiles. |
| `CM_Shell_Floor_MiniMart.fbx` | 90 × 0.4 × 56 | 300 | Floor | Mini Mart floor slab under the whole 90 x 56 shell; 4-stud tiles. |
| `CM_Shell_Floor_Supermarket.fbx` | 134 × 0.4 × 88 | 708 | Floor | Supermarket floor slab under the whole 134 x 88 shell; 4-stud tiles. |
| `CM_Shell_GlassCurtain.fbx` | 8 × 18 × 1 | 172 | Body, Glass | Full-height glass curtain wall module (8 wide) with slim gold mullions; Glass is separate. |
| `CM_Shell_Pillar.fbx` | 2 × 18 × 2 | 224 | Body | Decorative corner pillar matching the wall banding. |
| `CM_Shell_Planter.fbx` | 2.6 × 2 × 12 | 430 | Body, Shrub | Planter box 2.6 x 2 x 12 (long along Y); Shrub sits on the soil above it. |
| `CM_Shell_RoofAC.fbx` | 5 × 3 × 4 | 112 | Body, Fan | Rooftop HVAC unit. |
| `CM_Shell_Roof_CornerStore.fbx` | 52 × 3.6 × 38 | 180 | Roof, Glass | Corner Store roof; pivot at z = 17.4 inside the walls. Glass is the skylights. |
| `CM_Shell_Roof_LuxuryCenter.fbx` | 184 × 3.6 × 110 | 584 | Roof, Glass | Luxury Shopping Center roof; pivot at z = 17.4 inside the walls. Glass is the skylights. |
| `CM_Shell_Roof_MegaMart.fbx` | 184 × 3.6 × 102 | 584 | Roof, Glass | Mega Mart roof; pivot at z = 17.4 inside the walls. Glass is the skylights. |
| `CM_Shell_Roof_MiniMart.fbx` | 88 × 3.6 × 54 | 248 | Roof, Glass | Mini Mart roof; pivot at z = 17.4 inside the walls. Glass is the skylights. |
| `CM_Shell_Roof_Supermarket.fbx` | 132 × 3.6 × 86 | 416 | Roof, Glass | Supermarket roof; pivot at z = 17.4 inside the walls. Glass is the skylights. |
| `CM_Shell_SignBoard.fbx` | 34 × 4.6 × 0.4 | 120 | Body, Face, Neon | Main store sign. Face is blank (the game draws the store name); Neon is the outline tube. |
| `CM_Shell_SignBoard_Small.fbx` | 20 × 3.6 × 0.4 | 120 | Body, Face, Neon | Corner-store sign 20 x 3.6; Face is blank, Neon is the outline. |
| `CM_Shell_SlidingDoor.fbx` | 14.4 × 12 × 0.6 | 464 | Track, DoorLeft, DoorLeftGlass, DoorRight, DoorRightGlass | Fits the DoorFrame opening. DoorLeft/DoorRight (+Glass) pivot at their own bottom centre so the game can tween them sideways. |
| `CM_Shell_StaffDoor.fbx` | 8 × 18 × 1 | 508 | Body, Door, SignPlate | 8-wide wall module holding the 8 x 10 metal staff door (frame included). Door pivots at its hinge side bottom; SignPlate is blank for 'STAFF ONLY'. |
| `CM_Shell_Stockroom.fbx` | 51 × 16 × 76 | 1,298 | Body, RollUpDoor, LightStrip, Roof | Loading-dock building 51 x 16 x 76. RollUpDoor (22 x 12) is on the +X long side with the LightStrip above it; Roof is separate so the game can hide it. |
| `CM_Shell_Storefront.fbx` | 7 × 18 × 1 | 382 | Body, Glass | Glass storefront: navy kick plate 0-2.5, glass 2.5-12 (separate Glass mesh), header 12-18. |
| `CM_Shell_WallLight.fbx` | 1 × 1.4 × 0.9 | 112 | Body, Light | Exterior wall sconce; mount the back (+Y) on the wall. Light is the warm lamp part (set Neon). |
| `CM_Shell_Wall_Luxury.fbx` | 4 × 18 × 1 | 306 | Body | Luxury 4-wide wall: navy plinth, cream stone field with a gold-framed panel, gold band. |
| `CM_Shell_Wall_Solid.fbx` | 4 × 18 × 1 | 304 | Body | 4-stud solid wall module; exterior -Y with a recessed panel. |

## Interiors (37)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Decor_CheckoutSign.fbx` | 14 × 3 × 0.5 | 200 | Body, Face, Neon, Rods | Board is 14 x 3 x 0.5 with its bottom at the pivot; Rods rise 4.4 above it. Face is blank. |
| `CM_Fixture_BakeryCase.fbx` | 22 × 4.6 × 5 | 1,406 | Body, Glass, PriceTag, Anchor, Item1…Item7 | Counter with a sloped glass front; loaves on two stepped decks. |
| `CM_Fixture_CheckoutLane.fbx` | 3 × 3.6 × 9 | 464 | Body, Belt, Register, Screen, LanePost, LanePlate, LaneLamp, Anchor | Counter is 3 x 3.6 x 9 along Y; Belt, Register, Screen and LanePost are separate parts. LanePlate is the blank lane-number face; LaneLamp can be set to Neon. |
| `CM_Fixture_DairyFridge.fbx` | 22 × 9 × 6 | 1,530 | Body, Glass, LightStrip, PriceTag, Anchor, Item1…Item7 | Glass-door cooler: Glass is a separate mesh, LightStrip is the mint strip to set to Neon. |
| `CM_Fixture_DrinkCooler.fbx` | 24 × 9 × 6 | 2,334 | Body, Glass, LightStrip, PriceTag, Anchor, Item1…Item10 | Glass-door cooler: Glass is a separate mesh, LightStrip is the mint strip to set to Neon. |
| `CM_Fixture_Endcap.fbx` | 6 × 7.6 × 5 | 784 | Body, PriceTag, Anchor, Item1…Item4 | End-of-aisle promo display; snaps onto a gondola end. 4 Item slots of cereal. |
| `CM_Fixture_FreezerChest.fbx` | 12 × 3.6 × 5 | 1,562 | Body, Glass, PriceTag, Anchor, Item1…Item6 | Chest freezer with sliding Glass lids; 6 Item slots of ice cream and frozen pizza. |
| `CM_Fixture_PremiumShelf.fbx` | 28 × 7.6 × 5 | 1,622 | Body, PriceTag, Anchor, Item1…Item7 | Two-tier gondola; the price board fills the top 1.15 studs so the asset stays 7.6 high. |
| `CM_Fixture_ProduceFridge.fbx` | 24 × 9 × 6 | 2,680 | Body, Glass, LightStrip, PriceTag, Anchor, Item1…Item10 | Glass-door cooler: Glass is a separate mesh, LightStrip is the mint strip to set to Neon. |
| `CM_Fixture_ProduceStand.fbx` | 24 × 3.6 × 5 | 2,866 | Body, PriceTag, Anchor, Item1…Item10 | Wooden stand with crates tilted 12 degrees toward the shopper. |
| `CM_Fixture_SnackBin.fbx` | 28 × 3.4 × 5 | 2,622 | Body, PriceTag, Anchor, Item1…Item12 | Low open bin, six compartments per row; price board on a raised back rail. |
| `CM_Fixture_SnackShelf.fbx` | 28 × 7.6 × 5 | 2,826 | Body, PriceTag, Anchor, Item1…Item10 | Two-tier gondola; the price board fills the top 1.15 studs so the asset stays 7.6 high. |
| `CM_Fixture_ToyShelf.fbx` | 28 × 7.6 × 5 | 1,418 | Body, PriceTag, Anchor, Item1…Item7 | Two-tier gondola; the price board fills the top 1.15 studs so the asset stays 7.6 high. |
| `CM_Fixture_WaterShelf.fbx` | 28 × 7.6 × 5 | 2,794 | Body, PriceTag, Anchor, Item1…Item12 | Two-tier gondola; the price board fills the top 1.15 studs so the asset stays 7.6 high. |
| `CM_Interior_AisleSign.fbx` | 8 × 2.4 × 0.3 | 152 | Body, Face, Rods | Hanging aisle sign; Face is blank on both sides (aisle number / category). Rods rise 3 above. |
| `CM_Interior_CardboardBox.fbx` | 2 × 1.6 × 1.6 | 48 | Body | Taped shipping box with a blank label. |
| `CM_Interior_CeilingLight.fbx` | 8 × 0.5 × 1.6 | 80 | Body, Light | Linear ceiling light; hang its top at the ceiling. Light is the diffuser (set Neon). |
| `CM_Interior_DeliveryCrate.fbx` | 3 × 1.6 × 2 | 124 | Body | Stackable plastic produce crate with hand holes. |
| `CM_Interior_DigitalAdScreen.fbx` | 4 × 7 × 1.6 | 102 | Body, Face | Freestanding digital advert totem; Face is the blank screen for an ImageLabel. |
| `CM_Interior_EmployeeDesk.fbx` | 6 × 4.6 × 3 | 188 | Body | Office desk with a monitor, keyboard and drawer pedestal. |
| `CM_Interior_MopBucket.fbx` | 2.4 × 4.2 × 1.6 | 224 | Body | Mop bucket with wringer and mop (cleaner prop). |
| `CM_Interior_OfficeChair.fbx` | 2.2 × 4 × 2.25 | 296 | Body | Swivel office chair facing -Y. |
| `CM_Interior_Pallet.fbx` | 4 × 0.6 × 4 | 352 | Body | Wooden shipping pallet. |
| `CM_Interior_PalletStack.fbx` | 4 × 3.46 × 4 | 560 | Body | Pallet loaded with a shrink-wrapped stack of boxes (a delivery). |
| `CM_Interior_RestroomDoor.fbx` | 4 × 8 × 0.5 | 234 | Body, Door, SignPlate | Restroom door in its frame; SignPlate is blank (draw the icon in-game). Door hinges on the left. |
| `CM_Interior_SecurityCamera.fbx` | 0.7 × 1 × 1.72 | 120 | Body, Lens | Wall-mounted bullet camera; mount the back plate (+Y) on a wall. Lens is the red LED part. |
| `CM_Interior_SecurityGate.fbx` | 5 × 5 × 1 | 268 | Body, Alarm | Anti-theft gate pair 4 apart; Alarm is the light bar on top (flash it when a shoplifter passes). |
| `CM_Interior_SelfCheckout.fbx` | 4 × 6.9 × 3.01 | 216 | Body, Screen | Self-checkout kiosk: scanner bed, angled Screen, bagging shelf and a lane lamp. |
| `CM_Interior_ServiceDesk.fbx` | 10 × 9.2 × 4 | 302 | Body, Face | Customer service desk with a raised counter; Face is the blank 'HELP' sign above. |
| `CM_Interior_ShoppingBasket.fbx` | 2.22 × 1.63 × 1.42 | 184 | Body | Hand basket with two folding handles. |
| `CM_Interior_ShoppingCart.fbx` | 3.08 × 3.53 × 4.96 | 406 | Body | Shopping cart, handle at +Y; wire basket drawn as grid lines on thin panels. |
| `CM_Interior_StaffLocker.fbx` | 6 × 7 × 2 | 118 | Body, Door1, Door2, Door3 | Bank of three staff lockers; Door1-3 are separate and hinge on their left edge. |
| `CM_Interior_StockroomShelf.fbx` | 12 × 10 × 4 | 612 | Body | Heavy-duty racking, three levels loaded with boxes. |
| `CM_Interior_VendingMachine.fbx` | 4 × 8 × 3 | 836 | Body, Glass | Drinks vending machine; Glass front over six rows of cans, keypad and pickup slot. |
| `CM_Interior_WallDecal.fbx` | 6 × 4 × 0.24 | 78 | Body | Framed wall decoration (fresh-produce motif) for interior walls. |
| `CM_Interior_WetFloorSign.fbx` | 1.59 × 2.6 × 1.38 | 101 | Body | Yellow A-frame caution sign (Supermarket Cleanup event). |
| `CM_Shelf_Double_Aisle.fbx` | 28 × 7.6 × 10 | 2,890 | Body, PriceTag, PriceTagBack, Anchor, AnchorBack, Item1…Item20 | Double-sided gondola 28 x 7.6 x 10: Item1-10 face the front (-Y, chips), Item11-20 face the back (+Y, cereal). Anchor is in front, AnchorBack behind; PriceTag and PriceTagBack likewise. |

## Products (33)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Product_Apple.fbx` | 0.78 × 0.84 × 0.74 | 148 | Apple |  |
| `CM_Product_BananaBunch.fbx` | 2.05 × 0.66 × 0.89 | 180 | BananaBunch |  |
| `CM_Product_BreadLoaf.fbx` | 2.1 × 1.01 × 1.2 | 130 | BreadLoaf |  |
| `CM_Product_CandyBag.fbx` | 1.98 × 2 × 0.86 | 144 | CandyBag |  |
| `CM_Product_CandyPieces.fbx` | 1.44 × 0.32 × 0.74 | 240 | CandyPieces |  |
| `CM_Product_CarrotBunch.fbx` | 1.05 × 0.49 × 1.95 | 144 | CarrotBunch |  |
| `CM_Product_CerealBox.fbx` | 1.62 × 2.3 × 0.69 | 99 | CerealBox |  |
| `CM_Product_CheeseWedge.fbx` | 1.67 × 0.81 × 1.24 | 70 | CheeseWedge |  |
| `CM_Product_ChipBag.fbx` | 1.98 × 2 × 0.86 | 144 | ChipBag |  |
| `CM_Product_CleaningSpray.fbx` | 0.57 × 1.55 × 0.71 | 96 | CleaningSpray |  |
| `CM_Product_CoffeeCup.fbx` | 0.67 × 1 × 0.67 | 136 | CoffeeCup |  |
| `CM_Product_CookieBox.fbx` | 1.9 × 0.85 × 0.83 | 70 | CookieBox |  |
| `CM_Product_DetergentJug.fbx` | 1.1 × 1.65 × 0.71 | 114 | DetergentJug |  |
| `CM_Product_EggCarton.fbx` | 2.1 × 0.63 × 1.11 | 134 | EggCarton |  |
| `CM_Product_EnergyDrink.fbx` | 0.44 × 1.2 × 0.47 | 124 | EnergyDrink |  |
| `CM_Product_FrozenPizza.fbx` | 2.2 × 0.33 × 2.2 | 80 | FrozenPizza |  |
| `CM_Product_GameController.fbx` | 1.67 × 0.39 × 0.8 | 208 | GameController |  |
| `CM_Product_Headphones.fbx` | 1.55 × 1.64 × 0.76 | 276 | Headphones |  |
| `CM_Product_HoneyJar.fbx` | 0.78 × 1.03 × 0.78 | 72 | HoneyJar |  |
| `CM_Product_IceCreamTub.fbx` | 1.43 × 1 × 1.43 | 120 | IceCreamTub |  |
| `CM_Product_JuiceCarton.fbx` | 0.9 × 1.94 × 0.93 | 74 | JuiceCarton |  |
| `CM_Product_Lettuce.fbx` | 1.2 × 1.12 × 1.14 | 136 | Lettuce |  |
| `CM_Product_MilkCarton.fbx` | 0.9 × 1.94 × 0.93 | 74 | MilkCarton |  |
| `CM_Product_Orange.fbx` | 0.82 × 0.86 × 0.78 | 136 | Orange |  |
| `CM_Product_Pastry.fbx` | 1.6 × 0.64 × 0.66 | 112 | Pastry |  |
| `CM_Product_PremiumGiftBox.fbx` | 1.62 × 1.3 × 1.22 | 112 | PremiumGiftBox |  |
| `CM_Product_SodaBottle.fbx` | 0.69 × 1.91 × 0.69 | 92 | SodaBottle |  |
| `CM_Product_SodaCan.fbx` | 0.6 × 0.96 × 0.6 | 136 | SodaCan |  |
| `CM_Product_TShirtStack.fbx` | 1.6 × 0.64 × 1.11 | 134 | TShirtStack |  |
| `CM_Product_Television.fbx` | 4.4 × 3.15 × 0.7 | 104 | Television |  |
| `CM_Product_ToyBox.fbx` | 1.8 × 1.7 × 1.03 | 56 | ToyBox |  |
| `CM_Product_WaterBottle.fbx` | 0.58 × 1.7 × 0.58 | 92 | WaterBottle |  |
| `CM_Prop_ShoppingBag.fbx` | 1.1 × 1.3 × 0.7 | 110 | Bag, Handles | Carried bag 1.1 x 1.3 x 0.7 (Bag); Handles arch above it. |

## Roads (9)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Road_Corner.fbx` | 24 × 0.4 × 24 | 56 | Road | 90-degree bend joining a road from -Y to a road toward +X, with curved lane markings. |
| `CM_Road_Crosswalk.fbx` | 24 × 0.4 × 12 | 32 | Road | 12-long segment with zebra bars and stop lines; put it where shoppers cross to a plot. |
| `CM_Road_Intersection.fbx` | 24 × 0.41 × 24 | 32 | Road | Plain 24 x 24 junction square with a manhole; joins four straights. |
| `CM_Road_Parking.fbx` | 32 × 0.75 × 20 | 198 | Road | Asphalt parking strip: four 8 x 18 bays opening to -Y, with wheel stops. |
| `CM_Road_Short.fbx` | 24 × 0.4 × 10 | 18 | Road | 10-long filler: Short + Crosswalk (12) + Short = one 32 segment. |
| `CM_Road_Straight.fbx` | 24 × 0.4 × 32 | 24 | Road | Two-lane segment along Y: dashed yellow centre line, white edge lines. |
| `CM_Road_TJunction.fbx` | 24 × 0.4 × 24 | 32 | Road | T-junction: the road runs along Y, a branch leaves toward +X (stop line on its inbound lane). |
| `CM_Sidewalk_Corner.fbx` | 8 × 1 × 8 | 106 | Sidewalk | 8 x 8 corner with curbs on -X and -Y (the two road sides). |
| `CM_Sidewalk_Straight.fbx` | 8 × 1 × 32 | 70 | Sidewalk | 8 x 32 sidewalk; the curb (lighter, bevelled) is on the -X side facing the road. |

## Environment (35)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Ground_Base.fbx` | 1200 × 0.2 × 760 | 12 | Ground | One grass slab under the whole map (sized by map_layout.json); place it at z = -0.2. |
| `CM_Ground_Grass.fbx` | 32 × 0.6 × 32 | 20 | Grass | 32 x 32 lawn tile with a few darker mowing stripes. |
| `CM_Ground_PaverTile.fbx` | 16 × 1.01 × 16 | 24 | Paving | Decorative plaza paving: sand field, terracotta border and a diamond inlay. |
| `CM_Plaza_Pad.fbx` | 960 × 1.01 × 160 | 174 | Paving | Central plaza paving sized by map_layout.json, with a lawn ring around the fountain spot. |
| `CM_Plot_Pad_CornerStore.fbx` | 288 × 1.01 × 208 | 202 | Pad | Corner Store plot foundation 288 x 208: parking, walkway to the door, loading apron, and the next stage's footprint painted as an expansion zone. |
| `CM_Plot_Pad_LuxuryCenter.fbx` | 288 × 1.01 × 208 | 150 | Pad | Luxury Shopping Center plot foundation 288 x 208: parking, walkway to the door, loading apron. |
| `CM_Plot_Pad_MegaMart.fbx` | 288 × 1.01 × 208 | 202 | Pad | Mega Mart plot foundation 288 x 208: parking, walkway to the door, loading apron, and the next stage's footprint painted as an expansion zone. |
| `CM_Plot_Pad_MiniMart.fbx` | 288 × 1.01 × 208 | 228 | Pad | Mini Mart plot foundation 288 x 208: parking, walkway to the door, loading apron, and the next stage's footprint painted as an expansion zone. |
| `CM_Plot_Pad_Supermarket.fbx` | 288 × 1.01 × 208 | 250 | Pad | Supermarket plot foundation 288 x 208: parking, walkway to the door, loading apron, and the next stage's footprint painted as an expansion zone. |
| `CM_Prop_AdBillboard.fbx` | 16 × 14 × 1 | 192 | Body, Face | Roadside billboard on two legs; Face is blank for in-game adverts. |
| `CM_Prop_Bench.fbx` | 10 × 2 × 3 | 352 | Body | Backless plaza bench, 10 x 2 x 3: wooden slats on two slate frames. |
| `CM_Prop_BikeRack.fbx` | 8 × 3 × 1.2 | 444 | Body | Five hoop bike rack on a rail. |
| `CM_Prop_BusStop.fbx` | 12 × 8 × 4 | 272 | Body, Face, Glass | Bus shelter with a glass back (Glass), bench and a blank advert panel (Face). |
| `CM_Prop_Bush.fbx` | 4 × 2.6 × 3 | 240 | Body | Low clipped hedge bush. |
| `CM_Prop_DeliveryTruck.fbx` | 8 × 9 × 22 | 536 | Body, RearDoor | Box truck for the Surprise Delivery event; RearDoor is separate so it can roll up. |
| `CM_Prop_Fence.fbx` | 8 × 3 × 0.4 | 274 | Body | 8-long decorative picket fence module; tiles end to end. |
| `CM_Prop_FlowerPlanter.fbx` | 4 × 2.33 × 4 | 452 | Body | Round planter with flowers; the flower heads are decals on the soil mound. |
| `CM_Prop_Fountain.fbx` | 26 × 10 × 26 | 820 | Body, Water | Plaza fountain: rim diameter 26 and 2.4 high, centre spire 10 high; Water is separate. |
| `CM_Prop_LeaderboardStage.fbx` | 40 × 20 × 8.01 | 198 | Body, Board, Face | Leaderboard: 40 x 14 x 1 board on two posts over a low stage; Face is blank for the scores. |
| `CM_Prop_MiniMartSign.fbx` | 36 × 7 × 1 | 136 | Body, Face, Neon | Rooftop prestige sign 36 x 7 with a star motif; Face blank, Neon is the outline tube. |
| `CM_Prop_ParkedCar_Blue.fbx` | 6 × 4 × 11 | 354 | Body | Stylised compact car, nose toward -Y; colour variant Blue. |
| `CM_Prop_ParkedCar_Red.fbx` | 6 × 4 × 11 | 354 | Body | Stylised compact car, nose toward -Y; colour variant Red. |
| `CM_Prop_ParkedCar_Yellow.fbx` | 6 × 4 × 11 | 354 | Body | Stylised compact car, nose toward -Y; colour variant Yellow. |
| `CM_Prop_PlazaKiosk_Blue.fbx` | 14 × 7 × 8 | 536 | Body, Face | Plaza booth 14 x 7 x 8, Blue. Face is the blank sign board on the roof. |
| `CM_Prop_PlazaKiosk_Orange.fbx` | 14 × 7 × 8 | 536 | Body, Face | Plaza booth 14 x 7 x 8, Orange. Face is the blank sign board on the roof. |
| `CM_Prop_PlazaKiosk_Purple.fbx` | 14 × 7 × 8 | 536 | Body, Face | Plaza booth 14 x 7 x 8, Purple. Face is the blank sign board on the roof. |
| `CM_Prop_PlazaKiosk_Teal.fbx` | 14 × 7 × 8 | 536 | Body, Face | Plaza booth 14 x 7 x 8, Teal. Face is the blank sign board on the roof. |
| `CM_Prop_PlotBanner.fbx` | 13.23 × 24 × 1.66 | 142 | Pole, Flag | Plot banner: 24-high pole, Flag 12 x 7 (blank face, hangs toward +X). |
| `CM_Prop_SpawnArch.fbx` | 48 × 20 × 3 | 424 | Body, Face | Spawn gate: two 3 x 15 x 3 pillars with centres 44 apart and a 48 x 5 x 2 header (Face blank). |
| `CM_Prop_StreetLamp.fbx` | 1.4 × 12 × 4.05 | 144 | Body, Light | 12-high street lamp; arm reaches toward -Y. Light is the lamp face (set Neon at night). |
| `CM_Prop_StreetSign.fbx` | 8.4 × 10 × 4.66 | 224 | Body, Blade1, Blade2, Blade3 | Directional signpost with three blank arrow blades (Blade1-3) for SurfaceGui text. |
| `CM_Prop_TrafficLight.fbx` | 1.5 × 14 × 9.3 | 220 | Body, LampRed, LampAmber, LampGreen | Pole with an arm reaching -Y and a three-lamp head. LampRed/Amber/Green are separate parts. |
| `CM_Prop_TrashCan.fbx` | 2.51 × 3.6 × 2.51 | 186 | Body | Round street bin with a domed lid and a teal band. |
| `CM_Prop_Tree_Pine.fbx` | 10 × 16 × 10 | 94 | Trunk, Canopy | Tiered pine: three stacked cones, 10 across at the base, 16 tall. |
| `CM_Prop_Tree_Round.fbx` | 10 × 16 × 10 | 488 | Trunk, Canopy | Broadleaf tree: canopy 10 across, 16 tall overall. |

## Characters (29)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Accessory_Apron_Cleaner.fbx` | 1.7 × 2.2 × 0.07 | 14 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named BodyFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Apron_Stocker.fbx` | 1.7 × 2.2 × 0.07 | 14 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named BodyFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Backpack_Delivery.fbx` | 1.7 × 1.65 × 0.87 | 46 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named BodyBackAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Beanie_Red.fbx` | 1.43 × 0.92 × 1.43 | 124 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Beanie_Teal.fbx` | 1.43 × 0.92 × 1.43 | 124 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Cap_Cashier.fbx` | 1.36 × 0.35 × 1.88 | 96 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Cap_Delivery.fbx` | 1.36 × 0.35 × 1.88 | 88 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Cap_Security.fbx` | 1.36 × 0.35 × 1.88 | 96 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Cap_Teal.fbx` | 1.36 × 0.35 × 1.88 | 88 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Cap_Yellow.fbx` | 1.36 × 0.35 × 1.88 | 88 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_GoldChain.fbx` | 0.97 × 0.79 × 0.1 | 44 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named BodyFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Hair_Bun.fbx` | 1.32 × 0.81 × 1.25 | 108 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Hood_Shoplifter.fbx` | 1.5 × 1.37 × 1.27 | 44 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named HatAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Mask_Shoplifter.fbx` | 1.2 × 0.3 × 0.04 | 12 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named FaceFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_NameBadge.fbx` | 0.6 × 0.24 × 0.06 | 14 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named BodyFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Sunglasses.fbx` | 0.88 × 0.2 × 0.06 | 36 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named FaceFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_Accessory_Vest_Security.fbx` | 2 × 1.65 × 0.05 | 26 | Handle | Roblox Accessory mesh: make it the Handle of an Accessory and add an Attachment named BodyFrontAttachment at the Handle's pivot (0, 0, 0). |
| `CM_NPC_Celebrity.fbx` | 4 × 5.76 × 1.55 | 702 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, Glasses, Chain | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Customer_BlueBeanie.fbx` | 4 × 5.75 × 1.43 | 638 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Customer_CoralBun.fbx` | 4 × 5.76 × 1.5 | 622 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Customer_TealCap.fbx` | 4 × 5.35 × 1.88 | 602 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Customer_Yellow.fbx` | 4 × 5.25 × 1.27 | 516 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Shoplifter.fbx` | 4 × 5.37 × 1.38 | 558 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, Mask | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Staff_Cashier.fbx` | 4 × 5.35 × 1.88 | 624 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, NameTag | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Staff_Cleaner.fbx` | 4 × 5.35 × 1.88 | 616 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, Apron | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Staff_Delivery.fbx` | 4 × 5.35 × 2.59 | 650 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, Bag | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Staff_Manager.fbx` | 4 × 5.25 × 1.32 | 567 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, NameTag, Glasses | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Staff_Security.fbx` | 4 × 5.35 × 1.88 | 636 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, Vest | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |
| `CM_NPC_Staff_Stocker.fbx` | 4 × 5.75 × 1.43 | 666 | Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Hat, Apron, NameTag | R6-proportioned character (6 parts + accessories), each part pivoted at its own centre. |

## Gameplay (13)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Tycoon_CashCollector.fbx` | 4.8 × 6.98 × 4.8 | 1,016 | Body, Coin | Money collection point: pedestal with stacked bills; Coin floats above (spin it). |
| `CM_Tycoon_DailyRewardStand.fbx` | 6 × 10.4 × 6.1 | 552 | Body, Face | Daily reward podium with a gift on top and a blank calendar Face board. |
| `CM_Tycoon_DeliveryStation.fbx` | 12 × 10.6 × 8.01 | 486 | Body, Button, Face | Loading platform: Button pad to call a delivery, crates waiting, Face sign on a gantry. |
| `CM_Tycoon_EventCountdown.fbx` | 14 × 11 × 2 | 208 | Body, Face | Event countdown display: lit frame on twin legs; Face is blank for the timer. |
| `CM_Tycoon_ExpansionSign.fbx` | 4.8 × 10.5 × 0.51 | 294 | Body, Face | 'Expand here' sign: big plus on a post with a blank Face for the price. |
| `CM_Tycoon_HireStation.fbx` | 8.4 × 9.6 × 3.4 | 250 | Body, Face | Worker hiring desk with a clipboard, staff silhouette and a blank Face sign. |
| `CM_Tycoon_ManagementTerminal.fbx` | 3.2 × 4.58 × 2.4 | 92 | Body, Face | Store management terminal: pedestal with an angled touchscreen (Face). |
| `CM_Tycoon_PrestigeTerminal.fbx` | 5 × 11.53 × 5 | 302 | Body, Face | Prestige terminal: gold-trimmed obelisk with a star crown and a blank Face screen. |
| `CM_Tycoon_PurchasePad.fbx` | 8 × 6 × 8.8 | 582 | Base, Button, Body, PriceBoard | Round purchase button: Button presses down; PriceBoard behind it shows the cost. |
| `CM_Tycoon_RewardChest.fbx` | 4 × 3.1 × 3 | 350 | Body, Lid | Treasure chest; Lid is separate and hinges on its back edge (+Y). |
| `CM_Tycoon_UpgradePad.fbx` | 8 × 6 × 8.8 | 175 | Base, Button, Body, PriceBoard | Square upgrade pad with an up-arrow Button and a PriceBoard. |
| `CM_Tycoon_UpgradePreview.fbx` | 8 × 5 × 8 | 352 | Body, Hologram | Ghost marker showing where an upgrade will appear: floor ring plus a Hologram frame (fade it). |
| `CM_Tycoon_VIPRope.fbx` | 8 × 3.57 × 0.84 | 328 | Body | VIP decoration: two gold stanchions joined by a velvet rope. |

## Events (10)

| File | Size (W × H × D) | Tris | Parts | Notes |
|---|---|---:|---|---|
| `CM_Event_CashStack.fbx` | 2.07 × 1.05 × 1.13 | 192 | Body | Double Cash collectible: a banded bundle of bills. |
| `CM_Event_CelebrityStar.fbx` | 4 × 0.12 × 4 | 76 | Body | Floor star marking the Celebrity Shopper's spot. |
| `CM_Event_EmergencyLight.fbx` | 1.4 × 1.35 × 1.45 | 212 | Body, Light | Rotating beacon for Power Outage / Shoplifter Chase; Light is the dome (spin + Neon). |
| `CM_Event_Generator.fbx` | 4.1 × 6.4 × 2.41 | 174 | Body, Light | Power Outage generator with a work Light on a mast. |
| `CM_Event_GoldenCart.fbx` | 3.08 × 3.53 × 4.96 | 406 | Body | Golden Shopping Cart event: the standard cart in gold. |
| `CM_Event_RedCarpet.fbx` | 6 × 0.11 × 20 | 40 | Body | Celebrity Shopper red carpet runner with gold edging. |
| `CM_Event_SaleBanner.fbx` | 16 × 7.4 × 0.3 | 118 | Body, Face | Hanging Black Friday sale banner with zig-zag edges; Face is blank. |
| `CM_Event_Spill.fbx` | 4.6 × 0.06 × 3.25 | 48 | Body | Supermarket Cleanup spill puddle: flat, 0.05 high, lay it on the floor. |
| `CM_Event_SurpriseCrate.fbx` | 3 × 3.45 × 3 | 184 | Body, Lid | Surprise Delivery crate: purple box with star decals; Lid lifts off. |
| `CM_Event_TrafficCone.fbx` | 1.4 × 2.2 × 1.4 | 100 | Body | Cone for chase barriers and cleanup zones. |
