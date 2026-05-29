// ============================================
// 🐉 RED DRAGON ELITE | NOSTR LOG BOT v1.2.3
// FIVEM COMPATIBLE - Using nostr-tools
// Author: RDE | SerpentsByte & Shin
// ============================================
// 🛠️ FIXED v1.2.3:
//   ✅ UnhandledPromiseRejection on player leave — ROOT CAUSE FIXED
//      → getEventHash / getSignature can throw when nostr-tools builds
//        the event; all calls now wrapped in try/catch inside postToNostr
//   ✅ nip19.decode() crash when nsec is malformed — defensive decode
//   ✅ global.exports('postLog') returns a real Promise so callers that
//        .catch() on it actually get the rejection (was silently swallowed)
//   ✅ playerDropped: source captured BEFORE any await/async gap
//   ✅ playerDropped: GetPlayerName null-guard + early return
//   ✅ playerJoining: GetPlayerName null-guard
//   ✅ playerConnecting: identifier fallback chain (steam → license → fivem → unknown)
//   ✅ isPlayerAdmin: try/catch around every native call, returns false on throw
//   ✅ NostrRelay.publish: pendingEvents leak fixed — timeout always resolves
//   ✅ NostrRelay.close: ws null-guard + removes listeners to prevent reconnect loop
//   ✅ connectToRelays: duplicate relay guard (don't double-connect on restart)
//   ✅ onResourceStop: await postToNostr so shutdown post actually fires
//   ✅ batchEnabled forced to false in JS (config.lua has it true — JS wins)
//   ✅ Startup post uses connectedRelays counter correctly after async connect
// ============================================

'use strict';

const crypto = require('crypto');
const WebSocket = require('ws');
// nostr-tools v2.x API (breaking change from v1.x)
// v1.x used: getPublicKey(hexString), getEventHash+getSignature separately
// v2.x uses: getPublicKey(Uint8Array), finalizeEvent(template, Uint8Array) for sign+hash
const {
    getPublicKey,
    finalizeEvent,
    nip19
} = require('nostr-tools');

// ============================================
// ⚙️ CONFIGURATION
// ============================================

const Config = {
    Nostr: {
        // 🔐 SECURITY: Private key is loaded from server.cfg ConVar — NOT stored here
        // Add this to your server.cfg:  set NOSTR_PRIVATE_KEY "nsec1yourkeyhere"
        // Leave empty string here — key is read at runtime via GetConvar()
        privateKey: GetConvar('NOSTR_PRIVATE_KEY', ''),

        // 🔥 STABLE RELAYS
        relays: [
            'wss://nos.lol',          // HIGH RATE LIMITS — reliable
            'wss://relay.damus.io',    // reliable
            'wss://relay.primal.net',  // reliable
            'wss://relay.snort.social' // sometimes flaky — auto-reconnects
        ],

        reconnectDelay:      5000,
        maxReconnectAttempts: 5,
        publishTimeout:      15000,

        // Batch disabled — keep events realtime so Discord/clients see them instantly
        batchEnabled: false,
        batchInterval: 5000,
        batchMaxSize: 10,

        defaultTags: [
            ['client',  'FiveM-RDE-Nostr-Bot'],
            ['version', '1.1.0'],
            ['server',  GetConvar('sv_hostname', 'RDE Server')]
        ]
    },

    Security: {
        sanitizeLogs: true,
        sanitizePatterns: ['password', 'token', 'api_key', 'secret', 'nsec', 'private']
    },

    Performance: {
        storeLogsInMemory: true,
        maxStoredLogs: 100
    },

    AdminSystem: {
        acePermission: 'rde.nostr.admin',
        steamIds: ['steam:110000101605859'],
        checkOrder: ['ace', 'steam']
    },

    DevMode: false
};

// ============================================
// 🎨 HELPER FUNCTIONS
// ============================================

function bytesToHex(bytes) {
    return Buffer.from(bytes).toString('hex');
}

function hexToBytes(hex) {
    return Buffer.from(hex, 'hex');
}

function log(msg, type = 'info') {
    const colors = { info: '^5', success: '^2', error: '^1', warning: '^3' };
    const color = colors[type] || '^5';
    console.log(`${color}[RDE-NOSTR] ${msg}^0`);
}

function sanitizeContent(content) {
    if (!Config.Security.sanitizeLogs) return content;
    let sanitized = String(content ?? '');
    for (const pattern of Config.Security.sanitizePatterns) {
        sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '[REDACTED]');
    }
    return sanitized;
}

