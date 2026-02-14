# 📡 NOSTR INTEGRATION GUIDE

## 🌍 Was ist Nostr?

**Nostr** (Notes and Other Stuff Transmitted by Relays) ist ein **dezentrales Kommunikationsprotokoll** - eine Alternative zu Twitter/X, aber:

- ✅ **Unzensierbar** - Niemand kann dich sperren
- ✅ **Dezentral** - Keine zentrale Instanz
- ✅ **Offen** - Jeder kann teilnehmen
- ✅ **Permanent** - Logs bleiben für immer
- ✅ **Kryptographisch sicher** - Alles ist signiert

**Perfekt für Server-Logs!** 🚀

---

## 🔑 Keys verstehen

### Private Key (nsec)
- **Dein Geheimnis** - NIEMALS teilen!
- Format: `nsec1...` (59 Zeichen)
- Wird zum Signieren von Events verwendet
- **Wenn verloren = Identity verloren!**

### Public Key (npub)
- **Deine öffentliche ID** - Safe zum Teilen
- Format: `npub1...` (63 Zeichen)
- Damit finden andere deine Logs
- Wird aus dem Private Key generiert

**Analogie:**
- Private Key = Dein Passwort
- Public Key = Dein Benutzername

---

## 📡 Relays verstehen

### Was sind Relays?

Relays sind **Server**, die Nostr-Events speichern und weiterleiten. Sie sind wie:
- Discord-Server, aber dezentral
- Twitter-Server, aber jeder kann einen betreiben
- Email-Server, aber für Social Media

### Wie funktioniert's?

```
Dein Bot → Event signieren → An Relays senden
                                    ↓
                            Relays speichern
                                    ↓
                            Clients können lesen
```

### Empfohlene Relays

**Große, stabile Relays:**
```lua
'wss://relay.damus.io'     -- Am populärsten
'wss://nos.lol'            -- Sehr schnell
'wss://relay.snort.social' -- Feature-rich
'wss://nostr.wine'         -- Premium
'wss://relay.primal.net'   -- Gute Performance
```

**Spezial-Relays:**
```lua
'wss://nostr.mom'          -- Community-driven
'wss://relay.nostr.band'   -- Mit Suchfunktion
'wss://relay.orangepill.dev' -- Bitcoin-fokussiert
```

### Eigenen Relay hosten?

