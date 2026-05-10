-- Animated Shop Button Example
-- Place this LocalScript inside a TextButton or ImageButton.
-- It creates a simple hover animation for Roblox UI.

local TweenService = game:GetService("TweenService")
local button = script.Parent

local normalSize = button.Size
local hoverSize = UDim2.new(
    normalSize.X.Scale * 1.05,
    normalSize.X.Offset,
    normalSize.Y.Scale * 1.05,
    normalSize.Y.Offset
)

local tweenInfo = TweenInfo.new(
    0.15,
    Enum.EasingStyle.Quad,
    Enum.EasingDirection.Out
)

local function tweenButton(targetSize)
    local tween = TweenService:Create(button, tweenInfo, {
        Size = targetSize
    })
    tween:Play()
end

button.MouseEnter:Connect(function()
    tweenButton(hoverSize)
end)

button.MouseLeave:Connect(function()
    tweenButton(normalSize)
end)

button.MouseButton1Click:Connect(function()
    print("Shop button clicked!")
end)
