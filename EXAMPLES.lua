-- ============================================
-- 🐉 RDE NOSTR LOG BOT | INTEGRATION EXAMPLES
-- How to use the bot in your own resources
-- ============================================

-- ============================================
-- 📋 BASIC USAGE
-- ============================================

-- Simple log message
exports['rde_nostr_log']:postLog('🎮 Player started a job!')

-- Log with tags
exports['rde_nostr_log']:postLog('💰 Big purchase detected!', {
    {'event', 'purchase'},
    {'amount', '10000'},
    {'category', 'vehicle'}
})

-- ============================================
-- 🎮 PLAYER EVENTS
-- ============================================

-- Custom player event
local function logPlayerEvent(player, action, details)
    local content = string.format('🎯 [%s] %s: %s', 
        player.name, 
        action, 
        details
    )
    
    exports['rde_nostr_log']:postLog(content, {
        {'player', player.identifier},
        {'action', action}
    })
end

-- Example: Job start
RegisterNetEvent('job:started', function(jobName)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    logPlayerEvent(player, 'Job Started', jobName)
end)

-- ============================================
-- 💰 ECONOMY TRACKING
-- ============================================

-- Money transactions
local function logTransaction(player, transactionType, amount, reason)
    local content = string.format('💵 %s | %s: $%d | %s',
        player.name,
        transactionType,
        amount,
        reason
    )
    
    exports['rde_nostr_log']:postLog(content, {
        {'transaction', transactionType},
        {'amount', tostring(amount)},
        {'player', player.identifier}
    })
end

-- Example: Shop purchase
RegisterNetEvent('shop:purchase', function(itemName, price)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    logTransaction(player, 'Purchase', price, itemName)
end)

-- ============================================
-- 🚗 VEHICLE EVENTS
-- ============================================

-- Vehicle spawning
RegisterNetEvent('vehicle:spawned', function(model, plate)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    local content = string.format('🚗 %s spawned vehicle: %s [%s]',
        player.name,
        model,
        plate
    )
    
    exports['rde_nostr_log']:postLog(content, {
        {'event', 'vehicle_spawn'},
        {'model', model},
        {'plate', plate},
        {'player', player.identifier}
    })
end)

-- Vehicle impound
RegisterNetEvent('vehicle:impounded', function(plate, reason)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    local content = string.format('🚓 Vehicle impounded: [%s] | Reason: %s | Officer: %s',
        plate,
        reason,
        player.name
    )
    
    exports['rde_nostr_log']:postLog(content, {
        {'event', 'vehicle_impound'},
        {'plate', plate},
        {'reason', reason},
        {'officer', player.identifier}
    })
end)

-- ============================================
-- 🏪 BUSINESS LOGS
-- ============================================

-- Business opening
RegisterNetEvent('business:opened', function(businessName)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    exports['rde_nostr_log']:postLog(
        string.format('🏪 %s opened business: %s', player.name, businessName),
        {
            {'event', 'business_open'},
            {'business', businessName},
            {'owner', player.identifier}
        }
    )
end)

-- Sales tracking
RegisterNetEvent('business:sale', function(businessName, amount, customer)
    exports['rde_nostr_log']:postLog(
        string.format('💰 Sale: $%d at %s | Customer: %s', amount, businessName, customer),
        {
            {'event', 'business_sale'},
            {'business', businessName},
            {'amount', tostring(amount)}
        }
    )
end)

-- ============================================
-- 🔫 CRIME LOGS
-- ============================================

-- Crime committed
RegisterNetEvent('crime:committed', function(crimeType, severity)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    local severityIcon = severity == 'high' and '🚨' or severity == 'medium' and '⚠️' or 'ℹ️'
    
    exports['rde_nostr_log']:postLog(
        string.format('%s Crime: %s | Suspect: %s | Severity: %s',
            severityIcon,
            crimeType,
            player.name,
            severity
        ),
        {
            {'event', 'crime'},
            {'crime_type', crimeType},
            {'severity', severity},
            {'suspect', player.identifier}
        }
    )
end)

-- Arrest
RegisterNetEvent('police:arrest', function(suspectId, charges)
    local officer = Ox.GetPlayer(source)
    local suspect = Ox.GetPlayer(suspectId)
    
    if not officer or not suspect then return end
    
    exports['rde_nostr_log']:postLog(
        string.format('🚓 Arrest: %s arrested %s | Charges: %s',
            officer.name,
            suspect.name,
            table.concat(charges, ', ')
        ),
        {
            {'event', 'arrest'},
            {'officer', officer.identifier},
            {'suspect', suspect.identifier},
            {'charges', table.concat(charges, ',')}
        }
    )
end)

