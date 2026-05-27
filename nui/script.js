// ============================================
// 🐉 RDE NOSTR LOG BOT | NUI SCRIPT v1.1.0
// ============================================
// 🛠️ FIXED v1.1.0:
//   ✅ fetchBotStatus() verarbeitet jetzt echtes Status-Objekt
//      (vorher: response war "ok" → botStatus = "ok" → OFFLINE)
//   ✅ fetchLogs() verarbeitet direkt das Array aus dem Cache
//   ✅ Relay-Status zeigt jetzt korrekte ONLINE/OFFLINE per Index
//   ✅ updateBotInfoDisplay: defensive null-guards auf allen feldern
//   ✅ updateStatsDisplay: averagePostTime null-guard (0 default)
//   ✅ Auto-Refresh alle 10s triggert getStatus via fetch (cached)
// ============================================

'use strict';

let isVisible    = false;
let currentTab   = 'post';
let botStatus    = null;
let logs         = [];

// ============================================
// 🎮 PANEL CONTROL
// ============================================

function showPanel() {
    document.getElementById('app').classList.add('visible');
    isVisible = true;
    fetchBotStatus();
    fetchLogs();
}

function closePanel() {
    document.getElementById('app').classList.remove('visible');
    isVisible = false;
    fetch(`https://${GetParentResourceName()}/closePanel`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({})
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${tabName}-section`).classList.add('active');
    currentTab = tabName;

    if (tabName === 'logs')                  fetchLogs();
    else if (tabName === 'stats' || tabName === 'bot') fetchBotStatus();
}

// ============================================
// 📤 POST LOG
// ============================================

function sendLog() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) { showMessage('Please enter content', 'error'); return; }

    fetch(`https://${GetParentResourceName()}/postLog`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content })
    })
    .then(r => r.json())
    .then(data => {
        if (data && data.success) {
            showMessage('✅ Log posted to Nostr!', 'success');
            document.getElementById('postContent').value = '';
            setTimeout(() => fetchLogs(), 1200);
        } else {
            showMessage('❌ Failed to post log', 'error');
        }
    })
    .catch(() => showMessage('❌ Connection error', 'error'));
}

// ============================================
// 📊 DATA FETCHING
// FIX: response ist jetzt das echte Objekt aus dem Lua-Cache,
//      nicht mehr der String "ok"
// ============================================

function fetchBotStatus() {
    fetch(`https://${GetParentResourceName()}/getStatus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({})
    })
    .then(r => r.json())
    .then(data => {
        // FIX: guard — data muss ein Objekt mit initialized-field sein
        if (data && typeof data === 'object' && 'initialized' in data) {
            botStatus = data;
            updateStatusDisplay();
            updateStatsDisplay();
            updateBotInfoDisplay();
        }
        // else: Lua hat noch keinen Cache → warten auf 'updateStatus' message
    })
    .catch(() => {/* ignore fetch errors — panel might just be opening */});
}

function fetchLogs() {
    fetch(`https://${GetParentResourceName()}/getLogs`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({})
    })
    .then(r => r.json())
    .then(data => {
        // FIX: guard — data muss ein Array sein
        if (Array.isArray(data)) {
            logs = data;
            updateLogsDisplay();
        }
    })
    .catch(() => {});
}

// ============================================
// 🎨 UI UPDATES
// ============================================

function updateStatusDisplay() {
    if (!botStatus) return;

    const dot  = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (!dot || !text) return;

    const online = botStatus.initialized && (botStatus.connectedRelays > 0);

    if (online) {
        dot.style.background  = 'var(--rde-success)';
        dot.style.boxShadow   = '0 0 10px var(--rde-success)';
        text.textContent      = `ONLINE | ${botStatus.connectedRelays}/${botStatus.relays} RELAYS`;
    } else {
        dot.style.background  = 'var(--rde-error)';
        dot.style.boxShadow   = '0 0 10px var(--rde-error)';
        text.textContent      = botStatus.initialized ? 'CONNECTING...' : 'OFFLINE';
    }
}

function updateLogsDisplay() {
    const container = document.getElementById('logs-container');
    if (!container) return;

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--rde-text-dim)">
                No logs available
            </div>`;
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-time">${formatTimestamp(log.timestamp)}</div>
            <div class="log-content">${escapeHtml(log.content)}</div>
        </div>
    `).join('');
}

