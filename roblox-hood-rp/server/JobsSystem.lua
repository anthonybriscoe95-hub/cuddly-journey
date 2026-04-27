-- Script → ServerScriptService/JobsSystem
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes    = ReplicatedStorage:WaitForChild("Remotes")

local activeJobs = {}  -- [player] = { jobKey, thread }

Remotes.GetJobList.OnServerInvoke = function(_player)
	return GameConfig.Jobs
end

Remotes.StartJob.OnServerEvent:Connect(function(player, jobKey)
	if not GameConfig.Jobs[jobKey] then return end

	if activeJobs[player] then
		Remotes.ShowNotification:FireClient(player, "Quit your current job first!", "error")
		return
	end

	local cfg = GameConfig.Jobs[jobKey]

	local thread = task.spawn(function()
		while activeJobs[player] and activeJobs[player].jobKey == jobKey do
			task.wait(cfg.duration)
			if not activeJobs[player] then break end

			if _G.MoneyAPI then
				_G.MoneyAPI.GiveCash(player, cfg.pay)
			end
			Remotes.ShowNotification:FireClient(player,
				cfg.name .. " task done! +$" .. cfg.pay, "cash")
			Remotes.JobTaskComplete:FireClient(player, jobKey)
		end
	end)

	activeJobs[player] = { jobKey = jobKey, thread = thread }
	Remotes.ShowNotification:FireClient(player, "Started: " .. cfg.name, "success")
end)

Remotes.StopJob.OnServerEvent:Connect(function(player)
	local job = activeJobs[player]
	if job then
		task.cancel(job.thread)
		activeJobs[player] = nil
		Remotes.ShowNotification:FireClient(player, "Job stopped.", "info")
	end
end)

Players.PlayerRemoving:Connect(function(player)
	local job = activeJobs[player]
	if job then
		task.cancel(job.thread)
		activeJobs[player] = nil
	end
end)