-- ============================================
-- 🏥 MEDICAL LOGS
-- ============================================

-- Death
RegisterNetEvent('medical:death', function(cause)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    exports['rde_nostr_log']:postLog(
        string.format('💀 %s died | Cause: %s', player.name, cause),
        {
            {'event', 'death'},
            {'cause', cause},
            {'player', player.identifier}
        }
    )
end)

-- Revive
RegisterNetEvent('medical:revive', function(patientId)
    local medic = Ox.GetPlayer(source)
    local patient = Ox.GetPlayer(patientId)
    
    if not medic or not patient then return end
    
    exports['rde_nostr_log']:postLog(
        string.format('🏥 %s revived %s', medic.name, patient.name),
        {
            {'event', 'revive'},
            {'medic', medic.identifier},
            {'patient', patient.identifier}
        }
    )
end)

-- ============================================
-- 🎯 ACHIEVEMENT LOGS
-- ============================================

-- Achievement unlocked
RegisterNetEvent('achievement:unlocked', function(achievementName, rarity)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    local rarityIcon = rarity == 'legendary' and '🏆' or rarity == 'rare' and '⭐' or '🎖️'
    
    exports['rde_nostr_log']:postLog(
        string.format('%s Achievement Unlocked: %s | Player: %s | Rarity: %s',
            rarityIcon,
            achievementName,
            player.name,
            rarity
        ),
        {
            {'event', 'achievement'},
            {'achievement', achievementName},
            {'rarity', rarity},
            {'player', player.identifier}
        }
    )
end)

-- ============================================
-- 🏭 FACTORY/CRAFTING LOGS
-- ============================================

-- Crafting
RegisterNetEvent('crafting:complete', function(item, quantity, quality)
    local player = Ox.GetPlayer(source)
    if not player then return end
    
    exports['rde_nostr_log']:postLog(
        string.format('🔨 Crafted: %dx %s | Quality: %s%% | Crafter: %s',
            quantity,
            item,
            quality,
            player.name
        ),
        {
            {'event', 'crafting'},
            {'item', item},
            {'quantity', tostring(quantity)},
            {'quality', tostring(quality)}
        }
    )
end)

-- ============================================
-- 🎪 EVENT LOGS
-- ============================================

