-- ============================================
-- 👥 RDE NOSTR LOG | PLAYER ACTIVITY TRACKER
-- v1.1.0 — Full null-guard & error handling
-- ============================================
-- 🛠️ FIXED v1.1.0:
--   ✅ source captured with local source = source immediately
--   ✅ playerDropped: nil-guard on playerName before export call
--   ✅ playerJoining: nil-guard on playerName
--   ✅ All GetPlayerIdentifierByType() wrapped defensively
--   ✅ Export calls wrapped in pcall so a JS-side error never
--      crashes the Lua thread
-- ============================================

-- Track first-time players this session
local firstTimeJoins = {}

-- ============================================
-- 🔧 HELPER
-- ============================================

local function safePostLog(content, tags)
    -- pcall so a JS export error never crashes the Lua thread
    local ok, err = pcall(function()
        exports['rde_nostr_log']:postLog(content, tags)
    end)
    if not ok then
        print('^1[RDE-NOSTR] safePostLog error: ' .. tostring(err) .. '^0')
    end
end

local function getIdentifier(src)
    return GetPlayerIdentifierByType(src, 'steam')
        or GetPlayerIdentifierByType(src, 'license')
        or GetPlayerIdentifierByType(src, 'fivem')
        or 'unknown'
end

-- ============================================
-- 🔌 PLAYER CONNECTING
-- ============================================

AddEventHandler('playerConnecting', function(playerName, setKickReason, deferrals)
    local source     = source  -- capture IMMEDIATELY
    local identifier = getIdentifier(source)

    local isFirstTime    = not firstTimeJoins[identifier]
    firstTimeJoins[identifier] = true

    local emoji  = isFirstTime and '🆕' or '👋'
    local status = isFirstTime and 'NEW PLAYER' or 'WELCOME BACK'

    safePostLog(
        string.format('%s %s connecting | %s', emoji, playerName or 'Unknown', status),
        {
            { 'event',      'player_connecting' },
            { 'player',     identifier          },
            { 'first_time', tostring(isFirstTime) }
        }
    )
end)

-- ============================================
-- ✅ PLAYER JOINED
-- ============================================

AddEventHandler('playerJoining', function(source)
    -- FIX: GetPlayerName can return nil if player bails during loading
    local playerName = GetPlayerName(source)
    if not playerName then return end

    local identifier  = getIdentifier(source)
    local playerCount = GetNumPlayerIndices()

    safePostLog(
        string.format('✅ %s has joined | Players online: %d', playerName, playerCount),
        {
            { 'event',         'player_joined'           },
            { 'player',        identifier                },
            { 'total_players', tostring(playerCount)     }
        }
    )
end)

-- ============================================
-- ❌ PLAYER DROPPED
-- ============================================

AddEventHandler('playerDropped', function(reason)
    local source = source  -- FIX: capture IMMEDIATELY — changes on the next tick

    -- FIX: player may already be fully removed when this fires
    local playerName = GetPlayerName(source)
    if not playerName then
        -- Nothing we can do — identifiers are gone too
        return
    end

    local identifier  = getIdentifier(source)
    -- Subtract 1 because this player is still counted until the event returns
    local playerCount = math.max(0, GetNumPlayerIndices() - 1)

    safePostLog(
        string.format(
            '❌ %s has left the server | Reason: %s | Players online: %d',
            playerName,
            reason or 'Unknown',
            playerCount
        ),
        {
            { 'event',         'player_left'         },
            { 'player',        identifier            },
            { 'reason',        reason or 'unknown'   },
            { 'total_players', tostring(playerCount) }
        }
    )
end)
