-- ============================================
-- 🐉 RDE NOSTR LOG BOT | CLIENT SCRIPT v1.1.0
-- NUI Integration & Keybinds
-- ============================================
-- 🛠️ FIXED v1.1.0:
--   ✅ getStatus NUI Callback gibt echte Daten zurück
--      (vorher: cb('ok') → NUI hatte botStatus = "ok" → OFFLINE)
--   ✅ getLogs NUI Callback gibt echte Daten zurück
--   ✅ Status-Cache auf Client-Seite — kein Race Condition mehr
--   ✅ Panel open schickt sofort gecachten Status an NUI
--   ✅ Server-Events updaten den Cache UND die NUI gleichzeitig
-- ============================================

local isNuiOpen = false

-- ============================================
-- 📦 CLIENT-SIDE STATE CACHE
-- FIX: NUI fetch callbacks geben direkt cached Daten zurück
-- ============================================
local cachedStatus = nil
local cachedLogs   = {}

-- ============================================
-- 🎮 NUI CONTROL
-- ============================================

local function openNui()
    if isNuiOpen then return end
    isNuiOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'show' })

    -- FIX: sofort gecachten Status schicken falls vorhanden
    if cachedStatus then
        SendNUIMessage({ action = 'updateStatus', status = cachedStatus })
    end
    if #cachedLogs > 0 then
        SendNUIMessage({ action = 'updateLogs', logs = cachedLogs })
    end
end

local function closeNui()
    if not isNuiOpen then return end
    isNuiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'hide' })
end

-- ============================================
-- 🎯 KEYBIND REGISTRATION
-- ============================================

RegisterCommand('nostrpanel', function()
    TriggerServerEvent('rde_nostr:requestPanelAccess')
end, false)

if not Config then
    print('^1[RDE-NOSTR] ERROR: Config not loaded! Check fxmanifest.lua^0')
    return
end

local keybind = Config.UI and Config.UI.keybind or 'F9'
RegisterKeyMapping('nostrpanel', 'Open Nostr Admin Panel', 'keyboard', keybind)

-- ============================================
-- 📡 NUI CALLBACKS
-- FIX: getStatus und getLogs geben jetzt direkt Daten zurück
-- kein TriggerServerEvent mehr nötig — Cache wird durch
-- Server-Events aktuell gehalten
-- ============================================

RegisterNUICallback('closePanel', function(data, cb)
    closeNui()
    cb('ok')
end)

RegisterNUICallback('postLog', function(data, cb)
    TriggerServerEvent('rde_nostr:postLog', data.content, data.tags or {})
    cb({ success = true })
end)

-- FIX: direkt cached Status zurückgeben statt TriggerServerEvent
RegisterNUICallback('getStatus', function(data, cb)
    if cachedStatus then
        cb(cachedStatus)
    else
        -- Kein Cache — Server fragen und mit 'ok' antworten
        -- NUI kriegt Update dann über updateStatus message
        TriggerServerEvent('rde_nostr:getStatus')
        cb({ initialized = false, connectedRelays = 0, relays = 0,
             relayUrls = {}, stats = {}, npub = 'Loading...', publicKey = '' })
    end
end)

-- FIX: direkt cached Logs zurückgeben
RegisterNUICallback('getLogs', function(data, cb)
    cb(cachedLogs)
end)

-- ============================================
-- 🎨 SERVER EVENTS
-- ============================================

RegisterNetEvent('rde_nostr:openPanel', function()
    openNui()
    -- Nach dem Öffnen frischen Status holen
    TriggerServerEvent('rde_nostr:getStatus')
    TriggerServerEvent('rde_nostr:getLogs')
end)

RegisterNetEvent('rde_nostr:panelDenied', function()
    lib.notify({
        title       = 'RDE Nostr',
        description = 'Admin access required',
        type        = 'error',
        icon        = 'shield-alert',
        iconColor   = '#ef4444'
    })
end)

RegisterNetEvent('rde_nostr:success', function(message)
    SendNUIMessage({ action = 'message', message = message, type = 'success' })
    lib.notify({
        title       = 'RDE Nostr',
        description = message,
        type        = 'success',
        icon        = 'check-circle',
        iconColor   = '#10b981'
    })
end)

RegisterNetEvent('rde_nostr:error', function(message)
    SendNUIMessage({ action = 'message', message = message, type = 'error' })
    lib.notify({
        title       = 'RDE Nostr',
        description = message,
        type        = 'error',
        icon        = 'x-circle',
        iconColor   = '#ef4444'
    })
end)

-- FIX: Status cachen UND sofort an NUI schicken
RegisterNetEvent('rde_nostr:status', function(status)
    cachedStatus = status
    if isNuiOpen then
        SendNUIMessage({ action = 'updateStatus', status = status })
    end
end)

-- FIX: Logs cachen UND sofort an NUI schicken
RegisterNetEvent('rde_nostr:logs', function(logs)
    cachedLogs = logs or {}
    if isNuiOpen then
        SendNUIMessage({ action = 'updateLogs', logs = cachedLogs })
    end
end)

-- ============================================
-- 🔐 ADMIN COMMAND
-- ============================================

RegisterCommand('nostrlog', function(source, args, raw)
    if #args == 0 then
        TriggerServerEvent('rde_nostr:requestPanelAccess')
    else
        local content = table.concat(args, ' ')
        TriggerServerEvent('rde_nostr:postLog', content, {})
    end
end, false)

-- ============================================
-- 🎯 RESOURCE CLEANUP
-- ============================================

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    if isNuiOpen then closeNui() end
end)

-- ============================================
-- 📊 DEBUG COMMANDS
-- ============================================

if Config.DevMode then
    RegisterCommand('nostr_test',   function() print('[RDE-NOSTR] Testing NUI...') openNui() end, false)
    RegisterCommand('nostr_close',  function() print('[RDE-NOSTR] Closing NUI...') closeNui() end, false)
    RegisterCommand('nostr_status', function()
        print('[RDE-NOSTR] Requesting status...')
        TriggerServerEvent('rde_nostr:getStatus')
    end, false)
end

-- ============================================
-- 🎨 VISUAL FEEDBACK
-- ============================================

if Config.UI and Config.UI.showNotifications then
    RegisterNetEvent('rde_nostr:logPosted', function(content)
        if Config.DevMode then
            lib.notify({
                title       = '📡 Nostr Log',
                description = 'Log posted to Nostr',
                type        = 'info',
                icon        = 'rss',
                iconColor   = '#3b82f6',
                duration    = 3000
            })
        end
    end)
end

-- ============================================
-- 🚀 STARTUP
-- ============================================

CreateThread(function()
    Wait(5000)
    if not Config then
        print('^1[RDE-NOSTR] ERROR: Config not loaded in client!^0')
        return
    end
    if Config.DevMode then
        local kb = Config.UI and Config.UI.keybind or 'F9'
        print('^2[RDE-NOSTR] Client v1.2.4 initialized^0')
        print('^5[RDE-NOSTR] Press ' .. kb .. ' to open admin panel^0')
        print('^5[RDE-NOSTR] Or use command: /nostrpanel^0')
    end
end)
