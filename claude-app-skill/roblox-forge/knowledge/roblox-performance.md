---
name: roblox-performance
description: Profiling and optimizing Roblox games — MicroProfiler, Developer Console, Script Profiler, memory leaks, StreamingEnabled, physics and part-count budgets, network bandwidth, Parallel Luau with Actors, and mobile performance targets. Use when diagnosing lag or before launching.
---

# Roblox Performance

## Budgets (targets for a smooth mobile experience)

| Metric | Target |
|---|---|
| Client FPS (mid phone) | 60 (minimum 30) |
| Server Heartbeat | ~60 Hz steady |
| Client memory (phone) | < 1.5 GB total; watch `PlaceMemory`, `Graphics`, `Sounds` |
| Instance count in workspace | keep moving + collidable parts low; stream the rest |
| Network receive per client | ideally < 50 KB/s sustained |
| Time to playable | < 10 s on mobile |

## Measure

1. **F9 Developer Console** — Memory, Network, ScriptProfiler, Server Stats/Jobs.
2. **MicroProfiler** (Ctrl+F6, Ctrl+P to pause) — find tall frames; label your code:
   ```lua
   debug.profilebegin("NPC.Update")
   updateNPCs()
   debug.profileend()
   ```
3. **Studio → Script Profiler** — per-function CPU time.
4. **Luau heap snapshot** (Developer Console Memory → Luau Heap) — compare two snapshots to find leaks.
5. Test on a real low-end phone over cellular-like conditions.

## Leak hunting checklist

- Connections made per player/character/round that are never disconnected.
- Tables keyed by `Player`, `Instance`, or `Model` that are never cleared on leave/destroy.
- Clones parented to `nil` but still referenced.
- `task.spawn`ed loops that never end when their owner is gone (`while alive do ... end` with an exit condition).

## Parallel Luau

```lua
-- Inside a Script under an Actor
local actor = script:GetActor()
actor:BindToMessageParallel("Compute", function(chunkData)
	-- runs in parallel: read-only access to most of the DataModel
	local result = heavyMath(chunkData)
	task.synchronize() -- back to serial before writing to Instances
	applyResult(result)
end)
-- elsewhere: actor:SendMessage("Compute", data)
```

Use for: many NPC raycasts/pathfinding, procedural terrain chunks, large simulations. Each Actor should own its instances.

## StreamingEnabled

- Enable on large maps. Tune `StreamingTargetRadius`, `StreamingMinRadius`, `StreamOutBehavior`.
- Gameplay-critical models: `ModelStreamingMode = Persistent` (sparingly) or `Atomic` so they stream as a unit.
- Client code must tolerate parts not existing: `CollectionService` signals, `WaitForChild` with timeouts.

## Quick wins

- Anchor static parts; `CanTouch/CanQuery/CanCollide = false` on decor; `CastShadow = false` on small parts.
- `CollisionFidelity = Box` for decorative meshes; `RenderFidelity = Automatic`.
- Replace `.Touched` hitboxes with periodic `GetPartBoundsInBox` queries.
- Pool projectiles and effects instead of creating/destroying each time.
- Only update UI when values change, not every frame.
- Server: don't animate or tween cosmetics; let clients do it.
- Batch remote traffic; use `buffer` to pack large numeric payloads.
