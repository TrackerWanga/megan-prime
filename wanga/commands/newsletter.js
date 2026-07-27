// Megan-Prime Newsletter Commands

const commands = [];
const FOOTER = '> Megan-Prime | TrackerWanga';

// Newsletter follow
commands.push({
    name: 'nfollow',
    description: 'Follow a newsletter/channel',
    aliases: ['newsletterfollow', 'channelfollow'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply('❌ Owner only');
        if (!args.length) return reply(`📰 *FOLLOW NEWSLETTER*\n\nUsage: .nfollow <newsletter JID>\nExample: .nfollow 120363423611305810@newsletter\n\n${FOOTER}`);
        
        await react('📰');
        try {
            await sock.newsletterFollow(args[0]);
            await reply(`✅ Followed: ${args[0]}\n\n${FOOTER}`);
        } catch(e) {
            await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`);
        }
    }
});

// Newsletter react
commands.push({
    name: 'nreact',
    description: 'React to a newsletter message',
    aliases: ['newsletterreact'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply('❌ Owner only');
        if (args.length < 2) return reply(`❤️ *REACT TO NEWSLETTER*\n\nUsage: .nreact <newsletter JID> <message ID> <emoji>\nExample: .nreact 120363xxx@newsletter A5B3C... ❤️\n\n${FOOTER}`);
        
        await react('❤️');
        try {
            await sock.sendMessage(args[0], {
                react: { key: { remoteJid: args[0], id: args[1], fromMe: false }, text: args[2] || '❤️' }
            });
            await reply(`✅ Reacted to ${args[1]}\n\n${FOOTER}`);
        } catch(e) {
            await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`);
        }
    }
});

// Newsletter info
commands.push({
    name: 'ninfo',
    description: 'Get newsletter/channel info',
    aliases: ['newsletterinfo', 'channelinfo'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply('❌ Owner only');
        if (!args.length) return reply(`📰 *NEWSLETTER INFO*\n\nUsage: .ninfo <newsletter JID>\n\n${FOOTER}`);
        
        await react('📰');
        try {
            const info = await sock.newsletterGetInfo(args[0]);
            if (info) {
                const text = `📰 *NEWSLETTER INFO*\n\nName: ${info.name || 'Unknown'}\nDescription: ${info.description || 'None'}\nSubscribers: ${info.subscriber_count || 'N/A'}\n\n${FOOTER}`;
                await reply(text);
            } else {
                await reply(`Could not fetch info for ${args[0]}\n\n${FOOTER}`);
            }
        } catch(e) {
            await reply(`❌ Failed: ${e.message}\n\n${FOOTER}`);
        }
    }
});

// List auto-followed newsletters
commands.push({
    name: 'nlist',
    description: 'List auto-followed newsletters',
    aliases: ['newsletters', 'channels'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply('❌ Owner only');
        const newsletters = bot.config.NEWSLETTERS || [];
        const groups = bot.config.GROUP_INVITES || [];
        
        let text = `📰 *AUTO-FOLLOW LIST*\n\n`;
        text += `*Newsletters (${newsletters.length}):*\n`;
        newsletters.forEach((n, i) => text += `${i + 1}. ${n}\n`);
        text += `\n*Groups (${groups.length}):*\n`;
        groups.forEach((g, i) => text += `${i + 1}. ${g}\n`);
        text += `\n${FOOTER}`;
        
        await reply(text);
        await react('📋');
    }
});

module.exports = { commands };
