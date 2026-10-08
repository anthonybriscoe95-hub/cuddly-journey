# Click Simulator (Roblox)

A simple "simulator" game, one of the most popular kinds of game on Roblox:

- **Click** the big button to get coins (with a bounce and "+10" popups)
- **Upgrade** to get more coins per click
- **Rebirth** to reset your coins for a permanent coin multiplier
- **2x Coins Game Pass**, sold for Robux (this is how you earn)
- **Leaderboard** in the top right, and **saves progress** automatically

The whole game is 2 scripts. The GUI is made by code, so you don't have to build any buttons.

## Fastest setup: open the ready-made place file

1. Download [`ClickSimulator.rbxlx`](ClickSimulator.rbxlx) (on GitHub, open the file and click the **Download raw file** button).
2. In Roblox Studio, go to **File → Open from File** and pick `ClickSimulator.rbxlx`.
3. Press **Play**. Then follow "Publish it" below.

If you change the scripts, rebuild the place file with `python3 tools/build_place.py`.

## Manual setup (about 5 minutes)

1. Open **Roblox Studio** and pick the **Baseplate** template.
2. In the **Explorer**, right-click **ServerScriptService** and choose **Insert Object**, then **Script**.
   Delete what's in it and paste everything from [`ServerScriptService/GameServer.server.lua`](ServerScriptService/GameServer.server.lua).
3. Open **StarterPlayer**, right-click **StarterPlayerScripts** and choose **Insert Object**, then **LocalScript**.
   Paste everything from [`StarterPlayerScripts/GameClient.client.lua`](StarterPlayerScripts/GameClient.client.lua).
4. Press **Play** to test it.

## Publish it and turn on saving

1. Go to **File → Publish to Roblox**, then give it a name and description.
2. Go to **Home → Game Settings → Security** and turn on **Enable Studio Access to API Services**. Saving needs this.
3. Go to **Game Settings → Permissions** and set the game to **Public**.

## Make Robux (the 2x Coins Game Pass)

1. Go to [create.roblox.com](https://create.roblox.com), open your game, then **Monetization → Passes → Create a Pass**.
   Name it "2x Coins", upload an icon, and save it.
2. Open the pass, turn on **Item for Sale**, and set a price. 50–150 Robux is typical.
3. Copy the pass's **ID** (the number in its URL).
4. In the server script, change this line:
   ```lua
   local DOUBLE_COINS_GAMEPASS_ID = 0
   ```
   to your ID, for example `= 123456789`. Then publish again.
   The red **⭐ 2x COINS ⭐** button appears in-game after you add the ID.

## Easy tweaks

At the top of the server script:

| Setting | What it does |
|---|---|
| `BASE_UPGRADE_COST` | Price of the first upgrade |
| `UPGRADE_COST_GROWTH` | How much pricier each upgrade gets |
| `BASE_REBIRTH_COST` | Coins needed to rebirth (goes up each time) |
| `CLICK_COOLDOWN` | Limits auto-clickers |

## Tips to get players

- A bright, exciting **thumbnail and icon** matter more than anything else.
- Use a clear name, such as "Click Simulator 🔥 [UPDATE]".
- Add some free models from the **Toolbox** (trees, a lobby, or a spawn area) so the map isn't empty.
- Keep updating the game, because Roblox favors games that people return to.
- Roblox has a lot of competition, so earning Robux isn't guaranteed. Treat your first game as practice and keep improving it.
