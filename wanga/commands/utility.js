// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME UTILITY COMMANDS - 100% Free       ║
// ║  Voice → Text | Lyrics | URL Unshort | Age      ║
// ║  Timezone | Pastebin | Compress | Currency       ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');
const dev = require('../../megan/lib/developer');

const FOOTER = '> Megan-Prime | TrackerWanga';
const commands = [];

// ═══════════════════════════════════════════
// 1. TRANSCRIBE - Voice Note → Text
// Uses your megan-ai worker (free)
// ═══════════════════════════════════════════

commands.push({
    name: 'transcribe',
    description: 'Convert voice note to text',
    aliases: ['stt', 'speechtotext', 'voicetotext', 'vtotext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, quoted }) {
        // Get audio from quoted message
        const qm = quoted?.message;
        let audioUrl = qm?.audioMessage?.url || qm?.videoMessage?.url;
        
        if (!audioUrl) {
            await react('ℹ️');
            return reply(`🎙️ *VOICE TO TEXT*\n\nReply to a voice note with ${config.PREFIX}transcribe\n\n${FOOTER}`);
        }
        
        await react('🎙️');
        await reply(`🎙️ *Transcribing...*\n\n⏳ Please wait...\n\n${FOOTER}`);
        
        try {
            const res = await axios.post(`${dev.AI_WORKER || 'https://ai.megan.qzz.io'}/api/audio/stt`, 
                { audio_url: audioUrl },
                { headers: { 'x-api-key': dev.API_KEY, 'Content-Type': 'application/json' }, timeout: 60000 }
            );
            
            const data = res.data;
            if (data.success && data.text) {
                await reply(`🎙️ *Transcribed:*\n\n${data.text}\n\n📡 Provider: ${data.provider || 'AI'}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`❌ *Failed to transcribe*\n${data.error || 'Try a shorter voice note'}\n\n${FOOTER}`);
                await react('❌');
            }
        } catch (e) {
            await react('❌');
            await reply(`❌ *Error:* ${e.message}\n\n${FOOTER}`);
        }
    }
});

// ═══════════════════════════════════════════
// 2. LYRICS - Song Lyrics Finder
// Uses lrclib.net (free, no key)
// ═══════════════════════════════════════════

commands.push({
    name: 'lyrics',
    description: 'Get song lyrics',
    aliases: ['lyric', 'songlyrics', 'findlyrics'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const query = args.join(' ');
        if (!query) {
            await react('ℹ️');
            return reply(`🎵 *LYRICS FINDER*\n\n*Usage:* ${config.PREFIX}lyrics <song name>\n*Example:* ${config.PREFIX}lyrics Bohemian Rhapsody\n\n${FOOTER}`);
        }
        
        await react('🎵');
        
        try {
            const res = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, {
                headers: { 'User-Agent': 'Megan-Prime/1.0' },
                timeout: 15000
            });
            
            if (res.data?.length > 0) {
                const track = res.data[0];
                const lyrics = track.plainLyrics || track.syncedLyrics;
                
                if (lyrics && lyrics.length > 10) {
                    // Split long lyrics
                    const maxLen = 3500;
                    const text = `🎵 *${track.trackName || 'Unknown'}*\n👤 ${track.artistName || 'Unknown'}\n\n${lyrics.substring(0, maxLen)}${lyrics.length > maxLen ? '...' : ''}\n\n📡 lrclib.net\n\n${FOOTER}`;
                    await reply(text);
                    await react('✅');
                } else {
                    await reply(`❌ *No lyrics found* for "${query}"\n\n${FOOTER}`);
                    await react('❌');
                }
            } else {
                await reply(`❌ *No results* for "${query}"\n\n${FOOTER}`);
                await react('❌');
            }
        } catch (e) {
            await react('❌');
            await reply(`❌ *Error:* ${e.message}\n\n${FOOTER}`);
        }
    }
});

// ═══════════════════════════════════════════
// 3. UNSHORT - Expand Shortened URLs
// Pure HTTP, no API needed
// ═══════════════════════════════════════════

commands.push({
    name: 'unshort',
    description: 'Expand shortened URLs',
    aliases: ['unshorten', 'expandurl', 'urlreveal'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const url = args[0];
        if (!url?.startsWith('http')) {
            await react('ℹ️');
            return reply(`🔗 *URL EXPANDER*\n\n*Usage:* ${config.PREFIX}unshort <short_url>\n*Example:* ${config.PREFIX}unshort bit.ly/abc123\n\n${FOOTER}`);
        }
        
        await react('🔗');
        
        try {
            // Follow redirects without downloading body
            const res = await axios.head(url, {
                maxRedirects: 10,
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0' },
                validateStatus: () => true
            });
            
            const finalUrl = res.request?.res?.responseUrl || res.request?.path || url;
            
            if (finalUrl !== url) {
                await reply(`🔗 *URL Expanded*\n\n*Short:* ${url}\n*Real:* ${finalUrl}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`ℹ️ *No redirect detected*\n\n${url}\n\n${FOOTER}`);
                await react('ℹ️');
            }
        } catch (e) {
            await react('❌');
            await reply(`❌ *Error:* ${e.message}\n\n${FOOTER}`);
        }
    }
});