-- Server event started
RegisterNetEvent('event:started', function(eventName, participants)
    exports['rde_nostr_log']:postLog(
        string.format('🎪 Event Started: %s | Participants: %d',
            eventName,
            #participants
        ),
        {
            {'event', 'server_event'},
            {'event_name', eventName},
            {'participants', tostring(#participants)}
        }
    )
end)

-- Event winner
RegisterNetEvent('event:winner', function(eventName, winnerId, prize)
    local winner = Ox.GetPlayer(winnerId)
    if not winner then return end
    
    exports['rde_nostr_log']:postLog(
        string.format('🏆 Event Winner: %s won %s! Prize: $%d',
            winner.name,
            eventName,
            prize
        ),
        {
            {'event', 'event_winner'},
            {'event_name', eventName},
            {'winner', winner.identifier},
            {'prize', tostring(prize)}
        }
    )
end)

-- ============================================
-- 🛡️ ADMIN ACTION LOGS
-- ============================================

-- Kick
RegisterCommand('kick', function(source, args, raw)
    if not IsPlayerAceAllowed(source, 'admin') then return end
    
    local admin = Ox.GetPlayer(source)
    local targetId = tonumber(args[1])
    local reason = table.concat(args, ' ', 2)
    
    if targetId then
        local target = Ox.GetPlayer(targetId)
        if target then
            exports['rde_nostr_log']:postLog(
                string.format('🔨 Kick: %s kicked %s | Reason: %s',
                    admin.name,
                    target.name,
                    reason
                ),
                {
                    {'event', 'admin_kick'},
                    {'admin', admin.identifier},
                    {'target', target.identifier},
                    {'reason', reason}
                }
            )
            
            DropPlayer(targetId, reason)
        end
    end
end, true)

-- Ban
RegisterCommand('ban', function(source, args, raw)
    if not IsPlayerAceAllowed(source, 'admin') then return end
    
    local admin = Ox.GetPlayer(source)
    local targetId = tonumber(args[1])
    local duration = args[2] or 'permanent'
    local reason = table.concat(args, ' ', 3)
    
    if targetId then
        local target = Ox.GetPlayer(targetId)
        if target then
            exports['rde_nostr_log']:postLog(
                string.format('⛔ Ban: %s banned %s | Duration: %s | Reason: %s',
                    admin.name,
                    target.name,
                    duration,
                    reason
                ),
                {
                    {'event', 'admin_ban'},
                    {'admin', admin.identifier},
                    {'target', target.identifier},
                    {'duration', duration},
                    {'reason', reason}
                }
            )
            
            -- Your ban logic here
        end
    end
end, true)

-- ============================================
-- 📊 STATISTICS LOGS
-- ============================================

-- Server statistics (every hour)
CreateThread(function()
    while true do
        Wait(3600000) -- 1 hour
        
        local playerCount = GetNumPlayerIndices()
        local uptime = os.time() - GetConvar('server_start_time', os.time())
        
        exports['rde_nostr_log']:postLog(
            string.format('📊 Hourly Stats | Players: %d | Uptime: %dh',
                playerCount,
                math.floor(uptime / 3600)
            ),
            {
                {'event', 'server_stats'},
                {'players', tostring(playerCount)},
                {'uptime', tostring(uptime)}
            }
        )
    end
end)

-- ============================================
-- 🎨 CUSTOM FORMATTING
-- ============================================

-- Helper function for formatted logs
local function createFormattedLog(template, data, tags)
    local content = template
    
    for key, value in pairs(data) do
        content = content:gsub('{' .. key .. '}', value)
    end
    
    exports['rde_nostr_log']:postLog(content, tags or {})
end

-- Example usage
RegisterNetEvent('custom:event', function()
    local player = Ox.GetPlayer(source)
    
    createFormattedLog(
        '🎯 {player} completed {action} and earned ${reward}!',
        {
            player = player.name,
            action = 'Special Mission',
            reward = '5000'
        },
        {
            {'event', 'mission_complete'},
            {'player', player.identifier}
        }
    )
end)

-- ============================================
-- 🔔 NOTIFICATION SYSTEM
-- ============================================

-- Send important logs with notifications
local function logWithNotification(message, tags, notifyAdmins)
    -- Log to Nostr
    exports['rde_nostr_log']:postLog(message, tags)
    
    -- Notify admins in-game
    if notifyAdmins then
        local players = GetPlayers()
        for _, playerId in ipairs(players) do
            if IsPlayerAceAllowed(playerId, 'admin') then
                TriggerClientEvent('ox_lib:notify', playerId, {
                    title = '📡 Nostr Log',
                    description = message,
                    type = 'info',
                    icon = 'rss'
                })
            end
        end
    end
end

-- Example usage
RegisterNetEvent('important:event', function()
    logWithNotification(
        '🚨 Critical Event: Server restart in 5 minutes!',
        {{'event', 'server_restart'}},
        true -- Notify admins
    )
end)

-- ============================================
-- 💡 PRO TIPS
-- ============================================

--[[
    
    1. Use consistent tagging:
       - Always include 'event' tag with event type
       - Include 'player' tag for player-related events
       - Use descriptive tag names
    
    2. Format your logs nicely:
       - Use emojis for visual categorization
       - Keep messages concise but informative
       - Include relevant data (amounts, names, etc.)
    
    3. Don't spam:
       - Use batch processing for high-frequency events
       - Consider logging only important events
       - Use rate limiting if needed
    
    4. Security:
       - Never log sensitive data (passwords, private keys)
       - Sanitize user input before logging
       - Use appropriate tags for filtering
    
    5. Performance:
       - Async operations don't block server
       - Batch processing reduces relay load
       - Use exports efficiently
    
]]

-- ============================================
-- 📚 EXPORT REFERENCE
-- ============================================

--[[
    
    Available exports:
    
    1. postLog(content, tags)
       - content: string - The log message
       - tags: table - Array of tag arrays
       - Example: exports['rde_nostr_log']:postLog('Test', {{'event', 'test'}})
    
    2. postEvent(eventType, player, extraData)
       - eventType: string - Event template name
       - player: table - Player object with name, identifier
       - extraData: table - Additional template variables
       - Example: exports['rde_nostr_log']:postEvent('player_connected', player, {playerCount = 50})
    
    3. getBotPubkey()
       - Returns: string - Bot's public key (hex)
       - Example: local pubkey = exports['rde_nostr_log']:getBotPubkey()
    
    4. getBotNpub()
       - Returns: string - Bot's npub (Nostr public key)
       - Example: local npub = exports['rde_nostr_log']:getBotNpub()
    
]]
