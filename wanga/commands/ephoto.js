// ╔══════════════════════════════════════════════════╗
// ║   MEGAN-PRIME EPHOTO360 - 110 Text Effects     ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga  ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');

const API_BASE = require('../../megan/lib/developer').API_BASE;
const API_KEY = require('../../megan/lib/developer').API_KEY;
const FOOTER = '> Megan-Prime | TrackerWanga';

const commands = [];

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

async function apiGet(endpoint, params = {}, timeout = 30000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.get(url, {
        params: { ...params, apikey: API_KEY },
        timeout,
        headers: { 'User-Agent': 'Megan-Prime/1.0' }
    });
    return res.data;
}

async function generateEphoto(effectId, texts) {
    // Build query params: text, text2, text3...
    const params = {};
    texts.forEach((t, i) => {
        params[i === 0 ? 'text' : `text${i + 1}`] = t;
    });
    const data = await apiGet(`/api/ephoto/${effectId}`, params, 60000);
    if (data.success && data.imageUrl) {
        return data.imageUrl;
    }
    throw new Error(data.error || 'Failed to generate effect');
}

// ═══════════════════════════════════════════
// 1. TEXT EFFECTS (Neon, Glow, Style)
// ═══════════════════════════════════════════

// Classic Neon Text
commands.push({
    name: 'neon',
    description: 'Classic Neon Text Effect',
    aliases: ['neontext', 'classicneon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💡 *CLASSIC NEON TEXT*\n\nUsage: ${config.PREFIX}neon <text>\nExample: ${config.PREFIX}neon Megan\n\n${FOOTER}`);
        await react('💡');
        try {
            const url = await generateEphoto('neon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💡 *Neon Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Colorful Glow Neon
commands.push({
    name: 'colorfulglow',
    description: 'Colorful Glow Neon Text',
    aliases: ['glowneon', 'colorn'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌈 *COLORFUL GLOW NEON*\n\nUsage: ${config.PREFIX}colorfulglow <text>\nExample: ${config.PREFIX}colorfulglow Megan\n\n${FOOTER}`);
        await react('🌈');
        try {
            const url = await generateEphoto('colorfulglow', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌈 *Colorful Glow Neon*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Advanced Glow Effect
commands.push({
    name: 'advancedglow',
    description: 'Advanced Glow Effect',
    aliases: ['advglow', 'proglow'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`✨ *ADVANCED GLOW EFFECT*\n\nUsage: ${config.PREFIX}advancedglow <text>\nExample: ${config.PREFIX}advancedglow Megan\n\n${FOOTER}`);
        await react('✨');
        try {
            const url = await generateEphoto('advancedglow', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `✨ *Advanced Glow*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Neon Text Online
commands.push({
    name: 'neononline',
    description: 'Neon Text Online',
    aliases: ['onlineneon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔮 *NEON TEXT ONLINE*\n\nUsage: ${config.PREFIX}neononline <text>\nExample: ${config.PREFIX}neononline Megan\n\n${FOOTER}`);
        await react('🔮');
        try {
            const url = await generateEphoto('neononline', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔮 *Neon Text Online*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Blue Neon Light
commands.push({
    name: 'blueneon',
    description: 'Blue Neon Light Text',
    aliases: ['bluelight', 'blueneontext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💙 *BLUE NEON LIGHT*\n\nUsage: ${config.PREFIX}blueneon <text>\nExample: ${config.PREFIX}blueneon Megan\n\n${FOOTER}`);
        await react('💙');
        try {
            const url = await generateEphoto('blueneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💙 *Blue Neon Light*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Neon Text Effect (2 lines)
commands.push({
    name: 'neontext2',
    description: 'Neon Text Effect (2 Lines)',
    aliases: ['neon2', 'doubleneon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💜 *NEON TEXT EFFECT (2 LINES)*\n\nUsage: ${config.PREFIX}neontext2 <line1> | <line2>\nExample: ${config.PREFIX}neontext2 Megan | Prime\n\n${FOOTER}`);
        await react('💜');
        try {
            const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length < 2) return reply(`❌ Provide 2 lines separated by |\n\n${FOOTER}`);
            const url = await generateEphoto('neontext', [parts[0], parts[1]]);
            await sock.sendMessage(from, { image: { url }, caption: `💜 *Neon Text Effect*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Neon Light Text
commands.push({
    name: 'neonlight',
    description: 'Neon Light Text',
    aliases: ['lightneon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💫 *NEON LIGHT TEXT*\n\nUsage: ${config.PREFIX}neonlight <text>\nExample: ${config.PREFIX}neonlight Megan\n\n${FOOTER}`);
        await react('💫');
        try {
            const url = await generateEphoto('neonlight', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💫 *Neon Light*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Green Neon Text
commands.push({
    name: 'greenneon',
    description: 'Green Neon Text',
    aliases: ['greenn', 'greenlightning'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💚 *GREEN NEON TEXT*\n\nUsage: ${config.PREFIX}greenneon <text>\nExample: ${config.PREFIX}greenneon Megan\n\n${FOOTER}`);
        await react('💚');
        try {
            const url = await generateEphoto('greenneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💚 *Green Neon*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Green Light Neon
commands.push({
    name: 'greenlightneon',
    description: 'Green Light Neon',
    aliases: ['glight', 'greenlight'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🟢 *GREEN LIGHT NEON*\n\nUsage: ${config.PREFIX}greenlightneon <text>\nExample: ${config.PREFIX}greenlightneon Megan\n\n${FOOTER}`);
        await react('🟢');
        try {
            const url = await generateEphoto('greenlightneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🟢 *Green Light Neon*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Neon Logo Text (Blackpink style)
commands.push({
    name: 'blueneonlogo',
    description: 'Neon Logo Text',
    aliases: ['neonlogo', 'logoneon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🩷 *NEON LOGO TEXT*\n\nUsage: ${config.PREFIX}blueneonlogo <text>\nExample: ${config.PREFIX}blueneonlogo Megan\n\n${FOOTER}`);
        await react('🩷');
        try {
            const url = await generateEphoto('blueneonlogo', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🩷 *Neon Logo Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Galaxy Text Effect
commands.push({
    name: 'galaxyneon',
    description: 'Galaxy Text Effect',
    aliases: ['galaxytext', 'galaxyeffect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌌 *GALAXY TEXT EFFECT*\n\nUsage: ${config.PREFIX}galaxyneon <text>\nExample: ${config.PREFIX}galaxyneon Megan\n\n${FOOTER}`);
        await react('🌌');
        try {
            const url = await generateEphoto('galaxyneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌌 *Galaxy Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Retro Text Effect
commands.push({
    name: 'retroneon',
    description: 'Retro Text Effect',
    aliases: ['retro', 'retrotext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🕹️ *RETRO TEXT EFFECT*\n\nUsage: ${config.PREFIX}retroneon <text>\nExample: ${config.PREFIX}retroneon Megan\n\n${FOOTER}`);
        await react('🕹️');
        try {
            const url = await generateEphoto('retroneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🕹️ *Retro Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Multicolor 3D Text
commands.push({
    name: 'multicolorneon',
    description: 'Multicolor 3D Paper Cut Text',
    aliases: ['multi3d', 'multicolor3d'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎨 *MULTICOLOR 3D TEXT*\n\nUsage: ${config.PREFIX}multicolorneon <text>\nExample: ${config.PREFIX}multicolorneon Megan\n\n${FOOTER}`);
        await react('🎨');
        try {
            const url = await generateEphoto('multicolorneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎨 *Multicolor 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Galaxy Neon Light
commands.push({
    name: 'hackerneon',
    description: 'Galaxy Neon Light',
    aliases: ['galaxyneon2', 'hackergalaxy'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌠 *GALAXY NEON LIGHT*\n\nUsage: ${config.PREFIX}hackerneon <text>\nExample: ${config.PREFIX}hackerneon Megan\n\n${FOOTER}`);
        await react('🌠');
        try {
            const url = await generateEphoto('hackerneon', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌠 *Galaxy Neon Light*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Devil Wings Neon
commands.push({
    name: 'devilwings',
    description: 'Devil Wings Neon',
    aliases: ['devilneon', 'evilwings'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`😈 *DEVIL WINGS NEON*\n\nUsage: ${config.PREFIX}devilwings <text>\nExample: ${config.PREFIX}devilwings Megan\n\n${FOOTER}`);
        await react('😈');
        try {
            const url = await generateEphoto('devilwings', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `😈 *Devil Wings Neon*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Glowing Text Effect
commands.push({
    name: 'glowtext',
    description: 'Glowing Text Effect',
    aliases: ['glowingtext', 'gloweffect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌟 *GLOWING TEXT EFFECT*\n\nUsage: ${config.PREFIX}glowtext <text>\nExample: ${config.PREFIX}glowtext Megan\n\n${FOOTER}`);
        await react('🌟');
        try {
            const url = await generateEphoto('glowtext', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌟 *Glowing Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Digital Glitch Neon
commands.push({
    name: 'neonglitch',
    description: 'Digital Glitch Neon Text',
    aliases: ['glitchneon', 'digitalglitch'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`👾 *DIGITAL GLITCH NEON*\n\nUsage: ${config.PREFIX}neonglitch <text>\nExample: ${config.PREFIX}neonglitch Megan\n\n${FOOTER}`);
        await react('👾');
        try {
            const url = await generateEphoto('neonglitch', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `👾 *Digital Glitch Neon*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Galaxy Text New
commands.push({
    name: 'neonwall',
    description: 'Galaxy Text New',
    aliases: ['newgalaxy', 'galaxynew'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌃 *GALAXY TEXT NEW*\n\nUsage: ${config.PREFIX}neonwall <text>\nExample: ${config.PREFIX}neonwall Megan\n\n${FOOTER}`);
        await react('🌃');
        try {
            const url = await generateEphoto('neonwall', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌃 *Galaxy Text New*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Colorful Glow Text
commands.push({
    name: 'led',
    description: 'Colorful Glow Text',
    aliases: ['ledtext', 'ledglow'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💡 *COLORFUL GLOW TEXT*\n\nUsage: ${config.PREFIX}led <text>\nExample: ${config.PREFIX}led Megan\n\n${FOOTER}`);
        await react('💡');
        try {
            const url = await generateEphoto('led', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💡 *Colorful Glow Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Write on Wet Glass
commands.push({
    name: 'wetglass',
    description: 'Write Text on Wet Glass',
    aliases: ['writeonwetglass', 'glasswrite'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💧 *WRITE ON WET GLASS*\n\nUsage: ${config.PREFIX}wetglass <text>\nExample: ${config.PREFIX}wetglass Megan\n\n${FOOTER}`);
        await react('💧');
        try {
            const url = await generateEphoto('writeonwetglass', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💧 *Wet Glass Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Deadpool Logo Style
commands.push({
    name: 'deadpool',
    description: 'Deadpool Logo Style',
    aliases: ['deadpoollogo', 'dpstyle'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔴 *DEADPOOL LOGO STYLE*\n\nUsage: ${config.PREFIX}deadpool <text> | <subtitle>\nExample: ${config.PREFIX}deadpool Megan | Deadpool\n\n${FOOTER}`);
        await react('🔴');
        try {
            const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length < 2) return reply(`❌ Provide 2 lines separated by |\n\n${FOOTER}`);
            const url = await generateEphoto('deadpool', [parts[0], parts[1]]);
            await sock.sendMessage(from, { image: { url }, caption: `🔴 *Deadpool Logo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Dragon Ball Style
commands.push({
    name: 'dragonball',
    description: 'Dragon Ball Style Text',
    aliases: ['dbztext', 'dragonballz'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🐉 *DRAGON BALL STYLE*\n\nUsage: ${config.PREFIX}dragonball <text>\nExample: ${config.PREFIX}dragonball Megan\n\n${FOOTER}`);
        await react('🐉');
        try {
            const url = await generateEphoto('dragonball', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🐉 *Dragon Ball Style*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Typography Pavement
commands.push({
    name: 'pavement',
    description: 'Typography Text on Pavement',
    aliases: ['typopavement', 'pavementtext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🛣️ *TYPOGRAPHY PAVEMENT*\n\nUsage: ${config.PREFIX}pavement <text>\nExample: ${config.PREFIX}pavement Megan\n\n${FOOTER}`);
        await react('🛣️');
        try {
            const url = await generateEphoto('typographypavement', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🛣️ *Typography Pavement*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Blackpink Style Logo
commands.push({
    name: 'blackpink',
    description: 'Blackpink Style Logo',
    aliases: ['bplogo', 'blackpinklogo'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🖤🩷 *BLACKPINK STYLE LOGO*\n\nUsage: ${config.PREFIX}blackpink <text>\nExample: ${config.PREFIX}blackpink Megan\n\n${FOOTER}`);
        await react('🖤');
        try {
            const url = await generateEphoto('blackpinklogo', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🖤🩷 *Blackpink Logo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Born Pink Album Logo
commands.push({
    name: 'bornpink',
    description: 'Born Pink Album Logo',
    aliases: ['bornpinklogo', 'bpalbum'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎀 *BORN PINK ALBUM LOGO*\n\nUsage: ${config.PREFIX}bornpink <text> | <subtitle>\nExample: ${config.PREFIX}bornpink Megan | Born Pink\n\n${FOOTER}`);
        await react('🎀');
        try {
            const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length < 2) return reply(`❌ Provide 2 lines separated by |\n\n${FOOTER}`);
            const url = await generateEphoto('bornpink', [parts[0], parts[1]]);
            await sock.sendMessage(from, { image: { url }, caption: `🎀 *Born Pink Album*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Foil Balloon 3D Text
commands.push({
    name: 'foilballoon',
    description: '3D Foil Balloon Text',
    aliases: ['foil3d', 'balloonfoil'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎈 *3D FOIL BALLOON TEXT*\n\nUsage: ${config.PREFIX}foilballoon <text>\nExample: ${config.PREFIX}foilballoon Megan\n\n${FOOTER}`);
        await react('🎈');
        try {
            const url = await generateEphoto('foilballoon3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎈 *3D Foil Balloon*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Colorful Paint 3D
commands.push({
    name: 'colorfulpaint',
    description: '3D Colorful Paint Text',
    aliases: ['paint3d', 'colorpaint'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎨 *3D COLORFUL PAINT TEXT*\n\nUsage: ${config.PREFIX}colorfulpaint <text>\nExample: ${config.PREFIX}colorfulpaint Megan\n\n${FOOTER}`);
        await react('🎨');
        try {
            const url = await generateEphoto('colorfulpaint3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎨 *3D Colorful Paint*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Blackpink Signature Logo
commands.push({
    name: 'bpsignature',
    description: 'Blackpink Signature Logo',
    aliases: ['blackpinksign', 'bpsign'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`✍️ *BLACKPINK SIGNATURE LOGO*\n\nUsage: ${config.PREFIX}bpsignature <text>\nExample: ${config.PREFIX}bpsignature Megan\n\n${FOOTER}`);
        await react('✍️');
        try {
            const url = await generateEphoto('blackpinksignature', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `✍️ *Blackpink Signature*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Dragon Ball Text Effect
commands.push({
    name: 'dbztext',
    description: 'Dragon Ball Text Effect',
    aliases: ['dragonballtext', 'dbzeffect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`⭐ *DRAGON BALL TEXT EFFECT*\n\nUsage: ${config.PREFIX}dbztext <text>\nExample: ${config.PREFIX}dbztext Megan\n\n${FOOTER}`);
        await react('⭐');
        try {
            const url = await generateEphoto('dragonballtext', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `⭐ *Dragon Ball Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Glossy Silver 3D
commands.push({
    name: 'glossysilver',
    description: 'Glossy Silver 3D Text',
    aliases: ['silverglossy', 'silver3dtext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🥈 *GLOSSY SILVER 3D TEXT*\n\nUsage: ${config.PREFIX}glossysilver <text>\nExample: ${config.PREFIX}glossysilver Megan\n\n${FOOTER}`);
        await react('🥈');
        try {
            const url = await generateEphoto('glossysilver3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🥈 *Glossy Silver 3D*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Typography Art Layers
commands.push({
    name: 'typoart',
    description: 'Typography Art Layers',
    aliases: ['typographyart', 'artlayers'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🖼️ *TYPOGRAPHY ART LAYERS*\n\nUsage: ${config.PREFIX}typoart <text>\nExample: ${config.PREFIX}typoart Megan\n\n${FOOTER}`);
        await react('🖼️');
        try {
            const url = await generateEphoto('typographyart', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🖼️ *Typography Art*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Handwritten Foggy Glass
commands.push({
    name: 'foggyglass',
    description: 'Handwritten Foggy Glass Text',
    aliases: ['foggy', 'glassfog'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌫️ *FOGGY GLASS TEXT*\n\nUsage: ${config.PREFIX}foggyglass <text>\nExample: ${config.PREFIX}foggyglass Megan\n\n${FOOTER}`);
        await react('🌫️');
        try {
            const url = await generateEphoto('foggyglass', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌫️ *Foggy Glass Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 2. MATERIAL EFFECTS (Ice, Gold, Blood, Fire)
// ═══════════════════════════════════════════

// Frozen Text
commands.push({
    name: 'frozen',
    description: 'Frozen Ice Text',
    aliases: ['icetext', 'frozentext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`❄️ *FROZEN ICE TEXT*\n\nUsage: ${config.PREFIX}frozen <text>\nExample: ${config.PREFIX}frozen Megan\n\n${FOOTER}`);
        await react('❄️');
        try {
            const url = await generateEphoto('frozen', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `❄️ *Frozen Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Gold Text
commands.push({
    name: 'gold',
    description: 'Gold Text Effect',
    aliases: ['goldtext', 'goldeneffect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🥇 *GOLD TEXT EFFECT*\n\nUsage: ${config.PREFIX}gold <text>\nExample: ${config.PREFIX}gold Megan\n\n${FOOTER}`);
        await react('🥇');
        try {
            const url = await generateEphoto('gold', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🥇 *Gold Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Horror Text
commands.push({
    name: 'horror',
    description: 'Horror Text Effect',
    aliases: ['horrortext', 'scarytext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`👻 *HORROR TEXT EFFECT*\n\nUsage: ${config.PREFIX}horror <text>\nExample: ${config.PREFIX}horror Megan\n\n${FOOTER}`);
        await react('👻');
        try {
            const url = await generateEphoto('horror', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `👻 *Horror Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Blood Text on Wall
commands.push({
    name: 'blood',
    description: 'Blood Text on Wall',
    aliases: ['bloodtext', 'bloodwall'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🩸 *BLOOD TEXT ON WALL*\n\nUsage: ${config.PREFIX}blood <text>\nExample: ${config.PREFIX}blood Megan\n\n${FOOTER}`);
        await react('🩸');
        try {
            const url = await generateEphoto('blood', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🩸 *Blood Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Lava Text
commands.push({
    name: 'lava',
    description: 'Lava/Fire Text Effect',
    aliases: ['lavatext', 'firetext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌋 *LAVA TEXT EFFECT*\n\nUsage: ${config.PREFIX}lava <text>\nExample: ${config.PREFIX}lava Megan\n\n${FOOTER}`);
        await react('🌋');
        try {
            const url = await generateEphoto('lava', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌋 *Lava Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Thunder Text
commands.push({
    name: 'thunder',
    description: 'Thunder/Lightning Text',
    aliases: ['thundertext', 'lightning'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`⚡ *THUNDER TEXT*\n\nUsage: ${config.PREFIX}thunder <text>\nExample: ${config.PREFIX}thunder Megan\n\n${FOOTER}`);
        await react('⚡');
        try {
            const url = await generateEphoto('thunder', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `⚡ *Thunder Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Matrix Text
commands.push({
    name: 'matrix',
    description: 'Matrix Code Text',
    aliases: ['matrixtext', 'codetext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💚 *MATRIX CODE TEXT*\n\nUsage: ${config.PREFIX}matrix <text>\nExample: ${config.PREFIX}matrix Megan\n\n${FOOTER}`);
        await react('💚');
        try {
            const url = await generateEphoto('matrix', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💚 *Matrix Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Smoke Text
commands.push({
    name: 'smoke',
    description: 'Smoke Text Effect',
    aliases: ['smoketext', 'smokeeffect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💨 *SMOKE TEXT EFFECT*\n\nUsage: ${config.PREFIX}smoke <text>\nExample: ${config.PREFIX}smoke Megan\n\n${FOOTER}`);
        await react('💨');
        try {
            const url = await generateEphoto('smoke', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💨 *Smoke Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Fire Text Effect
commands.push({
    name: 'fireeffect',
    description: 'Fire Text Effect',
    aliases: ['fire', 'flameon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔥 *FIRE TEXT EFFECT*\n\nUsage: ${config.PREFIX}fireeffect <text>\nExample: ${config.PREFIX}fireeffect Megan\n\n${FOOTER}`);
        await react('🔥');
        try {
            const url = await generateEphoto('fire', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔥 *Fire Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Flame Lettering
commands.push({
    name: 'flamelettering',
    description: 'Flame Lettering Effect',
    aliases: ['flame', 'flametext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔥 *FLAME LETTERING*\n\nUsage: ${config.PREFIX}flamelettering <text>\nExample: ${config.PREFIX}flamelettering Megan\n\n${FOOTER}`);
        await react('🔥');
        try {
            const url = await generateEphoto('flamelettering', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔥 *Flame Lettering*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 3. 3D EFFECTS
// ═══════════════════════════════════════════

// Wooden 3D Text
commands.push({
    name: 'wooden3d',
    description: 'Wooden 3D Text',
    aliases: ['wood3d', 'woodentext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🪵 *WOODEN 3D TEXT*\n\nUsage: ${config.PREFIX}wooden3d <text>\nExample: ${config.PREFIX}wooden3d Megan\n\n${FOOTER}`);
        await react('🪵');
        try {
            const url = await generateEphoto('wooden3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🪵 *Wooden 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Cubic 3D Text
commands.push({
    name: 'cubic3d',
    description: 'Cubic 3D Text',
    aliases: ['cube3d', 'cubictext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🧊 *CUBIC 3D TEXT*\n\nUsage: ${config.PREFIX}cubic3d <text>\nExample: ${config.PREFIX}cubic3d Megan\n\n${FOOTER}`);
        await react('🧊');
        try {
            const url = await generateEphoto('cubic3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🧊 *Cubic 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Water 3D Text
commands.push({
    name: 'water3d',
    description: 'Water 3D Text',
    aliases: ['watertext', '3dwater'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💧 *WATER 3D TEXT*\n\nUsage: ${config.PREFIX}water3d <text>\nExample: ${config.PREFIX}water3d Megan\n\n${FOOTER}`);
        await react('💧');
        try {
            const url = await generateEphoto('water3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💧 *Water 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// 3D Text Effect
commands.push({
    name: 'text3d',
    description: '3D Text Effect',
    aliases: ['3dtext', 'threedtext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`📐 *3D TEXT EFFECT*\n\nUsage: ${config.PREFIX}text3d <text>\nExample: ${config.PREFIX}text3d Megan\n\n${FOOTER}`);
        await react('📐');
        try {
            const url = await generateEphoto('text3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `📐 *3D Text Effect*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// 3D Graffiti Text
commands.push({
    name: 'graffiti3d',
    description: '3D Graffiti Text',
    aliases: ['graffiti', '3dgraffiti'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎨 *3D GRAFFITI TEXT*\n\nUsage: ${config.PREFIX}graffiti3d <text>\nExample: ${config.PREFIX}graffiti3d Megan\n\n${FOOTER}`);
        await react('🎨');
        try {
            const url = await generateEphoto('graffiti3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎨 *3D Graffiti*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Glossy Silver 3D
commands.push({
    name: 'silver3d',
    description: 'Glossy Silver 3D Text',
    aliases: ['silver', '3dsilver'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🥈 *GLOSSY SILVER 3D*\n\nUsage: ${config.PREFIX}silver3d <text>\nExample: ${config.PREFIX}silver3d Megan\n\n${FOOTER}`);
        await react('🥈');
        try {
            const url = await generateEphoto('silver3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🥈 *Glossy Silver 3D*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// 3D Style Text
commands.push({
    name: 'style3d',
    description: '3D Style Text Effect',
    aliases: ['3dstyle', 'styletext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`✨ *3D STYLE TEXT*\n\nUsage: ${config.PREFIX}style3d <text>\nExample: ${config.PREFIX}style3d Megan\n\n${FOOTER}`);
        await react('✨');
        try {
            const url = await generateEphoto('style3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `✨ *3D Style Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Metallic 3D Text
commands.push({
    name: 'metal3d',
    description: 'Metallic 3D Text',
    aliases: ['metal', '3dmetal'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔩 *METALLIC 3D TEXT*\n\nUsage: ${config.PREFIX}metal3d <text>\nExample: ${config.PREFIX}metal3d Megan\n\n${FOOTER}`);
        await react('🔩');
        try {
            const url = await generateEphoto('metal3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔩 *Metallic 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// 3D Comic Style Text
commands.push({
    name: 'comic3d',
    description: '3D Comic Style Text',
    aliases: ['comic', '3dcomic'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💥 *3D COMIC STYLE TEXT*\n\nUsage: ${config.PREFIX}comic3d <text>\nExample: ${config.PREFIX}comic3d Megan\n\n${FOOTER}`);
        await react('💥');
        try {
            const url = await generateEphoto('comic3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💥 *3D Comic Style*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Hologram 3D Text
commands.push({
    name: 'hologram3d',
    description: 'Hologram 3D Text',
    aliases: ['hologram', '3dhologram'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔮 *HOLOGRAM 3D TEXT*\n\nUsage: ${config.PREFIX}hologram3d <text>\nExample: ${config.PREFIX}hologram3d Megan\n\n${FOOTER}`);
        await react('🔮');
        try {
            const url = await generateEphoto('hologram3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔮 *Hologram 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Gradient 3D Text
commands.push({
    name: 'gradient3d',
    description: 'Gradient 3D Text',
    aliases: ['gradient', '3dgradient'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌈 *GRADIENT 3D TEXT*\n\nUsage: ${config.PREFIX}gradient3d <text>\nExample: ${config.PREFIX}gradient3d Megan\n\n${FOOTER}`);
        await react('🌈');
        try {
            const url = await generateEphoto('gradient3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌈 *Gradient 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Stone 3D Text
commands.push({
    name: 'stone3d',
    description: 'Stone/Ruby 3D Text',
    aliases: ['stone', '3dstone'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💎 *STONE 3D TEXT*\n\nUsage: ${config.PREFIX}stone3d <text>\nExample: ${config.PREFIX}stone3d Megan\n\n${FOOTER}`);
        await react('💎');
        try {
            const url = await generateEphoto('stone3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💎 *Stone 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Space 3D Text (2 params)
commands.push({
    name: 'space3d',
    description: 'Space 3D Text',
    aliases: ['space', '3dspace'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🚀 *SPACE 3D TEXT*\n\nUsage: ${config.PREFIX}space3d <text> | <subtitle>\nExample: ${config.PREFIX}space3d Megan | Text Effect\n\n${FOOTER}`);
        await react('🚀');
        try {
            const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length < 2) return reply(`❌ Provide 2 lines separated by |\n\n${FOOTER}`);
            const url = await generateEphoto('space3d', [parts[0], parts[1]]);
            await sock.sendMessage(from, { image: { url }, caption: `🚀 *Space 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Sand 3D Text
commands.push({
    name: 'sand3d',
    description: 'Sand 3D Text',
    aliases: ['sand', '3dsand'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🏖️ *SAND 3D TEXT*\n\nUsage: ${config.PREFIX}sand3d <text>\nExample: ${config.PREFIX}sand3d Megan\n\n${FOOTER}`);
        await react('🏖️');
        try {
            const url = await generateEphoto('sand3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🏖️ *Sand 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Snow 3D Text
commands.push({
    name: 'snow3d',
    description: 'Snow 3D Text',
    aliases: ['snow', '3dsnow'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`❄️ *SNOW 3D TEXT*\n\nUsage: ${config.PREFIX}snow3d <text>\nExample: ${config.PREFIX}snow3d Megan\n\n${FOOTER}`);
        await react('❄️');
        try {
            const url = await generateEphoto('snow3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `❄️ *Snow 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Paper Cut 3D Text
commands.push({
    name: 'papercut3d',
    description: 'Paper Cut 3D Text',
    aliases: ['papercut', '3dpaper'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`✂️ *PAPER CUT 3D TEXT*\n\nUsage: ${config.PREFIX}papercut3d <text>\nExample: ${config.PREFIX}papercut3d Megan\n\n${FOOTER}`);
        await react('✂️');
        try {
            const url = await generateEphoto('papercut3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `✂️ *Paper Cut 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Balloon 3D Text
commands.push({
    name: 'balloon3d',
    description: 'Balloon 3D Text',
    aliases: ['balloon', '3dballoon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎈 *BALLOON 3D TEXT*\n\nUsage: ${config.PREFIX}balloon3d <text>\nExample: ${config.PREFIX}balloon3d Megan\n\n${FOOTER}`);
        await react('🎈');
        try {
            const url = await generateEphoto('balloon3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎈 *Balloon 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Wooden 3D Online
commands.push({
    name: 'woodenonline',
    description: 'Wooden 3D Text Online',
    aliases: ['woodonline', '3dwoodonline'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🪵 *WOODEN 3D ONLINE*\n\nUsage: ${config.PREFIX}woodenonline <text>\nExample: ${config.PREFIX}woodenonline Megan\n\n${FOOTER}`);
        await react('🪵');
        try {
            const url = await generateEphoto('wooden3donline', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🪵 *Wooden 3D Online*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 4. ANIME/GAME STYLE
// ═══════════════════════════════════════════

// Naruto Shippuden Style
commands.push({
    name: 'naruto',
    description: 'Naruto Shippuden Style Text',
    aliases: ['narutotext', 'narutostyle'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🍥 *NARUTO SHIPPUDEN STYLE*\n\nUsage: ${config.PREFIX}naruto <text>\nExample: ${config.PREFIX}naruto Megan\n\n${FOOTER}`);
        await react('🍥');
        try {
            const url = await generateEphoto('naruto', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🍥 *Naruto Style*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Naruto Shippuden Logo Text
commands.push({
    name: 'narutologo',
    description: 'Naruto Shippuden Logo Text',
    aliases: ['narutol', 'narutologotext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🍥 *NARUTO LOGO TEXT*\n\nUsage: ${config.PREFIX}narutologo <text>\nExample: ${config.PREFIX}narutologo Megan\n\n${FOOTER}`);
        await react('🍥');
        try {
            const url = await generateEphoto('narutologo', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🍥 *Naruto Logo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Avengers Text Style
commands.push({
    name: 'avengers',
    description: 'Avengers Text Style',
    aliases: ['avengerstext', 'avengers3d'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🦸 *AVENGERS TEXT STYLE*\n\nUsage: ${config.PREFIX}avengers <text>\nExample: ${config.PREFIX}avengers Megan\n\n${FOOTER}`);
        await react('🦸');
        try {
            const url = await generateEphoto('avengers3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🦸 *Avengers Style*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// American Flag Text
commands.push({
    name: 'usaflag',
    description: 'American Flag 3D Text',
    aliases: ['americanflag', 'flagtext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🇺🇸 *AMERICAN FLAG 3D TEXT*\n\nUsage: ${config.PREFIX}usaflag <text>\nExample: ${config.PREFIX}usaflag Megan\n\n${FOOTER}`);
        await react('🇺🇸');
        try {
            const url = await generateEphoto('americanflag3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🇺🇸 *American Flag 3D*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 5. GAME BANNERS & COVERS
// ═══════════════════════════════════════════

// PUBG Logo Maker
commands.push({
    name: 'pubg',
    description: 'PUBG Logo Maker',
    aliases: ['pubglogo', 'pubgm'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎮 *PUBG LOGO MAKER*\n\nUsage: ${config.PREFIX}pubg <name>\nExample: ${config.PREFIX}pubg Megan\n\n${FOOTER}`);
        await react('🎮');
        try {
            const url = await generateEphoto('pubglogo', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎮 *PUBG Logo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// PUBG Girl Logo Maker
commands.push({
    name: 'pubggirl',
    description: 'PUBG Girl Logo Maker',
    aliases: ['pubggirllogo', 'pubglady'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`👧 *PUBG GIRL LOGO*\n\nUsage: ${config.PREFIX}pubggirl <name>\nExample: ${config.PREFIX}pubggirl Megan\n\n${FOOTER}`);
        await react('👧');
        try {
            const url = await generateEphoto('pubglogo2', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `👧 *PUBG Girl Logo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// PUBG Esports Team Logo
commands.push({
    name: 'pubgesports',
    description: 'PUBG Esports Team Logo',
    aliases: ['pubgteam', 'esportslogo'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🏆 *PUBG ESPORTS TEAM LOGO*\n\nUsage: ${config.PREFIX}pubgesports <team name>\nExample: ${config.PREFIX}pubgesports Team Alpha\n\n${FOOTER}`);
        await react('🏆');
        try {
            const url = await generateEphoto('pubgesports', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🏆 *PUBG Esports Logo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Call of Duty Warzone Banner
commands.push({
    name: 'warzone',
    description: 'Call of Duty Warzone Banner',
    aliases: ['codbanner', 'warzonecover'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔫 *COD WARZONE BANNER*\n\nUsage: ${config.PREFIX}warzone <channel name>\nExample: ${config.PREFIX}warzone MeganGaming\n\n${FOOTER}`);
        await react('🔫');
        try {
            const url = await generateEphoto('warzonecover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔫 *Warzone Banner*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Arena of Valor Banner
commands.push({
    name: 'aov',
    description: 'Arena of Valor Banner',
    aliases: ['aovbanner', 'arenaofvalor'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`⚔️ *ARENA OF VALOR BANNER*\n\nUsage: ${config.PREFIX}aov <name>\nExample: ${config.PREFIX}aov Megan\n\n${FOOTER}`);
        await react('⚔️');
        try {
            const url = await generateEphoto('aovbanner', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `⚔️ *AOV Banner*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Valorant YouTube Banner (3 params)
commands.push({
    name: 'valorant',
    description: 'Valorant YouTube Banner',
    aliases: ['valbanner', 'valorantcover'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎯 *VALORANT YOUTUBE BANNER*\n\nUsage: ${config.PREFIX}valorant <channel> | <games> | <@handle>\nExample: ${config.PREFIX}valorant Megan | Games | @megan\n\n${FOOTER}`);
        await react('🎯');
        try {
            const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length < 3) return reply(`❌ Provide 3 lines separated by |\n\n${FOOTER}`);
            const url = await generateEphoto('valorantbanner', [parts[0], parts[1], parts[2]]);
            await sock.sendMessage(from, { image: { url }, caption: `🎯 *Valorant Banner*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// CrossFire Facebook Cover
commands.push({
    name: 'cfcover',
    description: 'CrossFire Facebook Cover',
    aliases: ['crossfire', 'cfcoverfb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎯 *CROSSFIRE FB COVER*\n\nUsage: ${config.PREFIX}cfcover <name>\nExample: ${config.PREFIX}cfcover Megan\n\n${FOOTER}`);
        await react('🎯');
        try {
            const url = await generateEphoto('cfcover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎯 *CrossFire Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// League of Legends Cover
commands.push({
    name: 'lolcover',
    description: 'League of Legends Cover',
    aliases: ['leaguecover', 'lolfb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🏰 *LEAGUE OF LEGENDS COVER*\n\nUsage: ${config.PREFIX}lolcover <name>\nExample: ${config.PREFIX}lolcover Megan\n\n${FOOTER}`);
        await react('🏰');
        try {
            const url = await generateEphoto('lolcover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🏰 *LoL Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// CS:GO Facebook Cover
commands.push({
    name: 'csgo',
    description: 'CS:GO Facebook Cover',
    aliases: ['csgocover', 'csgofb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💣 *CS:GO FACEBOOK COVER*\n\nUsage: ${config.PREFIX}csgo <name>\nExample: ${config.PREFIX}csgo Megan\n\n${FOOTER}`);
        await react('💣');
        try {
            const url = await generateEphoto('csgocover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💣 *CS:GO Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Dota 2 Facebook Cover
commands.push({
    name: 'dota2',
    description: 'Dota 2 Facebook Cover',
    aliases: ['dota2cover', 'dotafb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🗡️ *DOTA 2 FACEBOOK COVER*\n\nUsage: ${config.PREFIX}dota2 <name>\nExample: ${config.PREFIX}dota2 Megan\n\n${FOOTER}`);
        await react('🗡️');
        try {
            const url = await generateEphoto('dota2cover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🗡️ *Dota 2 Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Overwatch Facebook Cover
commands.push({
    name: 'overwatch',
    description: 'Overwatch Facebook Cover',
    aliases: ['owcover', 'overwatchfb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🛡️ *OVERWATCH FACEBOOK COVER*\n\nUsage: ${config.PREFIX}overwatch <name>\nExample: ${config.PREFIX}overwatch Megan\n\n${FOOTER}`);
        await react('🛡️');
        try {
            const url = await generateEphoto('overwatchcover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🛡️ *Overwatch Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// One Piece Facebook Cover
commands.push({
    name: 'onepiece',
    description: 'One Piece Facebook Cover',
    aliases: ['opcover', 'onepiecefb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🏴‍☠️ *ONE PIECE FACEBOOK COVER*\n\nUsage: ${config.PREFIX}onepiece <name>\nExample: ${config.PREFIX}onepiece Megan\n\n${FOOTER}`);
        await react('🏴‍☠️');
        try {
            const url = await generateEphoto('onepiececover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🏴‍☠️ *One Piece Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Dragon Ball Facebook Cover
commands.push({
    name: 'dbzcover',
    description: 'Dragon Ball Facebook Cover',
    aliases: ['dragonballcover', 'dbzfb'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🐉 *DRAGON BALL FACEBOOK COVER*\n\nUsage: ${config.PREFIX}dbzcover <name>\nExample: ${config.PREFIX}dbzcover Megan\n\n${FOOTER}`);
        await react('🐉');
        try {
            const url = await generateEphoto('dragonballcover', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🐉 *Dragon Ball Cover*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// YouTube Gold Play Button
commands.push({
    name: 'ytbutton',
    description: 'YouTube Gold Play Button',
    aliases: ['ytgold', 'playbutton'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`▶️ *YOUTUBE GOLD PLAY BUTTON*\n\nUsage: ${config.PREFIX}ytbutton <channel name>\nExample: ${config.PREFIX}ytbutton Megan Tech\n\n${FOOTER}`);
        await react('▶️');
        try {
            const url = await generateEphoto('youtubebutton', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `▶️ *YouTube Gold Button*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 6. CHRISTMAS & NEW YEAR
// ═══════════════════════════════════════════

// Christmas 3D Text
commands.push({
    name: 'xmas3d',
    description: 'Christmas 3D Text',
    aliases: ['christmas3d', 'xmastext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎄 *CHRISTMAS 3D TEXT*\n\nUsage: ${config.PREFIX}xmas3d <text>\nExample: ${config.PREFIX}xmas3d Merry Christmas\n\n${FOOTER}`);
        await react('🎄');
        try {
            const url = await generateEphoto('christmas3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎄 *Christmas 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Sparkles Christmas Text
commands.push({
    name: 'xmassparkle',
    description: 'Sparkles Christmas Text',
    aliases: ['christmassparkle', 'sparklexmas'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`✨ *SPARKLES CHRISTMAS TEXT*\n\nUsage: ${config.PREFIX}xmassparkle <text>\nExample: ${config.PREFIX}xmassparkle Merry Christmas\n\n${FOOTER}`);
        await react('✨');
        try {
            const url = await generateEphoto('christmas-sparkles', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `✨ *Christmas Sparkles*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Christmas Snow 3D Text
commands.push({
    name: 'xmassnow',
    description: 'Christmas Snow 3D Text',
    aliases: ['christmassnow', 'snowxmas'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`❄️ *CHRISTMAS SNOW 3D TEXT*\n\nUsage: ${config.PREFIX}xmassnow <text>\nExample: ${config.PREFIX}xmassnow Merry Christmas\n\n${FOOTER}`);
        await react('❄️');
        try {
            const url = await generateEphoto('christmas-snow3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `❄️ *Christmas Snow 3D*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Frozen Christmas Text
commands.push({
    name: 'xmasfrozen',
    description: 'Frozen Christmas Text',
    aliases: ['christmasfrozen', 'frozenxmas'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🧊 *FROZEN CHRISTMAS TEXT*\n\nUsage: ${config.PREFIX}xmasfrozen <text>\nExample: ${config.PREFIX}xmasfrozen Merry Christmas\n\n${FOOTER}`);
        await react('🧊');
        try {
            const url = await generateEphoto('christmas-frozen', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🧊 *Frozen Christmas Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Christmas Gold Glitter
commands.push({
    name: 'xmasgold',
    description: 'Christmas Gold Glitter',
    aliases: ['christmasgold', 'goldxmas'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🥇 *CHRISTMAS GOLD GLITTER*\n\nUsage: ${config.PREFIX}xmasgold <text>\nExample: ${config.PREFIX}xmasgold Merry Christmas\n\n${FOOTER}`);
        await react('🥇');
        try {
            const url = await generateEphoto('christmas-gold', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🥇 *Christmas Gold Glitter*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// New Year Gold Text
commands.push({
    name: 'newyear',
    description: 'New Year Gold Text',
    aliases: ['nygold', 'happynewyear'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎉 *NEW YEAR GOLD TEXT*\n\nUsage: ${config.PREFIX}newyear <text>\nExample: ${config.PREFIX}newyear Happy New Year 2026\n\n${FOOTER}`);
        await react('🎉');
        try {
            const url = await generateEphoto('newyear-gold', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎉 *New Year Gold Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 7. BIRTHDAY CAKES
// ═══════════════════════════════════════════

// Birthday 3D Text
commands.push({
    name: 'birthday',
    description: 'Birthday 3D Text',
    aliases: ['bday3d', 'happybirthday'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎂 *BIRTHDAY 3D TEXT*\n\nUsage: ${config.PREFIX}birthday <name>\nExample: ${config.PREFIX}birthday Happy Birthday Megan\n\n${FOOTER}`);
        await react('🎂');
        try {
            const url = await generateEphoto('birthday3d', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎂 *Birthday 3D Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// PUBG Birthday Cake
commands.push({
    name: 'pubgcake',
    description: 'PUBG Birthday Cake',
    aliases: ['pubgbirthday', 'pubgcakebday'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎂 *PUBG BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}pubgcake <name>\nExample: ${config.PREFIX}pubgcake Megan\n\n${FOOTER}`);
        await react('🎂');
        try {
            const url = await generateEphoto('pubgbirthday', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎂 *PUBG Birthday Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Flower Birthday Cake
commands.push({
    name: 'flowercake',
    description: 'Flower Birthday Cake',
    aliases: ['flowerbirthday', 'flowerbday'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌸 *FLOWER BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}flowercake <name>\nExample: ${config.PREFIX}flowercake Megan\n\n${FOOTER}`);
        await react('🌸');
        try {
            const url = await generateEphoto('flowerbirthday', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌸 *Flower Birthday Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Chocolate Birthday Cake
commands.push({
    name: 'choccake',
    description: 'Chocolate Birthday Cake',
    aliases: ['chocolatecake', 'chocobday'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🍫 *CHOCOLATE BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}choccake <name>\nExample: ${config.PREFIX}choccake Megan\n\n${FOOTER}`);
        await react('🍫');
        try {
            const url = await generateEphoto('chocolatecake', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🍫 *Chocolate Birthday Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Heart Rose Birthday Cake
commands.push({
    name: 'rosecake',
    description: 'Heart Rose Birthday Cake',
    aliases: ['rosebirthday', 'heartcake'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌹 *HEART ROSE BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}rosecake <name>\nExample: ${config.PREFIX}rosecake Megan\n\n${FOOTER}`);
        await react('🌹');
        try {
            const url = await generateEphoto('rosecake', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌹 *Heart Rose Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Amazing Flower Birthday Cake
commands.push({
    name: 'amazingcake',
    description: 'Amazing Flower Birthday Cake',
    aliases: ['amazingflower', 'wowcake'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌺 *AMAZING FLOWER BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}amazingcake <name>\nExample: ${config.PREFIX}amazingcake Megan\n\n${FOOTER}`);
        await react('🌺');
        try {
            const url = await generateEphoto('amazingflowercake', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌺 *Amazing Flower Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Red Rose Birthday Cake
commands.push({
    name: 'redrosecake',
    description: 'Red Rose Birthday Cake',
    aliases: ['redrose', 'redrosebirthday'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🌹 *RED ROSE BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}redrosecake <name>\nExample: ${config.PREFIX}redrosecake Megan\n\n${FOOTER}`);
        await react('🌹');
        try {
            const url = await generateEphoto('redrosebirthday', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🌹 *Red Rose Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Birthday Greeting Cake
commands.push({
    name: 'greetingcake',
    description: 'Birthday Greeting Cake',
    aliases: ['greetcake', 'bdaygreeting'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎂 *BIRTHDAY GREETING CAKE*\n\nUsage: ${config.PREFIX}greetingcake <name>\nExample: ${config.PREFIX}greetingcake Megan\n\n${FOOTER}`);
        await react('🎂');
        try {
            const url = await generateEphoto('greetingcake', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎂 *Birthday Greeting Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Anniversary Birthday Cake
commands.push({
    name: 'anniversarycake',
    description: 'Anniversary Birthday Cake',
    aliases: ['annivcake', 'anniversary'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💝 *ANNIVERSARY BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}anniversarycake <name>\nExample: ${config.PREFIX}anniversarycake Megan\n\n${FOOTER}`);
        await react('💝');
        try {
            const url = await generateEphoto('anniversarycake', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💝 *Anniversary Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Romantic Flower Birthday Cake
commands.push({
    name: 'romanticcake',
    description: 'Romantic Flower Birthday Cake',
    aliases: ['romanticflower', 'lovecake'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💕 *ROMANTIC FLOWER BIRTHDAY CAKE*\n\nUsage: ${config.PREFIX}romanticcake <name>\nExample: ${config.PREFIX}romanticcake Megan\n\n${FOOTER}`);
        await react('💕');
        try {
            const url = await generateEphoto('romanticflowercake', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💕 *Romantic Flower Cake*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 8. HALLOWEEN EFFECTS
// ═══════════════════════════════════════════

// Horror Cemetery Name
commands.push({
    name: 'cemetery',
    description: 'Horror Cemetery Name',
    aliases: ['horrorcemetery', 'gravetext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🪦 *HORROR CEMETERY NAME*\n\nUsage: ${config.PREFIX}cemetery <name>\nExample: ${config.PREFIX}cemetery Megan\n\n${FOOTER}`);
        await react('🪦');
        try {
            const url = await generateEphoto('horrorcemetery', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🪦 *Horror Cemetery*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Halloween Theme Text
commands.push({
    name: 'halloween',
    description: 'Halloween Theme Text',
    aliases: ['halloweentheme', 'spookytext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎃 *HALLOWEEN THEME TEXT*\n\nUsage: ${config.PREFIX}halloween <text>\nExample: ${config.PREFIX}halloween Megan\n\n${FOOTER}`);
        await react('🎃');
        try {
            const url = await generateEphoto('halloweentheme', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎃 *Halloween Theme*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Blood Text on Wall (Halloween)
commands.push({
    name: 'bloodwall',
    description: 'Blood Text on Wall (Halloween)',
    aliases: ['bloodywall', 'halloweenblood'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🩸 *BLOOD TEXT ON WALL*\n\nUsage: ${config.PREFIX}bloodwall <text>\nExample: ${config.PREFIX}bloodwall Megan\n\n${FOOTER}`);
        await react('🩸');
        try {
            const url = await generateEphoto('bloodwall', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🩸 *Blood Text on Wall*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Frankenstein Horror Text
commands.push({
    name: 'frankenstein',
    description: 'Frankenstein Horror Text',
    aliases: ['franktext', 'frankenstyle'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🧟 *FRANKENSTEIN HORROR TEXT*\n\nUsage: ${config.PREFIX}frankenstein <text>\nExample: ${config.PREFIX}frankenstein Megan\n\n${FOOTER}`);
        await react('🧟');
        try {
            const url = await generateEphoto('frankensteintext', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🧟 *Frankenstein Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Horror Letters on Metal
commands.push({
    name: 'horrormetal',
    description: 'Horror Letters on Metal',
    aliases: ['metalhorror', 'scarymetal'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🔩 *HORROR LETTERS ON METAL*\n\nUsage: ${config.PREFIX}horrormetal <text>\nExample: ${config.PREFIX}horrormetal Megan\n\n${FOOTER}`);
        await react('🔩');
        try {
            const url = await generateEphoto('horrormetal', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🔩 *Horror Letters on Metal*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Halloween Text Effect
commands.push({
    name: 'halloweentext',
    description: 'Halloween Text Effect',
    aliases: ['hallowtext', 'spookyeffect'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`👻 *HALLOWEEN TEXT EFFECT*\n\nUsage: ${config.PREFIX}halloweentext <text>\nExample: ${config.PREFIX}halloweentext Megan\n\n${FOOTER}`);
        await react('👻');
        try {
            const url = await generateEphoto('halloweentext', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `👻 *Halloween Text Effect*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Halloween Neon Text
commands.push({
    name: 'halloweenneon',
    description: 'Halloween Neon Text',
    aliases: ['neonhallow', 'spookyneon'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🎃 *HALLOWEEN NEON TEXT*\n\nUsage: ${config.PREFIX}halloweenneon <text>\nExample: ${config.PREFIX}halloweenneon Megan\n\n${FOOTER}`);
        await react('🎃');
        try {
            const url = await generateEphoto('halloweeneffect', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🎃 *Halloween Neon Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Horror Text Online
commands.push({
    name: 'horroronline',
    description: 'Horror Text Online',
    aliases: ['horrortext2', 'scaryonline'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`😱 *HORROR TEXT ONLINE*\n\nUsage: ${config.PREFIX}horroronline <text>\nExample: ${config.PREFIX}horroronline Megan\n\n${FOOTER}`);
        await react('😱');
        try {
            const url = await generateEphoto('horrortext', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `😱 *Horror Text Online*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Halloween Card Text
commands.push({
    name: 'halloweencard',
    description: 'Halloween Card Text',
    aliases: ['spookycard', 'hallowcard'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🃏 *HALLOWEEN CARD TEXT*\n\nUsage: ${config.PREFIX}halloweencard <text>\nExample: ${config.PREFIX}halloweencard Megan\n\n${FOOTER}`);
        await react('🃏');
        try {
            const url = await generateEphoto('halloweencard', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `🃏 *Halloween Card Text*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 9. LOVE & ROMANCE
// ═══════════════════════════════════════════

// Name Tattoo Online
commands.push({
    name: 'tattoo',
    description: 'Name Tattoo Online',
    aliases: ['nametattoo', 'tattooname'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💉 *NAME TATTOO ONLINE*\n\nUsage: ${config.PREFIX}tattoo <name>\nExample: ${config.PREFIX}tattoo Megan\n\n${FOOTER}`);
        await react('💉');
        try {
            const url = await generateEphoto('nametattoo', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💉 *Name Tattoo*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Sunlight Shadow Love Text
commands.push({
    name: 'sunlight',
    description: 'Sunlight Shadow Love Text',
    aliases: ['sunlightshadow', 'lovetext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`☀️ *SUNLIGHT SHADOW LOVE TEXT*\n\nUsage: ${config.PREFIX}sunlight <name>\nExample: ${config.PREFIX}sunlight Megan\n\n${FOOTER}`);
        await react('☀️');
        try {
            const url = await generateEphoto('sunlightshadow', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `☀️ *Sunlight Shadow*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Heart Wings Name GIF
commands.push({
    name: 'heartwings',
    description: 'Heart Wings Name',
    aliases: ['heartwing', 'lovewings'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💝 *HEART WINGS NAME*\n\nUsage: ${config.PREFIX}heartwings <name>\nExample: ${config.PREFIX}heartwings Megan\n\n${FOOTER}`);
        await react('💝');
        try {
            const url = await generateEphoto('heartwinggif', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `💝 *Heart Wings Name*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// Love Balloons Card (2 names)
commands.push({
    name: 'loveballoons',
    description: 'Love Balloons Card (2 Names)',
    aliases: ['loveballoon', 'coupleballoons'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`💕 *LOVE BALLOONS CARD*\n\nUsage: ${config.PREFIX}loveballoons <name1> | <name2>\nExample: ${config.PREFIX}loveballoons Megan | Alex\n\n${FOOTER}`);
        await react('💕');
        try {
            const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length < 2) return reply(`❌ Provide 2 names separated by |\n\n${FOOTER}`);
            const url = await generateEphoto('loveballoons', [parts[0], parts[1]]);
            await sock.sendMessage(from, { image: { url }, caption: `💕 *Love Balloons*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 10. ANIMATION
// ═══════════════════════════════════════════

// Exam Crank 3D Animation
commands.push({
    name: 'examcrank',
    description: 'Exam Crank 3D Animation',
    aliases: ['exam', 'crank3d'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`📝 *EXAM CRANK 3D ANIMATION*\n\nUsage: ${config.PREFIX}examcrank <name>\nExample: ${config.PREFIX}examcrank Megan\n\n${FOOTER}`);
        await react('📝');
        try {
            const url = await generateEphoto('examcrank', [args.join(' ')]);
            await sock.sendMessage(from, { image: { url }, caption: `📝 *Exam Crank 3D*\n\n${FOOTER}` }, { quoted: msg });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 11. EPHOTO MENU
// ═══════════════════════════════════════════

commands.push({
    name: 'ephoto',
    description: 'Show all Ephoto360 effects menu',
    aliases: ['ephotomenu', 'ephoto360', 'textfx', 'texteffects'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const menu = `🎨 *EPHOTO360 TEXT EFFECTS - 110 Effects*

*NEON & GLOW*
${config.PREFIX}neon - Classic Neon Text
${config.PREFIX}colorfulglow - Colorful Glow Neon
${config.PREFIX}advancedglow - Advanced Glow
${config.PREFIX}neononline - Neon Text Online
${config.PREFIX}blueneon - Blue Neon Light
${config.PREFIX}neontext2 - Neon Text (2 Lines)
${config.PREFIX}neonlight - Neon Light Text
${config.PREFIX}greenneon - Green Neon Text
${config.PREFIX}greenlightneon - Green Light Neon
${config.PREFIX}blueneonlogo - Neon Logo Text
${config.PREFIX}galaxyneon - Galaxy Text
${config.PREFIX}retroneon - Retro Text
${config.PREFIX}multicolorneon - Multicolor 3D
${config.PREFIX}hackerneon - Galaxy Neon Light
${config.PREFIX}devilwings - Devil Wings Neon
${config.PREFIX}glowtext - Glowing Text
${config.PREFIX}neonglitch - Digital Glitch Neon
${config.PREFIX}neonwall - Galaxy Text New
${config.PREFIX}led - Colorful Glow Text
${config.PREFIX}wetglass - Wet Glass Text
${config.PREFIX}foilballoon - Foil Balloon 3D
${config.PREFIX}colorfulpaint - Colorful Paint 3D
${config.PREFIX}bpsignature - Blackpink Signature
${config.PREFIX}dbztext - Dragon Ball Text
${config.PREFIX}glossysilver - Glossy Silver 3D
${config.PREFIX}typoart - Typography Art
${config.PREFIX}foggyglass - Foggy Glass Text

*MATERIAL EFFECTS*
${config.PREFIX}frozen - Frozen Ice Text
${config.PREFIX}gold - Gold Text
${config.PREFIX}horror - Horror Text
${config.PREFIX}blood - Blood Text
${config.PREFIX}lava - Lava/Fire Text
${config.PREFIX}thunder - Thunder Text
${config.PREFIX}matrix - Matrix Code Text
${config.PREFIX}smoke - Smoke Text
${config.PREFIX}fireeffect - Fire Text
${config.PREFIX}flamelettering - Flame Lettering

*3D EFFECTS*
${config.PREFIX}wooden3d - Wooden 3D
${config.PREFIX}cubic3d - Cubic 3D
${config.PREFIX}water3d - Water 3D
${config.PREFIX}text3d - 3D Text Effect
${config.PREFIX}graffiti3d - 3D Graffiti
${config.PREFIX}silver3d - Glossy Silver 3D
${config.PREFIX}style3d - 3D Style Text
${config.PREFIX}metal3d - Metallic 3D
${config.PREFIX}comic3d - 3D Comic Style
${config.PREFIX}hologram3d - Hologram 3D
${config.PREFIX}gradient3d - Gradient 3D
${config.PREFIX}stone3d - Stone/Ruby 3D
${config.PREFIX}space3d - Space 3D (2 lines)
${config.PREFIX}sand3d - Sand 3D
${config.PREFIX}snow3d - Snow 3D
${config.PREFIX}papercut3d - Paper Cut 3D
${config.PREFIX}balloon3d - Balloon 3D
${config.PREFIX}woodenonline - Wooden 3D Online

*ANIME/GAME STYLE*
${config.PREFIX}deadpool - Deadpool Logo (2 lines)
${config.PREFIX}dragonball - Dragon Ball Style
${config.PREFIX}blackpink - Blackpink Logo
${config.PREFIX}bornpink - Born Pink Album (2 lines)
${config.PREFIX}pavement - Typography Pavement
${config.PREFIX}naruto - Naruto Style
${config.PREFIX}narutologo - Naruto Logo Text
${config.PREFIX}avengers - Avengers Style
${config.PREFIX}usaflag - American Flag 3D

*GAME BANNERS & COVERS*
${config.PREFIX}pubg - PUBG Logo
${config.PREFIX}pubggirl - PUBG Girl Logo
${config.PREFIX}pubgesports - PUBG Esports Logo
${config.PREFIX}warzone - COD Warzone Banner
${config.PREFIX}aov - Arena of Valor Banner
${config.PREFIX}valorant - Valorant Banner (3 lines)
${config.PREFIX}cfcover - CrossFire Cover
${config.PREFIX}lolcover - LoL Cover
${config.PREFIX}csgo - CS:GO Cover
${config.PREFIX}dota2 - Dota 2 Cover
${config.PREFIX}overwatch - Overwatch Cover
${config.PREFIX}onepiece - One Piece Cover
${config.PREFIX}dbzcover - Dragon Ball Cover
${config.PREFIX}ytbutton - YouTube Gold Button

*CHRISTMAS & NEW YEAR*
${config.PREFIX}xmas3d - Christmas 3D
${config.PREFIX}xmassparkle - Christmas Sparkles
${config.PREFIX}xmassnow - Christmas Snow 3D
${config.PREFIX}xmasfrozen - Frozen Christmas
${config.PREFIX}xmasgold - Christmas Gold Glitter
${config.PREFIX}newyear - New Year Gold

*BIRTHDAY CAKES*
${config.PREFIX}birthday - Birthday 3D
${config.PREFIX}pubgcake - PUBG Birthday Cake
${config.PREFIX}flowercake - Flower Birthday Cake
${config.PREFIX}choccake - Chocolate Cake
${config.PREFIX}rosecake - Heart Rose Cake
${config.PREFIX}amazingcake - Amazing Flower Cake
${config.PREFIX}redrosecake - Red Rose Cake
${config.PREFIX}greetingcake - Birthday Greeting
${config.PREFIX}anniversarycake - Anniversary Cake
${config.PREFIX}romanticcake - Romantic Flower Cake

*HALLOWEEN*
${config.PREFIX}cemetery - Horror Cemetery
${config.PREFIX}halloween - Halloween Theme
${config.PREFIX}bloodwall - Blood Text on Wall
${config.PREFIX}frankenstein - Frankenstein Text
${config.PREFIX}horrormetal - Horror Metal Letters
${config.PREFIX}halloweentext - Halloween Text
${config.PREFIX}halloweenneon - Halloween Neon
${config.PREFIX}horroronline - Horror Text Online
${config.PREFIX}halloweencard - Halloween Card

*LOVE & TATTOO*
${config.PREFIX}tattoo - Name Tattoo
${config.PREFIX}sunlight - Sunlight Shadow
${config.PREFIX}heartwings - Heart Wings Name
${config.PREFIX}loveballoons - Love Balloons (2 names)

*ANIMATION*
${config.PREFIX}examcrank - Exam Crank 3D

> Megan-Prime | Ephoto360 | TrackerWanga`;

        await reply(menu);
        await react('🎨');
    }
});

module.exports = { commands };