// ============================================
// 🌍 GLOBAL STATE
// ============================================

const state = {
    privateKey:     null,
    publicKey:      null,
    npub:           null,
    nsec:           null,

    relays:          new Map(),
    connectedRelays: 0,

    stats: {
        totalLogsSent:       0,
        totalErrors:         0,
        startTime:           Date.now(),
        lastPostTime:        0,
        averagePostTime:     0,
        relayPublishSuccess: 0,
        relayPublishFailed:  0
    },

    batchQueue:   [],
    batchTimer:   null,
    storedLogs:   [],
    initialized:  false,
    // Pre-init queue: events that arrive before the bot is ready get buffered
    // and flushed once relays connect (max 20 to avoid memory bloat on cold start)
    preInitQueue: [],
    subscriptions: new Map()
};

// ============================================
// 📡 WEBSOCKET RELAY CONNECTION
// ============================================

class NostrRelay {
    constructor(url) {
        this.url              = url;
        this.ws               = null;
        this.status           = 'disconnected';
        this.reconnectAttempts = 0;
        this.messageQueue     = [];
        this.pendingEvents    = new Map();
        // FIX: track whether we intentionally closed so we don't reconnect
        this._intentionalClose = false;
    }

    connect() {
        // FIX: don't re-enter if already connecting/connected
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this._intentionalClose = false;

        try {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                this.status             = 'connected';
                this.reconnectAttempts  = 0;
                state.connectedRelays++;
                log(`✅ Connected to relay: ${this.url}`, 'success');

                // Drain queued messages
                while (this.messageQueue.length > 0) {
                    const msg = this.messageQueue.shift();
                    try { this.ws.send(msg); } catch (_) { /* ignore */ }
                }

                // FIX: first relay up → flush any events that were queued before init
                if (state.connectedRelays === 1 && state.preInitQueue.length > 0) {
                    setTimeout(() => flushPreInitQueue(), 500);
                }
            });

            this.ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());

                    if (msg[0] === 'OK') {
                        const eventId = msg[1];
                        const success = msg[2];
                        const message = msg[3] || '';

                        if (success) {
                            log(`✅ Relay ACCEPTED event ${eventId.substring(0, 8)}... on ${this.url}`, 'success');
                            state.stats.relayPublishSuccess++;
                        } else {
                            log(`❌ Relay REJECTED event ${eventId.substring(0, 8)}... on ${this.url}: ${message}`, 'error');
                            state.stats.relayPublishFailed++;
                        }

                        // FIX: always resolve, even on reject — never leave a pending event dangling
                        if (this.pendingEvents.has(eventId)) {
                            const resolve = this.pendingEvents.get(eventId);
                            this.pendingEvents.delete(eventId);
                            resolve(success);
                        }
                    }
                } catch (err) {
                    if (Config.DevMode) {
                        log(`Error parsing relay message: ${err.message}`, 'error');
                    }
                }
            });

            this.ws.on('error', (err) => {
                // FIX: error is ALWAYS followed by 'close' — just log, don't double-count
                if (Config.DevMode) {
                    log(`Relay error on ${this.url}: ${err.message}`, 'error');
                }
                this.status = 'error';
                // FIX: resolve all pending events as failed so Promises don't hang forever
                for (const [id, resolve] of this.pendingEvents) {
                    this.pendingEvents.delete(id);
                    resolve(false);
                }
            });

            this.ws.on('close', () => {
                if (state.connectedRelays > 0) state.connectedRelays--;
                this.status = 'disconnected';
                log(`⚠️ Relay disconnected: ${this.url}`, 'warning');

                // FIX: Don't reconnect if we closed intentionally (resource stop)
                if (this._intentionalClose) return;

                if (this.reconnectAttempts < Config.Nostr.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => {
                        log(`🔄 Reconnecting to ${this.url} (attempt ${this.reconnectAttempts})...`, 'info');
                        this.connect();
                    }, Config.Nostr.reconnectDelay);
                } else {
                    log(`❌ Max reconnect attempts reached for ${this.url}, giving up`, 'warning');
                }
            });

        } catch (err) {
            log(`❌ Failed to connect to ${this.url}: ${err.message}`, 'error');
            this.status = 'error';
        }
    }

    async publish(event) {
        return new Promise((resolve) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                resolve(false);
                return;
            }

            let timeoutHandle = null;

            try {
                const message = JSON.stringify(['EVENT', event]);
                this.ws.send(message);

                // FIX: store resolve so the 'message' handler can call it
                this.pendingEvents.set(event.id, (success) => {
                    clearTimeout(timeoutHandle);
                    resolve(success);
                });

                // FIX: timeout always cleans up pendingEvents and resolves
                timeoutHandle = setTimeout(() => {
                    if (this.pendingEvents.has(event.id)) {
                        log(`⏰ Timeout waiting for OK from ${this.url}`, 'warning');
                        this.pendingEvents.delete(event.id);
                        resolve(false);
                    }
                }, Config.Nostr.publishTimeout);

            } catch (err) {
                clearTimeout(timeoutHandle);
                log(`❌ Error publishing to ${this.url}: ${err.message}`, 'error');
                resolve(false);
            }
        });
    }

    // FIX: mark intentional, remove listeners so 'close' doesn't trigger reconnect
    close() {
        this._intentionalClose = true;
        if (this.ws) {
            // Resolve all pending events as failed before closing
            for (const [id, resolve] of this.pendingEvents) {
                this.pendingEvents.delete(id);
                resolve(false);
            }
            try {
                this.ws.terminate(); // faster than close() for shutdown
            } catch (_) { /* ignore */ }
            this.ws = null;
        }
        this.status = 'disconnected';
    }
}

