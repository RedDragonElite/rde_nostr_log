// ============================================
// 🐉 RDE NOSTR LOG BOT | NUI SCRIPT
// Admin Panel JavaScript
// ============================================

let isVisible = false;
let currentTab = 'post';
let botStatus = null;
let logs = [];

// ============================================
// 🎮 PANEL CONTROL
// ============================================

function showPanel() {
    const app = document.getElementById('app');
    app.classList.add('visible');
    isVisible = true;
    
    // Request initial data
    fetchBotStatus();
    fetchLogs();
}

function closePanel() {
    const app = document.getElementById('app');
    app.classList.remove('visible');
    isVisible = false;
    
    // Notify FiveM
    fetch(`https://${GetParentResourceName()}/closePanel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}

function switchTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(`${tabName}-section`).classList.add('active');
    
    currentTab = tabName;
    
    // Load data for tab
    if (tabName === 'logs') {
        fetchLogs();
    } else if (tabName === 'stats' || tabName === 'bot') {
        fetchBotStatus();
    }
}

// ============================================
// 📤 POST LOG
// ============================================

function sendLog() {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content) {
        showMessage('Please enter content', 'error');
        return;
    }
    
    // Send to FiveM
    fetch(`https://${GetParentResourceName()}/postLog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
    }).then(resp => resp.json()).then(data => {
        if (data.success) {
            showMessage('✅ Log posted to Nostr!', 'success');
            document.getElementById('postContent').value = '';
            
            // Refresh logs
            setTimeout(() => fetchLogs(), 1000);
        } else {
            showMessage('❌ Failed to post log', 'error');
        }
    });
}

// ============================================
// 📊 DATA FETCHING
// ============================================

function fetchBotStatus() {
    fetch(`https://${GetParentResourceName()}/getStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(resp => resp.json()).then(data => {
        botStatus = data;
        updateStatusDisplay();
        updateStatsDisplay();
        updateBotInfoDisplay();
    });
}

function fetchLogs() {
    fetch(`https://${GetParentResourceName()}/getLogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(resp => resp.json()).then(data => {
        logs = data;
        updateLogsDisplay();
    });
}

// ============================================
// 🎨 UI UPDATES
// ============================================

function updateStatusDisplay() {
    if (!botStatus) return;
    
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    
    if (botStatus.initialized) {
        dot.style.background = 'var(--rde-success)';
        dot.style.boxShadow = '0 0 10px var(--rde-success)';
        text.textContent = `ONLINE | ${botStatus.connectedRelays}/${botStatus.relays} RELAYS`;
    } else {
        dot.style.background = 'var(--rde-error)';
        dot.style.boxShadow = '0 0 10px var(--rde-error)';
        text.textContent = 'OFFLINE';
    }
}

function updateLogsDisplay() {
    const container = document.getElementById('logs-container');
    
    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--rde-text-dim)">
                No logs available
            </div>
        `;
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
    
    const stats = botStatus.stats;
    const uptime = Date.now() - stats.startTime;
    
    const statsHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.totalLogsSent}</div>
            <div class="stat-label">Total Logs Sent</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalErrors}</div>
            <div class="stat-label">Total Errors</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatUptime(uptime)}</div>
            <div class="stat-label">Uptime</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.averagePostTime.toFixed(0)}ms</div>
            <div class="stat-label">Avg Post Time</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${botStatus.connectedRelays}</div>
            <div class="stat-label">Connected Relays</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${botStatus.batchQueue || 0}</div>
            <div class="stat-label">Queued Logs</div>
        </div>
    `;
    
    document.getElementById('stats-grid').innerHTML = statsHTML;
}

function updateBotInfoDisplay() {
    if (!botStatus) return;
    
    const infoHTML = `
        <div class="bot-info-item">
            <div class="bot-info-label">Status</div>
            <div class="bot-info-value">${botStatus.initialized ? '✅ ONLINE' : '❌ OFFLINE'}</div>
        </div>
        <div class="bot-info-item">
            <div class="bot-info-label">Public Key (npub)</div>
            <div class="bot-info-value">${botStatus.npub || 'N/A'}</div>
        </div>
        <div class="bot-info-item">
            <div class="bot-info-label">Public Key (hex)</div>
            <div class="bot-info-value">${botStatus.publicKey || 'N/A'}</div>
        </div>
        <div class="bot-info-item">
            <div class="bot-info-label">Total Relays</div>
            <div class="bot-info-value">${botStatus.relays || 0}</div>
        </div>
        <div class="bot-info-item">
            <div class="bot-info-label">Connected Relays</div>
            <div class="bot-info-value">${botStatus.connectedRelays || 0}</div>
        </div>
    `;
    
    document.getElementById('bot-info').innerHTML = infoHTML;
    
    // Update relay list
    if (botStatus.relayUrls) {
        const relayHTML = botStatus.relayUrls.map(relay => `
            <div class="relay-item">
                <div class="relay-url">${relay}</div>
                <div class="relay-status-badge">
                    <div class="status-dot"></div>
                    <span>CONNECTED</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('relay-container').innerHTML = relayHTML;
    }
}

// ============================================
// 💬 MESSAGES
// ============================================

function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message status-${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// ============================================
// 🛠️ UTILITIES
// ============================================

function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('de-DE');
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
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
// 🎮 FIVEM INTEGRATION
// ============================================

window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data.action === 'show') {
        showPanel();
    } else if (data.action === 'hide') {
        closePanel();
    } else if (data.action === 'updateStatus') {
        botStatus = data.status;
        updateStatusDisplay();
        updateStatsDisplay();
        updateBotInfoDisplay();
    } else if (data.action === 'updateLogs') {
        logs = data.logs;
        updateLogsDisplay();
    } else if (data.action === 'message') {
        showMessage(data.message, data.type || 'info');
    }
});

// Close on ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isVisible) {
        closePanel();
    }
});

// Handle Enter key in textarea (CTRL+Enter to send)
document.getElementById('postContent')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
        sendLog();
    }
});

// Auto-refresh every 10 seconds if visible
setInterval(() => {
    if (isVisible) {
        if (currentTab === 'logs') {
            fetchLogs();
        }
        fetchBotStatus();
    }
}, 10000);