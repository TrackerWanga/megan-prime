// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME PDF GENERATOR                      ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga   ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');
const fs = require('fs-extra');
const path = require('path');

const API_BASE = require('../../megan/lib/developer').API_BASE;
const API_KEY = require('../../megan/lib/developer').API_KEY;
const FOOTER = '> Megan-Prime | PDF Tools | TrackerWanga';
const TEMP_DIR = path.join(__dirname, '../../temp');
fs.ensureDirSync(TEMP_DIR);

const commands = [];

async function apiPost(endpoint, data = {}, timeout = 60000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.post(url, data, {
        params: { apikey: API_KEY },
        timeout,
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
}

async function sendBase64AsPdf(sock, from, base64, filename, caption, quoted) {
    const filePath = path.join(TEMP_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    await sock.sendMessage(from, {
        document: fs.readFileSync(filePath),
        mimetype: 'application/pdf',
        fileName: filename,
        caption
    }, { quoted });
    setTimeout(() => fs.unlink(filePath).catch(() => {}), 60000);
}

// ═══════════════════════════════════════════
// PDF GENERATE
// ═══════════════════════════════════════════

commands.push({
    name: 'pdf',
    description: 'Generate a PDF document from text',
    aliases: ['makepdf', 'pdfgen', 'createpdf'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`📄 *PDF GENERATOR*\n\n*Usage:* ${config.PREFIX}pdf <title> | <content>\n*Example:* ${config.PREFIX}pdf My Notes | This is my document\n\n${FOOTER}`);
        await react('📄');
        
        const fullText = args.join(' ');
        const parts = fullText.split('|').map(s => s.trim()).filter(Boolean);
        const title = parts[0] || 'Document';
        const content = parts[1] || (parts.length === 1 ? parts[0] : 'No content');
        
        try {
            const data = await apiPost('/api/tools/generate-pdf', {
                title,
                content,
                type: 'document'
            });
            
            if (data.success && data.base64) {
                const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                await sendBase64AsPdf(sock, from, data.base64, filename, 
                    `📄 *PDF Generated*\n📝 ${title}\n📁 ${filename}\n\n${FOOTER}`, msg);
                await react('✅');
            } else {
                await reply(`❌ *Failed:* ${data.error || 'Unknown error'}\n\n${FOOTER}`);
                await react('❌');
            }
        } catch(e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// INVOICE GENERATE
// ═══════════════════════════════════════════

commands.push({
    name: 'invoice',
    description: 'Generate a PDF invoice',
    aliases: ['makeinvoice', 'bill', 'receipt'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        if (!args.length) return reply(`🧾 *INVOICE GENERATOR*\n\n*Usage:* ${config.PREFIX}invoice from=<you> to=<client> item=<name>:<price> total=<amount>\n*Example:* ${config.PREFIX}invoice from=Megan to=John item=Service:500 total=500\n\n${FOOTER}`);
        await react('🧾');
        
        const params = {};
        args.forEach(a => {
            const [k, ...v] = a.split('=');
            if (k && v.length) params[k.trim()] = v.join('=').trim();
        });
        
        const items = [];
        if (params.item) {
            const [name, price] = params.item.split(':');
            items.push({ name: name?.trim() || 'Item', price: parseFloat(price) || 0 });
            delete params.item;
        }
        
        try {
            const data = await apiPost('/api/tools/generate-invoice', {
                from: params.from || 'Megan Tech',
                to: params.to || 'Client',
                items: items.length ? items : [{ name: 'Service', price: parseFloat(params.total) || 100 }],
                total: parseFloat(params.total) || 100
            });
            
            if (data.success && data.base64) {
                const filename = `invoice_${Date.now()}.pdf`;
                await sendBase64AsPdf(sock, from, data.base64, filename,
                    `🧾 *Invoice Generated*\n👤 ${params.to || 'Client'}\n💰 ${params.total || '100'}\n\n${FOOTER}`, msg);
                await react('✅');
            } else {
                await reply(`❌ *Invoice failed:* ${data.error || 'Unknown'}\n\nTip: Use format: ${config.PREFIX}invoice from=M to=C item=X:100 total=100\n\n${FOOTER}`);
                await react('❌');
            }
        } catch(e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// PDF MENU
// ═══════════════════════════════════════════

commands.push({
    name: 'pdfmenu',
    description: 'Show PDF generator commands',
    aliases: ['pdfhelp'],
    async execute({ react, reply }) {
        await react('📄');
        await reply(`📄 *PDF TOOLS*\n\n${config.PREFIX}pdf <title> | <content> - Create document\n${config.PREFIX}invoice from=X to=Y item=Z:100 total=100 - Invoice\n\n> Megan-Prime | PDF Tools | TrackerWanga`);
    }
});

module.exports = { commands };
