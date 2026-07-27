// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME DEVELOPER CONFIG                   ║
// ║  ⚠️ SENSITIVE - Do not publish publicly          ║
// ╚══════════════════════════════════════════════════╝

module.exports = {
    // === DEVELOPER ===
    DEVELOPER: 'Wanga',
    DEVELOPER_NUMBER: '254119387715',
    DEVELOPER_JID: '254119387715:32@s.whatsapp.net',
    DEVELOPER_LID: '272409072521286:32@lid',
    DEVELOPER_EMAIL: 'trackerwanga254@gmail.com',

    // === AUTH & API KEYS ===
    API_KEY: 'megan_admin_master',
    GOOGLE_API_KEY: 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ',
    IMGBB_KEY: 'bbc0c59714520ebcd0af58caf995bd08',
    WEATHER_API_KEY: '',

    // === CHANNELS & GROUPS ===
    WA_CHANNEL_URL: 'https://whatsapp.com/channel/0029Vb7FYNA8qIzs2P5dcE37',
    WA_CHANNEL_JID: '120363423611305810@newsletter',
    WA_CHANNEL_NAME: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
    WA_GROUP_INVITE: 'https://chat.whatsapp.com/Bfr7VjAkxCfHMmpKuIXyt1',

    // === API ENDPOINTS ===
    API_BASE: 'https://apis.megan.qzz.io',
    AI_WORKER: 'https://late-salad-9d56.youngwanga254.workers.dev',
    SESSION_PAIR: 'https://megan-session-pairing.onrender.com',

    // === THIRD-PARTY APIs ===
    SIPUTZX: 'https://api.siputzx.my.id',
    GITHUB_API: 'https://api.github.com',
    TENOR_API: 'https://tenor.googleapis.com/v2',
    CATBOX_UPLOAD: 'https://catbox.moe/user/api.php',
    CATBOX_FILES: 'https://files.catbox.moe',
    TINYURL: 'https://tinyurl.com/api-create.php',
    IMGUR: 'https://i.imgur.com',
    TMDB_IMAGE: 'https://image.tmdb.org/t/p',
    YOUTUBE_IMG: 'https://img.youtube.com',

    // === BOT REPO ===
    REPO_URL: 'https://github.com/TrackerWanga/megan-prime',

    // === BOT PIC (Catbox logo) ===
    BOT_PICS: [
        'https://anime-cdn.megan.qzz.io/bot-pics/670364df-8322-47a9-a20e-a76edcbc7834.jpeg',
        'https://anime-cdn.megan.qzz.io/bot-pics/befa3371-b594-4031-a1c4-1e06031fb299.jpeg',
        'https://anime-cdn.megan.qzz.io/bot-pics/dd2a5f58-dcfb-4c79-bcb6-b5161178e26c.jpeg',
        'https://anime-cdn.megan.qzz.io/bot-pics/f46d9acc-d3f4-409f-a253-1b72ac82916a.jpeg'
    ],
    // Random bot pic from R2 CDN
    get BOT_PIC() { return this.BOT_PICS[Math.floor(Math.random() * this.BOT_PICS.length)]; },
};