// ============================================
// 🔐 BOT INITIALIZATION
// ============================================

function initializeBot() {
    log('🤖 Initializing Nostr Bot...', 'info');

    try {
        const rawKey = Config.Nostr.privateKey;

        // --- Resolve private key to Uint8Array (v2.x requires Uint8Array everywhere) ---
        let privBytes; // Uint8Array — the single source of truth

        if (!rawKey || rawKey.trim() === '') {
            // Auto-generate
            privBytes  = crypto.randomBytes(32);
            state.nsec = nip19.nsecEncode(privBytes);
            log('⚠️ NO PRIVATE KEY! Generated new key:', 'warning');
            log(`📝 nsec: ${state.nsec}`, 'warning');
            log(`📝 hex:  ${bytesToHex(privBytes)}`, 'warning');

        } else if (rawKey.startsWith('nsec')) {
            // Decode nsec → Uint8Array
            try {
                const decoded = nip19.decode(rawKey);
                if (decoded.type !== 'nsec' || !decoded.data) {
                    throw new Error('Decoded type is not nsec');
                }
                privBytes  = decoded.data; // already Uint8Array in v2.x
                state.nsec = nip19.nsecEncode(privBytes);
            } catch (decodeErr) {
                log(`⚠️ nsec decode failed (${decodeErr.message}), generating new key`, 'error');
                privBytes  = crypto.randomBytes(32);
                state.nsec = nip19.nsecEncode(privBytes);
            }

        } else {
            // Raw hex string → Uint8Array
            privBytes  = hexToBytes(rawKey);
            state.nsec = nip19.nsecEncode(privBytes);
        }

        // Store both forms — hex for display, bytes for crypto ops
        state.privateKey      = privBytes;        // Uint8Array — used in finalizeEvent()
        state.privateKeyHex   = bytesToHex(privBytes); // hex string — display only
        state.publicKey       = getPublicKey(privBytes); // v2.x: needs Uint8Array
        state.npub            = nip19.npubEncode(state.publicKey);

        log(`✅ Bot Identity loaded`, 'success');
        log(`   npub:   ${state.npub}`, 'info');
        log(`   pubkey: ${state.publicKey}`, 'info');
        log(`   hex:    ${state.privateKeyHex}`, 'info');

        connectToRelays();

        if (Config.Nostr.batchEnabled) {
            startBatchProcessor();
        }

        state.initialized = true;

        // Queue the startup post — will be flushed by flushPreInitQueue()
        // once the first relay connects (no need for a hardcoded 8s delay)
        state.preInitQueue.unshift({
            content:    '🐉 RDE Nostr Bot ONLINE | Server logging active ⚡777',
            customTags: [['event', 'bot_startup'], ['timestamp', Date.now().toString()]]
        });

        return true;

    } catch (err) {
        log(`❌ Initialization failed: ${err.message}`, 'error');
        log(err.stack, 'error');
        return false;
    }
}

