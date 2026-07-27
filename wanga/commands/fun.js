// ╔══════════════════════════════════════════════════╗
// ║    MEGAN-PRIME FUN COMMANDS - 47 Endpoints      ║
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
    const res = await axios.get(url, {
        params: { ...params, apikey: API_KEY },
        timeout,
        headers: { 'User-Agent': 'Megan-Prime/1.0' }
    });
    return res.data;
}

// Helper to extract text from /api/fun/* responses
function extractText(data) {
    if (data.result?.text) return data.result.text;
    if (data.result) return data.result;
    return null;
}

// ═══════════════════════════════════════════
// SIMPLE TEXT FUN (single emoji, no params)
// ═══════════════════════════════════════════

function simpleFunCmd(name, endpoint, emoji, label, aliases = []) {
    commands.push({ name, description: label, aliases,
        async execute({ react, reply }) {
            await react(emoji);
            try {
                const data = await apiGet(endpoint);
                const text = extractText(data);
                if (text) {
                    await reply(`${emoji} *${label}:*\n${text}\n\n${FOOTER}`);
                    await react('✅');
                } else {
                    await reply(`❌ *Failed*\n\n${FOOTER}`);
                }
            } catch(e) { await react('❌'); }
        }
    });
}

// ═══════════════════════════════════════════
// FUN CATEGORIES (all working /api/fun/*)
// ═══════════════════════════════════════════

simpleFunCmd('joke', '/api/fun/jokes', '😂', 'Joke', ['jokes', 'lol']);
simpleFunCmd('roast', '/api/fun/roasts', '🔥', 'Roast', ['roasts', 'burn']);
simpleFunCmd('compliment', '/api/fun/compliments', '💐', 'Compliment', ['compliments', 'praise']);
simpleFunCmd('pickup', '/api/fun/pickuplines', '😏', 'Pickup Line', ['pickupline', 'rizz']);
simpleFunCmd('dare', '/api/fun/dares', '🎯', 'Dare', ['dares']);
simpleFunCmd('truth', '/api/fun/truth', '❓', 'Truth', ['truths']);
simpleFunCmd('wyr', '/api/fun/wouldyourather', '🤔', 'Would You Rather', ['wouldyourather', 'wyrather']);
simpleFunCmd('pun', '/api/fun/puns', '🥁', 'Pun', ['puns', 'punny']);
simpleFunCmd('funfact', '/api/fun/funfacts', '📚', 'Fun Fact', ['funfacts', 'factoid']);
simpleFunCmd('trivia', '/api/fun/trivia', '🧠', 'Trivia', ['trivias', 'quiz']);
simpleFunCmd('advice', '/api/fun/advice', '💡', 'Advice', ['advices', 'tip']);
simpleFunCmd('flirt', '/api/fun/flirt', '💋', 'Flirt', ['flirts', 'smooth']);
simpleFunCmd('motivation', '/api/fun/motivation', '💪', 'Motivation', ['motivate', 'inspire']);
simpleFunCmd('wisdom', '/api/fun/wisdom', '🦉', 'Wisdom', ['wise', 'philosophy']);
simpleFunCmd('success', '/api/fun/success', '🏆', 'Success Quote', ['successquote', 'win']);
simpleFunCmd('friendship', '/api/fun/friendship', '👫', 'Friendship', ['friend', 'bff']);
simpleFunCmd('humor', '/api/fun/humor', '😄', 'Humor', ['humour', 'funny']);
simpleFunCmd('heartbreak', '/api/fun/heartbreak', '💔', 'Heartbreak', ['broken', 'sad']);
simpleFunCmd('shayari', '/api/fun/shayari', '📝', 'Shayari', ['poetry', 'sher']);

// ═══════════════════════════════════════════
// GREETINGS & SPECIAL OCCASIONS
// ═══════════════════════════════════════════

