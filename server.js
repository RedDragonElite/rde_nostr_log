// ============================================
// 🐉 RED DRAGON ELITE | NOSTR LOG BOT
// FIVEM COMPATIBLE - Using nostr-tools
// Author: RDE | SerpentsByte & Shin
// ============================================

const crypto = require('crypto');
const WebSocket = require('ws');
const { 
    getPublicKey, 
    getEventHash, 
    getSignature,
    nip19
} = require('nostr-tools');

// ⚙️ CONFIGURATION
const Config = {
    Nostr: {
        // ⚠️ Leave empty to auto-generate, or add hex private key (64 chars)
        privateKey: '', // Your key here!
        
        // 🔥 STABLE RELAYS - Known to work well
        relays: [
            'wss://nos.lol',
            'wss://relay.damus.io',
            'wss://relay.primal.net',
            'wss://relay.snort.social'
        ],
        
        reconnectDelay: 5000,
        maxReconnectAttempts: 5,
        publishTimeout: 15000,
        
        batchEnabled: false, // DISABLED for testing
        batchInterval: 5000,
        batchMaxSize: 10,
        
        defaultTags: [
            ['client', 'FiveM-RDE-Nostr-Bot'],
            ['version', '1.0.0'],
            ['server', GetConvar('sv_hostname', 'RDE Server')]
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
        steamIds: ['steam:110000101605859'], // ⚠️ CHANGE THIS!
        checkOrder: ['ace', 'steam']
    },
    
    DevMode: true
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
    console.log(`${colors[type]}[RDE-NOSTR] ${msg}^0`);
}

function sanitizeContent(content) {
    if (!Config.Security.sanitizeLogs) return content;
    let sanitized = content;
    for (const pattern of Config.Security.sanitizePatterns) {
        sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '[REDACTED]');
    }
    return sanitized;
}

// ============================================
// 🌍 GLOBAL STATE
// ============================================

const state = {
    privateKey: null,
    publicKey: null,
    npub: null,
    nsec: null,
    
    relays: new Map(),
    connectedRelays: 0,
    
    stats: {
        totalLogsSent: 0,
        totalErrors: 0,
        startTime: Date.now(),
        lastPostTime: 0,
        averagePostTime: 0,
        relayPublishSuccess: 0,
        relayPublishFailed: 0
    },
    
    batchQueue: [],
    batchTimer: null,
    storedLogs: [],
    initialized: false,
    subscriptions: new Map()
};

// ============================================
// 📡 REAL WEBSOCKET RELAY CONNECTION
// ============================================

class NostrRelay {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.status = 'disconnected';
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.pendingEvents = new Map();
    }
    
    connect() {
        if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) {
            return;
        }
        
        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.on('open', () => {
                this.status = 'connected';
                this.reconnectAttempts = 0;
                state.connectedRelays++;
                log(`✅ Connected to relay: ${this.url}`, 'success');
                
                while (this.messageQueue.length > 0) {
                    const msg = this.messageQueue.shift();
                    this.ws.send(msg);
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
                        
                        if (this.pendingEvents.has(eventId)) {
                            const resolve = this.pendingEvents.get(eventId);
                            resolve(success);
                            this.pendingEvents.delete(eventId);
                        }
                    }
                } catch (err) {
                    if (Config.DevMode) {
                        log(`Error parsing relay message: ${err.message}`, 'error');
                    }
                }
            });
            
            this.ws.on('error', (err) => {
                log(`❌ Relay error on ${this.url}: ${err.message}`, 'error');
                this.status = 'error';
            });
            
            this.ws.on('close', () => {
                this.status = 'disconnected';
                if (state.connectedRelays > 0) state.connectedRelays--;
                log(`⚠️ Relay disconnected: ${this.url}`, 'warning');
                
                if (this.reconnectAttempts < Config.Nostr.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => {
                        log(`🔄 Reconnecting to ${this.url} (attempt ${this.reconnectAttempts})...`, 'info');
                        this.connect();
                    }, Config.Nostr.reconnectDelay);
                }
            });
            
        } catch (err) {
            log(`❌ Failed to connect to ${this.url}: ${err.message}`, 'error');
            this.status = 'error';
        }
    }
    
    async publish(event) {
        return new Promise((resolve) => {
            if (!this.ws || this.ws.readyState !== 1) {
                log(`⚠️ Relay ${this.url} not connected, queuing event`, 'warning');
                resolve(false);
                return;
            }
            
            try {
                const message = JSON.stringify(['EVENT', event]);
                this.ws.send(message);
                
                this.pendingEvents.set(event.id, resolve);
                
                setTimeout(() => {
                    if (this.pendingEvents.has(event.id)) {
                        log(`⏰ Timeout waiting for OK from ${this.url}`, 'warning');
                        this.pendingEvents.delete(event.id);
                        resolve(false);
                    }
                }, Config.Nostr.publishTimeout);
                
            } catch (err) {
                log(`❌ Error publishing to ${this.url}: ${err.message}`, 'error');
                resolve(false);
            }
        });
    }
    
    close() {
        if (this.ws) {
            this.ws.close();
            this.status = 'disconnected';
        }
    }
}

