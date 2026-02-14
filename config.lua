-- ============================================
-- 🐉 RDE NOSTR LOG BOT | CONFIGURATION
-- Ultra-realistic Server-Logging via Nostr
-- ============================================

Config = {}

-- 🌐 LOCALIZATION SETTINGS
Config.DefaultLanguage = 'en' -- Options: 'en', 'de'

Config.Languages = {
    en = {
        -- 🎯 General
        success = '✅ Success',
        error = '❌ Error',
        warning = '⚠️ Warning',
        info = 'ℹ️ Information',
        
        -- 🔐 Bot Status
        bot_starting = '🤖 Nostr Bot starting...',
        bot_ready = '✅ Nostr Bot ready!',
        bot_error = '❌ Bot error',
        relay_connected = '📡 Relay connected',
        relay_disconnected = '📡 Relay disconnected',
        relay_error = '❌ Relay error',
        
        -- 📝 Logging
        log_posted = '📤 Log posted to Nostr',
        log_failed = '❌ Log posting failed',
        event_logged = '📋 Event logged',
        
        -- 🛡️ Admin
        admin_only = '👑 Admin access required',
        no_permission = '🚫 No permission',
        manual_post_sent = '📤 Manual post sent',
        
        -- 🎮 Events
        player_connecting = '🔌 Player connecting',
        player_connected = '✅ Player connected',
        player_disconnected = '❌ Player disconnected',
        player_died = '💀 Player died',
        vehicle_spawned = '🚗 Vehicle spawned',
        weapon_given = '🔫 Weapon given',
        money_changed = '💰 Money changed',
        
        -- 🌍 UI
        admin_panel = '👑 Admin Panel',
        post_log = '📤 Post Log',
        view_logs = '📋 View Logs',
        bot_status = '🤖 Bot Status',
        relay_status = '📡 Relay Status',
        post_content = '📝 Content',
        send = '📤 Send',
        cancel = '🚫 Cancel'
    },
    
    de = {
        -- 🎯 Allgemein
        success = '✅ Erfolg',
        error = '❌ Fehler',
        warning = '⚠️ Warnung',
        info = 'ℹ️ Information',
        
        -- 🔐 Bot Status
        bot_starting = '🤖 Nostr Bot startet...',
        bot_ready = '✅ Nostr Bot bereit!',
        bot_error = '❌ Bot Fehler',
        relay_connected = '📡 Relay verbunden',
        relay_disconnected = '📡 Relay getrennt',
        relay_error = '❌ Relay Fehler',
        
        -- 📝 Logging
        log_posted = '📤 Log auf Nostr gepostet',
        log_failed = '❌ Log-Post fehlgeschlagen',
        event_logged = '📋 Event geloggt',
        
        -- 🛡️ Admin
        admin_only = '👑 Admin-Zugriff erforderlich',
        no_permission = '🚫 Keine Berechtigung',
        manual_post_sent = '📤 Manueller Post gesendet',
        
        -- 🎮 Events
        player_connecting = '🔌 Spieler verbindet sich',
        player_connected = '✅ Spieler verbunden',
        player_disconnected = '❌ Spieler getrennt',
        player_died = '💀 Spieler gestorben',
        vehicle_spawned = '🚗 Fahrzeug gespawnt',
        weapon_given = '🔫 Waffe gegeben',
        money_changed = '💰 Geld geändert',
        
        -- 🌍 UI
        admin_panel = '👑 Admin Panel',
        post_log = '📤 Log posten',
        view_logs = '📋 Logs ansehen',
        bot_status = '🤖 Bot Status',
        relay_status = '📡 Relay Status',
        post_content = '📝 Inhalt',
        send = '📤 Senden',
        cancel = '🚫 Abbrechen'
    }
}

-- 🎨 Helper function
function GetLanguageString(key)
    local lang = Config.Languages[Config.DefaultLanguage]
    return lang[key] or key
end

-- ============================================
-- 🔐 NOSTR CONFIGURATION
-- ============================================

Config.Nostr = {
    -- 🔑 Bot Credentials (KEEP SECRET!)
    -- Generate offline: https://nostr.how/en/guides/setup-nostr-keys
    -- Or leave empty to auto-generate on first start
    privateKey = '', -- WARNING DO NOT PUT NSEC HERE USE SERVER.JS!! | nsec1... or hex format
    
    -- 📡 Relay Configuration
    relays = {
        'wss://relay.damus.io',
        'wss://nos.lol',
        'wss://relay.snort.social',
        'wss://nostr.wine',
        'wss://relay.primal.net'
    },
    
    -- ⏱️ Retry Configuration
    reconnectDelay = 5000, -- ms
    maxReconnectAttempts = 10,
    publishTimeout = 10000, -- ms
    
    -- 🏷️ Default Tags
    defaultTags = {
        {'t', 'RedDragonElite'},
        {'t', 'FiveM'},
        {'t', 'ServerLog'},
        {'server', GetConvar('sv_hostname', 'Unknown Server')}
    },
    
    -- 📊 Log Level (what gets posted)
    logLevel = {
        player_connect = true,
        player_disconnect = true,
        player_death = true,
        vehicle_spawn = false, -- can be spammy
        weapon_give = true,
        money_change = true,
        admin_action = true,
        custom = true
    },
    
    -- 🔄 Batch Processing (reduces relay spam)
    batchEnabled = true,
    batchInterval = 5000, -- ms (post every 5 seconds)
    batchMaxSize = 10 -- max events per batch
}