simpleFunCmd('goodmorning', '/api/fun/goodmorning', '🌅', 'Good Morning', ['gm', 'morning']);
simpleFunCmd('goodnight', '/api/fun/goodnight', '🌙', 'Good Night', ['gn', 'night']);
simpleFunCmd('love', '/api/fun/love', '❤️', 'Love Message', ['lovequote', 'romance']);
simpleFunCmd('sorry', '/api/fun/sorry', '🙏', 'Apology', ['apology', 'apologize']);
simpleFunCmd('thankyou', '/api/fun/thankyou', '🙌', 'Thank You', ['thanks', 'grateful']);
simpleFunCmd('gratitude', '/api/fun/gratitude', '✨', 'Gratitude', ['grateful', 'blessed']);
simpleFunCmd('birthday', '/api/fun/birthday', '🎂', 'Birthday Wish', ['bday', 'happybirthday']);
simpleFunCmd('valentine', '/api/fun/valentines', '💝', 'Valentine', ['valentines', 'vday']);
simpleFunCmd('halloween', '/api/fun/halloween', '🎃', 'Halloween Message', ['spooky', 'trickortreat']);
simpleFunCmd('christmas', '/api/fun/christmas', '🎄', 'Christmas Message', ['xmas', 'merryxmas']);
simpleFunCmd('newyear', '/api/fun/newyear', '🎆', 'New Year Message', ['nye', 'happynewyear']);

// ═══════════════════════════════════════════
// SPECIAL DAYS
// ═══════════════════════════════════════════

simpleFunCmd('roseday', '/api/fun/roseday', '🌹', 'Rose Day', ['rose', 'flowerday']);
simpleFunCmd('fathersday', '/api/fun/fathersday', '👨', "Father's Day", ['dad', 'father']);
simpleFunCmd('mothersday', '/api/fun/mothersday', '👩', "Mother's Day", ['mom', 'mother']);
simpleFunCmd('girlfriendsday', '/api/fun/girlfriendsday', '👧', "Girlfriend's Day", ['gfday', 'girlfriend']);
simpleFunCmd('boyfriendsday', '/api/fun/boyfriendsday', '👦', "Boyfriend's Day", ['bfday', 'boyfriend']);

// ═══════════════════════════════════════════
// SPECIAL: Riddle (from /api/fun/riddles)
// ═══════════════════════════════════════════