// ============================================
// 🔐 BOT INITIALIZATION
// ============================================

function initializeBot() {
    log('🤖 Initializing Nostr Bot...', 'info');
    
    try {
        let privKeyHex = Config.Nostr.privateKey;
        
        if (!privKeyHex || privKeyHex === '') {
            privKeyHex = bytesToHex(crypto.randomBytes(32));
            state.nsec = nip19.nsecEncode(privKeyHex);
            log('⚠️ NO PRIVATE KEY! Generated new key:', 'warning');
            log(`📝 Add to config: privateKey = '${privKeyHex}'`, 'warning');
            log(`📝 Or nsec: ${state.nsec}`, 'warning');
        } else {
            if (privKeyHex.startsWith('nsec')) {
                try {
                    const decoded = nip19.decode(privKeyHex);
                    privKeyHex = decoded.data;
                } catch (err) {
                    log('⚠️ Invalid nsec format, using deterministic key', 'warning');
                    const hash = crypto.createHash('sha256').update(privKeyHex).digest('hex');
                    privKeyHex = hash;
                }
            }
            state.nsec = nip19.nsecEncode(privKeyHex);
        }
        
        state.privateKey = privKeyHex;
        state.publicKey = getPublicKey(privKeyHex);
        state.npub = nip19.npubEncode(state.publicKey);
        
        log(`✅ Bot Identity:`, 'success');
        log(`   npub: ${state.npub}`, 'info');
        log(`   pubkey: ${state.publicKey}`, 'info');
        
        connectToRelays();
        
        if (Config.Nostr.batchEnabled) {
            startBatchProcessor();
        }
        
        state.initialized = true;
        
        setTimeout(() => {
            if (state.connectedRelays > 0) {
                postToNostr('🐉 RDE Nostr Bot ONLINE | Server logging active ⚡777', [
                    ['event', 'bot_startup'],
                    ['timestamp', Date.now().toString()]
                ]);
            } else {
                log('⚠️ No relays connected yet, skipping startup post', 'warning');
            }
        }, 5000);
        
        return true;
        
    } catch (err) {
        log(`❌ Initialization failed: ${err.message}`, 'error');
        log(err.stack, 'error');
        return false;
    }
}

function connectToRelays() {
    log(`📡 Connecting to ${Config.Nostr.relays.length} relays...`, 'info');
    
    for (const url of Config.Nostr.relays) {
        const relay = new NostrRelay(url);
        state.relays.set(url, relay);
        relay.connect();
    }
}

// ============================================
// 📤 POST TO NOSTR
// ============================================