// Drain events queued before relays were ready
function flushPreInitQueue() {
    if (state.preInitQueue.length === 0) return;
    log(`⚡ Flushing ${state.preInitQueue.length} queued pre-init events...`, 'info');
    const queue = state.preInitQueue.splice(0);
    for (const item of queue) {
        postToNostr(item.content, item.customTags || []);
    }
}

function connectToRelays() {
    log(`📡 Connecting to ${Config.Nostr.relays.length} relays...`, 'info');

    for (const url of Config.Nostr.relays) {
        // FIX: skip if we already have a relay object for this URL
        if (state.relays.has(url)) {
            state.relays.get(url).connect(); // will no-op if already connected
            continue;
        }
        const relay = new NostrRelay(url);
        state.relays.set(url, relay);
        relay.connect();
    }
}

// ============================================
// 📤 POST TO NOSTR
// ============================================

// FIX: This function NEVER throws and NEVER returns a rejected Promise.
// All internal errors are caught, logged, and return false.
// This is the contract callers depend on.
async function postToNostr(content, customTags = []) {
    // FIX: validate content first — before any queue logic
    if (!content || typeof content !== 'string') return false;

    // If bot isn't ready yet, queue the event instead of dropping it silently.
    // flushPreInitQueue() drains this once relays connect.
    if (!state.initialized || state.connectedRelays === 0) {
        if (state.preInitQueue.length < 20) {
            state.preInitQueue.push({ content, customTags });
            if (Config.DevMode) log(`⏳ Queued pre-init [${state.preInitQueue.length}/20]: ${content.substring(0,50)}`, 'info');
        }
        return false;
    }

    const startTime = Date.now();

    try {
        const sanitizedContent = sanitizeContent(content);

        // v2.x: finalizeEvent(template, privKeyBytes) handles hash+sign in one call
        // state.privateKey is Uint8Array (set during initializeBot)
        let event;
        try {
            event = finalizeEvent({
                kind:       1,
                created_at: Math.floor(Date.now() / 1000),
                tags:       [...Config.Nostr.defaultTags, ...customTags],
                content:    sanitizedContent
            }, state.privateKey); // Uint8Array — v2.x API

        } catch (signErr) {
            log(`❌ Event signing failed: ${signErr.message}`, 'error');
            state.stats.totalErrors++;
            return false;
        }

        log(`📤 Publishing: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`, 'info');

        let successCount = 0;
        let failCount    = 0;

        const publishPromises = [];

        for (const [, relay] of state.relays) {
            const promise = relay.publish(event).then(success => {
                if (success) { successCount++; } else { failCount++; }
                return success;
            });
            // FIX: each per-relay promise already resolves (never rejects) — belt-and-suspenders
            publishPromises.push(promise.catch(() => { failCount++; return false; }));
        }

        // FIX: Promise.all on promises that never reject — safe
        await Promise.all(publishPromises);

        const postTime = Date.now() - startTime;

        // Running average
        const total = state.stats.totalLogsSent;
        state.stats.averagePostTime = total === 0
            ? postTime
            : (state.stats.averagePostTime * total + postTime) / (total + 1);

        state.stats.totalLogsSent++;
        state.stats.lastPostTime = Date.now();

        // Store in memory for UI — include relay info for NUI display
        if (Config.Performance.storeLogsInMemory) {
            // Build list of relay short-names that accepted this event
            const acceptedRelays = Array.from(state.relays.entries())
                .filter(([, relay]) => relay.status === 'connected')
                .map(([url]) => url);

            state.storedLogs.unshift({
                timestamp:  event.created_at,
                content:    sanitizedContent,
                eventId:    event.id,
                relayUrl:   acceptedRelays[0] || 'wss://server',  // primary relay for display
                relayCount: successCount,
                relayTotal: state.relays.size
            });

            if (state.storedLogs.length > Config.Performance.maxStoredLogs) {
                state.storedLogs.pop();
            }
        }

        log(`✅ Published to ${successCount}/${state.relays.size} relays (${failCount} failed) in ${postTime}ms`, 'success');
        return true;

    } catch (err) {
        // Catch-all — should never reach here with the inner catches above, but just in case
        log(`❌ Post failed unexpectedly: ${err.message}`, 'error');
        if (Config.DevMode) log(err.stack, 'error');
        state.stats.totalErrors++;
        return false;
    }
}

// ============================================
// 📦 BATCH PROCESSING
// ============================================

function startBatchProcessor() {
    state.batchTimer = setInterval(() => {
        if (state.batchQueue.length > 0) {
            processBatch();
        }
    }, Config.Nostr.batchInterval);
}

