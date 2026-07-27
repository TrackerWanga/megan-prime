// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME AUDIO EFFECTS - 25 Effects         ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga   ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');
const fs = require('fs-extra');
const path = require('path');

const API_BASE = require('../../megan/lib/developer').API_BASE;
const API_KEY = require('../../megan/lib/developer').API_KEY;
const FOOTER = '> Megan-Prime | AudioFX | TrackerWanga';
const TEMP_DIR = path.join(__dirname, '../../temp');
fs.ensureDirSync(TEMP_DIR);

const commands = [];

async function apiGet(endpoint, params = {}, timeout = 120000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.get(url, { params: { ...params, apikey: API_KEY }, timeout, headers: { 'User-Agent': 'Megan-Prime/1.0' } });
    return res.data;
}

// All 25 audio effects
const AUDIO_EFFECTS = {
    'bass':       { emoji: '🔊', name: 'Bass', desc: 'Enhance low-frequency bass tones' },
    'bassboost':  { emoji: '📢', name: 'Bass Boost', desc: 'Heavy bass boost effect' },
    'robot':      { emoji: '🤖', name: 'Robot', desc: 'Robotic voice transformation' },
    'echo':       { emoji: '🔁', name: 'Echo', desc: 'Add echo/reverb effect' },
    'nightcore':  { emoji: '🎵', name: 'Nightcore', desc: 'Sped up + high pitch (nightcore)' },
    '8d':         { emoji: '🎧', name: '8D Audio', desc: 'Immersive 8D surround effect' },
    'chipmunk':   { emoji: '🐿️', name: 'Chipmunk', desc: 'High-pitched chipmunk voice' },
    'slowreverb': { emoji: '🌊', name: 'Slow Reverb', desc: 'Slowed + reverb effect' },
    'vaporwave':  { emoji: '🌴', name: 'Vaporwave', desc: 'Retro vaporwave style' },
    'distortion': { emoji: '🎸', name: 'Distortion', desc: 'Heavy distortion/fuzz' },
    'reverse':    { emoji: '◀️', name: 'Reverse', desc: 'Play audio backwards' },
    'deepvoice':  { emoji: '🗣️', name: 'Deep Voice', desc: 'Lower pitch deep voice' },
    'highvoice':  { emoji: '🗣️', name: 'High Voice', desc: 'Higher pitch squeaky voice' },
    'tremolo':    { emoji: '〰️', name: 'Tremolo', desc: 'Volume oscillation effect' },
    'flanger':    { emoji: '✈️', name: 'Flanger', desc: 'Jet plane whoosh effect' },
    'phaser':     { emoji: '🌀', name: 'Phaser', desc: 'Sweeping phase shift' },
    'radio':      { emoji: '📻', name: 'Radio', desc: 'Old radio/AM broadcast sound' },
    'phone':      { emoji: '📞', name: 'Phone', desc: 'Telephone call quality' },
    'underwater': { emoji: '🌊', name: 'Underwater', desc: 'Muffled underwater sound' },
    'alien':      { emoji: '👽', name: 'Alien', desc: 'Extraterrestrial voice effect' },
    'helium':     { emoji: '🎈', name: 'Helium', desc: 'High-pitched helium voice' },
    'demon':      { emoji: '👹', name: 'Demon', desc: 'Demonic deep voice' },
    'karaoke':    { emoji: '🎤', name: 'Karaoke', desc: 'Remove vocals (karaoke)' },
    'megaphone':  { emoji: '📣', name: 'Megaphone', desc: 'Loud megaphone effect' },
    'spooky':     { emoji: '👻', name: 'Spooky', desc: 'Creepy horror effect' }
};

// ═══════════════════════════════════════════
// AUDIO EFFECT - Reply to audio/video
// ═══════════════════════════════════════════

