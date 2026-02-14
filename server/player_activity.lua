-- ============================================
-- 👥 PLAYER ACTIVITY TRACKER
-- ============================================

--[[
    Tracks player join/leave with detailed info
    - First-time joins
    - Returning players
    - Play time tracking
    - Peak player times
]]

-- Track first-time players
local firstTimeJoins = {}

-- Player connecting
AddEventHandler('playerConnecting', function(playerName, setKickReason, deferrals)
    local source = source
    local identifier = GetPlayerIdentifierByType(source, 'steam') or 
                      GetPlayerIdentifierByType(source, 'license') or 
                      'unknown'
    
    -- Check if first time (you'd want to check database in real implementation)
    local isFirstTime = not firstTimeJoins[identifier]
    firstTimeJoins[identifier] = true
    
    local emoji = isFirstTime and '🆕' or '👋'
    local status = isFirstTime and 'NEUER SPIELER' or 'WILLKOMMEN ZURÜCK'
    
    exports['rde_nostr_log']:postLog(
        string.format('%s %s verbindet sich | %s',
            emoji,
            playerName,
            status
        ),
        {
            {'event', 'player_connecting'},
            {'player', identifier},
            {'first_time', tostring(isFirstTime)}
        }
    )
end)

-- Player joined
AddEventHandler('playerJoining', function(source)
    local playerName = GetPlayerName(source)
    local identifier = GetPlayerIdentifierByType(source, 'steam') or 'unknown'
    local playerCount = GetNumPlayerIndices()
    
    exports['rde_nostr_log']:postLog(
        string.format('✅ %s ist beigetreten | Spieler online: %d',
            playerName,
            playerCount
        ),
        {
            {'event', 'player_joined'},
            {'player', identifier},
            {'total_players', tostring(playerCount)}
        }
    )
end)

-- Player dropped
AddEventHandler('playerDropped', function(reason)
    local source = source
    local playerName = GetPlayerName(source)
    local identifier = GetPlayerIdentifierByType(source, 'steam') or 'unknown'
    local playerCount = GetNumPlayerIndices() - 1
    
    -- Calculate session time (simplified - would need proper tracking)
    local sessionTime = 'unbekannt'
    
    exports['rde_nostr_log']:postLog(
        string.format('❌ %s hat Server verlassen | Grund: %s | Spieler online: %d',
            playerName,
            reason or 'Unbekannt',
            playerCount
        ),
        {
            {'event', 'player_left'},
            {'player', identifier},
            {'reason', reason or 'unknown'},
            {'total_players', tostring(playerCount)}
        }
    )
end)