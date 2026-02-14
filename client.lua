-- ============================================
-- 🐉 RDE NOSTR LOG BOT | CLIENT SCRIPT
-- NUI Integration & Keybinds
-- Author: RDE | SerpentsByte & Shin
-- ============================================

local isNuiOpen = false

-- ============================================
-- 🎮 NUI CONTROL
-- ============================================

-- Open NUI
local function openNui()
    if isNuiOpen then return end
    
    isNuiOpen = true
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        action = 'show'
    })
end

-- Close NUI
local function closeNui()
    if not isNuiOpen then return end
    
    isNuiOpen = false
    SetNuiFocus(false, false)
    
    SendNUIMessage({
        action = 'hide'
    })
end

-- ============================================
-- 🎯 KEYBIND REGISTRATION
-- ============================================

-- Register command to open admin panel
RegisterCommand('nostrpanel', function()
    -- Admin check is done server-side
    TriggerServerEvent('rde_nostr:requestPanelAccess')
end, false)

-- Register keybind (F5 by default, configurable)
if not Config then
    print('^1[RDE-NOSTR] ERROR: Config not loaded! Check fxmanifest.lua^0')
    return
end

local keybind = Config.UI and Config.UI.keybind or 'F9'
RegisterKeyMapping('nostrpanel', 'Open Nostr Admin Panel', 'keyboard', keybind)

-- ============================================
-- 📡 NUI CALLBACKS
-- ============================================

-- Close panel callback
RegisterNUICallback('closePanel', function(data, cb)
    closeNui()
    cb('ok')
end)

-- Post log callback
RegisterNUICallback('postLog', function(data, cb)
    TriggerServerEvent('rde_nostr:postLog', data.content, data.tags or {})
    cb({success = true})
end)

-- Get status callback
RegisterNUICallback('getStatus', function(data, cb)
    TriggerServerEvent('rde_nostr:getStatus')
    cb('ok')
end)

-- Get logs callback
RegisterNUICallback('getLogs', function(data, cb)
    TriggerServerEvent('rde_nostr:getLogs')
    cb('ok')
end)

-- ============================================
-- 🎨 SERVER EVENTS
-- ============================================

-- Panel access granted
RegisterNetEvent('rde_nostr:openPanel', function()
    openNui()
end)

-- Panel access denied
RegisterNetEvent('rde_nostr:panelDenied', function()
    lib.notify({
        title = GetLanguageString('error'),
        description = GetLanguageString('admin_only'),
        type = 'error',
        icon = 'shield-alert',
        iconColor = '#ef4444'
    })
end)

-- Success message from server
RegisterNetEvent('rde_nostr:success', function(message)
    SendNUIMessage({
        action = 'message',
        message = message,
        type = 'success'
    })
    
    lib.notify({
        title = GetLanguageString('success'),
        description = message,
        type = 'success',
        icon = 'check-circle',
        iconColor = '#10b981'
    })
end)

-- Error message from server
RegisterNetEvent('rde_nostr:error', function(message)
    SendNUIMessage({
        action = 'message',
        message = message,
        type = 'error'
    })
    
    lib.notify({
        title = GetLanguageString('error'),
        description = message,
        type = 'error',
        icon = 'x-circle',
        iconColor = '#ef4444'
    })
end)

-- Status update from server
RegisterNetEvent('rde_nostr:status', function(status)
    SendNUIMessage({
        action = 'updateStatus',
        status = status
    })
end)

-- Logs update from server
RegisterNetEvent('rde_nostr:logs', function(logs)
    SendNUIMessage({
        action = 'updateLogs',
        logs = logs
    })
end)

-- ============================================
-- 🔐 ADMIN COMMAND (Alternative to keybind)
-- ============================================

RegisterCommand('nostrlog', function(source, args, raw)
    if #args == 0 then
        -- No args = open panel
        TriggerServerEvent('rde_nostr:requestPanelAccess')
    else
        -- With args = post directly
        local content = table.concat(args, ' ')
        TriggerServerEvent('rde_nostr:postLog', content, {})
    end
end, false)

-- ============================================
-- 🎯 RESOURCE CLEANUP
-- ============================================

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    
    -- Close NUI if open
    if isNuiOpen then
        closeNui()
    end
end)

-- ============================================
-- 📊 DEBUG COMMANDS (Dev Mode)
-- ============================================

if Config.DevMode then
    RegisterCommand('nostr_test', function()
        print('[RDE-NOSTR] Testing NUI...')
        openNui()
    end, false)
    
    RegisterCommand('nostr_close', function()
        print('[RDE-NOSTR] Closing NUI...')
        closeNui()
    end, false)
    
    RegisterCommand('nostr_status', function()
        print('[RDE-NOSTR] Requesting status...')
        TriggerServerEvent('rde_nostr:getStatus')
    end, false)
end

-- ============================================
-- 🎨 VISUAL FEEDBACK
-- ============================================

-- Show notification when bot posts (optional, can be disabled)
if Config.UI.showNotifications then
    RegisterNetEvent('rde_nostr:logPosted', function(content)
        if Config.DevMode then
            lib.notify({
                title = '📡 Nostr Log',
                description = 'Log posted to Nostr',
                type = 'info',
                icon = 'rss',
                iconColor = '#3b82f6',
                duration = 3000
            })
        end
    end)
end

-- ============================================
-- 🚀 STARTUP MESSAGE
-- ============================================

CreateThread(function()
    Wait(5000) -- Wait for server to initialize
    
    if not Config then
        print('^1[RDE-NOSTR] ERROR: Config not loaded in client!^0')
        return
    end
    
    if Config.DevMode then
        local keybind = Config.UI and Config.UI.keybind or 'F9'
        print('^2[RDE-NOSTR] Client initialized^0')
        print('^5[RDE-NOSTR] Press ' .. keybind .. ' to open admin panel^0')
        print('^5[RDE-NOSTR] Or use command: /nostrpanel^0')
    end
end)