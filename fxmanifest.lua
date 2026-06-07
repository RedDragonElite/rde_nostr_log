-- ============================================
-- 🐉 RED DRAGON ELITE | NOSTR LOG BOT
-- Dezentraler Server-Log über Nostr
-- Author: RDE | SerpentsByte (Shin)
-- Website: https://rd-elite.com
-- ============================================

fx_version 'cerulean'
game 'gta5'

name 'rde_nostr_log'
author 'RDE | SerpentsByte (Shin)'
description '🐉 Dezentraler FiveM Log-Bot über Nostr - Unzensierbar, Dezentral, Frei'
version '1.2.4'

-- 🎯 Core Dependencies
dependencies {
    'ox_core',
    'ox_lib'
}

-- 🌍 Shared Configuration (both client & server)
shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

-- 🧠 Server-Side Logic (Node.js für nostr-tools)
server_scripts {
    'server.js',
	'server/player_activity.lua'
}

-- 🎨 Client-Side NUI Handler
client_scripts {
    'client.lua'
}

-- 🎨 Optional Admin NUI
ui_page 'nui/index.html'

files {
    'nui/index.html',
    'nui/script.js',
    'nui/nostr-tools.bundle.js'
}

-- 📦 Exports für andere Resources
exports {
    'postLog',
    'postEvent',
    'getBotPubkey',
    'getBotNpub'
}

server_exports {
    'postLog',
    'postEvent',
    'getBotPubkey',
    'getBotNpub'
}
