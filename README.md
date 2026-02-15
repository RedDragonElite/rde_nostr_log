# 🐉 RDE Nostr Log Bot

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-red?style=for-the-badge)
![License](https://img.shields.io/badge/license-RDE%20Black%20Flag-black?style=for-the-badge)
![FiveM](https://img.shields.io/badge/FiveM-Compatible-blue?style=for-the-badge)
![Nostr](https://img.shields.io/badge/Nostr-Decentralized-purple?style=for-the-badge)

**The World's First Truly Decentralized FiveM Logging System**

*Built by [Red Dragon Elite](https://rd-elite.com) | Free Forever | Uncensorable by Design*

[📖 Documentation](#-installation) • [🚀 Quick Start](#-quick-start) • [💬 Nostr](https://primal.net/p/nprofile1qqs8p6u423fappfqrrmxful5kt95hs7d04yr25x88apv7k4vszf4gcqynchct) • [🌐 Website](https://rd-elite.com)

</div>

---

## 📸 Screenshots

<img width="1021" height="593" alt="image" src="https://github.com/user-attachments/assets/3a8050ef-5985-4ad8-ad5c-fa8f4db024d4" />
<img width="1920" height="1080" alt="113Fwdaawdok" src="https://github.com/user-attachments/assets/94980ee4-c8c5-4550-863b-be9c39d192c9" />
<img width="1920" height="1080" alt="113Fwdwddaawdok" src="https://github.com/user-attachments/assets/03f9b6fd-2a66-469f-906a-e0ad6bca84b9" />
<img width="1920" height="1080" alt="113Fwdafefeawdok" src="https://github.com/user-attachments/assets/d4734fb0-c096-41f1-bf95-ab27b143f8ea" />
<img width="1920" height="1080" alt="113Fwdaawffswedok" src="https://github.com/user-attachments/assets/054d4bd7-4a2e-43a5-81b9-4db4d7062be6" />
<img width="638" height="957" alt="image" src="https://github.com/user-attachments/assets/aefb2ff2-80c2-4321-b8d1-5291b26335b8" />


<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@serpentsbyte/video/7606598159921319190" data-video-id="7606598159921319190" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@serpentsbyte" href="https://www.tiktok.com/@serpentsbyte?refer=embed">@serpentsbyte</a> <p>🖥️🔥 FIRST EVER FiveM Nostr Bot just dropped… and it’s INSANE 🤯💀 Watch this cyberpunk AETHER panel glitch in real-time:   ✅ Live server logs scrolling   ✅ 5&#47;5 relays connected   ✅ Decentralized &#38; uncensorable   ✅ Discord webhooks? DEAD. 💥 🔥 Why this changes everything? - Decentralized &#38; Permanent: Logs live forever on the Nostr network – no single point of failure - Uncensorable: No bans, no downtime, no company can delete your logs - Cryptographically signed: Every event is verifiable and tamper-proof - AETHER Cyberpunk UI: Glitch effects, scanlines, neon pulse – the most beautiful admin panel in FiveM - Production ready: 5 relays, batch processing, triple admin verification, zero spam No more centralized bullshit. Logs live FOREVER on Nostr – signed, permanent, free. 🐉⚡️ Built by Red Dragon Elite – AAA quality, 100% FREE.   Download → GitHub → RedDragonElite   Follow the bot live: npub1606155780c677d11baba2a52c3a8d568eae40b54116aea3e325fe4ecc801f5e9 The future of FiveM logging is HERE. 🚀 #FiveM #Nostr #Cyberpunk #GTARP #fyp</p> <a target="_blank" title="♬ Originalton  - △ ᛋᛅᚱᛒᛅᚾᛏᛋ ᛒᛁᛏᛅ ▽" href="https://www.tiktok.com/music/Originalton-△-ᛋᛅᚱᛒᛅᚾᛏᛋ-ᛒᛁᛏᛅ-▽-7606598123947510550?refer=embed">♬ Originalton  - △ ᛋᛅᚱᛒᛅᚾᛏᛋ ᛒᛁᛏᛅ ▽</a> </section> </blockquote>

---

## 🔥 Why This Bot Changes Everything

Traditional FiveM logging is **broken by design**:

| ❌ Discord Webhooks | ✅ RDE Nostr Bot |
|---------------------|------------------|
| **Rate limited** (30 requests/min) | **Unlimited** posts |
| **Censored** by Discord TOS | **Uncensorable** - no central authority |
| **Deleted** when server banned | **Permanent** - distributed across relays |
| **Privacy nightmare** - Discord owns your data | **True privacy** - you control your keys |
| **Single point of failure** - Discord goes down, you're blind | **Decentralized** - 100+ global relays |
| **Paywalled** - "Premium bots" cost money | **100% Free Forever** |

### 🎯 Key Features

- 🔓 **Truly Open Source** - No backdoors, no telemetry, no BS
- 🌍 **Decentralized** - Your logs live on Nostr's global relay network
- 🔐 **Cryptographically Signed** - Every event provably authentic (BIP-340)
- ⚡ **Lightning Fast** - WebSocket connections, batch processing, sub-100ms latency
- 🎨 **Stunning UI** - AETHER-style admin panel with live statistics
- 🛡️ **Triple Admin Verification** - ACE permissions + Steam ID + ox_core
- 📊 **Real-time Stats** - Monitor relay health, success rates, uptime
- 🔧 **Developer Friendly** - Clean exports, extensive documentation
- 🌐 **Multi-language** - EN/DE support, easily extendable

---

## 🚀 Quick Start

### Prerequisites

**FiveM Server Requirements:**
- Node.js 16+ (comes with FiveM server)
- Yarn package manager (included with FiveM)
- Outbound port 443 access (for WebSocket connections)

### Installation (5 Minutes)

```bash
# 1. Clone the repository
cd resources
git clone https://github.com/RedDragonElite/rde_nostr_log.git

# 2. Install dependencies (using yarn, not npm!)
cd rde_nostr_log
yarn install

# 3. Add to server.cfg
ensure rde_nostr_log

# 4. Restart server or start resource
start rde_nostr_log

# 5. Done! Check console for your npub
```

**Important:** FiveM servers use **Yarn**, not npm. The installation happens automatically when you start the resource.

---

## 📚 Full Installation Guide

### Step 1: Get Your Nostr Identity

**What is Nostr?**  
Nostr (Notes and Other Stuff Transmitted by Relays) is a decentralized protocol - think "Twitter but unstoppable". Your bot needs a Nostr identity to post logs.

**Creating Your Keys:**

#### Option A: Auto-Generate (Easiest)
1. Leave `privateKey = ''` empty in `server.js`
2. Start the bot - it generates a key automatically
3. Check console for: `📝 Add to config: privateKey = 'abc123...'`
4. Copy that key into `server.js` line 15
5. Restart - now you have a permanent identity!

#### Option B: Generate Offline (Most Secure)
1. Visit [Nostr Key Generator](https://nostr-keygen.pages.dev/) (works offline!)
2. Save your **private key (nsec)** somewhere safe
3. Paste it into `server.js`: `privateKey: 'your-hex-or-nsec-here'`
4. **Never share your private key** - it's like a password!

**Your Public Identity (npub):**  
- The bot shows your `npub` in console on startup
- Share this publicly - it's how people find your logs
- Example: `npub1wr4e24zn6zzjqx8kvnelfvktf0pu6l2gx4gvw06zead2eqyn23sq9tsd94`

### Step 2: Configure Admin Access

Edit `server.js` lines 51-54:

```javascript
AdminSystem: {
    acePermission: 'rde.nostr.admin',
    steamIds: [
        'steam:110000101605859', // ⚠️ REPLACE WITH YOUR STEAM ID!
    ],
}
```

**How to get your Steam ID:**
1. Join your server
2. Check server console or logs
3. Look for your Steam Hex ID (starts with `steam:`)
4. Add it to the array above

**Optional - ACE Permissions:**
```cfg
# Add to server.cfg
add_ace group.admin rde.nostr.admin allow
```

### Step 3: Choose Your Relays

**What are Relays?**  
Relays are servers that store and broadcast Nostr events. Your bot posts to multiple relays for redundancy.

**Default Relays (Recommended):**
```javascript
relays: [
    'wss://relay.nostr.bg',      // Fast, open, reliable
    'wss://nostr.fmt.wiz.biz',   // Developer-friendly
    'wss://nos.lol',             // Popular community relay
    'wss://relay.damus.io',      // Largest iOS client relay
    'wss://relay.primal.net'     // High-uptime relay
]
```

**Want more relays?**  
- Browse [Nostr.watch](https://nostr.watch/) for relay stats
- Add/remove relays in `server.js` line 17-23
- More relays = more redundancy (but slower posts)

### Step 4: Viewing Your Logs

**Web Clients:**
- [nostr.band](https://nostr.band/) - Search by npub, see all your posts
- [Primal](https://primal.net/) - Modern, fast interface
- [Snort](https://snort.social/) - Power user features

**Mobile Apps:**
- [Amethyst](https://github.com/vitorpamplona/amethyst) (Android)
- [Damus](https://damus.io/) (iOS)

**Search for your npub:**  
`https://nostr.band/npub1wr4e24...` (replace with your npub from console)

---

## ✅ Post-Installation Verification

After installation, verify everything works:

### 1. Check Console Output

You should see:
```
[RDE-NOSTR] 🐉 RED DRAGON ELITE | NOSTR LOG BOT
[RDE-NOSTR] ⚡ FIVEM COMPATIBLE - Using nostr-tools
[RDE-NOSTR] 🤖 Initializing Nostr Bot...
[RDE-NOSTR] ✅ Bot Identity:
[RDE-NOSTR]    npub: npub1abc123...
[RDE-NOSTR]    pubkey: abc123def...
[RDE-NOSTR] 📡 Connecting to 4 relays...
[RDE-NOSTR] ✅ Connected to relay: wss://nos.lol
[RDE-NOSTR] ✅ Connected to relay: wss://relay.damus.io
[RDE-NOSTR] 📤 Publishing: "🐉 RDE Nostr Bot ONLINE..."
[RDE-NOSTR] ✅ Relay ACCEPTED event abc123... on wss://nos.lol
[RDE-NOSTR] ✅ Published to 4/4 relays (0 failed)
```

### 2. Check File Structure

```
rde_nostr_log/
├── node_modules/           ← Should exist after yarn install
│   ├── nostr-tools/       ← v1.17.0
│   └── ws/                ← v8.14.2
├── server.js              ← Must import nostr-tools
├── package.json           ← Contains correct versions
├── yarn.lock              ← Created by yarn
├── .yarnrc                ← Yarn config
├── fxmanifest.lua
├── config.lua
└── nui/
```

### 3. Test Manual Post

1. Press **F5** (or your configured keybind)
2. Admin panel should open
3. Go to "POST LOG" tab
4. Type: `🐉 First test post from RDE Nostr Bot!`
5. Click "SEND TO NOSTR ⚡777"
6. Check console for `✅ Relay ACCEPTED`

### 4. Verify in Nostr Feed

1. Copy your **npub** from console
2. Go to https://nostr.band/
3. Paste your npub in search
4. Should see your test post! 🎉

### 5. Quick Troubleshooting

**If you see "bad signature":**
- ❌ Wrong file - check `server.js` imports `nostr-tools`
- ❌ Package not installed - run `yarn install`

**If no relays connect:**
- ❌ Network blocked - check firewall/hosting settings
- ❌ Port 443 blocked - contact hosting provider

**If admin panel won't open:**
- ❌ Wrong Steam ID - check `server.js` line 57
- ❌ Missing ox_lib - install it or use `/nostrpanel` command

---

## 🎮 Usage

### Admin Panel (F5)

Press **F5** (configurable in `config.lua`) to open the admin panel:

- 📤 **Post Log** - Manual posts with custom tags
- 📋 **View Logs** - Recent 50 events with timestamps
- 📊 **Statistics** - Total posts, relay health, uptime
- 🤖 **Bot Info** - Public key, relay status, connection info

### Automatic Logging

The bot automatically logs:
- ✅ Player connections/disconnections
- 💀 Player deaths
- 🚗 Vehicle spawns (optional)
- 🔫 Weapon distribution
- 💰 Money changes
- 👑 Admin actions

Configure what gets logged in `config.lua` lines 66-74.

### Exports (For Developers)

```lua
-- Post a custom log
exports['rde_nostr_log']:postLog('🎯 Custom event happened', {
    {'event_type', 'custom'},
    {'player', identifier}
})

-- Get bot's public key
local npub = exports['rde_nostr_log']:getBotNpub()
print('Bot npub: ' .. npub)
```

---

## 🔧 Configuration

### Essential Settings (`server.js`)

```javascript
Config.Nostr = {
    privateKey: '',              // Your bot's private key (hex or nsec)
    relays: [...],               // List of relay URLs
    batchEnabled: false,         // Batch posts every 5s (reduces spam)
    batchInterval: 5000,         // Batch interval in ms
}

Config.AdminSystem = {
    steamIds: ['steam:123...'],  // Your Steam ID
}
```

### Optional Tweaks (`config.lua`)

```lua
-- UI Settings
Config.UI.keybind = 'F5'              -- Admin panel hotkey
Config.UI.showNotifications = false   -- Dev notifications

-- Language
Config.DefaultLanguage = 'en'         -- 'en' or 'de'

-- Performance
Config.Performance.maxStoredLogs = 100  -- Logs kept in memory
```

---

## 🐛 Troubleshooting

### "Cannot find module 'nostr-tools'" or "Cannot find module 'ws'"

**On FiveM Server:**
```bash
cd resources/rde_nostr_log
yarn install
```

FiveM servers use **Yarn**, not npm. When you start the resource, FiveM automatically runs `yarn install` if `node_modules` is missing.

### "error @noble/ciphers: The engine 'node' is incompatible"

This means you have the wrong package versions. Make sure your `package.json` contains:
```json
{
  "dependencies": {
    "nostr-tools": "1.17.0",
    "ws": "8.14.2"
  }
}
```

These versions are compatible with FiveM's Node.js 16.

### "Relay REJECTED: invalid signature"

This usually means `nostr-tools` isn't installed properly. 

**Fix:**
```bash
cd resources/rde_nostr_log
rm -rf node_modules yarn.lock
yarn install
restart rde_nostr_log
```

Make sure your `server.js` imports `nostr-tools`:
```javascript
const { getPublicKey, getEventHash, getSignature, nip19 } = require('nostr-tools');
```

If you see `const CURVE = {` or `@noble/secp256k1` instead, you're using the wrong file!

### "No relays connected"

**Check 1: Network Access**
```bash
# SSH into your server
curl -I https://nos.lol
# Should return 200 OK or similar
```

**Check 2: Firewall**  
Your server must allow **outbound port 443** (HTTPS/WSS). Contact your hosting provider if blocked.

**Check 3: Server.cfg**
```cfg
# Add to server.cfg if needed
set sv_enableNetworkLimitManager false
```

**Common Hosting Issues:**
- **ZAP-Hosting:** Enable "External Connections" in web panel
- **Pterodactyl:** Check firewall rules allow port 443 outbound
- **OVH/Kimsufi:** May need to configure firewall via OVH panel
- **Shared Hosting:** Often blocks WebSocket - contact support

### "Relay error: ENOTFOUND" or "ETIMEDOUT"

Your server cannot resolve DNS or reach relays. This is a **network/hosting issue**, not a code problem.

**Try different relays** - some have better routing:
```javascript
relays: [
    'wss://relay.damus.io',    // Usually very reliable
    'wss://nos.lol',           // Fast, stable
    'wss://relay.primal.net'   // High uptime
]
```

### Posts don't appear in feed

**Wait 10-30 seconds** - relay propagation takes time.

**Check console for:**
```
✅ Relay ACCEPTED event abc123...
```

If you see `✅ ACCEPTED` → Posts are working! Just wait a bit.

If you see `❌ REJECTED` → Check the reason in console.

### Admin panel won't open

1. **Check your Steam ID** is in `server.js` line 57:
   ```javascript
   steamIds: ['steam:YOUR_STEAM_ID_HERE'],
   ```

2. **Get your Steam ID:**
   - Join your server
   - Check server console for your identifier
   - Look for `steam:110000xxxxxxxxxx`
   - Add it to the array above

3. Try `/nostrpanel` command instead of F5

4. Check F8 console (in-game) for errors

5. Make sure `ox_lib` is installed (for notifications)

---

## 📊 Performance Tips

### Batch Processing

For high-traffic servers, enable batching:

```javascript
Config.Nostr.batchEnabled = true;
Config.Nostr.batchInterval = 5000;  // Post every 5 seconds
Config.Nostr.batchMaxSize = 10;     // Max 10 events per batch
```

Batching combines multiple events into one post, reducing relay spam.

### Selective Logging

Disable noisy events in `config.lua`:

```lua
Config.Nostr.logLevel = {
    player_connect = true,
    player_disconnect = true,
    player_death = true,
    vehicle_spawn = false,    -- Can be very spammy!
    weapon_give = true,
    money_change = true,
}
```

### Relay Selection

**Less is more!** Using 10 relays doesn't mean 10x better.

- **3-5 relays** = Fast, reliable, good redundancy
- **10+ relays** = Slower posts, diminishing returns

Pick relays based on:
- 🌍 Geography (close to your server)
- 📊 Uptime (check [nostr.watch](https://nostr.watch/))
- 🎯 Purpose (some specialize in bots/logging)

---

## 🔐 Security Best Practices

### Private Key Safety

- ⚠️ **Never share your private key** (nsec/hex)
- ✅ **Backup your key** - write it down physically
- ❌ **Don't commit keys to GitHub** - add to `.gitignore`
- 🔒 **Use environment variables** in production

```javascript
// Good (environment variable)
privateKey: process.env.NOSTR_PRIVATE_KEY || ''

// Bad (hardcoded in repo)
privateKey: 'nsec123abc456...'
```

### Admin Security

**Use all three verification methods:**

```javascript
Config.AdminSystem = {
    acePermission: 'rde.nostr.admin',  // Server-level
    steamIds: ['steam:123...'],         // Account-level
    checkOrder: ['ace', 'steam']        // Check priority
}
```

### Data Sanitization

The bot automatically removes sensitive patterns:

```javascript
Config.Security.sanitizePatterns = [
    'password', 'token', 'api_key', 'secret', 'nsec', 'private'
]
```

Add more patterns if needed!

---

## 🔧 Technical Details

### Stack

**Server-Side:**
- Node.js 16+ (FiveM built-in)
- `nostr-tools` v1.17.0 (Official Nostr library)
- `ws` v8.14.2 (WebSocket client)
- BIP-340 Schnorr signatures (secp256k1)

**Client-Side:**
- Lua for FiveM integration
- HTML5/CSS3/JavaScript for NUI
- Real-time WebSocket monitoring
- AETHER-inspired UI design

### How It Works

1. **Initialization:**
   - Generates or loads private key
   - Derives public key (npub)
   - Connects to 4 Nostr relays via WebSocket

2. **Event Creation:**
   ```javascript
   const event = {
       kind: 1,                              // Text note
       pubkey: getPublicKey(privateKey),     // Your bot's public key
       created_at: Math.floor(Date.now() / 1000),
       tags: [['client', 'FiveM-RDE']],
       content: "Player joined the server"
   };
   event.id = getEventHash(event);           // SHA-256 hash
   event.sig = getSignature(event, privateKey); // Schnorr signature
   ```

3. **Publishing:**
   - Event sent to all connected relays
   - Each relay responds with OK or FAILED
   - Success tracked in statistics

4. **Relay Protocol (NIP-01):**
   ```javascript
   // Client → Relay
   ["EVENT", {...}]
   
   // Relay → Client (success)
   ["OK", "event_id", true, ""]
   
   // Relay → Client (rejected)
   ["OK", "event_id", false, "invalid: bad signature"]
   ```

### Why This Approach?

**Decentralization:**
- No single point of failure
- No company can ban you
- Global redundancy across relays

**Performance:**
- WebSocket = real-time, persistent connections
- Batching = reduces spam, improves efficiency
- Async publishing = non-blocking

**Security:**
- Cryptographic signatures prove authenticity
- Private key never leaves server
- Sanitization removes sensitive data

---

## 🌟 Advanced Usage

### Custom Events

Create your own log templates in `config.lua`:

```lua
Config.EventTemplates.custom_purchase = '🛒 {name} bought {item} for ${price}'

-- In your resource:
exports['rde_nostr_log']:postLog(
    string.format(Config.EventTemplates.custom_purchase, 
        GetPlayerName(source), 
        'Supercar', 
        50000
    ),
    {{'event', 'shop_purchase'}}
)
```

### Stats Tracking

The bot tracks:
- Total logs sent
- Total errors
- Relay success/fail rates
- Average post time
- Uptime

Access stats via admin panel or exports:

```lua
-- Custom stat display
RegisterCommand('nostr_stats', function()
    local stats = exports['rde_nostr_log']:getStats()
    print(json.encode(stats, {indent = true}))
end)
```

### Integration with ox_core

The bot auto-detects ox_core groups:

```lua
Config.AdminSystem.oxGroups = {
    ['admin'] = 0,
    ['superadmin'] = 0,
    ['management'] = 0
}
```

Add your custom groups here!

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines

- ✅ Keep the RDE header intact
- ✅ Follow existing code style
- ✅ Test on a live server before PR
- ✅ Update README if adding features
- ❌ Don't add telemetry or paid features
- ❌ Don't change the license

---

## 📜 License

**RDE Black Flag Source License v6.66**

```
###################################################################################
#                                                                                 #
#      .:: RED DRAGON ELITE (RDE)  -  BLACK FLAG SOURCE LICENSE v6.66 ::.         #
#                                                                                 #
#   PROJECT:    RDE_NOSTR_LOG (ADVANCED FIVEM NOSTR BOT, DECENTRALIZED LOGGING)   #
#   ARCHITECT:  .:: RDE ⧌ Shin [△ ᛋᛅᚱᛒᛅᚾᛏᛋ ᛒᛁᛏᛅ ▽] ::. | https://rd-elite.com     #
#   ORIGIN:     https://github.com/RedDragonElite                                 #
#                                                                                 #
#   WARNING: THIS CODE IS PROTECTED BY DIGITAL VOODOO AND PURE HATRED FOR LEAKERS #
#                                                                                 #
#   [ THE RULES OF THE GAME ]                                                     #
#                                                                                 #
#   1. // THE "FUCK GREED" PROTOCOL (FREE USE)                                    #
#      You are free to use, edit, and abuse this code on your server.             #
#      Learn from it. Break it. Fix it. That is the hacker way.                   #
#      Cost: 0.00€. If you paid for this, you got scammed by a rat.               #
#                                                                                 #
#   2. // THE TEBEX KILL SWITCH (COMMERCIAL SUICIDE)                              #
#      Listen closely, you parasites:                                             #
#      If I find this script on Tebex, Patreon, or in a paid "Premium Pack":      #
#      > I will DMCA your store into oblivion.                                    #
#      > I will publicly shame your community.                                    #
#      > I hope your server lag spikes to 9999ms every time you blink.            #
#      SELLING FREE WORK IS THEFT. AND I AM THE JUDGE.                            #
#                                                                                 #
#   3. // THE CREDIT OATH                                                         #
#      Keep this header. If you remove my name, you admit you have no skill.      #
#      You can add "Edited by [YourName]", but never erase the original creator.  #
#      Don't be a skid. Respect the architecture.                                 #
#                                                                                 #
#   4. // THE CURSE OF THE COPY-PASTE                                             #
#      This code uses advanced logic and cryptographic signatures.                #
#      If you just copy-paste without reading, it WILL break.                     #
#      Don't come crying to my DMs. RTFM or learn to code.                        #
#                                                                                 #
#   --------------------------------------------------------------------------    #
#   "We build the future on the graves of paid resources."                        #
#   "REJECT MODERN MEDIOCRITY. EMBRACE RDE SUPERIORITY."                          #
#   --------------------------------------------------------------------------    #
###################################################################################
```

**TL;DR:**
- ✅ **Free forever** - use, edit, learn
- ✅ **Keep the header** - credit where it's due
- ❌ **Don't sell it** - commercial use = instant DMCA
- ❌ **Don't be a skid** - copy-paste won't work anyway

---

## 🌐 Community & Support

### Official Links

- 🤖 [TheBot](https://primal.net/p/nprofile1qqs0tu49u5ranxetlaes9ehrc2gharlurlx4up33anjqw5at242p8lq32028f)
- 🌍 [Website](https://rd-elite.com)
- 🐙 [GitHub](https://github.com/RedDragonElite)
- 🔵 [Nostr](nostr:npub1c0dk5uwgxlqrakhdzht2qjauakew036qrxxmu94ll4hx2hqlzhjs2p7c8j)

### Creator

**Shin | Red Dragon Elite**
- Nostr: `npub1wr4e24zn6zzjqx8kvnelfvktf0pu6l2gx4gvw06zead2eqyn23sq9tsd94`
- Web: [rd-elite.com](https://rd-elite.com)

### Get Help

1. 📖 Read the [Full Documentation](#-full-installation-guide)
2. 🔍 Check [Troubleshooting](#-troubleshooting)
3. 🐛 [Open an Issue](https://github.com/RedDragonElite/rde_nostr_log/issues)

**Please DON'T:**
- ❌ DM for basic setup questions (read the docs first!)
- ❌ Ask "is it working?" without providing logs
- ❌ Request paid support (this is free software!)

**Please DO:**
- ✅ Include error messages when asking for help
- ✅ Mention your hosting provider if having network issues
- ✅ Search existing issues before creating new ones
- ✅ Share your success stories and feedback!

---

## 📈 Why Nostr > Discord

| Feature | Discord Webhooks | RDE Nostr Bot |
|---------|------------------|---------------|
| **Cost** | Free (rate limited) | Free (unlimited) |
| **Censorship** | Can be banned/deleted | Impossible to censor |
| **Privacy** | Discord owns your data | You control your keys |
| **Reliability** | Single point of failure | 100+ redundant relays |
| **Speed** | 30 requests/min limit | Unlimited posts |
| **Permanence** | Deleted if server banned | Permanent on chain |
| **Control** | Discord's rules apply | You own the protocol |

**The Math:**
- Discord: 30 posts/min max = **43,200 posts/day**
- Nostr: Unlimited = **∞ posts/day**

For a 100-player server, you'll hit Discord's limit in under an hour. With Nostr? Never.

---

## 💡 FAQ

### Is this really free?
**Yes.** 100% free, forever. No "premium" version, no upsells, no BS. If you paid for this, you got scammed.

### Can Discord ban my bot?
**No.** This doesn't use Discord at all. Nostr is a decentralized protocol - there's no company to ban you.

### Will this work on my FiveM server?
**Yes!** Tested on:
- ✅ Linux servers (Ubuntu, Debian, CentOS)
- ✅ Windows servers
- ✅ ZAP-Hosting
- ✅ Pterodactyl panel
- ✅ OVH/Kimsufi dedicated servers
- ✅ txAdmin

**Requirements:**
- Node.js 16+ (comes with FiveM)
- Outbound port 443 access (for WebSocket)
- Yarn (comes with FiveM)

### Do I need to install Node.js?
**No.** FiveM servers already have Node.js built-in. The resource uses FiveM's Node.js environment.

### What about npm vs yarn?
FiveM uses **Yarn** by default. When you `ensure` or `start` the resource, FiveM automatically runs `yarn install` if needed. You don't need to do anything manually (unless troubleshooting).

### What if relays go down?
Your logs are on 4+ relays. Even if 3 go down, your logs survive on the 4th. True redundancy.

### Can I use this on multiple servers?
Yes! Install it on each server. Each server can have its own identity (npub) or share one.

### Is this legal?
Yes. Nostr is a protocol, like HTTP. You're just posting messages to relays. Nothing illegal about that.

### Can I see who views my logs?
No. Nostr is public by design. Anyone with your npub can read your posts. Don't log sensitive data!

### How do I delete old logs?
You can't. Nostr events are permanent (like blockchain). Only post what you're okay being public forever.

### Can I customize the UI?
Yes! Edit `nui/index.html` and `nui/script.js`. Colors are in `config.lua`.

### Does this work with ESX/QBCore/etc?
Yes. Framework-agnostic. Works with anything that runs on FiveM.

### Can I contribute?
Please do! See [Contributing](#-contributing) section.

---

## 🏆 Credits

**Built by:** [Red Dragon Elite](https://rd-elite.com)  
**Creator:** Shin | [Nostr](nostr:npub1wr4e24zn6zzjqx8kvnelfvktf0pu6l2gx4gvw06zead2eqyn23sq9tsd94)  
**Special Thanks:**
- Nostr protocol developers
- [@noble/secp256k1](https://github.com/paulmillr/noble-secp256k1) by Paul Miller
- The FiveM community
- Everyone who believes in decentralization

---

## ⚡ One More Thing...

**If you like this project:**
- ⭐ **Star this repo** (helps others discover it!)
- 🍴 **Fork it** (build something cool!)
- 💬 **Share it** (spread the word!)
- 🐉 **Follow us** on [Nostr](nostr:npub1wr4e24zn6zzjqx8kvnelfvktf0pu6l2gx4gvw06zead2eqyn23sq9tsd94)

**Remember:**
> "We build the future on the graves of paid resources."  
> — Red Dragon Elite

---

<div align="center">

**Made with 🔥 by [Red Dragon Elite](https://rd-elite.com)**

*REJECT MODERN MEDIOCRITY. EMBRACE RDE SUPERIORITY.*

[![Website](https://img.shields.io/badge/Website-Visit-red?style=for-the-badge&logo=google-chrome)](https://rd-elite.com)
[![Nostr](https://img.shields.io/badge/Nostr-Follow-purple?style=for-the-badge&logo=rss)](nostr:npub1wr4e24zn6zzjqx8kvnelfvktf0pu6l2gx4gvw06zead2eqyn23sq9tsd94)

</div>
