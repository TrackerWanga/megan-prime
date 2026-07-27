// ╔══════════════════════════════════════════════════╗
// ║   MEGAN-PRIME OWNER COMMANDS                     ║
// ║  Bot Management | Newsletter Styled              ║
// ╚══════════════════════════════════════════════════╝

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const config = require('../../megan/config');
const dev = require('../../megan/lib/developer');
const { replyStyled } = require('../../megan/lib/styler');

const commands = [];
const FOOTER = '> Megan-Prime | Owner Panel';
const PKG = require('../../package.json');

function formatUptime(s) {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
}

async function ownerReply(sock, from, text, msg) {
    await replyStyled(sock, from, text, msg, {
        title: 'Megan-Prime',
        footer: FOOTER,
        useNewsletter: true,
        newsletterName: 'Owner Panel',
        largeThumb: false,
        buttons: []
    });
}

// ═══════════════════════════════════════════
// 1. RESTART
// ═══════════════════════════════════════════
commands.push({
    name: 'restart', description: 'Restart the bot',
    aliases: ['reboot', 'reload'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply(`❌ *Owner Only*\n\n${FOOTER}`);
        await react('🔄');
        await ownerReply(sock, from, `🔄 *Restarting...*\n\n⏳ Bot will auto-restart\n📋 PM2/systemd handles recovery`, msg);
        setTimeout(() => process.exit(0), 2000);
    }
});

// ═══════════════════════════════════════════
// 2. UPDATE
// ═══════════════════════════════════════════
commands.push({
    name: 'update', description: 'Update from GitHub',
    aliases: ['upgrade', 'gitpull'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply(`❌ *Owner Only*\n\n${FOOTER}`);
        await react('⬆️');
        try { await execAsync('git --version'); } catch(e) { return reply(`❌ Git not installed\n\n${FOOTER}`); }

        await ownerReply(sock, from, `⬆️ *Checking for updates...*\n\n🔄 Fetching from GitHub...`, msg);

        try {
            await execAsync('git stash').catch(() => {});
            const { stdout: pullOut } = await execAsync('git pull origin main 2>&1 || git pull origin master 2>&1');

            if (pullOut.includes('Already up to date')) {
                await ownerReply(sock, from, `✅ *Already Up to Date*\n\n📦 Latest version running\n🔧 No changes needed`, msg);
                return await react('✅');
            }

            await ownerReply(sock, from, `📥 *Code Updated!*\n\n📦 Installing dependencies...`, msg);
            await execAsync('npm install --no-audit --no-fund 2>&1');

            await ownerReply(sock, from, `✅ *Update Complete!*\n\n🔄 Restarting now...`, msg);
            setTimeout(() => process.exit(0), 2000);
        } catch(e) {
            await react('❌');
            await ownerReply(sock, from, `❌ *Update Failed*\n\n${e.message?.substring(0,200)}\n\n💡 Try: \`git pull && npm install\``, msg);
        }
    }
});

