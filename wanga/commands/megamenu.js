// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME MEGA MENU - All Commands            ║
// ║  Categorized | Stylish | Newsletter              ║
// ╚══════════════════════════════════════════════════╝

const config = require('../../megan/config');
const { replyStyled, BUTTONS } = require('../../megan/lib/styler');

const commands = [];

commands.push({
    name: 'megamenu',
    description: 'Show all bot commands by category',
    aliases: ['allcommands', 'fullhelp', 'megacmds', 'commandslist'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const p = config.PREFIX;
        await react('📚');

        // If a category is specified, show just that
        const category = args[0]?.toLowerCase();
        
        const menus = {
            ai: `🤖 *AI COMMANDS*\n\n${p}megan | ${p}gpt | ${p}gemini | ${p}deepseek | ${p}mistral | ${p}duckai\n${p}codellama | ${p}teacher | ${p}bibleai | ${p}gita\n${p}claude | ${p}groq | ${p}llama | ${p}phi | ${p}qwen | ${p}replit\n${p}aisummarize | ${p}aicode | ${p}aihumanize | ${p}aiscanner\n${p}aimenu - Full AI model list\n\n> Megan-Prime | AI`,
            
            download: `📥 *DOWNLOADER*\n\n${p}play <song> | ${p}video <name> | ${p}ytmp3 | ${p}ytmp4\n${p}tiktok <url> | ${p}ig <url> | ${p}fb <url> | ${p}twitter <url>\n${p}spotify <song> | ${p}soundcloud <url> | ${p}shazam <song>\n${p}lyrics <song> | ${p}downloaderhelp\n\n> Megan-Prime | Downloader`,
            
            group: `👥 *GROUP*\n\n${p}tag | ${p}hidetag | ${p}announce | ${p}tagadmins\n${p}add | ${p}kick | ${p}promote | ${p}demote\n${p}lock | ${p}unlock | ${p}invite | ${p}revoke | ${p}join\n${p}poll | ${p}requests | ${p}approve | ${p}reject\n${p}welcome on/off | ${p}goodbye on/off\n${p}activate | ${p}deactivate | ${p}botstatus\n${p}warn | ${p}warns | ${p}resetwarns | ${p}antilinkgc\n${p}killgc | ${p}online | ${p}groupicon | ${p}grouphelp\n\n> Megan-Prime | Group`,
            
            fun: `🎉 *FUN*\n\n${p}joke | ${p}roast | ${p}compliment | ${p}pickup | ${p}meme\n${p}quote | ${p}fact | ${p}riddle | ${p}trivia | ${p}advice\n${p}flirt | ${p}motivation | ${p}wisdom | ${p}8ball\n${p}goodmorning | ${p}goodnight | ${p}love | ${p}birthday\n${p}fun - Full fun menu\n\n> Megan-Prime | Fun`,
            
            anime: `🎌 *ANIME*\n\n${p}hug @user | ${p}kiss @user | ${p}slap @user | ${p}pat @user\n${p}cuddle @user | ${p}cry | ${p}dance | ${p}laugh\n${p}waifu | ${p}neko\n\n> Megan-Prime | Anime`,
            
            effects: `🎨 *EFFECTS*\n\n${p}ephoto - 110 text effects\n${p}photofunia - 342 photo effects\n${p}audiofx - 25 audio effects\n${p}style <text> - Fancy text styles\n${p}beautiful | ${p}removebg | ${p}imagine\n\n> Megan-Prime | Effects`,
            
            tools: `🔧 *TOOLS*\n\n${p}binary | ${p}base64 | ${p}hash | ${p}morse | ${p}encrypt\n${p}password | ${p}uuid | ${p}lorem | ${p}qrcode\n${p}calculate | ${p}fliptext | ${p}emojimix\n${p}screenshot | ${p}browse | ${p}scrape | ${p}links\n${p}currency | ${p}age | ${p}time | ${p}countdown\n${p}paste | ${p}unshort | ${p}transcribe\n${p}extras | ${p}tools - Full tools menu\n\n> Megan-Prime | Tools`,
            
            search: `🔍 *SEARCH*\n\n${p}wiki | ${p}news | ${p}weather | ${p}dictionary\n${p}github | ${p}npm | ${p}reddit | ${p}urban\n${p}images | ${p}videos | ${p}youtube | ${p}spotifysearch\n${p}crypto | ${p}forex | ${p}country | ${p}emoji\n${p}ghstalk | ${p}igstalk | ${p}ipstalk | ${p}searchhelp\n\n> Megan-Prime | Search`,
            
            movie: `🎬 *MOVIE*\n\n${p}movie <title> | ${p}tv <show> | ${p}actor <name>\n${p}trending | ${p}popular | ${p}nowplaying | ${p}upcoming\n${p}toprated | ${p}cast <id> | ${p}trailer <id>\n${p}similar | ${p}recommend | ${p}providers\n${p}moviemenu - Full movie commands\n\n> Megan-Prime | TMDB`,
            
            owner: `👑 *OWNER*\n\n${p}restart | ${p}update | ${p}version | ${p}botstats\n${p}shell | ${p}gitstatus | ${p}pair <number>\n${p}activate | ${p}deactivate | ${p}dashboard\n\n> Megan-Prime | Owner`,
            
            security: `🛡️ *SECURITY*\n\n${p}whois | ${p}dns | ${p}portscan | ${p}ssl | ${p}geoip\n${p}headers | ${p}xss | ${p}sqli | ${p}csrf | ${p}clickjack\n${p}waf | ${p}firewall | ${p}subdomain | ${p}phish\n${p}securityhelp - Full security menu\n\n> Megan-Prime | Security`,
            
            sports: `⚽ *SPORTS*\n\n${p}livescores | ${p}teamsearch | ${p}playersearch\n${p}leagues | ${p}leaguetable | ${p}eventsbyday\n${p}sportshelp - Full sports menu\n\n> Megan-Prime | Sports`,
            
            media: `📸 *MEDIA*\n\n${p}sticker | ${p}stickervideo | ${p}toaudio | ${p}tovideo\n${p}gif | ${p}filter | ${p}voice | ${p}volume | ${p}speed\n${p}shorturl | ${p}catbox | ${p}imgbb\n${p}mediastatus | ${p}mediahelp\n\n> Megan-Prime | Media`,
        };

        if (category && menus[category]) {
            await replyStyled(sock, from, menus[category], msg, {
                title: category.toUpperCase() + ' Commands',
                useNewsletter: true,
                newsletterName: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
                buttons: [BUTTONS.channel]
            });
            return;
        }

        // Main mega menu
        const menu = `📚 *MEGAN-PRIME COMMANDS*\n\n` +
            `*${p}megamenu <category>* for details\n\n` +
            `🤖 *${p}megamenu ai* - AI Chat & Tools\n` +
            `📥 *${p}megamenu download* - YouTube, TikTok, Spotify\n` +
            `👥 *${p}megamenu group* - Group Management\n` +
            `🎉 *${p}megamenu fun* - Jokes, Memes, Games\n` +
            `🎌 *${p}megamenu anime* - Anime Reactions\n` +
            `🎨 *${p}megamenu effects* - Text & Photo Effects\n` +
            `🔧 *${p}megamenu tools* - Utilities & Converters\n` +
            `🔍 *${p}megamenu search* - Web & Data Search\n` +
            `🎬 *${p}megamenu movie* - TMDB Movie Info\n` +
            `⚽ *${p}megamenu sports* - Live Scores\n` +
            `📸 *${p}megamenu media* - Stickers & Media\n` +
            `🛡️ *${p}megamenu security* - Security Tools\n` +
            `👑 *${p}megamenu owner* - Owner Panel\n\n` +
            `📊 *Stats:* 1132 commands | 35 modules\n` +
            `> Megan-Prime | TrackerWanga`;

        await replyStyled(sock, from, menu, msg, {
            title: '📚 Megan-Prime Mega Menu',
            useNewsletter: true,
            newsletterName: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
            largeThumb: true,
            buttons: [BUTTONS.channel, BUTTONS.group]
        });
    }
});

module.exports = { commands };