// ═══════════════════════════════════════════
// 4. AGE - Calculate Exact Age
// Pure math, no API needed
// ═══════════════════════════════════════════

commands.push({
    name: 'age',
    description: 'Calculate exact age from birth date',
    aliases: ['howold', 'birthage', 'calcage'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const dateStr = args[0];
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            await react('ℹ️');
            return reply(`🎂 *AGE CALCULATOR*\n\n*Usage:* ${config.PREFIX}age <YYYY-MM-DD>\n*Example:* ${config.PREFIX}age 2000-05-15\n\n${FOOTER}`);
        }
        
        await react('🎂');
        
        const birth = new Date(dateStr);
        const now = new Date();
        
        if (isNaN(birth.getTime()) || birth > now) {
            return reply(`❌ *Invalid date*\n\n${FOOTER}`);
        }
        
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        
        if (days < 0) {
            months--;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBirthday < now) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        const daysUntil = Math.floor((nextBirthday - now) / (1000 * 60 * 60 * 24));
        
        await reply(`🎂 *Age Calculation*\n\n📅 Born: ${dateStr}\n👤 Age: ${years}y ${months}m ${days}d\n📊 Total: ${totalDays.toLocaleString()} days\n🎉 Next birthday: ${daysUntil} days\n\n${FOOTER}`);
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 5. TIMEZONE - Time in Any City
// No API needed
// ═══════════════════════════════════════════

commands.push({
    name: 'time',
    description: 'Get current time in any city',
    aliases: ['worldtime', 'citytime', 'timein'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const city = args.join(' ') || 'Nairobi';
        await react('🕐');
        
        try {
            // Use free worldtimeapi.org
            const res = await axios.get(`https://worldtimeapi.org/api/timezone`, { timeout: 10000 });
            const zones = res.data || [];
            
            // Find matching timezone
            const match = zones.find(z => z.toLowerCase().includes(city.toLowerCase()));
            const tz = match || 'Africa/Nairobi';
            
            const timeRes = await axios.get(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(tz)}`, { timeout: 10000 });
            const data = timeRes.data;
            
            if (data) {
                const dt = new Date(data.datetime);
                await reply(`🕐 *Time in ${tz.split('/').pop().replace('_', ' ')}*\n\n📅 ${dt.toDateString()}\n⏰ ${dt.toLocaleTimeString()}\n🌍 ${data.timezone}\n⏱️ UTC${data.utc_offset}\n\n${FOOTER}`);
                await react('✅');
            } else {
                // Fallback: show all matching zones
                const matches = zones.filter(z => z.toLowerCase().includes(city.toLowerCase())).slice(0, 10);
                if (matches.length) {
                    await reply(`🌍 *Matching timezones for "${city}":*\n\n${matches.join('\n')}\n\nUse exact name with ${config.PREFIX}time\n\n${FOOTER}`);
                } else {
                    await reply(`❌ *Not found*\n\n${FOOTER}`);
                }
            }
        } catch (e) {
            // Ultimate fallback: local time
            const now = new Date();
            await reply(`🕐 *Local Time*\n\n📅 ${now.toDateString()}\n⏰ ${now.toLocaleTimeString()}\n🌍 ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n\n${FOOTER}`);
        }
    }
});

// ═══════════════════════════════════════════
// 6. PASTEBIN - Create/Read Pastes
// Uses rentry.co (free, no key)
// ═══════════════════════════════════════════

commands.push({
    name: 'paste',
    description: 'Create or read a pastebin',
    aliases: ['pastebin', 'textshare', 'sharetext'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, quoted }) {
        if (args[0] === 'read' || args[0] === 'get') {
            // Read a paste
            const code = args[1];
            if (!code) return reply(`📋 *READ PASTE*\n\n*Usage:* ${config.PREFIX}paste read <code>\n\n${FOOTER}`);
            
            await react('📋');
            try {
                const res = await axios.get(`https://rentry.co/${code}/raw`, { timeout: 10000 });
                const text = res.data.substring(0, 3500);
                await reply(`📋 *Paste: ${code}*\n\n${text}\n\n${FOOTER}`);
                await react('✅');
            } catch (e) {
                await reply(`❌ *Paste not found*\n\n${FOOTER}`);
                await react('❌');
            }
        } else {
            // Create a paste from replied message or args
            let text = args.join(' ');
            if (quoted?.message?.conversation) text = quoted.message.conversation;
            if (quoted?.message?.extendedTextMessage?.text) text = quoted.message.extendedTextMessage.text;
            
            if (!text) return reply(`📋 *CREATE PASTE*\n\n*Usage:* ${config.PREFIX}paste <text>\nOr reply to a message with ${config.PREFIX}paste\n\n${FOOTER}`);
            
            await react('📋');
            
            try {
                const form = new URLSearchParams();
                form.append('text', text);
                form.append('edit_code', Math.random().toString(36).substring(2, 10));
                
                const res = await axios.post('https://rentry.co/api/new', form.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 15000
                });
                
                if (res.data?.status === '200' || res.data?.url) {
                    const pasteUrl = res.data.url || `https://rentry.co/${res.data.edit_code}`;
                    await reply(`📋 *Paste Created!*\n\n🔗 ${pasteUrl}\n📝 ${text.length} characters\n\n${FOOTER}`);
                    await react('✅');
                } else {
                    throw new Error('Paste failed');
                }
            } catch (e) {
                // Fallback: just send as text if short enough
                if (text.length < 4000) {
                    await reply(`📋 *Shared Text:*\n\n${text}\n\n${FOOTER}`);
                } else {
                    await reply(`❌ *Text too long (${text.length} chars)*\n\n${FOOTER}`);
                }
                await react('⚠️');
            }
        }
    }
});