// ═══════════════════════════════════════════
// 3. VERSION
// ═══════════════════════════════════════════
commands.push({
    name: 'version', description: 'Bot version info',
    aliases: ['ver', 'botversion'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        await react('📌');
        let gitHash = 'unknown', gitBranch = 'unknown', lastCommit = 'unknown';
        try { gitHash = (await execAsync('git rev-parse --short HEAD')).stdout.trim(); } catch(e) {}
        try { gitBranch = (await execAsync('git rev-parse --abbrev-ref HEAD')).stdout.trim(); } catch(e) {}
        try { lastCommit = (await execAsync('git log -1 --format=%cd --date=short')).stdout.trim(); } catch(e) {}

        const mem = Math.round(process.memoryUsage().heapUsed / 1048576);
        const text = `📌 *${config.BOT_NAME}* v${PKG.version}\n\n` +
            `🔧 Git: \`${gitHash}\` @ ${gitBranch}\n` +
            `📅 Commit: ${lastCommit}\n` +
            `⏱️ Uptime: ${formatUptime(process.uptime())}\n` +
            `💾 RAM: ${mem}MB | 📚 ${bot.commands.size} commands\n` +
            `⚡ Node ${process.version} | 📡 Megan API v3.6.4`;

        await ownerReply(sock, from, text, msg);
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 4. GIT STATUS
// ═══════════════════════════════════════════
commands.push({
    name: 'gitstatus', description: 'Git repository status',
    aliases: ['git', 'gitlog'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply(`❌ *Owner Only*\n\n${FOOTER}`);
        await react('🔍');
        try {
            const { stdout: status } = await execAsync('git status --short');
            const { stdout: branch } = await execAsync('git branch --show-current');
            const { stdout: log } = await execAsync('git log --oneline -5');

            let text = `🌿 *${branch.trim()}*\n\n`;
            text += status.trim() ? `📝 *Changes:*\n${status.trim()}\n\n` : `✅ Working tree clean\n\n`;
            text += `📋 *Recent:*\n${log.trim()}`;

            await ownerReply(sock, from, text, msg);
            await react('✅');
        } catch(e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 5. SHELL
// ═══════════════════════════════════════════
commands.push({
    name: 'shell', description: 'Run shell command',
    aliases: ['exec', 'cmd', '$'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply(`❌ *Owner Only*\n\n${FOOTER}`);
        if (!args.length) return reply(`💻 *Shell*\n\nUsage: ${config.PREFIX}shell <command>\n\n${FOOTER}`);

        const cmd = args.join(' ');
        const blocked = ['rm -rf', 'sudo', 'su', 'passwd', 'shutdown', 'reboot', 'mkfs'];
        if (blocked.some(b => cmd.toLowerCase().includes(b))) {
            await react('🚫');
            return reply(`🚫 *Blocked*\n\n${FOOTER}`);
        }

        await react('💻');
        try {
            const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
            const output = (stdout + stderr).substring(0, 2500) || '(no output)';
            await ownerReply(sock, from, `💻 *${cmd.substring(0,50)}*\n\n${output}`, msg);
            await react('✅');
        } catch(e) {
            await react('❌');
            await ownerReply(sock, from, `❌ *Error*\n\n${e.message?.substring(0,500)}`, msg);
        }
    }
});

// ═══════════════════════════════════════════
// 6. BOT STATS
// ═══════════════════════════════════════════
commands.push({
    name: 'botstats', description: 'Full system statistics',
    aliases: ['fullstats', 'sysinfo'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply(`❌ *Owner Only*\n\n${FOOTER}`);
        await react('📊');
        try {
            const os = require('os');
            const mem = process.memoryUsage();
            const cpu = os.loadavg();
            let gitHash = 'N/A';
            try { gitHash = (await execAsync('git rev-parse --short HEAD')).stdout.trim(); } catch(e) {}
            const { stdout: disk } = await execAsync('df -h . | tail -1 | awk "{print $3,$4,$5}"').catch(() => ({ stdout: 'N/A' }));

            const text = `📊 *System Stats*\n\n` +
                `🤖 ${config.BOT_NAME} v${PKG.version} (\`${gitHash}\`)\n` +
                `⏱️ Uptime: ${formatUptime(process.uptime())}\n` +
                `📚 Commands: ${bot.commands.size}\n\n` +
                `💾 RAM: ${Math.round(mem.heapUsed/1048576)}/${Math.round(mem.heapTotal/1048576)}MB\n` +
                `💻 System: ${(os.totalmem()/1073741824).toFixed(1)}GB (${(os.freemem()/1073741824).toFixed(1)}GB free)\n` +
                `📊 CPU: ${cpu.map(c=>c.toFixed(1)).join(' / ')}\n` +
                `💿 Disk: ${disk.trim()}\n` +
                `⚡ Node ${process.version} | ${os.platform()} ${os.arch()} | PID ${process.pid}`;

            await ownerReply(sock, from, text, msg);
            await react('✅');
        } catch(e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 7. PAIR - Uses pair.megan.qzz.io
// ═══════════════════════════════════════════
commands.push({
    name: 'pair', description: 'Generate WhatsApp pairing code',
    aliases: ['paircode', 'getcode', 'connect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`📱 *Pair Code*\n\nUsage: ${config.PREFIX}pair <number>\nExample: ${config.PREFIX}pair 254758476795\n\n🌐 pair.megan.qzz.io\n\n${FOOTER}`);

        const phone = args[0].replace(/[^0-9]/g, '');
        if (phone.length < 10) return reply(`❌ Invalid number. Include country code.\n\n${FOOTER}`);

        await react('📱');
        await ownerReply(sock, from, `📱 *Connecting...*\n\n📞 +${phone}\n⏳ This takes ~60 seconds\n🔄 Server may be waking up...`, msg);

        const axios = require('axios');
        let code = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (attempt > 1) await reply(`🔄 *Retry ${attempt}/3...*\n\n${FOOTER}`);
                const res = await axios.get(`https://pair.megan.qzz.io/pair?number=${phone}`, { timeout: 120000 });
                if (res.data?.code) { code = res.data.code; break; }
            } catch(e) {
                console.log(`Pair attempt ${attempt}: ${e.message}`);
                if (attempt < 3) await new Promise(r => setTimeout(r, 5000));
            }
        }

        if (code) {
            await react('✅');
            await ownerReply(sock, from, `📱 *Pairing Code Ready!*\n\n📞 +${phone}\n🔢 *${code}*\n\n⚡ Open WhatsApp → Linked Devices\n🔗 Tap "Link a Device"\n📲 Enter the code above\n\n⏰ Expires in 60 seconds\n🌐 pair.megan.qzz.io`, msg);
        } else {
            await react('❌');
            await ownerReply(sock, from, `❌ *Server Busy*\n\nTry directly:\n🌐 https://pair.megan.qzz.io/pair\n\nOr retry: .pair ${phone}`, msg);
        }
    }
});

// ═══════════════════════════════════════════
// 8. REPO
// ═══════════════════════════════════════════
commands.push({
    name: 'repo', description: 'Repository & deploy info',
    aliases: ['repository', 'source', 'github'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        await react('📦');
        const text = `📦 *Megan-Prime*\n\n` +
            `🔗 github.com/TrackerWanga/megan-prime\n` +
            `📡 ${dev.API_BASE?.replace('https://','') || 'apis.megan.qzz.io'}\n` +
            `🌐 pair.megan.qzz.io\n\n` +
            `👤 ${dev.DEVELOPER || 'TrackerWanga'}\n` +
            `📞 ${dev.DEVELOPER_NUMBER}\n\n` +
            `📥 .deploy | 📱 .pair`;

        await ownerReply(sock, from, text, msg);
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 9. DEPLOY GUIDES
// ═══════════════════════════════════════════
commands.push({
    name: 'deploy', description: 'Deployment guides',
    aliases: ['deployguide', 'host'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const platform = args[0]?.toLowerCase();
        const guides = {
            render: `🚀 *Deploy to Render*\n\n1. Fork repo on GitHub\n2. dashboard.render.com → New Web Service\n3. Connect repo, build: \`npm install\`, start: \`npm start\`\n4. Add .env with SESSION=\n5. Deploy!\n\n⏰ Free tier: 15min sleep\n💡 Use .update to keep current`,
            heroku: `🚀 *Deploy to Heroku*\n\n1. Fork repo → heroku.com → New App\n2. Connect GitHub → Add nodejs buildpack\n3. Deploy main branch\n4. Add .env vars\n\n💡 .update = git pull`,
            termux: `🚀 *Deploy to Termux*\n\n1. pkg install git nodejs\n2. git clone <repo>\n3. npm install\n4. Add SESSION= to .env\n5. npm start\n\n📱 Get session: .pair 254XXXXX`
        };

        if (platform && guides[platform]) {
            await ownerReply(sock, from, guides[platform], msg);
        } else {
            await ownerReply(sock, from, `🚀 *Deploy Guides*\n\nChoose platform:\n• .deploy render\n• .deploy heroku\n• .deploy termux\n\n📱 Session: .pair <number>\n🌐 pair.megan.qzz.io`, msg);
        }
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 10. SESSION GUIDE
// ═══════════════════════════════════════════
commands.push({
    name: 'session', description: 'How to get a WhatsApp session',
    aliases: ['getsession', 'sessionguide'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        await react('🔐');
        const text = `🔐 *Get Session*\n\n` +
            `📱 *Pair Code:* .pair 254XXXXXXXXX\n` +
            `🌐 *Website:* pair.megan.qzz.io\n` +
            `📷 *QR Scan:* Set SESSION='' in .env\n\n` +
            `📦 Then deploy: .deploy`;

        await ownerReply(sock, from, text, msg);
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 11. DASHBOARD - Bot dashboard link
// ═══════════════════════════════════════════
commands.push({
    name: 'dashboard', description: 'Get bot dashboard link',
    aliases: ['db', 'botpanel', 'botdashboard'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        await react('📊');
        const url = bot.botApi?.getDashboardUrl();
        if (url) {
            await ownerReply(sock, from, `📊 *Bot Dashboard*

🔗 ${url}

View stats, messages, groups, and send remote commands.

👤 ${dev.DEVELOPER}`, msg);
        } else {
            await reply(`❌ *Dashboard not available*

Login to auth.megan.qzz.io first.

${FOOTER}`);
        }
        await react('✅');
    }
});

module.exports = { commands };
