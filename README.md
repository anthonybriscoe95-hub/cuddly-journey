# GTA V Single-Player Bank / ATM Mod

A drop-in banking system inspired by the in-game ATM UI shown in the reference screenshot. Adds ATM blips around the map, lets you deposit, withdraw and transfer money, and tracks your balance + last transaction across save sessions.

## Features
- Card panel with auto-generated card number, holder name and expiry
- Bank balance, last deposit, last withdraw, last transaction
- Deposit / Withdraw / Transfer / Close actions
- ATM blips at every major bank in Los Santos, Sandy Shores and Paleto Bay
- Persistent save file (`BankSystem_save.json`)

## Requirements
- Grand Theft Auto V (single-player)
- [Script Hook V](http://www.dev-c.com/gtav/scripthookv/)
- [LUA Plugin for Script Hook V](https://www.gta5-mods.com/tools/lua-plugin-for-script-hook-v)

## Install
1. Install Script Hook V and the LUA Plugin.
2. Copy `BankSystem.lua` into:
   ```
   <GTA V folder>\scripts\addins\
   ```
3. Launch the game in story mode. ATM icons appear on your map.

## Controls
| Action | Key |
|---|---|
| Open ATM (when prompted) | `E` |
| Move selection | `Arrow Left` / `Right` |
| Confirm | `Enter` |
| Cancel / close | `Backspace` |
| Enter amount | Number row `0`-`9` |

## Notes
- `holder` defaults to `ANGIER3` - change it at the top of `BankSystem.lua`.
- Tweak `ATM_LOCATIONS` to add or remove ATMs.
- The save file is plain JSON; delete it to reset your account.