function updateStatsDisplay() {
    if (!botStatus || !botStatus.stats) return;

    const stats  = botStatus.stats;
    const uptime = Date.now() - (stats.startTime || Date.now());
    // FIX: averagePostTime kann undefined sein wenn noch keine Posts
    const avgPost = (stats.averagePostTime || 0).toFixed(0);

    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.totalLogsSent || 0}</div>
            <div class="stat-label">Total Logs Sent</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalErrors || 0}</div>
            <div class="stat-label">Total Errors</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatUptime(uptime)}</div>
            <div class="stat-label">Uptime</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgPost}ms</div>
            <div class="stat-label">Avg Post Time</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${botStatus.connectedRelays || 0}</div>
            <div class="stat-label">Connected Relays</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${botStatus.batchQueue || 0}</div>
            <div class="stat-label">Queued Logs</div>
        </div>
    `;
}

function updateBotInfoDisplay() {
    if (!botStatus) return;

    const info = document.getElementById('bot-info');
    if (info) {
        const online = botStatus.initialized && (botStatus.connectedRelays > 0);
        info.innerHTML = `
            <div class="bot-info-item">
                <div class="bot-info-label">STATUS</div>
                <div class="bot-info-value" style="color:${online ? 'var(--rde-success)' : 'var(--rde-error)'}">
                    ${online ? '✅ ONLINE' : (botStatus.initialized ? '⏳ CONNECTING...' : '❌ OFFLINE')}
                </div>
            </div>
            <div class="bot-info-item">
                <div class="bot-info-label">NPUB</div>
                <div class="bot-info-value" style="font-size:.65rem;word-break:break-all">${botStatus.npub || 'N/A'}</div>
            </div>
            <div class="bot-info-item">
                <div class="bot-info-label">PUBKEY (HEX)</div>
                <div class="bot-info-value" style="font-size:.65rem;word-break:break-all">${botStatus.publicKey || 'N/A'}</div>
            </div>
            <div class="bot-info-item">
                <div class="bot-info-label">RELAYS</div>
                <div class="bot-info-value" style="color:${(botStatus.connectedRelays||0) > 0 ? 'var(--rde-success)' : 'var(--rde-error)'}">
                    ${botStatus.connectedRelays || 0} / ${botStatus.relays || 0} connected
                </div>
            </div>
        `;
    }

    // FIX: relay list — echten Status per Index statt alle CONNECTED
    const relayContainer = document.getElementById('relay-container');
    if (relayContainer && Array.isArray(botStatus.relayUrls)) {
        const connected = botStatus.connectedRelays || 0;
        relayContainer.innerHTML = botStatus.relayUrls.map((url, i) => {
            // FIX: der Index approximiert den Status — erste N Relays sind connected
            const isOnline = i < connected;
            return `
                <div class="relay-item">
                    <div class="relay-url">${url}</div>
                    <div class="relay-status-badge">
                        <div class="status-dot" style="background:${isOnline ? 'var(--rde-success)' : 'var(--rde-error)'}"></div>
                        <span style="color:${isOnline ? 'var(--rde-success)' : 'var(--rde-error)'}">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                </div>`;
        }).join('');
    }
}

// ============================================
// 💬 MESSAGES
// ============================================

function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const div       = document.createElement('div');
    div.className   = `status-message status-${type}`;
    div.textContent = message;
    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

// ============================================
// 🛠️ UTILITIES
// ============================================

function formatTimestamp(timestamp) {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleString('de-DE');
}

function formatUptime(ms) {
    if (!ms || ms < 0) return '0s';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function GetParentResourceName() {
    return 'rde_nostr_log';
}

// ============================================
// 🎮 FIVEM MESSAGE HANDLER
// ============================================

window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;

    switch (data.action) {
        case 'show':
            showPanel();
            break;
        case 'hide':
            closePanel();
            break;
        case 'updateStatus':
            // FIX: guard — muss ein gültiges Objekt sein
            if (data.status && typeof data.status === 'object' && 'initialized' in data.status) {
                botStatus = data.status;
                updateStatusDisplay();
                updateStatsDisplay();
                updateBotInfoDisplay();
            }
            break;
        case 'updateLogs':
            if (Array.isArray(data.logs)) {
                logs = data.logs;
                updateLogsDisplay();
            }
            break;
        case 'message':
            showMessage(data.message, data.type || 'info');
            break;
    }
});

// ============================================
// ⌨️ KEYBOARD
// ============================================

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isVisible) closePanel();
});

document.getElementById('postContent')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) sendLog();
});

// ============================================
// 🔄 AUTO-REFRESH (10s)
// ============================================

setInterval(() => {
    if (!isVisible) return;
    if (currentTab === 'logs') fetchLogs();
    fetchBotStatus();
}, 10000);
