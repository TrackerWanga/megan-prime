// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME STYLER - Unified Message Styling   ║
// ║  Buttons + Newsletter + Copy + Group Invite      ║
// ╚══════════════════════════════════════════════════╝

const { sendButtons } = require('gifted-btns');
const axios = require('axios');
const dev = require('./developer');
const config = require('../config');

const BOT_NAME = config.BOT_NAME || 'Megan-Prime';
// BOT_PIC getter returns random each call from dev.BOT_PICS array
const CHANNEL_LINK = dev.WA_CHANNEL_URL;
const GROUP_LINK = dev.WA_GROUP_INVITE;
const NEWSLETTER_JID = dev.WA_CHANNEL_JID;
const NEWSLETTER_NAME = dev.WA_CHANNEL_NAME;
const DEVELOPER = dev.DEVELOPER || 'TrackerWanga';

/**
 * Create newsletter-style context for forwarded appearance
 */
async function createNewsletterContext(userJid, options = {}) {
    // Download bot pic as buffer so WhatsApp renders it
    let thumbnailBuffer = null;
    try {
        const res = await axios.get(dev.BOT_PIC, { responseType: 'arraybuffer', timeout: 10000 });
        thumbnailBuffer = Buffer.from(res.data);
    } catch(e) {}
    
    return {
        contextInfo: {
            mentionedJid: [userJid],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: NEWSLETTER_JID,
                newsletterName: options.newsletterName || NEWSLETTER_NAME,
                serverMessageId: Math.floor(100000 + Math.random() * 900000)
            },
            externalAdReply: {
                title: options.title || BOT_NAME,
                body: options.body || `Powered by Megan-Prime | ${DEVELOPER}`,
                thumbnail: thumbnailBuffer,  // Buffer works better than URL
                thumbnailUrl: dev.BOT_PIC,   // Fallback URL
                mediaType: 1,
                mediaUrl: options.mediaUrl || CHANNEL_LINK,
                sourceUrl: options.sourceUrl || CHANNEL_LINK,
                showAdAttribution: true,
                renderLargerThumbnail: true
            }
        }
    };
}

/**
 * Standard button presets
 */
const BUTTONS = {
    channel: { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '📢 Join Channel', url: CHANNEL_LINK }) },
    group: { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '👥 Join Group', url: GROUP_LINK }) },
    repo: { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '📂 GitHub Repo', url: dev.REPO_URL }) },
    copy: (label, code) => ({ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: label || '📋 Copy', copy_code: code }) }),
    url: (label, url) => ({ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: label || '🔗 Open', url }) }),
    quick: (label, id) => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: label, id }) }),
};

/**
 * Send a styled reply with newsletter context + optional buttons
 */
async function replyStyled(sock, from, text, msg, options = {}) {
    const {
        title = BOT_NAME,
        footer = `> Megan-Prime | ${DEVELOPER}`,
        buttons = [BUTTONS.channel],
        useNewsletter = true,
        newsletterName = NEWSLETTER_NAME,
        largeThumb = false,
        image = null,
    } = options;

    // Build newsletter context
    const context = useNewsletter ? await createNewsletterContext(from, { title, newsletterName, largeThumb, body: footer }) : {};
    
    // Try buttons first
    if (buttons.length > 0) {
        try {
            const content = { title, text, footer, buttons: [...buttons] };
            if (image) content.image = { url: image };
            await sendButtons(sock, from, content, { quoted: msg });
            return;
        } catch (e) {
            // Fall through to plain message with context
        }
    }
    
    // Fallback: plain message with newsletter context (always works)
    await sock.sendMessage(from, { text, ...context }, { quoted: msg });
}

/**
 * Send styled reply specifically for AI responses (detects code blocks)
 */
async function replyAI(sock, from, text, msg, options = {}) {
    const hasCode = text.includes('```') || text.includes('`');
    const buttons = [];

    if (hasCode) {
        const codeBlock = text.match(/```[\s\S]*?```/g);
        if (codeBlock) {
            const code = codeBlock[0].replace(/```\w*\n?/g, '').trim();
            buttons.push(BUTTONS.copy('📋 Copy Code', code.substring(0, 4000)));
        } else if (text.length > 200) {
            buttons.push(BUTTONS.copy('📋 Copy Response', text.substring(0, 4000)));
        }
    } else if (text.length > 500) {
        buttons.push(BUTTONS.copy('📋 Copy', text.substring(0, 4000)));
    }

    buttons.push(BUTTONS.channel);

    return replyStyled(sock, from, text, msg, {
        title: options.title || '🤖 Megan AI',
        footer: `> Megan-Prime | AI by ${DEVELOPER}`,
        buttons,
        useNewsletter: true,
        newsletterName: '𝐌𝐄𝐆𝐀𝐍 𝐀𝐈',
    });
}

/**
 * Send a menu-style message with quick reply + channel + group buttons
 */
async function replyMenu(sock, from, text, msg, quickButtons = []) {
    const buttons = quickButtons.map(b => BUTTONS.quick(b.label, b.id));
    buttons.push(BUTTONS.channel);
    buttons.push(BUTTONS.group);

    return replyStyled(sock, from, text, msg, {
        title: '📋 Megan-Prime Menu',
        buttons,
        useNewsletter: true,
        largeThumb: true,
    });
}

/**
 * Send a simple success/error styled message
 */
async function replyStatus(sock, from, text, msg, type = 'success') {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    return replyStyled(sock, from, `${emoji} ${text}`, msg, {
        title: 'Megan-Prime',
        buttons: [BUTTONS.channel],
        useNewsletter: false,
    });
}

module.exports = {
    replyStyled,
    replyAI,
    replyMenu,
    replyStatus,
    BUTTONS,
    createNewsletterContext,
    CHANNEL_LINK,
    GROUP_LINK,
    NEWSLETTER_JID,
    get BOT_PIC() { return dev.BOT_PIC; },
};
