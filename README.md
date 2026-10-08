# Roblox Forge — Claude Code plugin for building Roblox games

This repository is a Claude Code plugin marketplace containing **Roblox Forge**: a team of 12 specialist agents (engineers, designers, researchers, QA, security, performance), 9 Roblox knowledge skills, 8 workflow commands, and an auto-format/lint hook for Luau.

See [`plugins/roblox-forge/README.md`](plugins/roblox-forge/README.md) for everything included.

## Use it in the Claude app or claude.ai (chat)

1. Download [`roblox-forge-skill.zip`](https://github.com/anthonybriscoe95-hub/cuddly-journey/raw/main/claude-app-skill/roblox-forge-skill.zip).
2. In Claude, open **Settings → Capabilities**, make sure **Code execution and file creation** is on, then under **Skills** click **Upload skill** and choose the zip.
3. Start any chat with a Roblox request, e.g. "Make me a pet simulator game." Claude uses the whole team automatically.

## Use it in Claude Code sessions on this repo

Any Claude Code session opened on this repository (Claude app, claude.ai/code, or terminal) loads the team automatically from `.claude/`. There's nothing to install. Commands there have no prefix, e.g. `/new-game`.

## Install in Claude Code (any folder)

In a terminal:

```bash
claude plugin marketplace add anthonybriscoe95-hub/cuddly-journey
claude plugin install roblox-forge@roblox-forge-marketplace
```

(Inside the interactive `claude` app, the same commands are `/plugin marketplace add …` and `/plugin install …`.)

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
.claude/                            links to the plugin so sessions on this repo load it
claude-app-skill/                   single-skill version for the Claude app (built by scripts/build-claude-app-skill.sh)
```
