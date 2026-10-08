# Roblox Forge — Claude Code plugin for building Roblox games

## 🎮 Click Simulator (ready-to-play Roblox game)

This repo also has a finished, simple Roblox game. Download [`ClickSimulator.rbxlx`](ClickSimulator.rbxlx), then in Roblox Studio go to **File → Open from File**. The full setup, publishing, and Robux guide is in [`CLICK_SIMULATOR.md`](CLICK_SIMULATOR.md).

This repository is a Claude Code plugin marketplace containing **Roblox Forge**: a team of 12 specialist agents (engineers, designers, researchers, QA, security, performance), 9 Roblox knowledge skills, 8 workflow commands, and an auto-format/lint hook for Luau.

See [`plugins/roblox-forge/README.md`](plugins/roblox-forge/README.md) for everything included.

## Install

In Claude Code:

```
/plugin marketplace add anthonybriscoe95-hub/cuddly-journey
/plugin install roblox-forge@roblox-forge-marketplace
```

Then restart Claude Code (or run `/reload-plugins`) and try:

```
/roblox-forge:new-game a co-op tower defense game where pets are the towers
```

## Try it locally without installing

```
git clone https://github.com/anthonybriscoe95-hub/cuddly-journey
claude --plugin-dir ./cuddly-journey/plugins/roblox-forge
```

## Layout

```
.claude-plugin/marketplace.json     marketplace catalog
plugins/roblox-forge/
├─ .claude-plugin/plugin.json       plugin manifest
├─ agents/                          12 specialist subagents
├─ commands/                        8 slash commands
├─ skills/                          9 knowledge skills (+ Rojo project templates)
└─ hooks/                           StyLua + Selene hook for .luau files
```
