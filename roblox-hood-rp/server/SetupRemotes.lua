-- Script → ServerScriptService  (name: SetupRemotes, RunContext: Server)
-- Must be the FIRST script to run. Set its Priority higher than others.
local RS = game:GetService("ReplicatedStorage")

local folder = RS:FindFirstChild("Remotes") or Instance.new("Folder", RS)
folder.Name = "Remotes"

local events = {
	-- Money
	"GiveCash", "TakeCash", "Deposit", "Withdraw",
	-- Jobs
	"StartJob", "StopJob", "JobTaskComplete",
	-- Robbery
	"StartRobbery", "CancelRobbery", "RobberySuccess", "AlertPolice",
	-- Weapons
	"BuyWeapon",
	-- Police / arrest
	"CuffPlayer", "UncuffPlayer", "SendToJail", "Bail",
	"AddWanted", "ClearWanted", "UpdateWantedHUD",
	-- UI helpers
	"ShowNotification",
	-- World interaction
	"CollectMoney",
}

local functions = {
	"GetMoneyData",
	"GetJobList",
	"GetWeaponShopData",
	"GetWantedLevel",
}

for _, name in ipairs(events) do
	if not folder:FindFirstChild(name) then
		local e = Instance.new("RemoteEvent")
		e.Name = name
		e.Parent = folder
	end
end

for _, name in ipairs(functions) do
	if not folder:FindFirstChild(name) then
		local f = Instance.new("RemoteFunction")
		f.Name = name
		f.Parent = folder
	end
end

print("[SetupRemotes] All remotes ready.")