commands.push({
    name: 'riddle',
    description: 'Get a riddle with answer',
    aliases: ['riddles', 'puzzle'],
    async execute({ react, reply }) {
        await react('🧩');
        try {
            const data = await apiGet('/api/fun/riddles');
            const text = extractText(data);
            if (text) {
                // Format: "What am I? An echo." -> split at last "?"
                await reply(`🧩 *Riddle:*\n${text}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`❌ *Failed*\n\n${FOOTER}`);
            }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// SPECIAL: Meme (from /api/content/meme)
// ═══════════════════════════════════════════

commands.push({
    name: 'meme',
    description: 'Get a random meme from Reddit',
    aliases: ['memes', 'redditmeme', 'dankmeme'],
    async execute({ msg, from, sock, react, reply }) {
        await react('🤣');
        try {
            const data = await apiGet('/api/content/meme');
            if (data.success && data.url) {
                await sock.sendMessage(from, {
                    image: { url: data.url },
                    caption: `🤣 *${data.title || 'Meme'}*\n👤 ${data.author || 'Unknown'} | r/${data.subreddit || 'memes'}\n\n${FOOTER}`
                }, { quoted: msg });
                await react('✅');
            } else {
                await reply(`❌ *No meme found*\n\n${FOOTER}`);
            }
        } catch(e) { await react('❌'); await reply(`❌ *Error:* ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// SPECIAL: Quote (from /api/content/quote)
// ═══════════════════════════════════════════

commands.push({
    name: 'quote',
    description: 'Get an inspirational quote',
    aliases: ['quotes', 'inspire', 'wisdomquote'],
    async execute({ react, reply }) {
        await react('📜');
        try {
            const data = await apiGet('/api/content/quote');
            if (data.success && data.quote) {
                await reply(`📜 *Quote:*\n_"${data.quote}"_\n— ${data.author || 'Unknown'}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`❌ *Failed*\n\n${FOOTER}`);
            }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// SPECIAL: Useless Fact (from /api/content/fact)
// ═══════════════════════════════════════════

commands.push({
    name: 'fact',
    description: 'Get a random useless fact',
    aliases: ['facts', 'uselessfact', 'randomfact'],
    async execute({ react, reply }) {
        await react('🤓');
        try {
            const data = await apiGet('/api/content/fact');
            if (data.success && data.fact) {
                await reply(`🤓 *Fact:*\n${data.fact}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`❌ *Failed*\n\n${FOOTER}`);
            }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// SPECIAL: Cat Fact (from /api/content/cat-fact)
// ═══════════════════════════════════════════

commands.push({
    name: 'catfact',
    description: 'Get a random cat fact',
    aliases: ['catfacts', 'kittenfact', 'meowfact'],
    async execute({ react, reply }) {
        await react('🐱');
        try {
            const data = await apiGet('/api/content/cat-fact');
            if (data.success && data.fact) {
                await reply(`🐱 *Cat Fact:*\n${data.fact}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`❌ *Failed*\n\n${FOOTER}`);
            }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// SPECIAL: Tech Joke (from /api/fun/tech-joke)
// ═══════════════════════════════════════════

commands.push({
    name: 'techjoke',
    description: 'Get a programming/tech joke',
    aliases: ['techjokes', 'coderjoke', 'devjoke', 'geekjoke'],
    async execute({ react, reply }) {
        await react('💻');
        try {
            const data = await apiGet('/api/fun/tech-joke');
            const text = extractText(data);
            if (text) {
                await reply(`💻 *Tech Joke:*\n${text}\n\n${FOOTER}`);
                await react('✅');
            } else {
                await reply(`❌ *Failed*\n\n${FOOTER}`);
            }
        } catch(e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// FUN MENU
// ═══════════════════════════════════════════

commands.push({
    name: 'fun',
    description: 'Show all fun commands',
    aliases: ['funmenu', 'funhelp', 'entertainment'],
    async execute({ reply, react }) {
        const menu = `🎉 *FUN COMMANDS - 47 Endpoints*

*😂 JOKES & HUMOR*
${config.PREFIX}joke - Random joke
${config.PREFIX}pun - Random pun
${config.PREFIX}techjoke - Programming joke
${config.PREFIX}humor - Humorous line
${config.PREFIX}meme - Reddit meme with image

*🔥 ROASTS & SAVAGE*
${config.PREFIX}roast - Roast someone
${config.PREFIX}compliment - Give a compliment
${config.PREFIX}pickup - Pickup line
${config.PREFIX}flirt - Flirty message

*🎯 GAMES*
${config.PREFIX}truth - Truth question
${config.PREFIX}dare - Dare challenge
${config.PREFIX}wyr - Would you rather
${config.PREFIX}riddle - Riddle with answer

*🧠 KNOWLEDGE*
${config.PREFIX}fact - Random useless fact
${config.PREFIX}funfact - Fun fact
${config.PREFIX}catfact - Cat fact
${config.PREFIX}trivia - Trivia fact
${config.PREFIX}advice - Life advice
${config.PREFIX}wisdom - Wisdom quote
${config.PREFIX}quote - Inspirational quote

*💪 MOTIVATION*
${config.PREFIX}motivation - Motivational message
${config.PREFIX}success - Success quote

*❤️ RELATIONSHIPS*
${config.PREFIX}love - Love message
${config.PREFIX}friendship - Friendship quote
${config.PREFIX}heartbreak - Heartbreak quote
${config.PREFIX}shayari - Shayari verse
${config.PREFIX}sorry - Apology message

*🌅 GREETINGS*
${config.PREFIX}goodmorning - Good morning
${config.PREFIX}goodnight - Good night
${config.PREFIX}thankyou - Thank you
${config.PREFIX}gratitude - Gratitude

*🎉 OCCASIONS*
${config.PREFIX}birthday - Birthday wish
${config.PREFIX}valentine - Valentine's message
${config.PREFIX}halloween - Halloween
${config.PREFIX}christmas - Christmas
${config.PREFIX}newyear - New Year

*👨‍👩‍👧 SPECIAL DAYS*
${config.PREFIX}roseday - Rose Day
${config.PREFIX}fathersday - Father's Day
${config.PREFIX}mothersday - Mother's Day
${config.PREFIX}girlfriendsday - GF Day
${config.PREFIX}boyfriendsday - BF Day

> Megan-Prime | 47 Fun Commands | TrackerWanga`;

        await reply(menu);
        await react('🎉');
    }
});

module.exports = { commands };