// ═══════════════════════════════════════════
// 7. COMPRESS - Shrink Media for WhatsApp
// Local only, no API
// ═══════════════════════════════════════════

commands.push({
    name: 'compress',
    description: 'Compress image or video',
    aliases: ['shrink', 'reduce', 'smaller'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, quoted }) {
        const qm = quoted?.message;
        const hasImage = qm?.imageMessage;
        const hasVideo = qm?.videoMessage;
        
        if (!hasImage && !hasVideo) {
            await react('ℹ️');
            return reply(`🗜️ *COMPRESS*\n\nReply to an image or video with ${config.PREFIX}compress\n\n${FOOTER}`);
        }
        
        await react('🗜️');
        await reply(`🗜️ *Compressing...*\n\n⏳ Please wait...\n\n${FOOTER}`);
        
        try {
            if (hasImage) {
                // Use sharp to compress image
                const sharp = require('sharp');
                const buffer = await sock.downloadMediaMessage(quoted);
                const compressed = await sharp(buffer)
                    .resize(800, 800, { fit: 'inside' })
                    .jpeg({ quality: 70 })
                    .toBuffer();
                
                const reduction = ((1 - compressed.length / buffer.length) * 100).toFixed(1);
                await sock.sendMessage(from, {
                    image: compressed,
                    caption: `🗜️ *Compressed!*\n📉 ${reduction}% smaller\n📁 ${(buffer.length/1024).toFixed(0)}KB → ${(compressed.length/1024).toFixed(0)}KB\n\n${FOOTER}`
                }, { quoted: msg });
                await react('✅');
            } else if (hasVideo) {
                // For video, just send as GIF if small, or inform user
                const buffer = await sock.downloadMediaMessage(quoted);
                const sizeMB = buffer.length / (1024 * 1024);
                
                if (sizeMB < 10) {
                    await sock.sendMessage(from, {
                        video: buffer,
                        caption: `🗜️ *Video Info*\n📁 ${sizeMB.toFixed(1)}MB\n\n⚠️ Video compression needs ffmpeg on server\n\n${FOOTER}`
                    }, { quoted: msg });
                } else {
                    await reply(`⚠️ *Video too large (${sizeMB.toFixed(1)}MB)*\n\nVideo compression requires ffmpeg installed on the server.\n\n${FOOTER}`);
                }
                await react('⚠️');
            }
        } catch (e) {
            await react('❌');
            await reply(`❌ *Compression failed:* ${e.message}\n\n${FOOTER}`);
        }
    }
});

