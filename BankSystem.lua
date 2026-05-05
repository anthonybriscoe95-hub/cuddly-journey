--[[
    BankSystem.lua
    ATM / Bank account mod for GTA V single-player.
    Requires: Script Hook V + LUA Plugin for Script Hook V
    Drop into:  ...\GTAV\scripts\addins\
--]]

local SAVE_PATH = "scripts/addins/BankSystem_save.json"

------------------------------------------------------------
-- ATM / Bank locations (Los Santos)
------------------------------------------------------------
local ATM_LOCATIONS = {
    { x = -1212.98, y = -330.84, z = 37.78  }, -- Rockford Hills bank
    { x =  149.40,  y = -1041.10, z = 28.25 }, -- Pacific Standard
    { x = -2962.58, y =  482.19, z = 15.18  }, -- Great Ocean Hwy
    { x =  295.84,  y =  217.28, z = 102.79 }, -- Vinewood
    { x = -56.88,   y = -1752.55, z = 28.46 }, -- Strawberry
    { x =  1175.07, y =  2702.61, z = 37.34 }, -- Sandy Shores
    { x =  -112.74, y = 6469.50, z = 30.63  }, -- Paleto Bay
}

local INTERACT_DISTANCE = 1.6
local ATM_BLIP_SPRITE   = 108
local ATM_BLIP_COLOR    = 2

------------------------------------------------------------
-- State
------------------------------------------------------------
local state = {
    holder        = "ANGIER3",
    cardNumber    = nil,
    cardExpiry    = nil,
    balance       = 0,
    lastDeposit   = 0,
    lastWithdraw  = 0,
    lastTransfer  = 0,
}

local ui = {
    open       = false,
    nearestATM = nil,
    blips      = {},
    selection  = 1,        -- 1 Deposit, 2 Withdraw, 3 Transfer, 4 Close
    inputMode  = nil,      -- "deposit" | "withdraw" | "transfer"
    inputBuf   = "",
}

local MENU_ITEMS = { "DEPOSIT", "WITHDRAW", "TRANSFER", "CLOSE" }

------------------------------------------------------------
-- Helpers
------------------------------------------------------------
local function fmtMoney(n)
    local s = tostring(math.floor(n))
    local out, k = s:reverse():gsub("(%d%d%d)", "%1,")
    out = out:reverse()
    if out:sub(1, 1) == "," then out = out:sub(2) end
    return "$" .. out
end

local function genCardNumber()
    local parts = {}
    for i = 1, 4 do parts[i] = string.format("%04d", math.random(0, 9999)) end
    return table.concat(parts)
end

local function genExpiry()
    local mm = math.random(1, 12)
    local yy = math.random(28, 35)
    return string.format("%02d/%02d", mm, yy)
end

local function distance(p1x, p1y, p1z, p2x, p2y, p2z)
    local dx, dy, dz = p1x - p2x, p1y - p2y, p1z - p2z
    return math.sqrt(dx * dx + dy * dy + dz * dz)
end

local function notify(msg)
    Citizen.InvokeNative(0x202709F4C58A0424, "STRING") -- BEGIN_TEXT_COMMAND_THEFEED_POST
    Citizen.InvokeNative(0x6C188BE134E074AA, msg)      -- ADD_TEXT_COMPONENT_SUBSTRING
    Citizen.InvokeNative(0x2ED7843F8F801023)           -- END_TEXT_COMMAND_THEFEED_POST_TICKER
end

local function playBeep()
    Citizen.InvokeNative(0x67C540AA08E4A6F5,
        "NAV_LEFT_RIGHT", "HUD_FRONTEND_DEFAULT_SOUNDSET", true)
end

