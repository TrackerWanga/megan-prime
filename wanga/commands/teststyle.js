// ╔══════════════════════════════════════════════════╗
// ║  TEST NEWSLETTER STYLING                         ║
// ║  Owner only - tests all styling variants         ║
// ╚══════════════════════════════════════════════════╝

const { replyStyled, replyAI, replyMenu, replyStatus, BUTTONS, createNewsletterContext } = require('../../megan/lib/styler');
const config = require('../../megan/config');
const FOOTER = '> Megan-Prime | Style Test';

const commands = [];

commands.push({
    name: 'teststyle',
    description: 'Test all newsletter styling variants (Owner Only)',
    aliases: ['styletest', 'testnl'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isOwner }) {
        if (!isOwner) return reply(`❌ *Owner Only*\n\n${FOOTER}`);

        const testType = args[0] || 'all';
        await react('🎨');

        // Test 1: Basic styled reply with channel button
        if (testType === 'all' || testType === '1') {
            await replyStyled(sock, from, `✨ *Styled Reply Test*\n\nThis is a basic styled message with:\n• Newsletter header\n• Channel button\n• Footer branding\n\n✅ If you see this with a forwarded header and button below, styling works!`, msg, {
                title: 'Megan-Prime Styler',
                footer: '> Megan-Prime | Style Test',
                useNewsletter: true,
                newsletterName: '𝐌𝐄𝐆𝐀𝐍-𝐗𝐌𝐃',
                largeThumb: false,
                buttons: [BUTTONS.channel]
            });
            await new Promise(r => setTimeout(r, 1500));
        }

        // Test 2: AI response with code detection
        if (testType === 'all' || testType === '2') {
            await replyAI(sock, from, `Here's a Python function to calculate factorial:\n\n\`\`\`python\ndef factorial(n):\n    if n <= 1: return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # Output: 120\n\`\`\`\n\nThis uses recursion. The time complexity is O(n).`, msg, {
                title: '🤖 CodeLlama Response'
            });
            await new Promise(r => setTimeout(r, 1500));
        }

        // Test 3: Menu with quick reply buttons
        if (testType === 'all' || testType === '3') {
            await replyMenu(sock, from, `📋 *Menu Test*\n\nThis is a menu with:\n• Quick reply buttons\n• Channel button\n• Group button\n\nTap a button below!`, msg, [
                { label: '🤖 AI Chat', id: 'cmd_.megan Hello' },
                { label: '🎨 Effects', id: 'cmd_.ephoto' },
                { label: '📥 Download', id: 'cmd_.downloaderhelp' }
            ]);
            await new Promise(r => setTimeout(r, 1500));
        }

        // Test 4: Status messages
        if (testType === 'all' || testType === '4') {
            await replyStatus(sock, from, 'Success message test!', msg, 'success');
            await new Promise(r => setTimeout(r, 1000));
            await replyStatus(sock, from, 'Error message test!', msg, 'error');
            await new Promise(r => setTimeout(r, 1000));
            await replyStatus(sock, from, 'Info message test!', msg, 'info');
            await new Promise(r => setTimeout(r, 1500));
        }

        // Test 5: Full newsletter context (raw)
        if (testType === 'all' || testType === '5') {
            const context = createNewsletterContext(from, {
                title: 'Raw Context Test',
                newsletterName: '𝐌𝐄𝐆𝐀𝐍 𝐓𝐄𝐒𝐓',
                largeThumb: true
            });
            await sock.sendMessage(from, {
                text: `📰 *Raw Newsletter Context Test*\n\nThis uses createNewsletterContext() directly.\n\n• Forwarded appearance\n• Large thumbnail\n• Newsletter header\n• Source attribution\n\n✅ Works!`,
                ...context
            }, { quoted: msg });
        }

        await reply(`🎨 *Style Test Complete!*\n\nTested: ${testType === 'all' ? 'All 5 variants' : `Variant ${testType}`}\n\nCheck the messages above:\n1. Basic styled + button\n2. AI response + copy code button\n3. Menu + quick replies\n4. Success/Error/Info\n5. Raw newsletter context\n\n${FOOTER}`);
    }
});

module.exports = { commands };
