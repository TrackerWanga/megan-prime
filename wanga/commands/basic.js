// ╔══════════════════════════════════════════════════╗
// ║     MEGAN-PRIME BASIC COMMANDS                   ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga    ║
// ╚══════════════════════════════════════════════════╝

const config = require('../../megan/config');
const moment = require('moment-timezone');
const os = require('os');
const { replyStyled, BUTTONS } = require('../../megan/lib/styler');

const commands = [];
const FOOTER = '> Megan-Prime | TrackerWanga';

// ═══════════════════════════════════════════
// 1. PING
// ═══════════════════════════════════════════
commands.push({
    name: 'ping', description: 'Check bot response time',
    aliases: ['p'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const start = Date.now();
        await react('🏓');
        const ping = Date.now() - start;
        const uptime = process.uptime();
        const d = Math.floor(uptime / 86400);
        const h = Math.floor((uptime % 86400) / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const mem = Math.round(process.memoryUsage().heapUsed / 1048576);
        const speed = ping < 100 ? '⚡' : ping < 300 ? '✅' : ping < 600 ? '🐌' : '💀';
        
        const text = `╔══════════════════════╗\n` +
            `║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n` +
            `╚══════════════════════╝\n\n` +
            `│ 🏓 *Pong!* ${speed}\n` +
            `│ ⏱️ Latency: *${ping}ms*\n` +
            `│ ⏳ Uptime: *${d}d ${h}h ${m}m*\n` +
            `│ 💾 RAM: *${mem}MB*\n` +
            `│ 📚 Commands: *${bot.commands.size}*\n` +
            `╰──────────────────◇\n${FOOTER}`;
        
        await replyStyled(sock, from, text, msg, {
            title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞',
            useNewsletter: true,
            newsletterName: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
            buttons: [BUTTONS.channel]
        });
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 2. MENU
// ═══════════════════════════════════════════
commands.push({
    name: 'menu', description: 'Show all commands',
    aliases: ['help', 'cmds', 'commands'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const p = config.PREFIX;
        const now = moment().tz(config.TIMEZONE || 'Africa/Nairobi');
        const uptime = process.uptime();
        const d = Math.floor(uptime / 86400);
        const h = Math.floor((uptime % 86400) / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const mem = Math.round(process.memoryUsage().heapUsed / 1048576);
        const awayMode = await bot.db?.getSetting('awaymode', 'off') || 'off';
        const mode = await bot.db?.getSetting('mode', 'public') || 'public';
        
        const menu = `╔══════════════════════╗\n` +
            `║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n` +
            `╚══════════════════════╝\n\n` +
            `👤 *TrackerWanga* | 📞 254119387715\n` +
            `🔧 Prefix: *${p}* | ⚙️ Mode: *${mode}*\n` +
            `🟣 Away: *${awayMode === 'on' ? '✅ ON' : '❌ OFF'}*\n` +
            `📚 Commands: *${bot.commands.size}*\n` +
            `⏱️ Uptime: *${d}d ${h}h ${m}m*\n` +
            `🕐 ${now.format('h:mm A - DD/MM/YYYY')}\n` +
            `💾 RAM: *${mem}MB*\n\n` +
            `*📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n` +
            `${p}play\n${p}play2\n${p}play3\n${p}playdoc\n` +
            `${p}select\n${p}ytmp3\n${p}yta\n` +
            `${p}ytmp4\n${p}video\n${p}hd\n${p}ytmp5\n${p}ytdoc\n${p}ytv\n` +
            `${p}ytinfo\n${p}ytsearch\n${p}lyrics\n` +
            `${p}spotify\n${p}spotifyurl\n${p}spotifydl\n${p}spotifydldoc\n` +
            `${p}spotifytrack\n${p}spotifyalbum\n${p}spotifyartist\n` +
            `${p}spotifyrandom\n${p}spotifyplaylist\n` +
            `${p}soundcloud\n${p}scurl\n${p}scdoc\n${p}scdl\n` +
            `${p}tiktok\n${p}tiktokmp3\n${p}tiktokinfo\n` +
            `${p}ig\n${p}igstory\n` +
            `${p}fb\n${p}fbreel\n${p}fbsnap\n${p}fbinfo\n` +
            `${p}twitter\n${p}twitterinfo\n` +
            `${p}snapchat\n` +
            `${p}shazam\n${p}shazamsearch\n${p}shazaminfo\n` +
            `${p}downloaderhelp\n\n` +
            `*🔍 𝐒𝐄𝐀𝐑𝐂𝐇*\n` +
            `${p}google\n${p}bing\n${p}duckduckgo\n${p}searchall\n` +
            `${p}youtube\n${p}yttrending\n${p}ytrecommend\n` +
            `${p}spotifysearch\n${p}spsearch\n` +
            `${p}soundcloudsearch\n` +
            `${p}shazamsearch\n${p}musicsearch\n${p}musictrending\n${p}artist\n` +
            `${p}news\n${p}globalnews\n${p}kenyanews\n${p}tukonews\n${p}nationnews\n${p}standardnews\n${p}kenyansnews\n` +
            `${p}wiki\n${p}dictionary\n${p}urban\n${p}emoji\n` +
            `${p}github\n${p}npm\n${p}pypi\n${p}stackoverflow\n${p}reddit\n` +
            `${p}crypto\n${p}cryptolist\n${p}forex\n${p}forexconvert\n` +
            `${p}ghstalk\n${p}ipstalk\n${p}npmstalk\n${p}ttstalk\n${p}igstalk\n${p}twstalk\n${p}tgstalk\n` +
            `${p}weather\n${p}country\n` +
            `${p}images\n${p}videos\n` +
            `${p}dadjoke\n${p}proverb\n${p}affirmation\n${p}swahili\n${p}techjoke\n${p}fortune\n${p}neverhave\n` +
            `${p}bible\n${p}papers\n${p}books\n${p}bookinfo\n` +
            `${p}anime\n` +
            `${p}jobs\n${p}jiji\n${p}pigiame\n` +
            `${p}phone\n${p}dns\n` +
            `${p}searchhelp\n\n` +
            `*🤖 𝐀𝐈*\n` +
            `${p}megan\n${p}gpt\n${p}gemini\n${p}claude\n${p}deepseek\n${p}mistral\n` +
            `${p}llama\n${p}groq\n${p}cohere\n${p}qwen\n${p}phi\n` +
            `${p}codellama\n${p}dolphin\n${p}zephyr\n${p}falcon\n${p}vicuna\n` +
            `${p}wizard\n${p}yi\n${p}solar\n${p}chatglm\n${p}openchat\n` +
            `${p}mixtral\n${p}starcoder\n${p}neural\n${p}openhermes\n` +
            `${p}orca\n${p}command\n${p}nemotron\n${p}internlm\n${p}wormgpt\n${p}replit\n` +
            `${p}aisummarize\n${p}aicode\n${p}aihumanize\n${p}aiscanner\n` +
            `${p}aigenimage\n` +
            `${p}bibleai\n${p}teacher\n${p}gita\n` +
            `${p}aimenu\n\n` +
            `*🎨 𝐌𝐄𝐃𝐈𝐀*\n` +
            `${p}sticker\n${p}toimage\n${p}videosticker\n${p}stickervideo\n${p}gif\n${p}ungif\n` +
            `${p}say\n${p}voice\n${p}toaudio\n` +
            `${p}bass\n${p}nightcore\n${p}slowreverb\n${p}chipmunk\n${p}vibrato\n${p}echo\n` +
            `${p}distortion\n${p}8d\n${p}reverse\n${p}treble\n${p}surround\n${p}speed\n${p}volume\n` +
            `${p}circle\n${p}filter\n${p}removebg\n${p}meme\n` +
            `${p}catbox\n${p}imgbb\n` +
            `${p}qrcode\n${p}screenshot\n${p}shorturl\n` +
            `${p}waifu\n${p}neko\n` +
            `${p}cleantemp\n${p}mediahelp\n\n` +
            `*✨ 𝐄𝐅𝐅𝐄𝐂𝐓𝐒*\n` +
            `${p}ephoto (110)\n${p}textpro (65)\n${p}photofunia (342)\n` +
            `${p}audiofx (25)\n${p}style\n${p}beautiful\n${p}imagine\n${p}create\n\n` +
            `*👥 𝐆𝐑𝐎𝐔𝐏*\n` +
            `${p}creategroup\n${p}creategcadd\n${p}groupinfo\n${p}groups\n${p}metadata\n${p}participants\n${p}admins\n` +
            `${p}leave\n${p}add\n${p}kick\n${p}promote\n${p}demote\n` +
            `${p}invite\n${p}revoke\n${p}join\n${p}inviteinfo\n` +
            `${p}tag\n${p}hidetag\n${p}announce\n${p}tagadmins\n${p}antitag\n` +
            `${p}setname\n${p}setdesc\n${p}lock\n${p}unlock\n${p}lockinfo\n${p}unlockinfo\n${p}disappear\n${p}addmode\n` +
            `${p}poll\n${p}multipoll\n${p}gstatus\n` +
            `${p}requests\n${p}approve\n${p}reject\n${p}acceptall\n${p}rejectall\n` +
            `${p}welcome\n${p}setwelcome\n${p}goodbye\n${p}setgoodbye\n` +
            `${p}activate\n${p}deactivate\n${p}botstatus\n` +
            `${p}warn\n${p}warns\n${p}resetwarns\n${p}setmaxwarns\n` +
            `${p}killgc\n${p}online\n${p}groupicon\n${p}mute\n${p}unmute\n` +
            `${p}groupstats\n${p}grouprank\n${p}groupsilent\n` +
            `${p}antilinkgc\n${p}antibot\n` +
            `${p}grouphelp\n\n` +
            `*🎬 𝐌𝐎𝐕𝐈𝐄*\n` +
            `${p}movie\n${p}tv\n${p}actor\n${p}movieid\n${p}tvid\n${p}person\n` +
            `${p}trending\n${p}popular\n${p}nowplaying\n${p}toprated\n${p}upcoming\n${p}onair\n` +
            `${p}cast\n${p}trailer\n${p}providers\n${p}similar\n${p}recommend\n${p}reviews\n` +
            `${p}filmos\n${p}movieimages\n${p}season\n` +
            `${p}genres\n${p}genre\n${p}discover\n` +
            `${p}moviemenu\n\n` +
            `*🔧 𝐓𝐎𝐎𝐋𝐒*\n` +
            `${p}binary\n${p}debinary\n${p}base64\n${p}base64encode\n${p}base64decode\n` +
            `${p}hash\n${p}hashidentify\n${p}morse\n${p}urlencode\n${p}urldecode\n` +
            `${p}encrypt\n${p}decrypt\n` +
            `${p}password\n${p}vcc\n${p}email\n${p}uuid\n${p}lorem\n${p}color\n${p}timestamp\n` +
            `${p}emailvalidate\n${p}ipvalidate\n${p}passwordstrength\n${p}passwordaudit\n${p}textstats\n${p}jsonformat\n` +
            `${p}browse\n${p}tinyurl\n${p}screenshot\n${p}subdomains\n` +
            `${p}scrape\n${p}links\n${p}inspect\n${p}scripts\n${p}cookies\n` +
            `${p}deobfuscate\n${p}deminify\n${p}runjs\n${p}headless\n${p}decode\n` +
            `${p}countryinfo\n${p}phone\n${p}dns\n${p}wifi\n` +
            `${p}githubstalk\n${p}youtubestalk\n` +
            `${p}calc\n${p}fliptext\n${p}emojimix\n${p}zodiak\n${p}zodiakall\n${p}zodiakelement\n${p}zodiakmatch\n` +
            `${p}currency\n${p}age\n${p}time\n${p}countdown\n${p}paste\n${p}unshort\n${p}transcribe\n${p}lyrics\n` +
            `${p}extras\n${p}tools\n\n` +
            `*🛡️ 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘*\n` +
            `${p}whois\n${p}dnslookup\n${p}subdomainscan\n${p}reverseip\n` +
            `${p}geoip\n${p}portscan\n${p}openports\n${p}pinghost\n${p}latency\n${p}traceroute\n${p}asn\n${p}maclookup\n${p}ipinfo\n` +
            `${p}ssl\n${p}tls\n` +
            `${p}httpheaders\n${p}securityheaders\n` +
            `${p}wafdetect\n${p}firewall\n` +
            `${p}xss\n${p}sqli\n${p}csrf\n${p}clickjack\n${p}directoryscan\n${p}exposedfiles\n${p}misconfig\n` +
            `${p}robots\n${p}sitemap\n${p}cmsdetect\n${p}techstack\n${p}cookiescan\n${p}redirects\n${p}urlscan\n${p}phishcheck\n${p}metadata\n${p}hashgenerate\n` +
            `${p}securityhelp\n\n` +
            `*⚽ 𝐒𝐏𝐎𝐑𝐓𝐒*\n` +
            `${p}livescores\n` +
            `${p}teamsearch\n${p}playersearch\n${p}leaguesearch\n` +
            `${p}leagues\n${p}leaguedetails\n${p}leagueseasons\n${p}leagueteams\n${p}leaguetable\n` +
            `${p}teamdetails\n${p}teamplayers\n${p}teamnext\n${p}teamlast\n${p}teamequipment\n` +
            `${p}playerdetails\n` +
            `${p}eventdetails\n${p}eventlineup\n${p}eventstats\n${p}eventhighlights\n${p}eventsbyday\n${p}eventsbyround\n` +
            `${p}teamsbycountry\n${p}leaguesbycountry\n` +
            `${p}venue\n` +
            `${p}sportshelp\n\n` +
            `*🎮 𝐆𝐀𝐌𝐄𝐒*\n` +
            `${p}rps\n${p}flagguess\n${p}wordscramble\n${p}numberguess\n${p}gameshelp\n\n` +
            `*💬 𝐂𝐇𝐀𝐓*\n` +
            `${p}sendloc\n${p}sendcontact\n` +
            `${p}pin\n${p}unpin\n${p}archive\n${p}unarchive\n` +
            `${p}clearchat\n${p}markunread\n` +
            `${p}mutechat\n${p}unmutechat\n` +
            `${p}edit\n${p}forward\n${p}pinmsg\n` +
            `${p}lastseen\n${p}onlineprivacy\n${p}ppprivacy\n${p}statusprivacy\n${p}readreceipts\n${p}getprivacy\n` +
            `${p}checkwa\n${p}business\n` +
            `${p}chathelp\n\n` +
            `*⚙️ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n` +
            `${p}setprefix\n${p}setbotname\n${p}setmode\n${p}setownername\n${p}setownerphone\n` +
            `${p}setbio\n${p}autobio\n${p}setbotpic\n${p}removepp\n` +
            `${p}block\n${p}unblock\n${p}listblocked\n` +
            `${p}blacklist\n${p}whitelist\n${p}muteuser\n${p}unmuteuser\n${p}warnuser\n${p}resetwarns\n` +
            `${p}autoreact\n${p}autoread\n${p}autoviewonce\n` +
            `${p}antidelete\n${p}antiedit\n${p}anticall\n${p}antideletestatus\n${p}antilink\n${p}antilinkaction\n${p}antitag\n` +
            `${p}autoviewstatus\n${p}autoreactstatus\n${p}autodownloadstatus\n${p}setstatusemoji\n` +
            `${p}presencepm\n${p}presencegroup\n${p}autotyping\n${p}autorecording\n` +
            `${p}setdefaultdisappear\n${p}resetsettings\n${p}setlanguage\n${p}theme\n${p}buttons\n` +
            `${p}awaymode\n${p}setawaymessage\n${p}awaystatus\n` +
            `${p}chatbot\n${p}aimode\n${p}features\n` +
            `${p}mypic\n${p}myabout\n${p}userinfo\n${p}listmuted\n${p}listblacklist\n${p}listwhitelist\n` +
            `${p}statuscheck\n${p}statushelp\n${p}settings\n${p}privacysettings\n${p}newsletter\n` +
            `${p}settingshelp\n\n` +
            `*📊 𝐈𝐍𝐅𝐎*\n` +
            `${p}ping\n${p}uptime\n${p}info\n${p}status\n${p}debug\n${p}tracker\n${p}apistatus\n${p}mediastatus\n` +
            `${p}owner\n${p}vv\n\n` +
            `*📋 𝐎𝐓𝐇𝐄𝐑*\n` +
            `${p}vcf\n${p}vcfme\n${p}megamenu\n${p}style\n${p}translate\n` +
            `${p}pdf\n${p}invoice\n${p}newsletter\n${p}teststyle\n\n` +
            `📡 *Megan APIs v3.6.4*\n` +
            `⚡ *${bot.commands.size} commands loaded*\n\n${FOOTER}`;

        await replyStyled(sock, from, menu, msg, {
            title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞',
            useNewsletter: true,
            newsletterName: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
            largeThumb: true,
            buttons: [BUTTONS.channel, BUTTONS.group]
        });
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 3. INFO
// ═══════════════════════════════════════════
commands.push({
    name: 'info', description: 'Show bot information',
    aliases: ['bot', 'about'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const now = moment().tz(config.TIMEZONE || 'Africa/Nairobi');
        const uptime = process.uptime();
        const d = Math.floor(uptime / 86400);
        const h = Math.floor((uptime % 86400) / 3600);
        const totalMem = (os.totalmem() / 1073741824).toFixed(2);
        const freeMem = (os.freemem() / 1073741824).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const awayMode = await bot.db?.getSetting('awaymode', 'off') || 'off';
        
        const text = `╔══════════════════════╗\n` +
            `║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n` +
            `╚══════════════════════╝\n\n` +
            `│ 👤 *Tracker Wanga*\n` +
            `│ 📞 *254119387715*\n` +
            `│ 🤖 *${config.BOT_NAME}* v3.6.4\n` +
            `│ 🔧 Prefix: *${config.PREFIX}*\n` +
            `│ 🟣 Away: *${awayMode === 'on' ? '✅ ON' : '❌ OFF'}*\n` +
            `│ 📚 Commands: *${bot.commands.size}*\n` +
            `│ ⏱️ Uptime: *${d}d ${h}h*\n` +
            `│ 🕐 ${now.format('h:mm A - DD/MM/YYYY')}\n` +
            `│ 💾 RAM: *${usedMem}GB / ${totalMem}GB*\n` +
            `│ 💻 *${process.platform}*\n` +
            `│ ⚡ *Node ${process.version}*\n` +
            `│ 📡 *Megan APIs v3.6.4*\n` +
            `╰──────────────────◇\n${FOOTER}`;

        await replyStyled(sock, from, text, msg, {
            title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞',
            useNewsletter: true,
            newsletterName: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
            buttons: [BUTTONS.channel, BUTTONS.group]
        });
        await react('✅');
    }
});

// ═══════════════════════════════════════════
// 4. UPTIME | 5. OWNER | 6. STATUS | 7. API STATUS | 8. TRACKER | 9. DEBUG
// ═══════════════════════════════════════════

commands.push({
    name: 'uptime', description: 'Show bot uptime', aliases: ['runtime'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const uptime = process.uptime();
        const d = Math.floor(uptime / 86400), h = Math.floor((uptime % 86400) / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
        const text = `╔══════════════════════╗\n║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n╚══════════════════════╝\n\n│ ⏱️ *${d}d ${h}h ${m}m ${s}s*\n╰──────────────────◇\n${FOOTER}`;
        await replyStyled(sock, from, text, msg, { title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞', useNewsletter: true, buttons: [BUTTONS.channel] });
        await react('✅');
    }
});

commands.push({
    name: 'owner', description: 'Show owner information', aliases: ['creator', 'dev'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const text = `╔══════════════════════╗\n║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n╚══════════════════════╝\n\n│ 👑 *Tracker Wanga*\n│ 📞 *254119387715*\n│ 🌍 *Kenya 🇰🇪*\n│ 🤖 *${config.BOT_NAME}* v3.6.4\n│ 📡 *Megan APIs*\n╰──────────────────◇\n${FOOTER}`;
        await replyStyled(sock, from, text, msg, { title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞', useNewsletter: true, buttons: [BUTTONS.channel] });
        await react('✅');
    }
});

commands.push({
    name: 'status', description: 'Show bot status', aliases: ['stats'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const uptime = process.uptime();
        const d = Math.floor(uptime / 86400), h = Math.floor((uptime % 86400) / 3600), m = Math.floor((uptime % 3600) / 60);
        const mem = Math.round(process.memoryUsage().heapUsed / 1048576);
        const awayMode = await bot.db?.getSetting('awaymode', 'off') || 'off';
        const chatbot = await bot.db?.getSetting('chatbot', 'off') || 'off';
        const text = `╔══════════════════════╗\n║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n╚══════════════════════╝\n\n│ ⏱️ *${d}d ${h}h ${m}m*\n│ 💾 *${mem}MB*\n│ 📚 *${bot.commands.size} commands*\n│ 🟣 Away: *${awayMode === 'on' ? '✅ ON' : '❌ OFF'}*\n│ 💬 Chatbot: *${chatbot}*\n│ ⚡ *Node ${process.version}*\n╰──────────────────◇\n${FOOTER}`;
        await replyStyled(sock, from, text, msg, { title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞', useNewsletter: true, buttons: [BUTTONS.channel] });
        await react('✅');
    }
});

commands.push({
    name: 'apistatus', description: 'Check API server status', aliases: ['serverstatus'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        await react('🖥️');
        try {
            const axios = require('axios');
            const dev = require('../../megan/lib/developer');
            const res = await axios.get(`${dev.API_BASE}/api/status`, { params: { apikey: dev.API_KEY }, timeout: 15000 });
            const s = res.data?.result || res.data || {};
            let text = `╔══════════════════════╗\n║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n╚══════════════════════╝\n\n`;
            if (s.uptime_formatted) text += `│ ⏱️ ${s.uptime_formatted}\n`;
            if (s.status) text += `│ ✅ ${s.status}\n`;
            if (s.memory?.heap_used_mb) text += `│ 💾 ${s.memory.heap_used_mb}MB\n`;
            if (s.platform) text += `│ 💻 ${s.platform}\n`;
            text += `╰──────────────────◇\n${FOOTER}`;
            await replyStyled(sock, from, text, msg, { title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞', useNewsletter: true, buttons: [BUTTONS.channel] });
            await react('✅');
        } catch (e) { await react('❌'); await reply(`❌ *API may be waking up*\n\n${FOOTER}`); }
    }
});

commands.push({
    name: 'tracker', description: 'Show database statistics', aliases: ['dbstats'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        try {
            const stats = bot.db?.getStats ? bot.db.getStats() : { totalCommands: 0, totalUsers: 0, totalGroups: 0 };
            const text = `╔══════════════════════╗\n║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n╚══════════════════════╝\n\n│ 📨 ${stats.totalCommands}\n│ 👥 ${stats.totalUsers}\n│ 👥 ${stats.totalGroups}\n╰──────────────────◇\n${FOOTER}`;
            await replyStyled(sock, from, text, msg, { title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞', useNewsletter: true, buttons: [BUTTONS.channel] });
        } catch (e) { await reply(`❌ Error\n\n${FOOTER}`); }
        await react('✅');
    }
});

commands.push({
    name: 'debug', description: 'Show debug information', aliases: ['diagnose'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const uptime = process.uptime();
        const d = Math.floor(uptime / 86400), h = Math.floor((uptime % 86400) / 3600), m = Math.floor((uptime % 3600) / 60);
        const text = `╔══════════════════════╗\n║   🤖 𝐌𝐄𝐆𝐀𝐍-𝐏𝐑𝐈𝐌𝐄    ║\n╚══════════════════════╝\n\n│ 🤖 ${config.BOT_NAME}\n│ 🔧 Prefix: ${config.PREFIX}\n│ ⏱️ ${d}d ${h}h ${m}m\n│ ⚡ Node ${process.version}\n│ 💻 ${process.platform}\n│ 📚 ${bot.commands.size}\n│ 🆔 PID: ${process.pid}\n╰──────────────────◇\n${FOOTER}`;
        await replyStyled(sock, from, text, msg, { title: '𝐌𝐞𝐠𝐚𝐧 𝐏𝐫𝐢𝐦𝐞', useNewsletter: true, buttons: [BUTTONS.channel] });
        await react('✅');
    }
});

module.exports = { commands };
