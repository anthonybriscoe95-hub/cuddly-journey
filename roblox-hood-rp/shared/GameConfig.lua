-- ModuleScript → ReplicatedStorage/GameConfig
local GameConfig = {}

GameConfig.StartingCash = 500
GameConfig.StartingBank = 1000

GameConfig.Jobs = {
	Delivery   = { name = "Delivery Driver",   pay = 150, duration = 30, icon = "🚚" },
	Garbage    = { name = "Garbage Collector", pay = 100, duration = 20, icon = "🗑️" },
	Mechanic   = { name = "Mechanic",          pay = 250, duration = 45, icon = "🔧" },
	StoreClerk = { name = "Store Clerk",       pay = 75,  duration = 15, icon = "🏪" },
}

GameConfig.Weapons = {
	Knife   = { name = "Knife",   price = 300,  toolName = "Knife"   },
	Pistol  = { name = "Pistol",  price = 500,  toolName = "Pistol"  },
	Shotgun = { name = "Shotgun", price = 1200, toolName = "Shotgun" },
	SMG     = { name = "SMG",     price = 2000, toolName = "SMG"     },
	Rifle   = { name = "Rifle",   price = 4500, toolName = "Rifle"   },
}

GameConfig.Robbery = {
	Bank    = { duration = 60, payMin = 15000, payMax = 40000, cooldown = 600, wantedGain = 3 },
	Shop    = { duration = 20, payMin = 800,   payMax = 2500,  cooldown = 180, wantedGain = 1 },
	GunShop = { duration = 30, payMin = 2000,  payMax = 6000,  cooldown = 300, wantedGain = 2 },
}

GameConfig.Police = {
	CuffRange    = 12,
	JailDuration = 120,
	BailCost     = 2000,
}

GameConfig.WantedLevels = {
	[0] = { label = "Clean",       color = Color3.fromRGB(100, 200, 100) },
	[1] = { label = "Suspicious",  color = Color3.fromRGB(255, 220, 50)  },
	[2] = { label = "Wanted",      color = Color3.fromRGB(255, 140, 0)   },
	[3] = { label = "Armed",       color = Color3.fromRGB(220, 50,  50)  },
	[4] = { label = "Most Wanted", color = Color3.fromRGB(180, 0,   0)   },
}

return GameConfig
