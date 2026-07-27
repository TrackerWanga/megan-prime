// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME EXTRA TOOLS - Unique Commands     ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga   ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');

const API_BASE = require('../../megan/lib/developer').API_BASE;
const API_KEY = require('../../megan/lib/developer').API_KEY;
const FOOTER = '> Megan-Prime | TrackerWanga';

const commands = [];

async function apiGet(endpoint, params = {}, timeout = 30000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.get(url, { params: { ...params, apikey: API_KEY }, timeout, headers: { 'User-Agent': 'Megan-Prime/1.0' } });
    return res.data;
}

async function apiPost(endpoint, data = {}, timeout = 30000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.post(url, data, { params: { apikey: API_KEY }, timeout, headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

// ═══════════════════════════════════════════
// SOCIAL & WHATSAPP
// ═══════════════════════════════════════════

commands.push({ name: 'ytthumb', description: 'Get YouTube video thumbnails', aliases: ['youtubethumb', 'thumbnail'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length) return reply(`🖼️ *YOUTUBE THUMBNAILS*\n\n*Usage:* ${config.PREFIX}ytthumb <url>\n\n${FOOTER}`);
        await react('🖼️');
        try {
            const data = await apiGet('/api/social/youtube-thumbnails', { url: args[0] });
            if (data.success && data.thumbnails) {
                const hq = data.thumbnails['maxres'] || data.thumbnails['hq'] || data.thumbnails['0'];
                await sock.sendMessage(from, { image: { url: hq }, caption: `🖼️ *YouTube Thumbnails*\n🎬 ${data.videoId}\n\n${FOOTER}` }, { quoted: msg });
                await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'preview', description: 'Get link preview metadata', aliases: ['linkpreview', 'linkinfo'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`🔗 *LINK PREVIEW*\n\n*Usage:* ${config.PREFIX}preview <url>\n\n${FOOTER}`);
        await react('🔗');
        try {
            const data = await apiGet('/api/social/link-preview', { url: args[0] });
            if (data.success) {
                await reply(`🔗 *Link Preview*\n*Title:* ${data.title||'N/A'}\n*Desc:* ${(data.description||'').substring(0,300)}\n${FOOTER}`); await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'walink', description: 'Generate WhatsApp link', aliases: ['whatsapplink', 'wame'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`📱 *WHATSAPP LINK*\n\n*Usage:* ${config.PREFIX}walink <phone> <message>\n\n${FOOTER}`);
        await react('📱');
        try {
            const data = await apiGet('/api/whatsapp/link', { phone: args[0], message: args.slice(1).join(' ') || '' });
            if (data.success) { await reply(`📱 ${data.phone}\n🔗 ${data.link}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'wacheck', description: 'Validate phone number', aliases: ['phonecheck', 'checkphone'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`✅ *PHONE VALIDATOR*\n\n*Usage:* ${config.PREFIX}wacheck <phone>\n\n${FOOTER}`);
        await react('✅');
        try {
            const data = await apiGet('/api/whatsapp/check', { phone: args[0] });
            if (data.success) { await reply(`✅ *Phone:* ${data.phone}\n✔️ Valid: ${data.valid?'Yes':'No'}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'carrier', description: 'Check Kenyan phone carrier', aliases: ['network', 'safcom'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`📡 *CARRIER*\n\n*Usage:* ${config.PREFIX}carrier <phone>\n\n${FOOTER}`);
        await react('📡');
        try {
            const data = await apiGet('/api/whatsapp/carrier', { phone: args[0] });
            if (data.success) { await reply(`📡 ${data.phone}\n🏢 ${data.carrier}\n🌍 ${data.country}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// EMAIL
// ═══════════════════════════════════════════

commands.push({ name: 'gravatar', description: 'Get Gravatar for email', aliases: ['avatar', 'emailavatar'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length) return reply(`👤 *GRAVATAR*\n\n*Usage:* ${config.PREFIX}gravatar <email>\n\n${FOOTER}`);
        await react('👤');
        try {
            const data = await apiGet('/api/email/gravatar', { email: args[0] });
            if (data.success && data.gravatar) {
                await sock.sendMessage(from, { image: { url: data.gravatar+'?s=300' }, caption: `👤 *Gravatar*\n📧 ${data.email}\n\n${FOOTER}` }, { quoted: msg });
                await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'disposable', description: 'Check if email is disposable', aliases: ['tempmail', 'fakemail'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`📧 *DISPOSABLE CHECK*\n\n*Usage:* ${config.PREFIX}disposable <email>\n\n${FOOTER}`);
        await react('📧');
        try {
            const data = await apiGet('/api/email/disposable', { email: args[0] });
            if (data.success) { await reply(`📧 ${data.email}\n🗑️ Disposable: ${data.disposable?'⚠️ Yes':'✅ No'}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// TIME
// ═══════════════════════════════════════════

commands.push({ name: 'dayofyear', description: 'Get day of year info', aliases: ['doy', 'yearday'],
    async execute({ react, reply }) {
        await react('📅');
        try {
            const data = await apiGet('/api/time/day-of-year');
            if (data.success) { await reply(`📅 *Day ${data.dayOfYear}/${data.totalDays}*\n📆 ${data.date}\n⏳ ${data.remaining} days left\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'countdown', description: 'Countdown to a date', aliases: ['timer', 'until'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`⏰ *COUNTDOWN*\n\n*Usage:* ${config.PREFIX}countdown <YYYY-MM-DD>\n\n${FOOTER}`);
        await react('⏰');
        try {
            const data = await apiGet('/api/time/countdown', { date: args[0] });
            if (data.success) { await reply(`⏰ *Countdown to ${data.target}*\n📅 ${data.days} days\n⏱️ ${data.hours}h ${data.minutes}m ${data.seconds}s\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// MATH
// ═══════════════════════════════════════════

commands.push({ name: 'prime', description: 'Check if number is prime', aliases: ['isprime'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🔢 *PRIME CHECK*\n\n*Usage:* ${config.PREFIX}prime <number>\n\n${FOOTER}`);
        await react('🔢');
        try {
            const data = await apiGet('/api/math/prime', { number: args[0] });
            if (data.success) { await reply(`🔢 ${data.number} → ${data.prime?'✅ Prime':'❌ Not prime'}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'factorial', description: 'Calculate factorial', aliases: ['fact', 'nfact'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🔢 *FACTORIAL*\n\n*Usage:* ${config.PREFIX}factorial <number>\n\n${FOOTER}`);
        await react('🔢');
        try {
            const data = await apiGet('/api/math/factorial', { number: args[0] });
            if (data.success) { await reply(`🔢 ${args[0]}! = ${data.factorial}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'fibonacci', description: 'Generate Fibonacci sequence', aliases: ['fib', 'fibseq'],
    async execute({ msg, from, args, react, reply }) {
        const count = parseInt(args[0]) || 10;
        await react('🔢');
        try {
            const data = await apiGet('/api/math/fibonacci', { count });
            if (data.success) { await reply(`🔢 *Fibonacci (${count})*\n${data.sequence.join(', ')}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'bmi', description: 'Calculate BMI', aliases: ['bmicalc', 'bodymass'],
    async execute({ msg, from, args, react, reply }) {
        if (args.length < 2) return reply(`⚖️ *BMI*\n\n*Usage:* ${config.PREFIX}bmi <weight_kg> <height_m>\n\n${FOOTER}`);
        await react('⚖️');
        try {
            const data = await apiGet('/api/math/bmi', { weight: args[0], height: args[1] });
            if (data.success) { await reply(`⚖️ *BMI:* ${data.bmi}\n🏷️ ${data.category}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// QR CODES
// ═══════════════════════════════════════════

commands.push({ name: 'qrwifi', description: 'Generate WiFi QR code', aliases: ['wifiqr', 'qrconnect'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (args.length < 2) return reply(`📶 *WIFI QR*\n\n*Usage:* ${config.PREFIX}qrwifi <ssid> <password>\n\n${FOOTER}`);
        await react('📶');
        try {
            const data = await apiGet('/api/qr/wifi', { ssid: args[0], password: args[1] });
            if (data.success && data.qrCode) {
                await sock.sendMessage(from, { image: { url: data.qrCode }, caption: `📶 *WiFi QR*\n📡 ${data.ssid}\n\n${FOOTER}` }, { quoted: msg });
                await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'vcardqr', description: 'Generate vCard QR code', aliases: ['contactqr', 'bizcard'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length) return reply(`💳 *VCARD QR*\n\n*Usage:* ${config.PREFIX}vcardqr <name> <phone> <email> <org>\n\n${FOOTER}`);
        await react('💳');
        try {
            const [name, phone, email, org] = args;
            const data = await apiGet('/api/qr/vcard', { name, phone, email, org });
            if (data.success && data.qrCode) {
                await sock.sendMessage(from, { image: { url: data.qrCode }, caption: `💳 *vCard*\n👤 ${data.name}\n\n${FOOTER}` }, { quoted: msg });
                await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// GAMES
// ═══════════════════════════════════════════

commands.push({ name: '8ball', description: 'Magic 8-ball fortune', aliases: ['magic8', 'eightball'],
    async execute({ react, reply }) {
        await react('🎱');
        try {
            const data = await apiGet('/api/games/8ball');
            if (data.success) { await reply(`🎱 *Magic 8-Ball*\n\n${data.emoji} ${data.answer}\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'thisday', description: 'On this day in history', aliases: ['todayinhistory', 'onthisday'],
    async execute({ react, reply }) {
        await react('📜');
        try {
            const data = await apiGet('/api/games/this-day');
            if (data.success && data.events) {
                let txt = `📜 *On This Day - ${data.date}*\n\n`;
                data.events.slice(0,5).forEach(e => txt += `• ${e}\n`);
                txt += `\n${FOOTER}`;
                await reply(txt); await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'numberfact', description: 'Get number facts', aliases: ['numfact', 'numbertrivia'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🔢 *NUMBER FACTS*\n\n*Usage:* ${config.PREFIX}numberfact <number>\n\n${FOOTER}`);
        await react('🔢');
        try {
            const data = await apiGet('/api/games/numbers', { number: args[0] });
            if (data.success && data.facts) {
                let txt = `🔢 *Number ${data.number} Facts*\n\n`;
                data.facts.forEach(f => txt += `• ${f}\n`);
                txt += `\n${FOOTER}`;
                await reply(txt); await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

commands.push({ name: 'devjoke', description: 'Get a programming joke', aliases: ['programmerjoke', 'coderhumor'],
    async execute({ react, reply }) {
        await react('💻');
        try {
            const data = await apiGet('/api/games/programming-joke');
            if (data.success) { await reply(`💻 *Dev Joke*\n\n${data.setup}\n\n_${data.punchline}_\n\n${FOOTER}`); await react('✅'); }
            else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// ENCODING (API versions only - local ones are in tools.js)
// ═══════════════════════════════════════════

commands.push({ name: 'jwt', description: 'Decode JWT token', aliases: ['jwtdecode', 'tokendecode'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length) return reply(`🔑 *JWT DECODE*\n\n*Usage:* ${config.PREFIX}jwt <token>\n\n${FOOTER}`);
        await react('🔑');
        try {
            const data = await apiPost('/api/encode/jwt-decode', { token: args[0] });
            if (data.success) {
                await reply(`🔑 *JWT Decoded*\n\n*Header:* ${JSON.stringify(data.header)}\n*Payload:* ${JSON.stringify(data.payload).substring(0,300)}\n\n${FOOTER}`); await react('✅');
            } else { await reply(`❌ *Failed*\n\n${FOOTER}`); }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════

commands.push({ name: 'extras', description: 'Show all extra tool commands', aliases: ['extramenu', 'moretools'],
    async execute({ react, reply }) {
        const p = config.PREFIX;
        const menu = `🔧 *EXTRA TOOLS*

*📱 SOCIAL*
${p}ytthumb <url> - YouTube thumbnails
${p}preview <url> - Link preview
${p}walink <phone> - WhatsApp link
${p}wacheck <phone> - Validate phone
${p}carrier <phone> - Kenyan carrier

*📧 EMAIL*
${p}gravatar <email> - Get Gravatar
${p}disposable <email> - Check temp mail

*⏰ TIME*
${p}dayofyear - Day of year
${p}countdown <date> - Days until

*🔢 MATH*
${p}prime <n> - Check prime
${p}factorial <n> - Factorial
${p}fibonacci <n> - Fibonacci
${p}bmi <w> <h> - BMI calculator

*📶 QR CODES*
${p}qrwifi <ssid> <pass>
${p}vcardqr <name> <phone> <email>

*🎮 GAMES*
${p}8ball - Magic 8-ball
${p}thisday - On this day
${p}numberfact <n> - Number trivia
${p}devjoke - Programming joke

*🔐 ENCODING*
${p}jwt <token> - Decode JWT

> Megan-Prime | Extra Tools | TrackerWanga`;
        await reply(menu); await react('🔧');
    }
});

module.exports = { commands };
