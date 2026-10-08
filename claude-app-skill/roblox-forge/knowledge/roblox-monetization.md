---
name: roblox-monetization
description: Implementing Roblox monetization correctly — game passes, developer products, ProcessReceipt, Premium perks, purchase prompts, paid random item compliance via PolicyService, pricing ladders, and economy sinks/sources. Use when adding a shop, perks, or anything that costs Robux.
---

# Roblox Monetization

## Game passes (permanent perks)

```lua
--!strict
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")

local PASSES = { VIP = 11111111, DoubleCoins = 22222222 }
local owned: { [Player]: { [number]: boolean } } = {}

local function ownsPass(player: Player, passId: number): boolean
	local cache = owned[player]
	if cache and cache[passId] ~= nil then return cache[passId] end
	local ok, result = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, passId)
	if not ok then return false end -- don't cache failures
	owned[player] = owned[player] or {}
	owned[player][passId] = result
	return result
end

-- Grant immediately when bought in-session
MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
	if purchased then
		owned[player] = owned[player] or {}
		owned[player][passId] = true
		-- apply perk now
	end
end)

Players.PlayerRemoving:Connect(function(player) owned[player] = nil end)
```

Client prompt: `MarketplaceService:PromptGamePassPurchase(player, passId)`. The client may *prompt*, the server *grants*.

## Developer products (repeatable)

- Client: `MarketplaceService:PromptProductPurchase(player, productId)`.
- Server: one `ProcessReceipt` callback, idempotent via stored `PurchaseId` — see the `roblox-datastores` skill for the full implementation.
- Show product info from `MarketplaceService:GetProductInfo(id, Enum.InfoType.Product)` (cache it) so prices in UI are always correct.

## Premium perks

```lua
local function isPremium(player: Player): boolean
	return player.MembershipType == Enum.MembershipType.Premium
end
Players.PlayerMembershipChanged:Connect(function(player)
	if isPremium(player) then --[[ grant perk ]] end
end)
```

Premium Payouts reward engagement time from Premium players — small perks (bonus daily reward, exclusive cosmetic) encourage them to play your game.

## Paid random items (loot boxes / gacha) — required compliance

```lua
local PolicyService = game:GetService("PolicyService")

local function canBuyRandomItems(player: Player): boolean
	local ok, policy = pcall(PolicyService.GetPolicyInfoForPlayerAsync, PolicyService, player)
	if not ok then return false end -- fail closed
	return not policy.ArePaidRandomItemsRestricted
end
```

- Disclose odds **before** purchase, in the UI.
- Hide or disable paid random purchases for restricted players (and anything bought with currency that was bought with Robux).
- Also check `IsPaidItemTradingAllowed` before enabling trading of paid items.

## Pricing ladder (example — tune with analytics)

| Product | Robux | Coins | Bonus |
|---|---|---|---|
| Small pouch | 25 | 250 | — |
| Bag | 99 | 1,100 | +10% |
| Chest ⭐ best value | 399 | 5,000 | +25% |
| Vault | 999 | 14,000 | +40% |

Typical game pass price points: 2× currency 199–399, VIP 99–499, extra slots/storage 49–199. Validate against comparable games (`game-researcher`).

## Economy balancing

- Map every **source** (rewards/min, daily rewards, quests) and **sink** (upgrades, consumables, rebirths, cosmetics, trading tax).
- Compute time-to-milestone for a free player; paid options should accelerate, not gate, the core fun.
- Track with `AnalyticsService:LogEconomyEvent(player, flowType, currencyType, amount, endingBalance, transactionType, itemSku)` and funnels with `LogFunnelStepEvent`.

## Do / Don't

- ✅ Prompt purchases only from clear player actions (button press).
- ✅ Show what the player gets and the exact price.
- ❌ Never auto-prompt on join or repeatedly.
- ❌ No fake scarcity timers, no misleading "free" labels.
- ❌ Never grant from client code or trust client-sent ids for rewards.