-- ============================================
-- 🛡️ ADMIN CONFIGURATION (Triple Verification)
-- ============================================

Config.AdminSystem = {
    -- Method 1: ACE Permissions (Most secure!)
    acePermission = 'rde.nostr.admin', -- add_ace group.admin rde.nostr.admin allow
    
    -- Method 2: Steam IDs (Fallback)
    steamIds = {
        'steam:110000101605859', -- SerpentsByte
        'steam:110000000000001', -- Add your Steam ID here
    },
    
    -- Method 3: ox_core Groups
    oxGroups = {
        ['admin'] = 0,
        ['superadmin'] = 0,
        ['management'] = 0
    },
    
    -- 🎯 Check Priority
    checkOrder = {'ace', 'oxcore', 'steam'}
}

-- ============================================
-- 🎨 UI CONFIGURATION (Admin Panel)
-- ============================================

Config.UI = {
    -- 🎨 Theme Colors (matching AETHER aesthetic)
    colors = {
        primary = '#ff0041',
        secondary = '#00ffff',
        accent = '#ff00ff',
        bg = '#000000',
        bgSecondary = '#0a0a0a',
        bgTertiary = '#121212',
        text = '#ff0041',
        textDim = '#aa002b',
        border = '#ff004133',
        glow = '#ff004188',
        success = '#0f0',
        warning = '#ff0',
        error = '#f00'
    },
    
    -- 🎮 Keybind to open Admin Panel
    keybind = 'F5', -- Change as needed
    
    -- 📊 Display Settings
    maxLogsShown = 50, -- max logs in UI
    autoRefresh = true,
    refreshInterval = 10000, -- ms
    
    -- 🔔 Notifications
    showNotifications = false -- Show notification when logs are posted (dev only)
}

-- ============================================
-- 📋 EVENT LOGGING TEMPLATES
-- ============================================

Config.EventTemplates = {
    player_connecting = '🔌 {name} ({identifier}) verbindet sich...',
    player_connected = '✅ {name} ist beigetreten | Spieler: {playerCount}',
    player_disconnected = '❌ {name} hat den Server verlassen | Grund: {reason}',
    player_died = '💀 {name} ist gestorben | Killer: {killer}',
    vehicle_spawned = '🚗 {name} spawned Fahrzeug: {model}',
    weapon_given = '🔫 {name} erhielt Waffe: {weapon}',
    money_added = '💰 {name} erhielt ${amount} ({account})',
    money_removed = '💸 {name} verlor ${amount} ({account})',
    admin_command = '👑 [ADMIN] {name}: {command}',
    custom = '📋 {message}'
}

-- ============================================
-- ⚡ PERFORMANCE SETTINGS
-- ============================================

Config.Performance = {
    -- 🔄 Update Intervals
    statusUpdateInterval = 60000, -- Update bot status every minute
    
    -- 📦 Batch Processing
    enableBatching = true,
    batchSize = 10,
    batchTimeout = 5000,
    
    -- 🛡️ Rate Limiting
    rateLimit = {
        enabled = true,
        maxPerMinute = 30,
        burstAllowed = 5
    },
    
    -- 💾 Log Storage (optional - for UI history)
    storeLogsInMemory = true,
    maxStoredLogs = 100
}

-- ============================================
-- 🎯 CUSTOM EVENT HOOKS
-- ============================================

-- You can add custom events to log here
Config.CustomEvents = {
    -- Example: Log when players enter specific zones
    -- ['zone:enter'] = function(player, zone)
    --     return string.format('🗺️ %s entered zone: %s', player.name, zone)
    -- end,
    
    -- Example: Log shop purchases
    -- ['shop:purchase'] = function(player, item, price)
    --     return string.format('🛒 %s bought %s for $%d', player.name, item, price)
    -- end
}

-- ============================================
-- 🔐 SECURITY SETTINGS
-- ============================================

Config.Security = {
    -- 🚫 Prevent private key exposure
    neverExposePrivateKey = true,
    
    -- 🛡️ Sanitize logs (remove sensitive data)
    sanitizeLogs = true,
    sanitizePatterns = {
        '%d%d%d%d%-%d%d%d%d%-%d%d%d%d%-%d%d%d%d', -- Credit card patterns
        'password[%s:=]+%S+', -- Password patterns
        'token[%s:=]+%S+', -- Token patterns
    },
    
    -- 📡 Relay Verification
    verifyRelays = true,
    allowedRelayDomains = {
        'damus.io',
        'nos.lol',
        'snort.social',
        'nostr.wine',
        'primal.net'
    }
}

-- ============================================
-- 🎮 DEVELOPMENT MODE
-- ============================================

Config.DevMode = false -- Set to true for verbose logging

-- ============================================
-- 📊 STATISTICS TRACKING
-- ============================================

Config.Stats = {
    enabled = true,
    trackMetrics = {
        totalLogsSent = true,
        totalErrors = true,
        relayUptime = true,
        averagePostTime = true
    }
}

return Config