-- Coin System Example
-- Place this script inside ServerScriptService.
-- It creates a leaderstats folder and gives players coins over time.

local Players = game:GetService("Players")

local STARTING_COINS = 100
local COINS_PER_REWARD = 10
local REWARD_INTERVAL = 30

local function setupLeaderstats(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = STARTING_COINS
    coins.Parent = leaderstats
end

local function startCoinRewards(player)
    task.spawn(function()
        while player.Parent do
            task.wait(REWARD_INTERVAL)

            local leaderstats = player:FindFirstChild("leaderstats")
            local coins = leaderstats and leaderstats:FindFirstChild("Coins")

            if coins then
                coins.Value += COINS_PER_REWARD
                print(player.Name .. " received " .. COINS_PER_REWARD .. " coins.")
            end
        end
    end)
end

Players.PlayerAdded:Connect(function(player)
    setupLeaderstats(player)
    startCoinRewards(player)
end)