async function postToNostr(content, customTags = []) {
    if (!state.initialized) {
        log('⚠️ Bot not initialized yet', 'warning');
        return false;
    }
    
    const startTime = Date.now();
    
    try {
        const sanitizedContent = sanitizeContent(content);
        
        const event = {
            kind: 1,
            pubkey: state.publicKey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [...Config.Nostr.defaultTags, ...customTags],
            content: sanitizedContent
        };
        
        event.id = getEventHash(event);
        event.sig = getSignature(event, state.privateKey);
        
        log(`📤 Publishing: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`, 'info');
        
        const publishPromises = [];
        let successCount = 0;
        let failCount = 0;
        
        for (const [url, relay] of state.relays) {
            const promise = relay.publish(event).then(success => {
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
                return success;
            });
            publishPromises.push(promise);
        }
        
        await Promise.all(publishPromises);
        
        const postTime = Date.now() - startTime;
        state.stats.averagePostTime = 
            (state.stats.averagePostTime * state.stats.totalLogsSent + postTime) / 
            (state.stats.totalLogsSent + 1);
        
        state.stats.totalLogsSent++;
        state.stats.lastPostTime = Date.now();
        
        if (Config.Performance.storeLogsInMemory) {
            state.storedLogs.unshift({
                timestamp: event.created_at,
                content: sanitizedContent,
                eventId: event.id
            });
            
            if (state.storedLogs.length > Config.Performance.maxStoredLogs) {
                state.storedLogs.pop();
            }
        }
        
        log(`✅ Published to ${successCount}/${state.relays.size} relays (${failCount} failed) in ${postTime}ms`, 'success');
        
        return true;
        
    } catch (err) {
        log(`❌ Post failed: ${err.message}`, 'error');
        log(err.stack, 'error');
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
    
    const combinedContent = batch.map((item, index) => 
        `${index + 1}. ${item.content}`
    ).join('\n');
    
    const combinedTags = [
        ['batch', 'true'],
        ['batch_size', batch.length.toString()]
    ];
    
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
    const identifier = GetPlayerIdentifierByType(source, 'steam');
    
    for (const method of Config.AdminSystem.checkOrder) {
        if (method === 'ace') {
            if (IsPlayerAceAllowed(source, Config.AdminSystem.acePermission)) {
                return true;
            }
        } else if (method === 'steam') {
            if (identifier && Config.AdminSystem.steamIds.includes(identifier)) {
                return true;
            }
        }
    }
    
    return false;
}

// ============================================
// 📋 EVENT LOGGING
// ============================================

function logPlayerEvent(eventType, player, extraData = {}) {
    const templates = {
        player_connecting: '🔌 {name} ({identifier}) connecting...',
        player_connected: '✅ {name} joined | Players: {playerCount}',
        player_disconnected: '❌ {name} left | Reason: {reason}'
    };
    
    const template = templates[eventType];
    if (!template) return;
    
    let content = template
        .replace('{name}', player.name || 'Unknown')
        .replace('{identifier}', player.identifier || 'Unknown');
    
    for (const [key, value] of Object.entries(extraData)) {
        content = content.replace(`{${key}}`, value);
    }
    
    const tags = [
        ['event_type', eventType],
        ['player', player.identifier || '']
    ];
    
    if (Config.Nostr.batchEnabled) {
        addToBatch(content, tags);
    } else {
        postToNostr(content, tags);
    }
}

// ============================================
// 🎮 FIVEM EVENT HANDLERS
// ============================================

onNet('playerConnecting', (name, setKickReason, deferrals) => {
    const source = global.source;
    const identifier = GetPlayerIdentifierByType(source, 'steam');
    
    logPlayerEvent('player_connecting', {
        name: name,
        identifier: identifier
    });
});

on('playerJoining', (source) => {
    const name = GetPlayerName(source);
    const identifier = GetPlayerIdentifierByType(source, 'steam');
    const playerCount = GetNumPlayerIndices();
    
    logPlayerEvent('player_connected', {
        name: name,
        identifier: identifier
    }, {
        playerCount: playerCount
    });
});

on('playerDropped', (reason) => {
    const source = global.source;
    const name = GetPlayerName(source);
    const identifier = GetPlayerIdentifierByType(source, 'steam');
    
    logPlayerEvent('player_disconnected', {
        name: name,
        identifier: identifier
    }, {
        reason: reason || 'Unknown'
    });
});

// ============================================
// 📡 NETWORK EVENTS
// ============================================

onNet('rde_nostr:postLog', (content, tags) => {
    const source = global.source;
    
    if (!isPlayerAdmin(source)) {
        emitNet('rde_nostr:error', source, 'Admin access required');
        return;
    }
    
    const playerName = GetPlayerName(source);
    const formattedContent = `👑 [ADMIN - ${playerName}] ${content}`;
    
    postToNostr(formattedContent, [
        ['admin_post', 'true'],
        ['admin', playerName],
        ...(tags || [])
    ]);
    
    emitNet('rde_nostr:success', source, 'Manual post sent');
});

onNet('rde_nostr:getStatus', () => {
    const source = global.source;
    
    if (!isPlayerAdmin(source)) {
        emitNet('rde_nostr:error', source, 'Admin access required');
        return;
    }
    
    const relayUrls = Array.from(state.relays.keys());
    
    const status = {
        initialized: state.initialized,
        npub: state.npub,
        publicKey: state.publicKey,
        relays: state.relays.size,
        connectedRelays: state.connectedRelays,
        stats: state.stats,
        batchQueue: state.batchQueue.length,
        relayUrls: relayUrls
    };
    
    emitNet('rde_nostr:status', source, status);
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
    
    const relayUrls = Array.from(state.relays.keys());
    
    const status = {
        initialized: state.initialized,
        npub: state.npub,
        publicKey: state.publicKey,
        relays: state.relays.size,
        connectedRelays: state.connectedRelays,
        stats: state.stats,
        batchQueue: state.batchQueue.length,
        relayUrls: relayUrls
    };
    
    emitNet('rde_nostr:status', source, status);
    emitNet('rde_nostr:logs', source, state.storedLogs);
});

// ============================================
// 🎯 EXPORTS
// ============================================

global.exports('postLog', (content, tags = []) => {
    return postToNostr(content, tags);
});

global.exports('postEvent', (eventType, player, extraData = {}) => {
    return logPlayerEvent(eventType, player, extraData);
});

global.exports('getBotPubkey', () => {
    return state.publicKey;
});

global.exports('getBotNpub', () => {
    return state.npub;
});

// ============================================
// 🚀 STARTUP
// ============================================

setImmediate(() => {
    log('🐉 RED DRAGON ELITE | NOSTR LOG BOT', 'info');
    log('⚡ FIVEM COMPATIBLE - Using nostr-tools', 'info');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    
    const success = initializeBot();
    
    if (success) {
        log('🚀 Bot is LIVE and logging to Nostr!', 'success');
        log(`📡 Connecting to ${Config.Nostr.relays.length} relays...`, 'info');
        log(`🔑 npub: ${state.npub}`, 'info');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        log('', 'info');
        log('💡 Watch for "✅ Relay ACCEPTED" or "❌ Relay REJECTED" messages!', 'info');
        log('', 'info');
    }
});

// ============================================
// 🛑 SHUTDOWN
// ============================================

on('onResourceStop', (resourceName) => {
    if (GetCurrentResourceName() !== resourceName) return;
    
    log('🛑 Shutting down Nostr Bot...', 'warning');
    
    if (state.initialized) {
        postToNostr('🛑 RDE Server Nostr Bot shutting down', [['event', 'shutdown']]);
        
        setTimeout(() => {
            for (const [url, relay] of state.relays) {
                relay.close();
            }
        }, 1000);
    }
    
    if (state.batchTimer) {
        clearInterval(state.batchTimer);
    }
    
    log('✅ Nostr Bot stopped', 'success');
});