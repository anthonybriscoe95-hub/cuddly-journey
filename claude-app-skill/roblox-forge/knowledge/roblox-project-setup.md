---
name: roblox-project-setup
description: Set up a professional Roblox project with Rojo, Wally, Rokit, StyLua, Selene, and luau-lsp — folder structure, config templates, Git workflow, and syncing into Roblox Studio. Use when creating a new Roblox game, converting a Studio-only place to files, or fixing toolchain issues.
---

# Roblox Project Setup (Rojo toolchain)

Templates for every config file live in this skill's `templates/` directory — copy them into the project root and adjust the names.

## Toolchain

| Tool | Purpose |
|---|---|
| **Rokit** | Pins tool versions per project (`rokit.toml`). Successor to Aftman/Foreman. |
| **Rojo** | Syncs files ↔ Roblox Studio (`rojo serve` + the Rojo Studio plugin), builds `.rbxl` files (`rojo build`). |
| **Wally** | Package manager (`wally.toml` → `Packages/`, `ServerPackages/`). |
| **StyLua** | Formatter. |
| **Selene** | Linter (with the `roblox` std). |
| **luau-lsp** | Type checking + autocomplete in VS Code (extension "Luau Language Server"); needs a `sourcemap.json` from `rojo sourcemap`. |
| **wally-package-types** | Re-exports types for Wally packages so strict typing works. |

## New project steps

```bash
# 1. Install Rokit (see github.com/rojo-rbx/rokit), then in the project folder:
rokit init
rokit add rojo-rbx/rojo
rokit add UpliftGames/wally
rokit add JohnnyMorganz/StyLua
rokit add Kampfkarren/selene
rokit add JohnnyMorganz/wally-package-types
rokit install

# 2. Copy templates (default.project.json, wally.toml, selene.toml, stylua.toml, .luaurc; rename gitignore.template → .gitignore)

# 3. Install packages and generate types
wally install
rojo sourcemap default.project.json --output sourcemap.json
wally-package-types --sourcemap sourcemap.json Packages/

# 4. Sync into Studio
rojo serve
#    In Studio: install the Rojo plugin, open a place, click Rojo → Connect.
```

## Folder layout

```
my-game/
├─ default.project.json
├─ rokit.toml  wally.toml  selene.toml  stylua.toml  .luaurc  .gitignore
├─ src/
│  ├─ server/                 → ServerScriptService.Server
│  │  ├─ init.server.luau     (bootstrap Script)
│  │  ├─ Services/            (CoinService.luau, DataService.luau, ...)
│  │  └─ Data/
│  ├─ client/                 → StarterPlayer.StarterPlayerScripts.Client
│  │  ├─ init.client.luau     (bootstrap LocalScript)
│  │  ├─ Controllers/
│  │  └─ UI/
│  └─ shared/                 → ReplicatedStorage.Shared
│     ├─ Remotes.luau
│     ├─ Config/              (ItemConfig.luau, ShopConfig.luau — data only)
│     └─ Util/
├─ tests/                     (*.spec.luau)
└─ Packages/                  (wally, git-ignored)
```

## Rojo file naming

| File | Becomes |
|---|---|
| `Foo.server.luau` | `Script` named Foo |
| `Foo.client.luau` | `LocalScript` named Foo |
| `Foo.luau` | `ModuleScript` named Foo |
| `Foo/init.luau` (or `init.server.luau`/`init.client.luau`) | the folder *becomes* that script, children nested inside |
| `Foo.model.json` / `.rbxm` / `.rbxmx` | Instance(s) |
| `Foo.meta.json` | properties/attributes for the sibling script or folder |
| `Foo.json` / `Foo.txt` / `Foo.csv` | ModuleScript returning data / StringValue / LocalizationTable |

## What lives where

- **Code** → files (Git, reviewable, Claude-editable).
- **Maps, models, UI built visually, meshes** → stay in the place file in Studio (or export as `.rbxm` and reference from the project file). Use Rojo's `$ignoreUnknownInstances` (as in the template) so Rojo doesn't delete Studio-built content.
- **Publishing:** in Studio (File → Publish) or with Open Cloud (`rojo upload` / Place Publishing API) in CI.

## Git

- Commit: source, configs, `wally.lock`, `rokit.toml`. Ignore: `Packages/`, `ServerPackages/`, `sourcemap.json`, `*.rbxl(x).lock`, built `.rbxl`.
- Optional CI (GitHub Actions): `rokit install` → `stylua --check src` → `selene src` → `rojo build -o game.rbxl` → run tests via Open Cloud Luau Execution.
