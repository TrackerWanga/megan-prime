// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME GROUP COMMANDS - Complete v3.6.4   ║
// ║  Creation | Members | Tagging | Settings | Mod   ║
// ╚══════════════════════════════════════════════════╝

const GroupHelper = require('../../megan/helpers/groupHelper');
const config = require('../../megan/config');
const { resolveRealJid } = require('../../megan/lib/lidResolver');

const MEGAN_LOGO = 'https://files.catbox.moe/0v8bkv.png';
const FOOTER = '> Megan-Prime | TrackerWanga';
const commands = [];

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

async function sendWithLogo(sock, to, text, quoted = null) {
    try { await sock.sendMessage(to, { image: { url: MEGAN_LOGO }, caption: text }, { quoted }); }
    catch (e) { await sock.sendMessage(to, { text }, { quoted }); }
}

function reply(sock, to, text, quoted = null) {
    return sock.sendMessage(to, { text }, { quoted });
}

function extractPhone(input) {
    if (!input) return null;
    return input.replace(/[^0-9]/g, '') || null;
}

async function getDisplayName(sock, jid) {
    if (!jid) return 'Unknown';
    if (jid.endsWith('@lid')) {
        try { const real = await resolveRealJid(sock, jid); if (real && !real.endsWith('@lid')) jid = real; } catch(e) {}
    }
    try {
        if (sock && jid.endsWith('@s.whatsapp.net')) {
            const contact = await sock.getContact(jid);
            if (contact?.name) return contact.name;
            if (contact?.notify) return contact.notify;
        }
    } catch(e) {}
    return '+' + jid.split('@')[0].replace(/[^0-9]/g, '');
}

async function resolveParticipant(sock, jid) {
    if (!jid.endsWith('@lid')) return jid;
    try { const r = await resolveRealJid(sock, jid); if (r?.endsWith('@s.whatsapp.net')) return r; } catch(e) {}
    return null;
}

async function getValidMentions(sock, participants) {
    const jids = [];
    for (const p of participants) {
        const id = typeof p === 'string' ? p : p.id;
        let jid = id;
        if (jid.endsWith('@lid')) {
            try { const r = await resolveRealJid(sock, jid); if (r?.endsWith('@s.whatsapp.net')) jid = r; else continue; } catch(e) { continue; }
        }
        if (jid.endsWith('@s.whatsapp.net') && !jids.includes(jid)) jids.push(jid);
    }
    return jids;
}

function senderName(msg, sender) { return msg.pushName || sender.split('@')[0] || 'Someone'; }

// ═══════════════════════════════════════════
// CREATION & INFO
// ═══════════════════════════════════════════