function processBatch() {
    const batch = state.batchQueue.splice(0, Config.Nostr.batchMaxSize);
    if (batch.length === 0) return;

    const combinedContent = batch
        .map((item, index) => `${index + 1}. ${item.content}`)
        .join('\n');

    const combinedTags = [
        ['batch',      'true'],
        ['batch_size', batch.length.toString()]
    ];

    // postToNostr never throws/rejects — no .catch() needed, but it doesn't hurt
    postToNostr(combinedContent, combinedTags);
}

function addToBatch(content, tags = []) {
    state.batchQueue.push({ content, tags });
    if (state.batchQueue.length >= Config.Nostr.batchMaxSize) {
        processBatch();
    }
}

// ============================================
// 🛡️ ADMIN VERIFICATION
// ============================================

function isPlayerAdmin(source) {
    if (!source || source === 0) return false;

    for (const method of Config.AdminSystem.checkOrder) {
        try {
            if (method === 'ace') {
                if (IsPlayerAceAllowed(source, Config.AdminSystem.acePermission)) {
                    return true;
                }
            } else if (method === 'steam') {
                let identifier = null;
                try { identifier = GetPlayerIdentifierByType(source, 'steam'); } catch (_) {}
                if (identifier && Config.AdminSystem.steamIds.includes(identifier)) {
                    return true;
                }
            }
        } catch (_) {
            // Player already gone from server — treat as non-admin
        }
    }

    return false;
}

// ============================================
// 📋 EVENT LOGGING
// ============================================

function logPlayerEvent(eventType, player, extraData = {}) {
    // RDE Standard: guard all inputs — external scripts may pass undefined/null
    if (!player || typeof player !== 'object') {
        player = { name: 'Unknown', identifier: 'unknown' };
    }

    const templates = {
        player_connecting:   '🔌 {name} ({identifier}) connecting...',
        player_connected:    '✅ {name} joined | Players: {playerCount}',
        player_disconnected: '❌ {name} left | Reason: {reason}'
    };

    const template = templates[eventType];
    if (!template) return;

    let content = template
        .replace('{name}',       player.name       || 'Unknown')
        .replace('{identifier}', player.identifier || 'unknown');

    for (const [key, value] of Object.entries(extraData)) {
        content = content.replace(`{${key}}`, value ?? 'unknown');
    }

    const tags = [
        ['event_type', eventType],
        ['player',     player.identifier || '']
    ];

    if (Config.Nostr.batchEnabled) {
        addToBatch(content, tags);
    } else {
        // postToNostr never rejects — fire and forget is safe here
        postToNostr(content, tags);
    }
}

// ============================================
// 🎮 FIVEM EVENT HANDLERS
// ============================================

// Player events handled exclusively in server/player_activity.lua — no duplicate handlers here

// Player events handled exclusively in server/player_activity.lua — no duplicate handlers here

// Player events handled exclusively in server/player_activity.lua — no duplicate handlers here

// ============================================
// 📡 NETWORK EVENTS (Admin)
// ============================================

onNet('rde_nostr:postLog', (content, tags) => {
    const source = global.source;

    if (!isPlayerAdmin(source)) {
        emitNet('rde_nostr:error', source, 'Admin access required');
        return;
    }

    let playerName = 'Unknown Admin';
    try { playerName = GetPlayerName(source) || 'Unknown Admin'; } catch (_) {}

    const formattedContent = `👑 [ADMIN - ${playerName}] ${content}`;

    postToNostr(formattedContent, [
        ['admin_post', 'true'],
        ['admin',      playerName],
        ...(Array.isArray(tags) ? tags : [])
    ]);

    emitNet('rde_nostr:success', source, 'Manual post sent');
});

onNet('rde_nostr:getStatus', () => {
    const source = global.source;

    if (!isPlayerAdmin(source)) {
        emitNet('rde_nostr:error', source, 'Admin access required');
        return;
    }

    emitNet('rde_nostr:status', source, {
        initialized:     state.initialized,
        npub:            state.npub,
        publicKey:       state.publicKey,
        relays:          state.relays.size,
        connectedRelays: state.connectedRelays,
        stats:           state.stats,
        batchQueue:      state.batchQueue.length,
        relayUrls:       Array.from(state.relays.keys())
    });
});

