// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME GROUP EVENTS HANDLER                ║
// ║  Welcome | Goodbye | Anti-Promote | Anti-Demote  ║
// ║  Per-Group Settings | Newsletter Styled           ║
// ╚══════════════════════════════════════════════════╝

const dev = require('./developer');
const { replyStyled } = require('./styler');
const { resolveRealJid } = require('./lidResolver');

// ═══════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════

const DEFAULTS = {
    bot_active: 'true',          // Bot responds in this group
    welcome: 'false',            // Send welcome messages (OFF by default)
    goodbye: 'false',            // Send goodbye messages (OFF by default)
    events: 'false',             // Show promote/demote/kick events (OFF by default)
    antipromote: 'false',        // Auto-reverse unauthorized promotes
    antidemote: 'false',         // Auto-reverse unauthorized demotes
    antiflood: 'false',          // Block message flooding
    antispam: 'false',           // Block repeated spam
    maxwarns: '3',              // Auto-kick after X warnings
    welcome_text: 'Hey @user! 👋 Welcome to *{group}*!\n\n📜 Please read the group description for rules.\n👥 You are member #{count}',
    goodbye_text: 'Goodbye @user! 👋 Sorry to see you go!',
    chatmode: 'all',            // 'all', 'admins', 'off'
};

// ═══════════════════════════════════════════
// DEDUPLICATION (prevent double events)
// ═══════════════════════════════════════════

const recentEvents = new Map();
const DEDUP_MS = 5000;

function isDuplicate(groupJid, action, participants) {
    const key = `${groupJid}:${action}:${participants.sort().join(',')}`;
    const now = Date.now();
    const last = recentEvents.get(key);
    if (last && (now - last) < DEDUP_MS) return true;
    recentEvents.set(key, now);
    // Clean old entries
    for (const [k, v] of recentEvents) {
        if (now - v > 30000) recentEvents.delete(k);
    }
    return false;
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function getJid(jid) { return jid?.split('@')[0]?.split(':')[0] || 'unknown'; }
function formatNum(jid) { return '+' + getJid(jid); }

async function getGroupSetting(db, groupJid, key) {
    try {
        const val = await db.getSetting(`${key}_${groupJid}`);
        return val || DEFAULTS[key] || null;
    } catch(e) { return DEFAULTS[key] || null; }
}

async function getSetting(db, key) {
    try {
        const val = await db.getSetting(key);
        return val || DEFAULTS[key] || null;
    } catch(e) { return DEFAULTS[key] || null; }
}

async function isOwner(sock, jid, db) {
    const num = getJid(jid);
    const ownerNum = dev.DEVELOPER_NUMBER?.replace(/[^0-9]/g, '');
    if (num === ownerNum) return true;
    // Check DB owners
    const dbOwners = await db.getSetting('owner_numbers', '');
    if (dbOwners && dbOwners.split(',').includes(num)) return true;
    return false;
}

// ═══════════════════════════════════════════
// PROFILE PIC
// ═══════════════════════════════════════════

const DEFAULT_PIC = dev.BOT_PIC || 'https://files.catbox.moe/ICXJZHy.jpg';

async function getProfilePic(sock, jid) {
    try {
        return await sock.profilePictureUrl(jid, 'image');
    } catch {
        return DEFAULT_PIC;
    }
}

// ═══════════════════════════════════════════
// MAIN EVENT HANDLER
// ═══════════════════════════════════════════

async function setupGroupEvents(sock, db) {
    console.log('👥 [EVENTS] Group event handler initialized');
    
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id: groupJid, participants, action, author } = update;
            if (!groupJid || !participants?.length) return;
            if (isDuplicate(groupJid, action, participants)) return;

            // Check if bot is active in this group
            const botActive = await getGroupSetting(db, groupJid, 'bot_active');
            if (botActive === 'false') return;

            const metadata = await sock.groupMetadata(groupJid).catch(() => null);
            if (!metadata) return;

            const groupName = metadata.subject || 'Group';
            const memberCount = metadata.participants?.length || 0;
            const time = new Date().toLocaleString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true });

            for (const participant of participants) {
                const userJid = participant;
                const userNum = getJid(userJid);
                const profilePic = await getProfilePic(sock, userJid);

                switch (action) {
                    case 'add':
                        await handleWelcome(sock, db, groupJid, groupName, userJid, userNum, profilePic, memberCount, time);
                        break;
                    case 'remove':
                        await handleGoodbye(sock, db, groupJid, groupName, userJid, userNum, profilePic, author, time, memberCount);
                        break;
                    case 'promote':
                        await handlePromote(sock, db, groupJid, groupName, userJid, userNum, author, metadata);
                        break;
                    case 'demote':
                        await handleDemote(sock, db, groupJid, groupName, userJid, userNum, author, metadata);
                        break;
                }
            }
        } catch(e) {
            console.error('[EVENTS] Error:', e.message);
        }
    });
}

// ═══════════════════════════════════════════
// WELCOME HANDLER
// ═══════════════════════════════════════════