// ═══════════════════════════════════════════
// 8. CURRENCY - Quick Currency Converter
// Uses your existing forex endpoint
// ═══════════════════════════════════════════

commands.push({
    name: 'currency',
    description: 'Convert between currencies',
    aliases: ['convert', 'exchange', 'fx'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (args.length < 3) {
            await react('ℹ️');
            return reply(`💱 *CURRENCY CONVERTER*\n\n*Usage:* ${config.PREFIX}currency <amount> <from> <to>\n*Example:* ${config.PREFIX}currency 100 usd kes\n\n${FOOTER}`);
        }
        
        const amount = parseFloat(args[0]);
        const fromCurrency = args[1].toUpperCase();
        const to = args[2].toUpperCase();
        
        if (isNaN(amount)) return reply(`❌ *Invalid amount*\n\n${FOOTER}`);
        
        await react('💱');
        
        try {
            const apiBase = dev.API_BASE || 'https://apis.megan.qzz.io';
            const res = await axios.get(`${apiBase}/api/forex/convert`, {
                params: { amount, fromCurrency, to, apikey: dev.API_KEY },
                timeout: 15000
            });
            
            const data = res.data;
            if (data.success && data.result) {
                await reply(`💱 *Currency Converter*\n\n${amount} ${fromCurrency} = *${data.result.converted || data.result}* ${to}\n\n📡 Live rates\n\n${FOOTER}`);
                await react('✅');
            } else {
                throw new Error('Conversion failed');
            }
        } catch (e) {
            await react('❌');
            await reply(`❌ *Failed to convert*\n\n${FOOTER}`);
        }
    }
});

// ═══════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════

commands.push({
    name: 'utility',
    description: 'Show all utility commands',
    aliases: ['utils', 'tools2', 'helpers'],
    async execute({ react, reply }) {
        const p = config.PREFIX;
        await reply(`🔧 *UTILITY COMMANDS - 100% Free*

*🎙️ VOICE*
${p}transcribe - Voice note → text

*🎵 MUSIC*
${p}lyrics <song> - Find song lyrics

*🔗 URL*
${p}unshort <url> - Expand short URLs
${p}paste <text> - Create pastebin
${p}paste read <id> - Read pastebin

*📅 TIME & AGE*
${p}age <YYYY-MM-DD> - Calculate age
${p}time <city> - Time in any city

*💱 MONEY*
${p}currency <amt> <from> <to> - Convert

*🗜️ MEDIA*
${p}compress - Shrink image size

*📝 EXAMPLES*
${p}transcribe (reply to voice note)
${p}lyrics Shape of You
${p}unshort bit.ly/abc123
${p}age 2000-05-15
${p}time Tokyo
${p}currency 100 usd kes

> Megan-Prime | Free Tools | TrackerWanga`);
        await react('🔧');
    }
});

module.exports = { commands };
