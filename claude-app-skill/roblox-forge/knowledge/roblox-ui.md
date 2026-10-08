---
name: roblox-ui
description: Building responsive, cross-platform Roblox UI — ScreenGui setup, scale-based layouts, safe areas, mobile/console/gamepad support, tweened feedback, reusable components, and shop/inventory/HUD patterns in plain Luau, React-lua, or Fusion. Use when creating or fixing any in-game interface.
---

# Roblox UI Patterns

## ScreenGui defaults

```lua
local gui = Instance.new("ScreenGui")
gui.Name = "HUD"
gui.ResetOnSpawn = false                         -- keep state across respawns
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets -- avoid notches + topbar
gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
```

Layering: one ScreenGui per layer with `DisplayOrder` (HUD 0, Panels 10, Modals 20, Toasts 30).

## Responsive sizing recipe

```lua
local panel = Instance.new("Frame")
panel.AnchorPoint = Vector2.new(0.5, 0.5)
panel.Position = UDim2.fromScale(0.5, 0.5)
panel.Size = UDim2.fromScale(0.6, 0.7)

local aspect = Instance.new("UIAspectRatioConstraint")
aspect.AspectRatio = 1.4
aspect.Parent = panel

local limits = Instance.new("UISizeConstraint")
limits.MaxSize = Vector2.new(900, 640)
limits.Parent = panel

local corner = Instance.new("UICorner"); corner.CornerRadius = UDim.new(0, 12); corner.Parent = panel
local pad = Instance.new("UIPadding")
pad.PaddingTop, pad.PaddingBottom = UDim.new(0, 12), UDim.new(0, 12)
pad.PaddingLeft, pad.PaddingRight = UDim.new(0, 12), UDim.new(0, 12)
pad.Parent = panel
```

Grids of items: `ScrollingFrame` + `UIGridLayout` (`CellSize` in scale or offset) with `AutomaticCanvasSize = Enum.AutomaticSize.Y` and `CanvasSize = UDim2.new()`.

## Theme module

```lua
--!strict
return {
	Colors = {
		Background = Color3.fromRGB(24, 26, 33),
		Surface = Color3.fromRGB(36, 39, 50),
		Primary = Color3.fromRGB(88, 166, 255),
		Success = Color3.fromRGB(76, 209, 125),
		Danger = Color3.fromRGB(255, 92, 92),
		Text = Color3.fromRGB(240, 240, 245),
		TextMuted = Color3.fromRGB(160, 165, 180),
	},
	Font = Font.fromEnum(Enum.Font.GothamBold),
	Radius = UDim.new(0, 12),
	TweenFast = TweenInfo.new(0.12, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
}
```

## Button feedback

```lua
local TweenService = game:GetService("TweenService")

local function addPressFeedback(button: GuiButton)
	local scale = Instance.new("UIScale"); scale.Parent = button
	local info = TweenInfo.new(0.08, Enum.EasingStyle.Quad)
	button.MouseEnter:Connect(function() TweenService:Create(scale, info, { Scale = 1.05 }):Play() end)
	button.MouseLeave:Connect(function() TweenService:Create(scale, info, { Scale = 1 }):Play() end)
	button.MouseButton1Down:Connect(function() TweenService:Create(scale, info, { Scale = 0.95 }):Play() end)
	button.MouseButton1Up:Connect(function() TweenService:Create(scale, info, { Scale = 1.05 }):Play() end)
end
```

Use `Activated` (not `MouseButton1Click`) for the action itself — it fires for mouse, touch, and gamepad.

## Currency display bound to an Attribute

```lua
local player = Players.LocalPlayer
local label: TextLabel = hud.CoinsLabel

local function render()
	label.Text = string.format("%d", player:GetAttribute("Coins") or 0)
end
player:GetAttributeChangedSignal("Coins"):Connect(render)
render()
```

## Cross-platform input

```lua
local ContextActionService = game:GetService("ContextActionService")
local UserInputService = game:GetService("UserInputService")

local function onInteract(_name: string, state: Enum.UserInputState)
	if state == Enum.UserInputState.Begin then
		-- fire intent to server
	end
	return Enum.ContextActionResult.Pass
end

-- E on keyboard, ButtonX on gamepad, plus an on-screen touch button
ContextActionService:BindAction("Interact", onInteract, true, Enum.KeyCode.E, Enum.KeyCode.ButtonX)
ContextActionService:SetTitle("Interact", "Use")
```

- Detect device: `UserInputService.TouchEnabled`, `GamepadEnabled`, `KeyboardEnabled`, and update prompts on `UserInputService.LastInputTypeChanged`.
- Gamepad navigation: set `Selectable = true`, use `GuiService.SelectedObject = firstButton` when a menu opens, and `NextSelectionUp/Down/Left/Right` where auto-selection misbehaves.
- For world interactions prefer `ProximityPrompt` — it handles keyboard, gamepad, and touch automatically.

## Open/close panels

- Only one modal open at a time — keep a small UI state module (`UIState.open("Shop")`) that closes others.
- Tween in from 0.9 scale + transparency over ~0.15 s; disable gameplay input while a modal is open if needed.

## Frameworks

- **React-lua** (`jsdotlua/react` + `jsdotlua/react-roblox`): best for large, state-heavy UI and teams familiar with React.
- **Fusion** or **Vide**: reactive state with less boilerplate.
- **Plain Instances**: fine for simple HUDs. Don't mix frameworks in one project.

## Checklist

- [ ] Tested with Studio device emulator: small phone, tablet, 1080p, 4K, console
- [ ] Nothing under the topbar, notch, thumbstick, or jump button
- [ ] Works with gamepad only
- [ ] Text readable on phone; no clipping in long languages (consider `LocalizationService`)
- [ ] UI never decides prices/rewards — it only sends intent