async function handleWelcome(sock, db, groupJid, groupName, userJid, userNum, profilePic, memberCount, time) {
    const welcomeOn = await getGroupSetting(db, groupJid, 'welcome');
    if (welcomeOn === 'false') return;

    // Resolve LID to real JID for proper @mention
    let displayJid = userJid;
    let displayNum = userNum;
    try {
        const resolved = await resolveRealJid(sock, userJid);
        if (resolved && resolved.endsWith('@s.whatsapp.net')) {
            displayJid = resolved;
            displayNum = resolved.split('@')[0];
        }
    } catch(e) {}

    const customText = await getGroupSetting(db, groupJid, 'welcome_text');
    let message = (customText || DEFAULTS.welcome_text)
        .replace(/@user/g, `@${displayNum}`)
        .replace(/{group}/g, groupName)
        .replace(/{count}/g, memberCount);

    const text = `╭━━━━ *WELCOME* ━━━━╮\n┃ 🎉 *Hey @${displayNum}!*\n┃ 🏠 *${groupName}*\n┃ 👥 Member #${memberCount}\n┃ 🕐 ${time}\n╰━━━━━━━━━━━━━━╯\n\n${message}`;

    await replyStyled(sock, groupJid, text, null, {
        title: `Welcome to ${groupName}`,
        footer: '> Megan-Prime | Group Events',
        useNewsletter: true,
        newsletterName: 'Group Welcome',
        largeThumb: true,
        image: profilePic,
        buttons: [],
    });
}

// ═══════════════════════════════════════════
// GOODBYE / KICK HANDLER
// ═══════════════════════════════════════════

async function handleGoodbye(sock, db, groupJid, groupName, userJid, userNum, profilePic, author, time, memberCount) {
    const eventsOn = await getGroupSetting(db, groupJid, 'events');
    
    if (author && author !== userJid) {
        // KICKED
        if (eventsOn === 'false') return;
        const authorNum = getJid(author);
        let displayUserNum = userNum, displayAuthorNum = authorNum;
        try {
            const r1 = await resolveRealJid(sock, userJid);
            if (r1?.endsWith('@s.whatsapp.net')) displayUserNum = r1.split('@')[0];
            const r2 = await resolveRealJid(sock, author);
            if (r2?.endsWith('@s.whatsapp.net')) displayAuthorNum = r2.split('@')[0];
        } catch(e) {}
        const text = `╭━━━━ *KICKED* ━━━━╮\n┃ 🚫 *@${displayUserNum}* was removed\n┃ 🔨 By: @${displayAuthorNum}\n┃ 🏠 *${groupName}*\n┃ 👥 ${memberCount} remaining\n┃ 🕐 ${time}\n╰━━━━━━━━━━━━━━╯`;

        await replyStyled(sock, groupJid, text, null, {
            title: 'Member Removed',
            footer: '> Megan-Prime | Group Mod',
            useNewsletter: true,
            newsletterName: 'Group Moderation',
            image: profilePic,
            buttons: [],
        });
    } else {
        // LEFT
        const goodbyeOn = await getGroupSetting(db, groupJid, 'goodbye');
        if (goodbyeOn === 'false') return;

        let displayNum = userNum;
        try { const r = await resolveRealJid(sock, userJid); if (r?.endsWith('@s.whatsapp.net')) displayNum = r.split('@')[0]; } catch(e) {}

        const customText = await getGroupSetting(db, groupJid, 'goodbye_text');
        const message = (customText || DEFAULTS.goodbye_text).replace(/@user/g, `@${displayNum}`);

        const text = `╭━━━━ *GOODBYE* ━━━━╮\n┃ 👋 *@${displayNum}* left\n┃ 🏠 *${groupName}*\n┃ 👥 ${memberCount} remaining\n┃ 🕐 ${time}\n╰━━━━━━━━━━━━━━╯\n\n${message}`;

        await replyStyled(sock, groupJid, text, null, {
            title: 'Goodbye!',
            footer: '> Megan-Prime | Group Events',
            useNewsletter: true,
            newsletterName: 'Group Goodbye',
            image: profilePic,
            buttons: [],
        });
    }
}

// ═══════════════════════════════════════════
// PROMOTE HANDLER (with Anti-Promote)
// ═══════════════════════════════════════════

