// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME ANIME - Self-Hosted R2 CDN         ║
// ║  Downloads as buffer → WhatsApp renders reliably ║
// ╚══════════════════════════════════════════════════╝

const config = require('../../megan/config');
const axios = require('axios');
const FOOTER = '> Megan-Prime | Anime CDN | TrackerWanga';

const CDN = 'https://anime-cdn.megan.qzz.io/anime';
const commands = [];

// Files available per type on R2
const COUNTS = { cry:20, cuddle:7, dance:30, hug:30, kiss:30, laugh:30, pat:30, slap:30, waifu:26 };

function randomFile(type) {
    const max = COUNTS[type] || 20;
    const n = Math.floor(Math.random() * max) + 1;
    const padded = String(n).padStart(3, '0');
    
    // Waifu has mixed extensions
    if (type === 'waifu') {
        const exts = ['png','png','jpeg','jpg','jpg','jpg','jpeg','jpg','jpeg','jpg','jpg','jpg','jpeg','png','png','jpg','png','png','png','jpg','jpeg','jpeg','jpg','png','png','png'];
        return `${CDN}/waifu/${padded}.${exts[n-1] || 'png'}`;
    }
    return `${CDN}/${type}/${padded}.gif`;
}

async function downloadBuffer(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
    return Buffer.from(res.data);
}

function getMentions(msg) {
    const mentions = [];
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid) mentions.push(...ctx.mentionedJid);
    if (ctx?.participant && !mentions.includes(ctx.participant)) mentions.push(ctx.participant);
    return mentions;
}

function senderName(msg, sender) { return msg.pushName || sender.split('@')[0] || 'Someone'; }
function getTarget(args, msg) {
    if (args.length) return args.join(' ');
    const m = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    return m?.length ? '@' + m[0].split('@')[0] : 'you';
}

async function sendAnime(sock, from, msg, sender, type, emoji, caption, target) {
    const url = randomFile(type);
    const mentions = getMentions(msg);
    const name = senderName(msg, sender);
    const cap = caption.replace('{s}', name).replace('{t}', target || 'you');
    const text = emoji + ' *' + cap + '*\n\n' + FOOTER;
    
    // Download as buffer then send - WhatsApp renders buffers reliably
    const buffer = await downloadBuffer(url);
    
    if (type === 'waifu') {
        await sock.sendMessage(from, { image: buffer, caption: text, mentions }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { video: buffer, mimetype: 'video/mp4', caption: text, gifPlayback: true, mentions }, { quoted: msg });
    }
}

// ═══ ACTION COMMANDS ═══
function actionCmd(name, verb, emoji, aliases) {
    commands.push({ name, description: verb + ' anime GIF', aliases,
        async execute({ msg, from, sender, args, sock, react, reply }) {
            await react(emoji);
            try {
                await sendAnime(sock, from, msg, sender, name, emoji, '{s} ' + verb + ' {t}!', getTarget(args, msg));
                await react('✅');
            } catch(e) { await react('❌'); await reply('❌ ' + e.message + '\n\n' + FOOTER); }
        }
    });
}

function selfCmd(name, action, emoji, aliases) {
    commands.push({ name, description: action + ' anime GIF', aliases,
        async execute({ msg, from, sender, args, sock, react, reply }) {
            await react(emoji);
            try {
                await sendAnime(sock, from, msg, sender, name, emoji, '{s} ' + action, '');
                await react('✅');
            } catch(e) { await react('❌'); await reply('❌ ' + e.message + '\n\n' + FOOTER); }
        }
    });
}

actionCmd('hug', 'hugs', '🤗', ['ahug','animehug','huggif']);
actionCmd('kiss', 'kisses', '💋', ['akiss','animekiss','kissgif']);
actionCmd('slap', 'slaps', '👋', ['aslap','animeslap','slapgif']);
actionCmd('pat', 'pats', '🫳', ['apat','animepat','patgif','headpat']);
actionCmd('cuddle', 'cuddles', '🤱', ['acuddle','animecuddle','cuddlegif']);

selfCmd('cry', 'is crying...', '😢', ['acry','animecry','crygif']);
selfCmd('dance', 'is dancing!', '💃', ['adance','animedance','dancegif']);
selfCmd('laugh', 'is laughing!', '😂', ['alaugh','animelaugh','laughgif','lol']);

// Waifu
commands.push({ name: 'waifu', description: 'Random waifu image', aliases: ['waifuimg','animegirl'],
    async execute({ msg, from, sender, args, sock, react, reply }) {
        await react('🌸');
        try {
            await sendAnime(sock, from, msg, sender, 'waifu', '🌸', 'Random Waifu!', '');
            await react('✅');
        } catch(e) { await react('❌'); }
    }
});

// Menu
commands.push({ name: 'anime', description: 'Anime reactions menu', aliases: ['animemenu','animehelp'],
    async execute({ react, reply }) {
        const p = config.PREFIX;
        await reply('🎌 *ANIME REACTIONS - R2 CDN*\n\n*🎬 ACTIONS*\n' + p + 'hug @user | ' + p + 'kiss @user | ' + p + 'slap @user\n' + p + 'pat @user | ' + p + 'cuddle @user\n\n*😢 SELF*\n' + p + 'cry | ' + p + 'dance | ' + p + 'laugh\n\n*🖼️ IMAGE*\n' + p + 'waifu\n\n> Megan-Prime | TrackerWanga');
        await react('🎌');
    }
});

module.exports = { commands };