**Ja, kannst du!** 
- [strfry](https://github.com/hoytech/strfry) - C++, ultra-fast
- [nostr-rs-relay](https://git.sr.ht/~gheartsfield/nostr-rs-relay) - Rust, performant
- [relay](https://github.com/fiatjaf/relay) - Go, einfach

**Vorteile:**
- Volle Kontrolle über deine Logs
- Garantierte Verfügbarkeit
- Keine Limits

**Nachteil:**
- Weniger Reichweite (nur du & deine Follower sehen's)

---

## 🎯 Nostr Clients

### Desktop
- **[Damus](https://damus.io)** (macOS) - Schönste UI
- **[Gossip](https://github.com/mikedilger/gossip)** - Feature-rich
- **[Snort](https://snort.social)** - Web-based, schnell

### Mobile
- **Damus** (iOS) - Top-Tier
- **[Amethyst](https://github.com/vitorpamplona/amethyst)** (Android) - Bester Android Client
- **[Primal](https://primal.net)** (iOS/Android) - Einfach & schön

### Web
- **[Snort.social](https://snort.social)** - PWA, sehr schnell
- **[Coracle](https://coracle.social)** - Feature-packed
- **[Nostrudel](https://nostrudel.ninja)** - Experimentell

### Empfehlung für Server-Logs:
**[nostr.band](https://nostr.band)** - Perfekt zum Durchsuchen & Filtern!

---

## 🔍 Deinen Bot finden

### Via npub
1. Bot starten
2. npub aus Console kopieren (z.B. `npub1abc...xyz`)
3. In Nostr Client suchen
4. Folgen!

### Via Relay
Wenn du `wss://relay.damus.io` nutzt:
1. Gehe zu https://nostr.band
2. Suche deine npub
3. Siehst alle Posts!

### Via Tags
Filtern nach Tags:
- `#RedDragonElite` - Alle RDE Posts
- `#FiveM` - Alle FiveM Posts
- `#ServerLog` - Alle Server-Logs

---

## 🎨 Event-Struktur

### Nostr Event Format

```json
{
  "id": "event_hash",
  "pubkey": "dein_public_key",
  "created_at": 1234567890,
  "kind": 1,
  "tags": [
    ["t", "RedDragonElite"],
    ["t", "FiveM"],
    ["event", "player_join"]
  ],
  "content": "🔌 PlayerName (steam:123) connected...",
  "sig": "signature"
}
```

### Event Kinds

Der Bot nutzt:
- **Kind 1** - Text Notes (Standard für Logs)
- **Kind 30078** - Application-specific data (optional)

Andere Kinds:
- Kind 0 = Metadata (Profile)
- Kind 3 = Contacts (Following)
- Kind 7 = Reactions (Likes)

---

## 🏷️ Tagging Strategy

### Standard Tags
```lua
{
    {'t', 'RedDragonElite'},  -- Hashtag
    {'t', 'FiveM'},
    {'server', 'My Server Name'},
    {'event', 'player_join'}
}
```

### Custom Tags
```lua
{
    {'player', 'steam:123456'},
    {'amount', '10000'},
    {'transaction', 'purchase'}
}
```

### Filtering Tags
Clients können nach Tags filtern:
```
Show only #player_death events
Show only events from this server
```

---

## 🔐 Sicherheit & Privacy

### Was ist öffentlich?

**Alles!** Nostr ist ein **öffentliches Protokoll**.

- ✅ Jeder kann deine Logs lesen
- ✅ Jeder kann deinen npub folgen
- ✅ Events sind permanent

**Deshalb:**
- ❌ KEINE Passwörter loggen
- ❌ KEINE privaten Daten
- ❌ KEINE Credit Card Numbers
- ✅ Use Sanitization!

### Sanitization

Der Bot hat **automatische Sanitization**:

```lua
Config.Security = {
    sanitizeLogs = true,
    sanitizePatterns = {
        '%d%d%d%d%-%d%d%d%d%-%d%d%d%d%-%d%d%d%d', -- CC
        'password[%s:=]+%S+',
        'token[%s:=]+%S+'
    }
}
```

**Vorher:**
```
Player paid with card 1234-5678-9012-3456
```

**Nachher:**
```
Player paid with card [REDACTED]
```

---

## 🚀 Advanced Features

### NIP-04: Encrypted Direct Messages

**Möglich** - Private Logs nur für Admins:

```lua
-- Future feature
exports['rde_nostr_log']:postEncryptedLog(
    content,
    recipientPubkey
)
```

### NIP-05: Verification

**Empfohlen** - Verifiziere deinen Bot:

1. Domain besitzen
2. `.well-known/nostr.json` erstellen:
```json
{
  "names": {
    "myserver": "your_pubkey_hex"
  }
}
```
3. In Bot-Profil eintragen: `myserver@yourdomain.com`

**Vorteil:** Checkmark ✓ bei Bot-Name

### NIP-23: Long-form Content

**Für Reports** - Lange Berichte statt kurzer Logs:

```lua
-- Kind 30023 - Artikel
exports['rde_nostr_log']:postArticle(
    title,
    content,
    summary
)
```

### NIP-65: Relay Lists

**Auto-Discovery** - Clients finden deine Relays:

```lua
-- Kind 10002
exports['rde_nostr_log']:publishRelayList()
```

---

## 📊 Analytics & Monitoring

### Relay Monitoring

**Prüfen ob Relays funktionieren:**

```bash
# Via curl
curl -H "Accept: application/nostr+json" \
     wss://relay.damus.io

# Via websocat
websocat wss://relay.damus.io
```

### Event Stats

**Wie viele sehen deine Logs?**

- [nostr.band](https://nostr.band) - Zeigt Event-Reichweite
- [stats.nostr.band](https://stats.nostr.band) - Relay-Statistiken

### Follower Tracking

**Wer folgt deinem Bot?**

```lua
-- Future feature
local followers = exports['rde_nostr_log']:getFollowers()
print('Bot has ' .. #followers .. ' followers!')
```

---

## 🎮 Integration Examples

### Discord Bridge

**Logs auch nach Discord senden:**

```lua
RegisterNetEvent('rde_nostr:logPosted', function(content)
    -- Send to Discord webhook
    PerformHttpRequest('https://discord.com/api/webhooks/...', 
        function() end, 
        'POST', 
        json.encode({content = content})
    )
end)
```

### Web Dashboard

**Read-only Nostr Dashboard:**

```html
<script src="https://unpkg.com/nostr-tools"></script>
<script>
const pool = new SimplePool();
const pubkey = 'your_bot_pubkey';

pool.subscribe(
    ['wss://relay.damus.io'],
    [{kinds: [1], authors: [pubkey]}],
    {
        onevent(event) {
            console.log('New log:', event.content);
            displayLog(event);
        }
    }
);
</script>
```

### Telegram Bot

**Forward logs to Telegram:**

```lua
RegisterNetEvent('rde_nostr:logPosted', function(content)
    PerformHttpRequest(
        'https://api.telegram.org/bot<TOKEN>/sendMessage',
        function() end,
        'POST',
        json.encode({
            chat_id = 'YOUR_CHAT_ID',
            text = content
        })
    )
end)
```

---

## 🔧 Troubleshooting

### Logs erscheinen nicht

**Check:**
1. Bot connected to relays? → Console output
2. Private key valid? → Check format
3. Events signed? → `verifyEvent()` result
4. Relay online? → Test via curl

### Performance Issues

**Solutions:**
1. Enable batching
2. Reduce relay count
3. Increase batch interval
4. Use local relay

### Too many logs

**Solutions:**
1. Disable verbose events (vehicle_spawn)
2. Increase batch size
3. Use higher log levels
4. Filter before posting

---

## 💡 Best Practices

### 1. Use Batching
```lua
Config.Nostr.batchEnabled = true
Config.Nostr.batchInterval = 5000
```

### 2. Meaningful Tags
```lua
{
    {'event', 'player_death'},   -- Good
    {'xyz', 'abc'}                -- Bad
}
```

### 3. Consistent Format
```lua
-- Good
'🔌 PlayerName connected'
'💀 PlayerName died'
'💰 PlayerName earned $100'

-- Bad
'Player connected'
'Death occurred'
'Money: 100'
```

### 4. Security First
```lua
-- Never log:
'password: hunter2'
'credit_card: 1234-5678'
'private_key: abc123'

-- Always sanitize!
```

### 5. Descriptive Content
```lua
-- Good
'🚗 PlayerName spawned Adder [ABC123]'

-- Bad
'Vehicle spawned'
```

---

## 🌟 Future Possibilities

- **NIP-28** - Public Chat (Live Server Chat on Nostr)
- **NIP-65** - Relay List Metadata
- **NIP-89** - App Handlers (Click log → Open in FiveM)
- **NIP-94** - File Metadata (Attach screenshots to logs)
- **Custom Clients** - Dedicated FiveM log viewers

---

## 📚 Resources

### Learn Nostr
- [nostr.how](https://nostr.how) - Best intro guide
- [nostr.info](https://nostr.info) - Protocol docs
- [NIPs](https://github.com/nostr-protocol/nips) - Protocol specs

### Development
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) - JS library
- [rust-nostr](https://github.com/rust-nostr/nostr) - Rust library
- [awesome-nostr](https://github.com/aljazceru/awesome-nostr) - All things Nostr

### Community
- [Discord](https://discord.gg/nostr)
- [Telegram](https://t.me/nostr_protocol)
- Twitter: #nostr

---

## 🎯 Final Words

Nostr ist die **Zukunft der zensurresistenten Kommunikation**.

Deine Server-Logs sind jetzt:
- ✅ Permanent
- ✅ Unzensierbar
- ✅ Dezentral
- ✅ Öffentlich zugänglich
- ✅ Kryptographisch verifiziert

**Willkommen in der Zukunft!** 🚀

⚡ Red Dragon Elite | 777 Hz ∆ ⚡