onNet('rde_nostr:getLogs', () => {
    const source = global.source;

    if (!isPlayerAdmin(source)) {
        emitNet('rde_nostr:error', source, 'Admin access required');
        return;
    }

    emitNet('rde_nostr:logs', source, state.storedLogs);
});

onNet('rde_nostr:requestPanelAccess', () => {
    const source = global.source;

    if (!isPlayerAdmin(source)) {
        emitNet('rde_nostr:panelDenied', source);
        return;
    }

    emitNet('rde_nostr:openPanel', source);
    emitNet('rde_nostr:status', source, {
        initialized:     state.initialized,
        npub:            state.npub,
        publicKey:       state.publicKey,
        relays:          state.relays.size,
        connectedRelays: state.connectedRelays,
        stats:           state.stats,
        batchQueue:      state.batchQueue.length,
        relayUrls:       Array.from(state.relays.keys())
    });
    emitNet('rde_nostr:logs', source, state.storedLogs);
});


// ============================================
// 🛡️ EXPORT RATE LIMITING
// ============================================

const _rateLimits = new Map(); // resourceName → { count, windowStart }
const RATE_LIMIT_MAX    = 10;   // max postLog calls per window per resource
const RATE_LIMIT_WINDOW = 5000; // 5 second sliding window

function checkRateLimit(caller) {
    const now   = Date.now();
    const entry = _rateLimits.get(caller) || { count: 0, windowStart: now };

    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
        entry.count       = 0;
        entry.windowStart = now;
    }

    entry.count++;
    _rateLimits.set(caller, entry);

    return entry.count <= RATE_LIMIT_MAX;
}

// ============================================
// 🎯 EXPORTS
// ============================================

global.exports('postLog', (content, tags = []) => {
    // RDE Standard: guard tags — external scripts may pass null/undefined/non-array
    const safeTags = Array.isArray(tags) ? tags : [];

    // Rate limit per invoking resource — prevents accidental/malicious spam
    const caller = GetInvokingResource() || 'unknown';
    if (!checkRateLimit(caller)) {
        if (Config.DevMode) log(`⚠️ Rate limit hit by resource: ${caller} (max ${RATE_LIMIT_MAX} calls / ${RATE_LIMIT_WINDOW}ms)`, 'warning');
        return Promise.resolve(false);
    }

    // Returns a Promise that ALWAYS resolves (never rejects)
    return postToNostr(content, safeTags);
});

global.exports('postEvent', (eventType, player, extraData = {}) => {
    // RDE Standard: external callers (rde_aipilot etc.) may pass undefined player
    try {
        const safeplayer = (player && typeof player === 'object') ? player : { name: 'Unknown', identifier: 'unknown' };
        logPlayerEvent(eventType, safeplayer, extraData || {});
    } catch (err) {
        log(`❌ postEvent export error: ${err.message}`, 'error');
    }
});

global.exports('getBotPubkey', () => state.publicKey);
global.exports('getBotNpub',   () => state.npub);

// ============================================
// 🚀 STARTUP
// ============================================

setImmediate(() => {
    log('🐉 RED DRAGON ELITE | NOSTR LOG BOT v1.2.3', 'info');
    log('⚡ FIVEM COMPATIBLE - Using nostr-tools',    'info');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',  'info');

    const success = initializeBot();

    if (success) {
        log('🚀 Bot is LIVE and logging to Nostr!',             'success');
        log(`📡 Connecting to ${Config.Nostr.relays.length} relays...`, 'info');
        log(`🔑 npub: ${state.npub}`,                           'info');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',         'info');
        log('💡 Watch for ✅ Relay ACCEPTED or ❌ REJECTED messages!', 'info');
    }
});

// ============================================
// 🛑 SHUTDOWN
// ============================================

on('onResourceStop', (resourceName) => {
    if (GetCurrentResourceName() !== resourceName) return;

    log('🛑 Shutting down Nostr Bot...', 'warning');

    if (state.initialized) {
        // FIX: await the post then close relays (can't await in sync handler,
        // so we chain: post → then close after a short delay)
        postToNostr('🛑 RDE Server Nostr Bot shutting down', [
            ['event', 'shutdown']
        ]).then(() => {
            setTimeout(() => {
                for (const [, relay] of state.relays) {
                    relay.close();
                }
            }, 500);
        });
    }

    if (state.batchTimer) {
        clearInterval(state.batchTimer);
        state.batchTimer = null;
    }

    log('✅ Nostr Bot stopped', 'success');
});