commands.push({
    name: 'audiofx',
    description: 'Apply audio effect to a voice note or audio file',
    aliases: ['audioeffect', 'soundfx', 'voicefx'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, quoted }) {
        if (!args.length) {
            let list = `🎛️ *AUDIO EFFECTS - 25 Available*\n\n*Usage:* ${config.PREFIX}audiofx <effect> (reply to audio)\n*Example:* Reply to a voice note with ${config.PREFIX}audiofx bassboost\n\n`;
            list += `*Effects:* ${Object.keys(AUDIO_EFFECTS).join(', ')}\n\n${FOOTER}`;
            return reply(list);
        }
        
        const effectId = args[0].toLowerCase();
        if (!AUDIO_EFFECTS[effectId]) {
            return reply(`❌ *Unknown effect!*\n\nAvailable: ${Object.keys(AUDIO_EFFECTS).join(', ')}\n\n${FOOTER}`);
        }
        
        // Get audio URL from quoted message
        let audioUrl = null;
        const qm = quoted?.message;
        if (qm?.audioMessage) {
            // Download audio from quoted message
            await react('⬇️');
            try {
                const buffer = await sock.downloadMediaMessage(quoted);
                // Upload to catbox or use the API directly
                // For now, use the direct URL if available
                audioUrl = qm.audioMessage.url;
            } catch(e) {
                // Try direct URL
                audioUrl = qm.audioMessage?.url;
            }
        } else if (qm?.videoMessage) {
            audioUrl = qm.videoMessage?.url;
        } else if (args[1]?.startsWith('http')) {
            audioUrl = args[1];
        }
        
        if (!audioUrl) {
            return reply(`❌ *No audio found!*\n\nReply to a voice note/audio with ${config.PREFIX}audiofx <effect>\nOr: ${config.PREFIX}audiofx <effect> <url>\n\n${FOOTER}`);
        }
        
        const effect = AUDIO_EFFECTS[effectId];
        await react(effect.emoji);
        await reply(`🎛️ Applying *${effect.name}* effect...\n⏳ Processing...\n\n${FOOTER}`);
        
        try {
            const data = await apiGet(`/api/audio/${effectId}`, { url: audioUrl });
            
            if (data.success && data.result?.base64Data) {
                const base64 = data.result.base64Data.replace(/^data:.*?base64,/, '');
                const filename = `${effectId}_${Date.now()}.mp3`;
                const filePath = path.join(TEMP_DIR, filename);
                fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
                
                await sock.sendMessage(from, {
                    audio: fs.readFileSync(filePath),
                    mimetype: 'audio/mpeg',
                    ptt: msg.message?.audioMessage?.ptt || false
                }, { quoted: msg });
                
                await sock.sendMessage(from, {
                    text: `${effect.emoji} *${effect.name} Effect Applied!*\n\n🎛️ ${effect.desc}\n\n${FOOTER}`
                }, { quoted: msg });
                
                setTimeout(() => fs.unlink(filePath).catch(() => {}), 60000);
                await react('✅');
            } else {
                await reply(`❌ *Failed:* ${data.error || 'Processing error'}\n\n${FOOTER}`);
                await react('❌');
            }
        } catch(e) { 
            await react('❌'); 
            await reply(`❌ *Error:* ${e.message}\n\nTip: Make sure you're replying to an audio message!\n\n${FOOTER}`); 
        }
    }
});

// ═══════════════════════════════════════════
// QUICK EFFECT COMMANDS (for popular ones)
// ═══════════════════════════════════════════

['bassboost', 'robot', 'nightcore', '8d', 'chipmunk', 'slowreverb', 'echo', 'demon', 'alien', 'karaoke'].forEach(effectId => {
    const e = AUDIO_EFFECTS[effectId];
    commands.push({
        name: effectId,
        description: `Apply ${e.name} audio effect`,
        aliases: [effectId + 'fx'],
        async execute({ msg, from, sender, args, bot, sock, react, reply, quoted }) {
            let audioUrl = null;
            const qm = quoted?.message;
            if (qm?.audioMessage) audioUrl = qm.audioMessage.url;
            else if (qm?.videoMessage) audioUrl = qm.videoMessage.url;
            else if (args[0]?.startsWith('http')) audioUrl = args[0];
            
            if (!audioUrl) return reply(`❌ Reply to a voice note with ${config.PREFIX}${effectId}\n\n${FOOTER}`);
            
            await react(e.emoji);
            await reply(`🎛️ *${e.name}* processing...\n\n${FOOTER}`);
            
            try {
                const data = await apiGet(`/api/audio/${effectId}`, { url: audioUrl });
                if (data.success && data.result?.base64Data) {
                    const base64 = data.result.base64Data.replace(/^data:.*?base64,/, '');
                    const filePath = path.join(TEMP_DIR, `${effectId}_${Date.now()}.mp3`);
                    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
                    await sock.sendMessage(from, {
                        audio: fs.readFileSync(filePath),
                        mimetype: 'audio/mpeg'
                    }, { quoted: msg });
                    setTimeout(() => fs.unlink(filePath).catch(() => {}), 60000);
                    await react('✅');
                } else {
                    await reply(`❌ *Failed*\n\n${FOOTER}`);
                    await react('❌');
                }
            } catch(e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
        }
    });
});

// ═══════════════════════════════════════════
// AUDIOFX MENU
// ═══════════════════════════════════════════

commands.push({
    name: 'audiofxmenu',
    description: 'Show all audio effects',
    aliases: ['audiofxlist', 'soundlist', 'voiceeffects'],
    async execute({ react, reply }) {
        let list = `🎛️ *AUDIO EFFECTS - 25 Effects*\n\n*Usage:* Reply to voice note with ${config.PREFIX}audiofx <effect>\n\n`;
        for (const [id, e] of Object.entries(AUDIO_EFFECTS)) {
            list += `${e.emoji} *${e.name}* (${config.PREFIX}${id})\n   ${e.desc}\n`;
        }
        list += `\n*Quick commands:* ${config.PREFIX}bassboost, ${config.PREFIX}robot, ${config.PREFIX}nightcore, ${config.PREFIX}8d, ${config.PREFIX}chipmunk, ${config.PREFIX}demon, ${config.PREFIX}alien, ${config.PREFIX}karaoke\n\n${FOOTER}`;
        await reply(list); await react('🎛️');
    }
});

module.exports = { commands };