async function handlePromote(sock, db, groupJid, groupName, userJid, userNum, author, metadata) {
    const eventsOn = await getGroupSetting(db, groupJid, 'events');
    const antiPromoteOn = await getGroupSetting(db, groupJid, 'antipromote');

    // Anti-Promote: if enabled and someone unauthorized promotes, reverse it
    if (antiPromoteOn === 'true' && author) {
        const isAuthorOwner = await isOwner(sock, author, db);
        const isAuthorSuperAdmin = metadata.participants?.find(p => p.id === author)?.admin === 'superadmin';
        
        if (!isAuthorOwner && !isAuthorSuperAdmin) {
            const authorNum = getJid(author);
            // Reverse the promotion
            try {
                await sock.groupParticipantsUpdate(groupJid, [userJid], 'demote');
                await sock.groupParticipantsUpdate(groupJid, [author], 'demote');
            } catch(e) {}

            const text = `🛡️ *ANTI-PROMOTE*\n\n@${authorNum} tried to promote @${userNum}\n⚠️ Both have been demoted!\n\n> Megan-Prime | Protection`;
            await replyStyled(sock, groupJid, text, null, {
                title: '🛡️ Anti-Promote',
                footer: '> Megan-Prime | Group Protection',
                useNewsletter: true,
                newsletterName: 'Security Alert',
                buttons: [],
            });
            return;
        }
    }

    // Normal promote notification
    if (eventsOn === 'false') return;

    // Resolve names
    const authorNum = author ? getJid(author) : 'System';
    let displayUserNum = userNum;
    let displayAuthorNum = authorNum;
    try {
        const r1 = await resolveRealJid(sock, userJid);
        if (r1?.endsWith('@s.whatsapp.net')) displayUserNum = r1.split('@')[0];
        if (author) {
            const r2 = await resolveRealJid(sock, author);
            if (r2?.endsWith('@s.whatsapp.net')) displayAuthorNum = r2.split('@')[0];
        }
    } catch(e) {}
    const text = `╭━━━━ *PROMOTED* ━━━━╮\n┃ 👑 *@${displayUserNum}* is now admin!\n┃ 👤 By: @${displayAuthorNum}\n┃ 🏠 *${groupName}*\n╰━━━━━━━━━━━━━━╯\n\n🎉 Congratulations!`;

    await replyStyled(sock, groupJid, text, null, {
        title: '👑 New Admin!',
        footer: '> Megan-Prime | Group Events',
        useNewsletter: true,
        newsletterName: 'Group Promotion',
        buttons: [],
    });
}

// ═══════════════════════════════════════════
// DEMOTE HANDLER (with Anti-Demote)
// ═══════════════════════════════════════════

async function handleDemote(sock, db, groupJid, groupName, userJid, userNum, author, metadata) {
    const eventsOn = await getGroupSetting(db, groupJid, 'events');
    const antiDemoteOn = await getGroupSetting(db, groupJid, 'antidemote');

    // Anti-Demote: if enabled and someone unauthorized demotes, reverse it
    if (antiDemoteOn === 'true' && author) {
        const isAuthorOwner = await isOwner(sock, author, db);
        const isAuthorSuperAdmin = metadata.participants?.find(p => p.id === author)?.admin === 'superadmin';
        
        if (!isAuthorOwner && !isAuthorSuperAdmin) {
            const authorNum = getJid(author);
            // Reverse: re-promote victim, demote attacker
            try {
                await sock.groupParticipantsUpdate(groupJid, [userJid], 'promote');
                await sock.groupParticipantsUpdate(groupJid, [author], 'demote');
            } catch(e) {}

            const text = `🛡️ *ANTI-DEMOTE*\n\n@${authorNum} tried to demote @${userNum}\n⚠️ Demoter demoted, admin restored!\n\n> Megan-Prime | Protection`;
            await replyStyled(sock, groupJid, text, null, {
                title: '🛡️ Anti-Demote',
                footer: '> Megan-Prime | Group Protection',
                useNewsletter: true,
                newsletterName: 'Security Alert',
                buttons: [],
            });
            return;
        }
    }

    // Normal demote notification
    if (eventsOn === 'false') return;

    const authorNum = author ? getJid(author) : 'System';
    let displayUserNum = userNum, displayAuthorNum = authorNum;
    try {
        const r1 = await resolveRealJid(sock, userJid);
        if (r1?.endsWith('@s.whatsapp.net')) displayUserNum = r1.split('@')[0];
        if (author) {
            const r2 = await resolveRealJid(sock, author);
            if (r2?.endsWith('@s.whatsapp.net')) displayAuthorNum = r2.split('@')[0];
        }
    } catch(e) {}
    const text = `╭━━━━ *DEMOTED* ━━━━╮\n┃ 📉 *@${displayUserNum}* no longer admin\n┃ 👤 By: @${displayAuthorNum}\n┃ 🏠 *${groupName}*\n╰━━━━━━━━━━━━━━╯`;

    await replyStyled(sock, groupJid, text, null, {
        title: '📉 Admin Demoted',
        footer: '> Megan-Prime | Group Events',
        useNewsletter: true,
        newsletterName: 'Group Update',
        buttons: [],
    });
}

// ═══════════════════════════════════════════
// SPAM / FLOOD PROTECTION
// ═══════════════════════════════════════════

const messageTimestamps = new Map(); // groupJid: { userJid: [timestamps] }

function checkFlood(groupJid, userJid, db) {
    const now = Date.now();
    if (!messageTimestamps.has(groupJid)) messageTimestamps.set(groupJid, new Map());
    const group = messageTimestamps.get(groupJid);
    
    if (!group.has(userJid)) group.set(userJid, []);
    const timestamps = group.get(userJid);
    timestamps.push(now);
    
    // Keep only last 10 seconds
    const recent = timestamps.filter(t => now - t < 10000);
    group.set(userJid, recent);
    
    return recent.length > 5; // More than 5 messages in 10 seconds = flood
}

// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════

module.exports = {
    setupGroupEvents,
    getGroupSetting,
    getSetting,
    DEFAULTS,
    checkFlood,
};