commands.push({
    name: 'creategroup', description: 'Create a new WhatsApp group',
    aliases: ['creategc', 'newgroup'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (args.length < 1) return reply(sock, from, `📝 Usage: ${config.PREFIX}creategroup <name> [numbers]\n\n${FOOTER}`, msg);
        await react('🔄');
        try {
            const name = args[0];
            const participants = [`${config.OWNER_NUMBER}@s.whatsapp.net`];
            for (let i = 1; i < args.length; i++) {
                const phone = extractPhone(args[i]);
                if (phone?.length >= 10) participants.push(`${phone}@s.whatsapp.net`);
            }
            const group = await sock.groupCreate(name, participants);
            await sendWithLogo(sock, from, `✅ *Group Created!*\n📛 ${name}\n👥 ${participants.length} members\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'creategcadd', description: 'Create group and add members',
    aliases: ['newgroupadd'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (args.length < 2) return reply(sock, from, `📝 Usage: ${config.PREFIX}creategcadd <name> <numbers...>\n\n${FOOTER}`, msg);
        await react('🔄');
        try {
            const name = args[0];
            const participants = [`${config.OWNER_NUMBER}@s.whatsapp.net`];
            for (let i = 1; i < args.length; i++) {
                const phone = extractPhone(args[i]);
                if (phone?.length >= 10) participants.push(`${phone}@s.whatsapp.net`);
            }
            const group = await sock.groupCreate(name, participants);
            setTimeout(async () => {
                await sock.sendMessage(group.id, { text: `🎉 *Welcome to ${name}!*\n\n${FOOTER}`, mentions: participants });
            }, 2000);
            await sendWithLogo(sock, from, `✅ *Group Created!*\n📛 ${name}\n👥 ${participants.length}\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'groupinfo', description: 'Get detailed group information',
    aliases: ['ginfo', 'infogc'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        let target = from;
        if (args.length && args[0].includes('chat.whatsapp.com')) {
            try { const data = await sock.groupGetInviteInfo(GroupHelper.extractGroupCode(args[0])); target = data.id; }
            catch (e) { return reply(sock, from, `❌ Invalid link!\n\n${FOOTER}`, msg); }
        }
        if (!GroupHelper.isGroupJid(target)) return reply(sock, from, `❌ Not a group!\n\n${FOOTER}`, msg);
        await react('ℹ️');
        try {
            const metadata = await sock.groupMetadata(target);
            await sendWithLogo(sock, from, GroupHelper.formatGroupInfo(metadata), msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'groups', description: 'List all groups bot is in',
    aliases: ['grouplist', 'mygroups'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        await react('📋');
        try {
            const groups = await sock.groupFetchAllParticipating();
            const list = Object.values(groups);
            if (!list.length) return reply(sock, from, `❌ Not in any groups.\n\n${FOOTER}`, msg);
            let text = `📋 *MY GROUPS (${list.length})*\n\n`;
            for (let i = 0; i < Math.min(list.length, 15); i++) {
                text += `${i + 1}. *${list[i].subject}*\n   👥 ${list[i].participants.length}\n\n`;
            }
            if (list.length > 15) text += `... +${list.length - 15} more\n`;
            text += FOOTER;
            await sendWithLogo(sock, from, text, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'metadata', description: 'Get group info from invite link',
    aliases: ['groupmeta', 'linkinfo'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!args.length || !args[0].includes('chat.whatsapp.com')) return reply(sock, from, `📝 Usage: ${config.PREFIX}metadata <invite link>\n\n${FOOTER}`, msg);
        await react('🔍');
        try {
            const data = await sock.groupGetInviteInfo(GroupHelper.extractGroupCode(args[0]));
            await sendWithLogo(sock, from, `📌 *GROUP PREVIEW*\n📛 ${data.subject || '?'}\n👥 ${data.size || '?'} members\n📝 ${(data.desc || 'None').substring(0, 200)}\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ Invalid/expired link!\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'participants', description: 'List group participants with roles',
    aliases: ['members', 'memberlist'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('📋');
        try {
            const metadata = await sock.groupMetadata(from);
            const { superAdmins, admins, members } = GroupHelper.categorizeParticipants(metadata.participants);
            const jids = await getValidMentions(sock, metadata.participants);
            let text = `📋 *PARTICIPANTS (${metadata.participants.length})*\n\n`;
            if (superAdmins.length) { text += `👑 *Super Admins:*\n`; for (const s of superAdmins) text += `• ${s.display}\n`; text += `\n`; }
            if (admins.length) { text += `👮 *Admins:*\n`; for (const a of admins) text += `• ${a.display}\n`; text += `\n`; }
            if (members.length) {
            text += `👤 *Members:*\n`;
            members.forEach(j => text += `• @${j.split('@')[0]}\n`);
            text += `\n`;
        }
        text += FOOTER;
            await sendWithLogo(sock, from, text, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'admins', description: 'List all group admins',
    aliases: ['adminlist', 'gadmins'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('👑');
        try {
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(p => p.admin);
            if (!admins.length) return reply(sock, from, `⚠️ No admins!\n\n${FOOTER}`, msg);
            let text = `👑 *ADMINS (${admins.length})*\n\n`;
            for (const a of admins) {
                const role = a.admin === 'superadmin' ? '👑' : '👮';
                const name = await getDisplayName(sock, a.id);
                text += `${role} ${name}\n`;
            }
            text += `\n${FOOTER}`;
            await sendWithLogo(sock, from, text, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// MEMBER MANAGEMENT
// ═══════════════════════════════════════════

function memberAction(name, action, emoji, aliases) {
    commands.push({ name, description: `${action} members`, aliases,
        async execute({ msg, from, sender, args, bot, sock, react }) {
            if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
            await react(emoji);
            try {
                const metadata = await sock.groupMetadata(from);
                if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                    return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
                }
                const targets = [...(msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])];
                for (const arg of args) {
                    const jid = GroupHelper.getJidFromInput(msg, arg);
                    if (jid && !targets.includes(jid)) targets.push(jid);
                }
                if (!targets.length) return reply(sock, from, `❌ No targets specified!\n\n${FOOTER}`, msg);

                if (action === 'promote' || action === 'demote') {
                    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
                    targets.forEach(t => {
                        if (t === botJid || t.split('@')[0] === config.OWNER_NUMBER) {
                            return reply(sock, from, `❌ Cannot ${action} bot/owner!\n\n${FOOTER}`, msg);
                        }
                    });
                }

                const results = await sock.groupParticipantsUpdate(from, targets, action);
                await sendWithLogo(sock, from, GroupHelper.formatActionResult(action, results), msg);
                await react('✅');
            } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
        }
    });
}

commands.push({
    name: 'leave', description: 'Leave a group',
    aliases: ['exit', 'leavegc'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        let target = from;
        if (!GroupHelper.isGroupJid(from) && args.length) {
            try { const data = await sock.groupGetInviteInfo(GroupHelper.extractGroupCode(args[0])); target = data.id; }
            catch (e) { return reply(sock, from, `❌ Invalid link!\n\n${FOOTER}`, msg); }
        }
        if (!GroupHelper.isGroupJid(target)) return reply(sock, from, `❌ Not a group!\n\n${FOOTER}`, msg);
        await react('👋');
        try { await sock.groupLeave(target); await react('✅'); }
        catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

memberAction('add', 'Add', '➕', ['addmember']);
memberAction('kick', 'Kick', '🚫', ['remove', 'rm']);
memberAction('promote', 'Promote', '👑', ['makeadmin']);
memberAction('demote', 'Demote', '📉', ['removeadmin']);

// ═══════════════════════════════════════════
// INVITES
// ═══════════════════════════════════════════

commands.push({
    name: 'invite', description: 'Get group invite link',
    aliases: ['link', 'gclink'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🔗');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            const code = await sock.groupInviteCode(from);
            await sendWithLogo(sock, from, `🔗 *INVITE LINK*\n📛 ${metadata.subject}\n🔗 https://chat.whatsapp.com/${code}\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'revoke', description: 'Revoke and generate new invite link',
    aliases: ['revokelink', 'newlink'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🔄');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupRevokeInvite(from);
            const newCode = await sock.groupInviteCode(from);
            await sendWithLogo(sock, from, `✅ *Link Revoked!*\n📛 ${metadata.subject}\n🔗 https://chat.whatsapp.com/${newCode}\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'join', description: 'Join a group using invite link',
    aliases: ['joingroup'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}join <invite link>\n\n${FOOTER}`, msg);
        if (!args[0].includes('chat.whatsapp.com')) return reply(sock, from, `❌ Invalid link!\n\n${FOOTER}`, msg);
        await react('🔄');
        try {
            const result = await sock.groupAcceptInvite(GroupHelper.extractGroupCode(args[0]));
            await sendWithLogo(sock, from, `✅ *Joined!*\n🆔 ${result.split('@')[0]}\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'inviteinfo', description: 'Preview group from invite link',
    aliases: ['linkinfo', 'groupreview'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!args.length || !args[0].includes('chat.whatsapp.com')) return reply(sock, from, `📝 Usage: ${config.PREFIX}inviteinfo <link>\n\n${FOOTER}`, msg);
        await react('🔍');
        try {
            const data = await sock.groupGetInviteInfo(GroupHelper.extractGroupCode(args[0]));
            await sendWithLogo(sock, from, `🔍 *GROUP PREVIEW*\n📛 ${data.subject || '?'}\n👥 ${data.size || '?'} members\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ Invalid/expired link!\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// TAGGING
// ═══════════════════════════════════════════

commands.push({
    name: 'tag', description: 'Tag everyone with roles',
    aliases: ['tagall', 'everyone', 'all'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('📢');
        try {
            const metadata = await sock.groupMetadata(from);
            const name = senderName(msg, sender);
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const messageText = args.length ? args.join(' ') : (quoted ? '📢 Look at this!' : '📢 Attention everyone!');

            const superAdmins = [], admins = [], members = [], allMentions = [];
            for (const p of metadata.participants) {
                let jid = p.id;
                if (jid.endsWith('@lid')) {
                    try { const r = await resolveRealJid(sock, jid); if (r?.endsWith('@s.whatsapp.net')) jid = r; else continue; } catch(e) { continue; }
                }
                if (!jid.endsWith('@s.whatsapp.net')) continue;
                allMentions.push(jid);
                if (p.admin === 'superadmin') superAdmins.push(jid);
                else if (p.admin === 'admin') admins.push(jid);
                else members.push(jid);
            }
            allMentions.push(sender);

            let text = `📢 *TAG ALL*\n\n👤 *By:* @${name}\n`;
            if (args.length) text += `📝 *Message:* ${messageText}\n`;
            text += `\n👥 *${allMentions.length - 1} members*\n\n`;
            if (superAdmins.length) { text += `👑 *Super Admins:*\n`; superAdmins.forEach(j => text += `• @${j.split('@')[0]}\n`); text += `\n`; }
            if (admins.length) { text += `👮 *Admins:*\n`; admins.forEach(j => text += `• @${j.split('@')[0]}\n`); text += `\n`; }
            if (members.length) {
            text += `👤 *Members:*\n`;
            members.forEach(j => text += `• @${j.split('@')[0]}\n`);
            text += `\n`;
        }
        text += FOOTER;

            await sock.sendMessage(from, { text, mentions: allMentions }, { quoted: msg });
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'hidetag', description: 'Secretly tag everyone',
    aliases: ['htag', 'hidden'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}hidetag <message>\n\n${FOOTER}`, msg);
        await react('🕵️');
        try {
            const metadata = await sock.groupMetadata(from);
            const jids = await getValidMentions(sock, metadata.participants);
            await sock.sendMessage(from, { text: args.join(' '), mentions: jids }, { quoted: msg });
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'announce', description: 'Make a styled announcement',
    aliases: ['ann', 'broadcast'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}announce <message>\n\n${FOOTER}`, msg);
        await react('📢');
        try {
            const metadata = await sock.groupMetadata(from);
            const jids = await getValidMentions(sock, metadata.participants);
            const name = senderName(msg, sender);
            const text = `📢 *ANNOUNCEMENT*\n\n${args.join(' ')}\n\n👤 *By:* @${name}\n\n${FOOTER}`;
            await sock.sendMessage(from, { text, mentions: jids }, { quoted: msg });
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'tagadmins', description: 'Tag all group admins',
    aliases: ['admintag'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('👑');
        try {
            const metadata = await sock.groupMetadata(from);
            const superAdmins = [], admins = [], allMentions = [];
            for (const p of metadata.participants) {
                if (!p.admin) continue;
                let jid = p.id;
                if (jid.endsWith('@lid')) {
                    try { const r = await resolveRealJid(sock, jid); if (r?.endsWith('@s.whatsapp.net')) jid = r; else continue; } catch(e) { continue; }
                }
                if (!jid.endsWith('@s.whatsapp.net')) continue;
                allMentions.push(jid);
                if (p.admin === 'superadmin') superAdmins.push(jid);
                else admins.push(jid);
            }
            if (!allMentions.length) return reply(sock, from, `⚠️ No admins!\n\n${FOOTER}`, msg);

            allMentions.push(sender);
            const msg2 = args.length ? args.join(' ') : '📢 Attention admins!';
            const name = senderName(msg, sender);
            let text = `👑 *ADMIN TAG*\n\n👤 *By:* @${name}\n📝 *Message:* ${msg2}\n\n`;
            if (superAdmins.length) { text += `👑 *Super Admins:*\n`; superAdmins.forEach(j => text += `• @${j.split('@')[0]}\n`); text += `\n`; }
            if (admins.length) { text += `👮 *Admins:*\n`; admins.forEach(j => text += `• @${j.split('@')[0]}\n`); text += `\n`; }
            text += FOOTER;

            await sock.sendMessage(from, { text, mentions: allMentions }, { quoted: msg });
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════

function groupSetting(name, desc, aliases, settingKey) {
    commands.push({ name, description: desc, aliases,
        async execute({ msg, from, sender, args, bot, sock, react }) {
            if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
            if (!args.length || !['on', 'off'].includes(args[0]?.toLowerCase())) {
                const current = await bot.db.getSetting(`${settingKey}_${from}`, 'off');
                return reply(sock, from, `⚙️ *${desc}:* ${current === 'on' ? '✅ ON' : '❌ OFF'}\n\nUsage: ${config.PREFIX}${name} on/off\n\n${FOOTER}`, msg);
            }
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await bot.db.setSetting(`${settingKey}_${from}`, args[0].toLowerCase());
            await react('✅');
            await reply(sock, from, `✅ *${desc}: ${args[0].toUpperCase()}*\n\n${FOOTER}`, msg);
        }
    });
}

groupSetting('welcome', 'Welcome Messages', ['greet'], 'welcome');
groupSetting('goodbye', 'Goodbye Messages', ['byemsg'], 'goodbye');
groupSetting('events', 'Group Events (promote/demote)', ['groupevents'], 'events');
groupSetting('antipromotegc', 'Anti-Promote Protection', ['antipromote'], 'antipromote');
groupSetting('antidemotegc', 'Anti-Demote Protection', ['antidemote'], 'antidemote');
groupSetting('antiflood', 'Anti-Flood Protection', ['floodprotect'], 'antiflood');
groupSetting('antispam', 'Anti-Spam Protection', ['spamprotect'], 'antispam');

commands.push({
    name: 'activate', description: 'Enable bot in this group',
    aliases: ['boton', 'enable'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        await bot.db.setSetting(`bot_active_${from}`, 'true');
        await react('✅');
        await reply(sock, from, `✅ *Bot Activated!*\n\n${FOOTER}`, msg);
    }
});

commands.push({
    name: 'deactivate', description: 'Disable bot in this group',
    aliases: ['botoff', 'disable'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        await bot.db.setSetting(`bot_active_${from}`, 'false');
        await react('✅');
        await reply(sock, from, `🔕 *Bot Deactivated!*\n\n${FOOTER}`, msg);
    }
});

commands.push({
    name: 'botstatus', description: 'Check bot settings for this group',
    aliases: ['gcstatus', 'groupsettings'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('📊');
        const settings = ['bot_active', 'welcome', 'goodbye', 'events', 'antipromote', 'antidemote', 'antiflood', 'antispam'];
        let text = `📊 *GROUP BOT SETTINGS*\n\n`;
        for (const key of settings) {
            const val = await bot.db.getSetting(`${key}_${from}`) || 'true';
            const icon = val === 'true' ? '✅' : '❌';
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            text += `${icon} *${label}:* ${val === 'true' ? 'ON' : 'OFF'}\n`;
        }
        text += `\n${FOOTER}`;
        await sendWithLogo(sock, from, text, msg);
        await react('✅');
    }
});

commands.push({
    name: 'setname', description: 'Change group name',
    aliases: ['setgcname'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}setname <name>\n\n${FOOTER}`, msg);
        await react('🔄');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupUpdateSubject(from, args.join(' '));
            await sendWithLogo(sock, from, `✅ *Name updated!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'setdesc', description: 'Change group description',
    aliases: ['setdescription'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}setdesc <text>\n\n${FOOTER}`, msg);
        await react('🔄');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupUpdateDescription(from, args.join(' '));
            await sendWithLogo(sock, from, `✅ *Description updated!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'lock', description: 'Lock group (admins only can send)',
    aliases: ['lockgc'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🔒');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupSettingUpdate(from, 'announcement');
            await sendWithLogo(sock, from, `🔒 *Group Locked!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'unlock', description: 'Unlock group',
    aliases: ['unlockgc'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🔓');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sendWithLogo(sock, from, `🔓 *Group Unlocked!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'disappear', description: 'Set disappearing messages',
    aliases: ['ephemeral'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `⏱️ Usage: ${config.PREFIX}disappear 24h/7d/90d/off\n\n${FOOTER}`, msg);
        await react('⏱️');
        try {
            const opts = { '24h': [86400, '24 hours'], '7d': [604800, '7 days'], '90d': [7776000, '90 days'], 'off': [0, 'off'] };
            const [exp, text] = opts[args[0].toLowerCase()] || [0, 'off'];
            await sock.groupToggleEphemeral(from, exp);
            await sendWithLogo(sock, from, `✅ *Disappearing: ${text}*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'addmode', description: 'Set who can add members',
    aliases: ['memberaddmode'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length || !['all', 'admins'].includes(args[0]?.toLowerCase())) {
            return reply(sock, from, `📝 Usage: ${config.PREFIX}addmode all/admins\n\n${FOOTER}`, msg);
        }
        await react('🔄');
        try {
            const mode = args[0] === 'all' ? 'all_member_add' : 'admin_add';
            await sock.groupMemberAddMode(from, mode);
            await sendWithLogo(sock, from, `✅ *Add mode: ${args[0]}*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// INTERACTIVE
// ═══════════════════════════════════════════

commands.push({
    name: 'poll', description: 'Create a poll',
    aliases: ['createpoll'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (args.length < 3) return reply(sock, from, `📊 Usage: ${config.PREFIX}poll "Question" "A" "B"...\n\n${FOOTER}`, msg);
        await react('📊');
        try {
            const parsed = GroupHelper.parsePollArgs(args);
            if (parsed.length < 2) return reply(sock, from, `❌ At least 2 options!\n\n${FOOTER}`, msg);
            await sock.sendMessage(from, { poll: { name: parsed[0], values: parsed.slice(1), selectableCount: 1 } });
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'multipoll', description: 'Create multi-select poll',
    aliases: ['mpoll'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (args.length < 4) return reply(sock, from, `📊 Usage: ${config.PREFIX}multipoll "Q" "A" "B" [max]\n\n${FOOTER}`, msg);
        await react('📊');
        try {
            const parsed = GroupHelper.parsePollArgs(args);
            let count = 1;
            if (!isNaN(parsed[parsed.length - 1])) { count = parseInt(parsed.pop()); }
            if (parsed.length < 2) return reply(sock, from, `❌ At least 2 options!\n\n${FOOTER}`, msg);
            await sock.sendMessage(from, { poll: { name: parsed[0], values: parsed.slice(1), selectableCount: count } });
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'gstatus', description: 'Send group story/status',
    aliases: ['groupstatus'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!args.length && !quoted?.imageMessage && !quoted?.videoMessage) {
            return reply(sock, from, `📝 Usage: ${config.PREFIX}gstatus <text> or reply to media\n\n${FOOTER}`, msg);
        }
        await react('🔄');
        try {
            if (args.length) {
                await sock.sendMessage(from, { groupStatusMessage: { text: args.join(' ') } });
            } else if (quoted) {
                const { downloadMediaMessage } = require('gifted-baileys');
                const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console });
                const content = quoted.imageMessage ? { image: buffer } : { video: buffer };
                await sock.sendMessage(from, { groupStatusMessage: content });
            }
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// REQUESTS
// ═══════════════════════════════════════════

commands.push({
    name: 'requests', description: 'List pending join requests',
    aliases: ['joinrequests', 'pending'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('📋');
        try {
            const requests = await sock.groupRequestParticipantsList(from);
            if (!requests?.length) return reply(sock, from, `📋 No pending requests.\n\n${FOOTER}`, msg);
            let list = `📋 *PENDING (${requests.length})*\n\n`;
            for (let i = 0; i < requests.length; i++) {
                list += `${i + 1}. ${GroupHelper.formatJid(requests[i].jid)}\n`;
            }
            list += `\n${config.PREFIX}approve <n> | ${config.PREFIX}reject <n>\n\n${FOOTER}`;
            await sendWithLogo(sock, from, list, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'approve', description: 'Approve join request',
    aliases: ['accept'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}approve <number>\n\n${FOOTER}`, msg);
        await react('✅');
        try {
            const requests = await sock.groupRequestParticipantsList(from);
            const index = parseInt(args[0]) - 1;
            if (isNaN(index) || index < 0 || index >= requests.length) return reply(sock, from, `❌ Invalid number!\n\n${FOOTER}`, msg);
            await sock.groupRequestParticipantsUpdate(from, [requests[index].jid], 'approve');
            await sendWithLogo(sock, from, `✅ *Approved!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'reject', description: 'Reject join request',
    aliases: ['deny'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `📝 Usage: ${config.PREFIX}reject <number>\n\n${FOOTER}`, msg);
        await react('❌');
        try {
            const requests = await sock.groupRequestParticipantsList(from);
            const index = parseInt(args[0]) - 1;
            if (isNaN(index) || index < 0 || index >= requests.length) return reply(sock, from, `❌ Invalid number!\n\n${FOOTER}`, msg);
            await sock.groupRequestParticipantsUpdate(from, [requests[index].jid], 'reject');
            await sendWithLogo(sock, from, `❌ *Rejected!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// MODERATION
// ═══════════════════════════════════════════

commands.push({
    name: 'antilinkgc', description: 'Toggle anti-link for this group',
    aliases: ['gcantilink', 'linkprotect'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) {
            const enabled = await bot.db.isGroupAntiLinkEnabled(from);
            const action = await bot.db.getSetting(`antilink_action_${from}`, 'delete');
            return reply(sock, from, `🔗 *ANTI-LINK*\n\nStatus: ${enabled ? '✅ ON' : '❌ OFF'}\nAction: ${action}\n\nOptions: on/off/delete/warn/kick\n\n${FOOTER}`, msg);
        }
        const action = args[0].toLowerCase();
        if (action === 'on') { await bot.db.enableGroupAntiLink(from); await react('✅'); return reply(sock, from, `✅ Anti-Link ON\n\n${FOOTER}`, msg); }
        if (action === 'off') { await bot.db.disableGroupAntiLink(from); await react('✅'); return reply(sock, from, `❌ Anti-Link OFF\n\n${FOOTER}`, msg); }
        if (!['delete', 'warn', 'kick'].includes(action)) return reply(sock, from, `❌ Use: delete, warn, kick\n\n${FOOTER}`, msg);
        await bot.db.enableGroupAntiLink(from);
        await bot.db.setSetting(`antilink_action_${from}`, action);
        await react('✅');
        await reply(sock, from, `✅ Anti-Link: ${action}\n\n${FOOTER}`, msg);
    }
});

commands.push({
    name: 'antibot', description: 'Toggle anti-bot detection',
    aliases: ['botdetect', 'nobots'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) {
            const current = await bot.db.getSetting(`antibot_${from}`, 'off');
            return reply(sock, from, `🤖 *ANTI-BOT*\nStatus: ${current === 'off' ? '❌ OFF' : `✅ ${current}`}\nUsage: ${config.PREFIX}antibot off/warn/kick\n\n${FOOTER}`, msg);
        }
        if (!['off', 'warn', 'kick'].includes(args[0]?.toLowerCase())) return reply(sock, from, `❌ Use: off, warn, kick\n\n${FOOTER}`, msg);
        await bot.db.setSetting(`antibot_${from}`, args[0].toLowerCase());
        await react('✅');
        await reply(sock, from, `✅ Anti-Bot: ${args[0]}\n\n${FOOTER}`, msg);
    }
});

// ═══════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════

commands.push({
    name: 'groupstats', description: 'Show group statistics',
    aliases: ['gcstats'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('📊');
        try {
            const metadata = await sock.groupMetadata(from);
            const ageDays = Math.floor((Date.now() - metadata.creation * 1000) / 86400000);
            let stats = `📊 *GROUP STATS*\n\n📛 ${metadata.subject}\n👥 ${metadata.participants.length} members\n📅 ${ageDays} days old\n👑 ${metadata.participants.filter(p => p.admin).length} admins\n🔒 ${metadata.announce === 'announcement' ? 'Locked' : 'Open'}\n\n${FOOTER}`;
            await sendWithLogo(sock, from, stats, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'grouprank', description: 'Show member ranking',
    aliases: ['rank'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🏆');
        try {
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(p => p.admin);
            let rank = `🏆 *GROUP RANKING*\n\n👑 Owner/Admins:\n`;
            for (const a of admins.slice(0, 10)) {
                rank += `• ${await getDisplayName(sock, a.id)}\n`;
            }
            rank += `\n👥 Total: ${metadata.participants.length} members\n\n${FOOTER}`;
            await sendWithLogo(sock, from, rank, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'groupsilent', description: 'Silent mode for X minutes',
    aliases: ['silent'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) return reply(sock, from, `🤫 Usage: ${config.PREFIX}groupsilent <minutes>\n\n${FOOTER}`, msg);
        const minutes = parseInt(args[0]);
        if (isNaN(minutes) || minutes < 1 || minutes > 1440) return reply(sock, from, `❌ 1-1440 minutes\n\n${FOOTER}`, msg);
        await react('🤫');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupSettingUpdate(from, 'announcement');
            await sendWithLogo(sock, from, `🤫 *SILENT MODE: ${minutes} min*\n🔒 Only admins can send\n\n${FOOTER}`, msg);
            setTimeout(async () => { try { await sock.groupSettingUpdate(from, 'not_announcement'); } catch(e) {} }, minutes * 60000);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// HELP
// ═══════════════════════════════════════════

commands.push({
    name: 'grouphelp', description: 'Show all group commands',
    aliases: ['ghelp', 'group'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        const p = config.PREFIX;
        const help = `*👥 GROUP COMMANDS*\n\n` +
            `*📋 INFO*\n${p}creategroup | ${p}groupinfo | ${p}groups | ${p}participants | ${p}admins | ${p}metadata\n\n` +
            `*👤 MEMBERS*\n${p}add | ${p}kick | ${p}promote | ${p}demote | ${p}leave\n\n` +
            `*🔗 INVITES*\n${p}invite | ${p}revoke | ${p}join | ${p}inviteinfo\n\n` +
            `*🏷️ TAGGING*\n${p}tag | ${p}hidetag | ${p}announce | ${p}tagadmins\n\n` +
            `*⚙️ SETTINGS*\n${p}setname | ${p}setdesc | ${p}lock | ${p}unlock | ${p}disappear | ${p}addmode\n${p}activate | ${p}deactivate | ${p}botstatus\n${p}welcome | ${p}goodbye | ${p}events\n${p}antipromotegc | ${p}antidemotegc\n\n` +
            `*📊 INTERACTIVE*\n${p}poll | ${p}multipoll | ${p}gstatus\n\n` +
            `*📋 REQUESTS*\n${p}requests | ${p}approve | ${p}reject\n\n` +
            `*🛡️ MODERATION*\n${p}antilinkgc | ${p}antibot\n\n` +
            `*📊 STATS*\n${p}groupstats | ${p}grouprank | ${p}groupsilent\n\n${FOOTER}`;
        await sendWithLogo(sock, from, help, msg);
        await react('✅');
    }
});


// ═══════════════════════════════════════════
// MISSING: ANTITAG
// ═══════════════════════════════════════════

commands.push({
    name: 'antitag', description: 'Block users from tagging owner (Owner Only)',
    aliases: ['blocktag', 'nomention'],
    async execute({ msg, from, sender, args, bot, sock, react, isOwner }) {
        if (!isOwner) return reply(sock, from, `❌ *Owner Only*\n\n${FOOTER}`, msg);
        if (!args.length) {
            const current = await bot.db.getSetting('antitag', 'off');
            return reply(sock, from, `🚫 *ANTI-TAG*\nCurrent: ${current === 'on' ? '✅ ON' : '❌ OFF'}\nUsage: ${config.PREFIX}antitag on/off\n\n${FOOTER}`, msg);
        }
        if (!['on', 'off'].includes(args[0]?.toLowerCase())) return reply(sock, from, `❌ Use: on or off\n\n${FOOTER}`, msg);
        await bot.db.setSetting('antitag', args[0].toLowerCase());
        await react('✅');
        await reply(sock, from, `✅ *Anti-Tag ${args[0].toUpperCase()}*\n\n${FOOTER}`, msg);
    }
});

// ═══════════════════════════════════════════
// MISSING: SETWELCOME / SETGOODBYE
// ═══════════════════════════════════════════

commands.push({
    name: 'setwelcome', description: 'Set custom welcome message',
    aliases: ['welcomemsg'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) {
            const current = await bot.db.getSetting(`welcome_text_${from}`, 'Hey @user! 👋 Welcome to the group!');
            return reply(sock, from, `👋 *Welcome Message*\nCurrent: "${current}"\n\nUsage: ${config.PREFIX}setwelcome <message>\nUse @user for name, {group} for group name\n\n${FOOTER}`, msg);
        }
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        await bot.db.setSetting(`welcome_text_${from}`, args.join(' '));
        await react('✅');
        await reply(sock, from, `✅ *Welcome message updated!*\n\n${FOOTER}`, msg);
    }
});

commands.push({
    name: 'setgoodbye', description: 'Set custom goodbye message',
    aliases: ['goodbyemsg'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!args.length) {
            const current = await bot.db.getSetting(`goodbye_text_${from}`, 'Goodbye @user! 👋');
            return reply(sock, from, `👋 *Goodbye Message*\nCurrent: "${current}"\n\nUsage: ${config.PREFIX}setgoodbye <message>\nUse @user for name\n\n${FOOTER}`, msg);
        }
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        await bot.db.setSetting(`goodbye_text_${from}`, args.join(' '));
        await react('✅');
        await reply(sock, from, `✅ *Goodbye message updated!*\n\n${FOOTER}`, msg);
    }
});

// ═══════════════════════════════════════════
// MISSING: LOCKINFO / UNLOCKINFO
// ═══════════════════════════════════════════

commands.push({
    name: 'lockinfo', description: 'Lock group info editing',
    aliases: ['lockedit'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🔒');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupSettingUpdate(from, 'locked');
            await sendWithLogo(sock, from, `🔒 *Info Editing Locked!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'unlockinfo', description: 'Unlock group info editing',
    aliases: ['unlockedit'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🔓');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }
            await sock.groupSettingUpdate(from, 'unlocked');
            await sendWithLogo(sock, from, `🔓 *Info Editing Unlocked!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// NEW: WARN SYSTEM
// ═══════════════════════════════════════════

commands.push({
    name: 'warn', description: 'Warn a member',
    aliases: ['warning'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }

        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let targetJid = mentions[0];
        if (!targetJid && args[0]) {
            const phone = extractPhone(args[0]);
            if (phone?.length >= 10) targetJid = `${phone}@s.whatsapp.net`;
        }
        if (!targetJid) return reply(sock, from, `📝 Usage: ${config.PREFIX}warn @user <reason>\n\n${FOOTER}`, msg);

        const reason = args.length > 0 && !args[0].startsWith('@') ? args.join(' ') : (args.length > 1 ? args.slice(1).join(' ') : 'No reason given');
        await bot.db?.addWarning(targetJid, from, reason, sender);
        
        const warnCount = await bot.db?.getWarnings(targetJid, from) || 1;
        const maxWarns = parseInt(await bot.db.getSetting(`maxwarns_${from}`, '3'));
        const targetName = await getDisplayName(sock, targetJid);

        let text = `⚠️ *WARNING ${warnCount}/${maxWarns}*\n\n👤 ${targetName}\n📝 Reason: ${reason}\n\n`;
        if (warnCount >= maxWarns) {
            try { await sock.groupParticipantsUpdate(from, [targetJid], 'remove'); text += `🚫 *Auto-kicked!* (${maxWarns} warnings)\n`; } catch(e) {}
        }
        text += `\n${FOOTER}`;

        await sendWithLogo(sock, from, text, msg);
        await react('✅');
    }
});

commands.push({
    name: 'warns', description: 'Check warnings for a member',
    aliases: ['warnings', 'checkwarn'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let targetJid = mentions[0];
        if (!targetJid && args[0]) {
            const phone = extractPhone(args[0]);
            if (phone?.length >= 10) targetJid = `${phone}@s.whatsapp.net`;
        }
        if (!targetJid) targetJid = sender; // Default to self

        await react('📋');
        const warns = await bot.db?.getWarningDetails(targetJid, from) || [];
        const count = warns.length;
        const maxWarns = parseInt(await bot.db.getSetting(`maxwarns_${from}`, '3'));
        const targetName = await getDisplayName(sock, targetJid);

        let text = `📋 *WARNINGS: ${targetName}*\n\n`;
        text += `⚠️ ${count}/${maxWarns} warnings\n\n`;
        if (warns.length) {
            warns.forEach((w, i) => {
                text += `*${i + 1}.* ${w.reason || 'No reason'}\n   📅 ${new Date(w.timestamp || w.created_at).toLocaleDateString()}\n\n`;
            });
        } else {
            text += `✅ No warnings!\n`;
        }
        text += `\n${FOOTER}`;
        await sendWithLogo(sock, from, text, msg);
        await react('✅');
    }
});

commands.push({
    name: 'resetwarns', description: 'Reset warnings for a member',
    aliases: ['clearwarns', 'unwarn'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }

        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let targetJid = mentions[0];
        if (!targetJid && args[0]) {
            const phone = extractPhone(args[0]);
            if (phone?.length >= 10) targetJid = `${phone}@s.whatsapp.net`;
        }
        if (!targetJid) return reply(sock, from, `📝 Usage: ${config.PREFIX}resetwarns @user\n\n${FOOTER}`, msg);

        await bot.db?.clearWarnings(targetJid, from);
        const targetName = await getDisplayName(sock, targetJid);
        await sendWithLogo(sock, from, `✅ *Warnings cleared for ${targetName}!*\n\n${FOOTER}`, msg);
        await react('✅');
    }
});

commands.push({
    name: 'setmaxwarns', description: 'Set max warnings before auto-kick',
    aliases: ['maxwarns'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        if (!args.length) {
            const current = await bot.db.getSetting(`maxwarns_${from}`, '3');
            return reply(sock, from, `⚠️ *Max Warnings: ${current}*\n\nUsage: ${config.PREFIX}setmaxwarns <number>\n\n${FOOTER}`, msg);
        }
        const num = parseInt(args[0]);
        if (isNaN(num) || num < 1 || num > 10) return reply(sock, from, `❌ 1-10\n\n${FOOTER}`, msg);
        await bot.db.setSetting(`maxwarns_${from}`, String(num));
        await react('✅');
        await reply(sock, from, `✅ *Max warnings set to ${num}*\n\n${FOOTER}`, msg);
    }
});

// ═══════════════════════════════════════════
// NEW: KILLGC - Nuke group
// ═══════════════════════════════════════════

commands.push({
    name: 'killgc', description: 'Remove all members and leave (Owner Only)',
    aliases: ['nukegc', 'destroygc', 'terminategc'],
    async execute({ msg, from, sender, args, bot, sock, react, isOwner }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        if (!isOwner) return reply(sock, from, `❌ *Owner Only!*\n\n${FOOTER}`, msg);
        await react('💀');
        try {
            const metadata = await sock.groupMetadata(from);
            const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
            const toRemove = metadata.participants.filter(p => p.id !== botJid && p.id !== sender).map(p => p.id);

            await reply(sock, from, `💀 *Nuking group...*\n👥 Removing ${toRemove.length} members...\n\n${FOOTER}`, msg);

            if (toRemove.length) {
                const batchSize = 10;
                for (let i = 0; i < toRemove.length; i += batchSize) {
                    const batch = toRemove.slice(i, i + batchSize);
                    await sock.groupParticipantsUpdate(from, batch, 'remove').catch(() => {});
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            await sock.groupLeave(from);
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// NEW: ACCEPTALL / REJECTALL
// ═══════════════════════════════════════════

commands.push({
    name: 'acceptall', description: 'Accept all pending join requests',
    aliases: ['approveall'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('✅');
        try {
            const requests = await sock.groupRequestParticipantsList(from);
            if (!requests?.length) return reply(sock, from, `📭 No pending requests.\n\n${FOOTER}`, msg);
            const jids = requests.map(r => r.jid);
            await sock.groupRequestParticipantsUpdate(from, jids, 'approve');
            await sendWithLogo(sock, from, `✅ *Approved ${jids.length} requests!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'rejectall', description: 'Reject all pending join requests',
    aliases: ['declineall'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('❌');
        try {
            const requests = await sock.groupRequestParticipantsList(from);
            if (!requests?.length) return reply(sock, from, `📭 No pending requests.\n\n${FOOTER}`, msg);
            const jids = requests.map(r => r.jid);
            await sock.groupRequestParticipantsUpdate(from, jids, 'reject');
            await sendWithLogo(sock, from, `❌ *Rejected ${jids.length} requests!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// NEW: GROUPICON - Change group profile pic
// ═══════════════════════════════════════════

commands.push({
    name: 'groupicon', description: 'Change group profile picture',
    aliases: ['gcicon', 'gcpp', 'setgcicon'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage && !args[0]) {
            return reply(sock, from, `🖼️ *GROUP ICON*\n\nReply to an image with ${config.PREFIX}groupicon\nOr: ${config.PREFIX}groupicon <image_url>\n\n${FOOTER}`, msg);
        }
        await react('🖼️');
        try {
            const metadata = await sock.groupMetadata(from);
            if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
                return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
            }

            let buffer;
            if (quoted?.imageMessage) {
                const { downloadMediaMessage } = require('megan-baileys');
                buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console });
            } else if (args[0]?.startsWith('http')) {
                const axios = require('axios');
                const res = await axios.get(args[0], { responseType: 'arraybuffer', timeout: 30000 });
                buffer = Buffer.from(res.data);
            }
            if (!buffer) return reply(sock, from, `❌ No image found!\n\n${FOOTER}`, msg);

            await sock.updateProfilePicture(from, buffer);
            await sendWithLogo(sock, from, `🖼️ *Group icon updated!*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// NEW: MUTE / UNMUTE MEMBER
// ═══════════════════════════════════════════

commands.push({
    name: 'mute', description: 'Mute a member (removes messaging permission)',
    aliases: ['silence', 'shutup'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let targetJid = mentions[0];
        if (!targetJid && args[0]) {
            const phone = extractPhone(args[0]);
            if (phone?.length >= 10) targetJid = `${phone}@s.whatsapp.net`;
        }
        if (!targetJid) return reply(sock, from, `📝 Usage: ${config.PREFIX}mute @user\n\n${FOOTER}`, msg);

        await react('🤫');
        try {
            // WhatsApp mute via group setting update for specific member
            await sock.groupParticipantsUpdate(from, [targetJid], 'demote').catch(() => {});
            const targetName = await getDisplayName(sock, targetJid);
            await sendWithLogo(sock, from, `🤫 *Muted: ${targetName}*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

commands.push({
    name: 'unmute', description: 'Unmute a member',
    aliases: ['unsilence', 'speak'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        const metadata = await sock.groupMetadata(from);
        if (!GroupHelper.canPerformAdminAction(metadata, sender, config.OWNER_NUMBER)) {
            return reply(sock, from, `❌ Only admins!\n\n${FOOTER}`, msg);
        }
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let targetJid = mentions[0];
        if (!targetJid && args[0]) {
            const phone = extractPhone(args[0]);
            if (phone?.length >= 10) targetJid = `${phone}@s.whatsapp.net`;
        }
        if (!targetJid) return reply(sock, from, `📝 Usage: ${config.PREFIX}unmute @user\n\n${FOOTER}`, msg);

        await react('🔊');
        try {
            // Re-promote if they were admin before, or just notify
            const targetName = await getDisplayName(sock, targetJid);
            await sendWithLogo(sock, from, `🔊 *Unmuted: ${targetName}*\n\n${FOOTER}`, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// NEW: ONLINE - Check who's active
// ═══════════════════════════════════════════

commands.push({
    name: 'online', description: 'Check which members are online/typing',
    aliases: ['whosonline', 'active', 'onlineusers'],
    async execute({ msg, from, sender, args, bot, sock, react }) {
        if (!GroupHelper.isGroupJid(from)) return reply(sock, from, `❌ Group only!\n\n${FOOTER}`, msg);
        await react('🟢');
        
        await reply(sock, from, `🔍 *Checking online members...*\n⏳ This takes ~10 seconds...\n\n${FOOTER}`, msg);

        try {
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants;
            const onlineMembers = [];
            const presenceData = new Map();

            // Subscribe to presence for all participants
            const presenceHandler = (update) => {
                if (update.presences) {
                    for (const [jid, presence] of Object.entries(update.presences)) {
                        presenceData.set(jid, presence);
                        presenceData.set(jid.split('@')[0], presence);
                    }
                }
            };

            sock.ev.on('presence.update', presenceHandler);

            try {
                // Subscribe in batches
                for (let i = 0; i < participants.length; i += 10) {
                    const batch = participants.slice(i, i + 10);
                    await Promise.all(batch.map(async (p) => {
                        try { await sock.presenceSubscribe(p.id); } catch (e) {}
                    }));
                    await new Promise(r => setTimeout(r, 500));
                }

                // Wait for presence data
                await new Promise(r => setTimeout(r, 3000));

                for (const p of participants) {
                    const jid = p.id;
                    const num = jid.split('@')[0];
                    const presence = presenceData.get(jid) || presenceData.get(num);

                    if (presence?.lastKnownPresence === 'composing' || 
                        presence?.lastKnownPresence === 'recording' || 
                        presence?.lastKnownPresence === 'available') {
                        const name = await getDisplayName(sock, jid);
                        onlineMembers.push({ jid, name, presence: presence.lastKnownPresence });
                    }
                }
            } finally {
                sock.ev.off('presence.update', presenceHandler);
            }

            if (!onlineMembers.length) {
                return reply(sock, from, `😴 *No members currently active*\n\n_Note: Only detects typing/recording presence_\n\n${FOOTER}`, msg);
            }

            let text = `🟢 *ONLINE MEMBERS*\n\n📊 ${onlineMembers.length}/${participants.length} active\n\n`;
            onlineMembers.forEach((m, i) => {
                const icon = m.presence === 'composing' ? '⌨️' : m.presence === 'recording' ? '🎤' : '🟢';
                text += `${i + 1}. ${icon} ${m.name}\n`;
            });
            text += `\n${FOOTER}`;

            await sendWithLogo(sock, from, text, msg);
            await react('✅');
        } catch (error) { await react('❌'); reply(sock, from, `❌ ${error.message}\n\n${FOOTER}`, msg); }
    }
});

// ═══════════════════════════════════════════
// ANTI-SPAM/FLOOD (toggle via groupSetting)
// ═══════════════════════════════════════════

// Already handled by events.js checkFlood() and groupSetting toggles above
// antiflood + antispam toggles are in the groupSetting section

module.exports = { commands };