------------------------------------------------------------
-- Save / Load
------------------------------------------------------------
local function serialize(t)
    local function esc(s) return (tostring(s):gsub('"', '\\"')) end
    local b = {"{"}
    local first = true
    for k, v in pairs(t) do
        if not first then b[#b + 1] = "," end
        first = false
        b[#b + 1] = '"' .. esc(k) .. '":'
        if type(v) == "number" then
            b[#b + 1] = tostring(v)
        else
            b[#b + 1] = '"' .. esc(v) .. '"'
        end
    end
    b[#b + 1] = "}"
    return table.concat(b)
end

local function save()
    local f = io.open(SAVE_PATH, "w")
    if not f then return end
    f:write(serialize(state))
    f:close()
end

local function load()
    local f = io.open(SAVE_PATH, "r")
    if not f then return end
    local text = f:read("*a")
    f:close()
    for k, v in text:gmatch('"([^"]+)":"([^"]*)"') do state[k] = v end
    for k, v in text:gmatch('"([^"]+)":(%-?%d+%.?%d*)') do state[k] = tonumber(v) end
end

------------------------------------------------------------
-- Drawing
------------------------------------------------------------
local function drawText(text, x, y, scale, r, g, b, a, center)
    Citizen.InvokeNative(0x66E0276CC5F6B9DA, 4) -- SET_TEXT_FONT
    Citizen.InvokeNative(0x07C837F9A01C34C9, scale, scale)
    Citizen.InvokeNative(0xBE6B23FFA53FB442, r, g, b, a)
    if center then Citizen.InvokeNative(0xC02F4DBFB51D988B, true) end
    Citizen.InvokeNative(0x25FBB336DF1804CB, "STRING")
    Citizen.InvokeNative(0x6C188BE134E074AA, text)
    Citizen.InvokeNative(0xCD015E5BB0D96A57, x, y)
end

local function drawRect(x, y, w, h, r, g, b, a)
    Citizen.InvokeNative(0x3A618A217E5154F0, x + w / 2, y + h / 2, w, h, r, g, b, a)
end

local function drawHelp(text)
    Citizen.InvokeNative(0x8509B634FBE7DA11, "STRING")
    Citizen.InvokeNative(0x6C188BE134E074AA, text)
    Citizen.InvokeNative(0x238FFE5C7B0498A6, 0, false, true, -1)
end

------------------------------------------------------------
-- Menu rendering
------------------------------------------------------------
local function drawBankUI()
    -- panel
    local px, py, pw, ph = 0.25, 0.18, 0.50, 0.50
    drawRect(px, py, pw, ph, 18, 18, 22, 235)

    -- header
    drawText(state.holder, px + 0.015, py + 0.015, 0.55, 255, 255, 255, 255, false)
    drawText("WELCOME BACK", px + 0.015, py + 0.055, 0.32, 200, 200, 200, 220, false)
    drawText("EXPECT SHUTDOWNS + GLITCHES AS THIS GAME IS STILL IN EARLY DEVELOPMENT!",
        px + pw / 2, py - 0.025, 0.28, 255, 200, 230, 200, true)

    -- card panel
    local cx, cy, cw, ch = px + 0.015, py + 0.105, 0.22, 0.16
    drawRect(cx, cy, cw, ch, 70, 150, 220, 245)
    drawText("CARD NUMBER", cx + 0.01, cy + 0.01, 0.32, 255, 255, 255, 255, false)
    drawText("#1", cx + cw - 0.025, cy + 0.01, 0.32, 255, 255, 255, 255, false)
    drawText(state.cardNumber or "----------------", cx + 0.01, cy + 0.045, 0.36,
        255, 255, 255, 255, false)
    drawText("Valid", cx + 0.01, cy + ch - 0.045, 0.26, 230, 230, 230, 220, false)
    drawText(state.cardExpiry or "--/--", cx + 0.01, cy + ch - 0.022, 0.30,
        255, 255, 255, 255, false)
    drawText("Holder", cx + 0.10, cy + ch - 0.045, 0.26, 230, 230, 230, 220, false)
    drawText(state.holder, cx + 0.10, cy + ch - 0.022, 0.30, 255, 255, 255, 255, false)

    -- balance panel
    local bx = px + 0.255
    drawText("BANK BALANCE", bx, py + 0.115, 0.32, 200, 200, 200, 220, false)
    drawText(fmtMoney(state.balance), bx, py + 0.145, 0.55, 255, 255, 255, 255, false)
    drawText("Last Deposit",  bx, py + 0.205, 0.28, 200, 200, 200, 220, false)
    drawText("+" .. fmtMoney(state.lastDeposit), bx, py + 0.230, 0.32,
        80, 220, 110, 255, false)
    drawText("Last Withdraw", bx, py + 0.265, 0.28, 200, 200, 200, 220, false)
    drawText("-" .. fmtMoney(state.lastWithdraw), bx, py + 0.290, 0.32,
        230, 80, 80, 255, false)

    -- last transaction column
    local tx = px + pw - 0.18
    drawText("LAST TRANSACTION", tx, py + 0.115, 0.32, 200, 200, 200, 220, false)
    local last = state.lastDeposit
    local sign, col = "+", {80, 220, 110}
    if state.lastWithdraw > 0 then last, sign, col = state.lastWithdraw, "-", {230, 80, 80}
    elseif state.lastTransfer > 0 then last, sign, col = state.lastTransfer, "-", {230, 180, 80} end
    drawText(sign .. fmtMoney(last), tx, py + 0.145, 0.45, col[1], col[2], col[3], 255, false)

    -- action buttons
    local ay  = py + ph - 0.13
    local btnW, btnH, gap = 0.105, 0.07, 0.012
    local startX = px + 0.015
    for i, label in ipairs(MENU_ITEMS) do
        local bxp = startX + (i - 1) * (btnW + gap)
        local r, g, b = 60, 130, 200
        if label == "CLOSE" then r, g, b = 200, 50, 50 end
        if i == ui.selection then
            drawRect(bxp - 0.004, ay - 0.004, btnW + 0.008, btnH + 0.008,
                255, 255, 255, 255)
        end
        drawRect(bxp, ay, btnW, btnH, r, g, b, 250)
        drawText(label, bxp + btnW / 2, ay + 0.018, 0.35,
            255, 255, 255, 255, true)
    end

    -- input prompt
    if ui.inputMode then
        local ix, iy, iw, ih = px + 0.10, py + ph + 0.02, 0.30, 0.05
        drawRect(ix, iy, iw, ih, 0, 0, 0, 220)
        drawText(string.upper(ui.inputMode) .. " AMOUNT: $" .. ui.inputBuf,
            ix + iw / 2, iy + 0.012, 0.42, 255, 255, 255, 255, true)
        drawText("[0-9] enter   [BACKSPACE] delete   [ENTER] confirm   [ESC] cancel",
            ix + iw / 2, iy + ih + 0.005, 0.28, 200, 200, 200, 220, true)
    end
end

------------------------------------------------------------
-- Money helpers (story-mode wallet)
------------------------------------------------------------
local CHAR_HASH = {
    [0x705E61F2] = "SP0_TOTAL_CASH", -- Michael
    [0x9B22DBAF] = "SP1_TOTAL_CASH", -- Franklin
    [0x1581FD37] = "SP2_TOTAL_CASH", -- Trevor
}

local function currentCashStat()
    local ped   = PLAYER.PLAYER_PED_ID()
    local model = ENTITY.GET_ENTITY_MODEL(ped)
    local stat  = CHAR_HASH[model]
    if not stat then return nil end
    return GAMEPLAY.GET_HASH_KEY(stat)
end

local function getPlayerCash()
    local h = currentCashStat()
    if not h then return 0 end
    local ok, val = pcall(STATS.STAT_GET_INT, h, -1)
    return ok and val or 0
end

local function changeCash(delta)
    local h = currentCashStat()
    if not h then return false end
    local ok, cur = pcall(STATS.STAT_GET_INT, h, -1)
    if not ok then return false end
    local target = cur + delta
    if target < 0 then return false end
    pcall(STATS.STAT_SET_INT, h, target, true)
    return true
end

------------------------------------------------------------
-- Actions
------------------------------------------------------------
local function doDeposit(amount)
    if amount <= 0 then notify("~r~Invalid amount."); return end
    if amount > getPlayerCash() then notify("~r~Not enough cash on hand."); return end
    if not changeCash(-amount) then notify("~r~Cash transfer failed."); return end
    state.balance = state.balance + amount
    state.lastDeposit, state.lastWithdraw, state.lastTransfer = amount, 0, 0
    save()
    notify("~g~Deposited " .. fmtMoney(amount))
end

local function doWithdraw(amount)
    if amount <= 0 then notify("~r~Invalid amount."); return end
    if amount > state.balance then notify("~r~Insufficient bank balance."); return end
    if not changeCash(amount) then notify("~r~Cash transfer failed."); return end
    state.balance = state.balance - amount
    state.lastWithdraw, state.lastDeposit, state.lastTransfer = amount, 0, 0
    save()
    notify("~g~Withdrew " .. fmtMoney(amount))
end

local function doTransfer(amount)
    if amount <= 0 then notify("~r~Invalid amount."); return end
    if amount > state.balance then notify("~r~Insufficient bank balance."); return end
    state.balance = state.balance - amount
    state.lastTransfer, state.lastDeposit, state.lastWithdraw = amount, 0, 0
    save()
    notify("~g~Transferred " .. fmtMoney(amount) .. " to contact.")
end

------------------------------------------------------------
-- Input
------------------------------------------------------------
local KEYS = {
    LEFT = 174, RIGHT = 175, UP = 172, DOWN = 173,
    ENTER = 191, BACK = 177, NUM = {
        [157]=1,[158]=2,[160]=3,[164]=4,[165]=5,
        [159]=6,[161]=7,[162]=8,[163]=9,[216]=0,
    },
}

local function handleMenuInput()
    if CONTROLS.IS_CONTROL_JUST_PRESSED(0, KEYS.LEFT) then
        ui.selection = ui.selection - 1
        if ui.selection < 1 then ui.selection = #MENU_ITEMS end
        playBeep()
    elseif CONTROLS.IS_CONTROL_JUST_PRESSED(0, KEYS.RIGHT) then
        ui.selection = ui.selection + 1
        if ui.selection > #MENU_ITEMS then ui.selection = 1 end
        playBeep()
    elseif CONTROLS.IS_CONTROL_JUST_PRESSED(0, KEYS.ENTER) then
        local item = MENU_ITEMS[ui.selection]
        if item == "CLOSE" then
            ui.open = false
        else
            ui.inputMode = string.lower(item)
            ui.inputBuf  = ""
        end
        playBeep()
    elseif CONTROLS.IS_CONTROL_JUST_PRESSED(0, KEYS.BACK) then
        ui.open = false
    end
end

local function handleNumericInput()
    for keyCode, digit in pairs(KEYS.NUM) do
        if CONTROLS.IS_CONTROL_JUST_PRESSED(0, keyCode) then
            if #ui.inputBuf < 9 then ui.inputBuf = ui.inputBuf .. tostring(digit) end
        end
    end
    if CONTROLS.IS_CONTROL_JUST_PRESSED(0, 177) then         -- BACKSPACE / cancel
        if ui.inputBuf == "" then ui.inputMode = nil
        else ui.inputBuf = ui.inputBuf:sub(1, -2) end
    elseif CONTROLS.IS_CONTROL_JUST_PRESSED(0, KEYS.ENTER) then
        local amt = tonumber(ui.inputBuf) or 0
        local mode = ui.inputMode
        ui.inputMode, ui.inputBuf = nil, ""
        if     mode == "deposit"  then doDeposit(amt)
        elseif mode == "withdraw" then doWithdraw(amt)
        elseif mode == "transfer" then doTransfer(amt) end
    end
end

------------------------------------------------------------
-- Blips
------------------------------------------------------------
local function createBlips()
    for _, atm in ipairs(ATM_LOCATIONS) do
        local blip = HUD.ADD_BLIP_FOR_COORD(atm.x, atm.y, atm.z)
        HUD.SET_BLIP_SPRITE(blip, ATM_BLIP_SPRITE)
        HUD.SET_BLIP_COLOUR(blip, ATM_BLIP_COLOR)
        HUD.SET_BLIP_SCALE(blip, 0.7)
        HUD.SET_BLIP_AS_SHORT_RANGE(blip, true)
        HUD.BEGIN_TEXT_COMMAND_SET_BLIP_NAME("STRING")
        HUD.ADD_TEXT_COMPONENT_SUBSTRING_PLAYER_NAME("ATM")
        HUD.END_TEXT_COMMAND_SET_BLIP_NAME(blip)
        ui.blips[#ui.blips + 1] = blip
    end
end

local function findNearestATM()
    local ped = PLAYER.PLAYER_PED_ID()
    local px, py, pz = table.unpack(ENTITY.GET_ENTITY_COORDS(ped, true))
    local best, bestD
    for _, atm in ipairs(ATM_LOCATIONS) do
        local d = distance(px, py, pz, atm.x, atm.y, atm.z)
        if not bestD or d < bestD then bestD, best = d, atm end
    end
    return best, bestD or 9999
end

------------------------------------------------------------
-- Main loop
------------------------------------------------------------
local function init()
    math.randomseed(os.time())
    load()
    if not state.cardNumber then state.cardNumber = genCardNumber() end
    if not state.cardExpiry then state.cardExpiry = genExpiry() end
    createBlips()
    save()
end

init()

while true do
    Wait(0)

    local _, dist = findNearestATM()
    local nearby = dist < INTERACT_DISTANCE

    if nearby and not ui.open then
        drawHelp("Press ~INPUT_CONTEXT~ to use ATM.")
        if CONTROLS.IS_CONTROL_JUST_PRESSED(0, 51) then -- E / DPAD RIGHT
            ui.open      = true
            ui.selection = 1
            ui.inputMode = nil
            ui.inputBuf  = ""
        end
    end

    if ui.open then
        -- block player + camera while menu open
        CONTROLS.DISABLE_ALL_CONTROL_ACTIONS(0)
        CONTROLS.ENABLE_CONTROL_ACTION(0, 1, true)   -- look LR
        CONTROLS.ENABLE_CONTROL_ACTION(0, 2, true)   -- look UD

        drawBankUI()

        if ui.inputMode then handleNumericInput()
        else handleMenuInput() end
    end
end
