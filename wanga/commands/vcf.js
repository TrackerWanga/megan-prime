// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME VCF - Export Group Contacts        ║
// ║  Powered by Megan-Prime | Tracker Wanga          ║
// ╚══════════════════════════════════════════════════╝

const config = require('../../megan/config');
const fs = require('fs-extra');
const path = require('path');
const { resolveRealJid } = require('../../megan/lib/lidResolver');

const TEMP_DIR = path.join(__dirname, '../../temp');
const FOOTER = '> Megan-Prime | VCF Exporter | TrackerWanga';

fs.ensureDirSync(TEMP_DIR);

const commands = [];

// Name resolution simplified - uses phone numbers (most reliable for VCF import)

function extractPhoneNumber(jid) {
    // Real WhatsApp JIDs: 254712345678@s.whatsapp.net → 254712345678
    // LIDs are long numeric strings that can't be phone numbers
    let num = jid.replace(/@.*$/, '');
    
    // Valid phone numbers are 9-15 digits
    // LIDs are typically 15+ digits and can't be real phone numbers
    if (num.length <= 15 && num.length >= 9) {
        return num;
    }
    return null; // Not a valid phone number
}

function generateVCF(contacts, groupName) {
    let vcf = '';
    for (const contact of contacts) {
        vcf += 'BEGIN:VCARD\n';
        vcf += 'VERSION:3.0\n';
        vcf += `FN:${contact.name}\n`;
        if (contact.phone) {
            vcf += `TEL;TYPE=CELL:+${contact.phone}\n`;
        }
        if (contact.name) {
            vcf += `ORG:${groupName}\n`;
        }
        vcf += `NOTE:Exported by Megan-Prime Bot\n`;
        vcf += 'END:VCARD\n';
    }
    return vcf;
}

commands.push({
    name: 'vcf',
    description: 'Export all group contacts to VCF file',
    aliases: ['contacts', 'exportcontacts', 'vcards', 'savecontacts', 'groupvcf'],
    async execute({ msg, from, sender, args, bot, sock, react, reply, isGroup, resolveRealJid: ctxResolveJid }) {
        if (!isGroup) {
            return reply(`❌ *Group Only!*\n\nThis command exports all members of a group as a VCF contact file.\n\n${FOOTER}`);
        }
        
        await react('📇');
        
        try {
            const metadata = await sock.groupMetadata(from);
            if (!metadata || !metadata.participants) {
                await react('❌');
                return reply(`❌ *Failed to get group members*\n\n${FOOTER}`);
            }
            
            const participants = metadata.participants;
            const groupName = metadata.subject || 'Group';
            
            await reply(`📇 *Exporting ${participants.length} contacts from "${groupName}"...*\n\n⏳ Resolving phone numbers...\n\n${FOOTER}`);
            
            const contacts = [];
            let resolvedCount = 0;
            
            for (let i = 0; i < participants.length; i++) {
                const p = participants[i];
                const rawJid = p.id;
                
                // Resolve LID → real JID
                let resolvedJid = rawJid;
                try {
                    resolvedJid = await ctxResolveJid(rawJid);
                } catch(e) {
                    resolvedJid = rawJid;
                }
                
                // Extract phone number from resolved JID
                const phone = extractPhoneNumber(resolvedJid);
                if (phone) resolvedCount++;
                
                // Get display name
                const name = await resolveName(sock, resolvedJid, i + 1, metadata, p);
                
                contacts.push({ name, phone, jid: resolvedJid });
            }
            
            // Generate VCF (only include contacts with valid phone numbers)
            const validContacts = contacts.filter(c => c.phone);
            const skippedCount = contacts.length - validContacts.length;
            
            const vcfContent = generateVCF(validContacts, groupName);
            
            const safeName = groupName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'group';
            const filename = `${safeName}_${validContacts.length}_contacts.vcf`;
            const filePath = path.join(TEMP_DIR, filename);
            fs.writeFileSync(filePath, vcfContent, 'utf8');
            
            let caption = `📇 *${groupName} Contacts*\n\n`;
            caption += `👥 ${participants.length} total members\n`;
            caption += `✅ ${validContacts.length} contacts exported\n`;
            if (skippedCount > 0) caption += `⚠️ ${skippedCount} skipped (no phone number)\n`;
            caption += `📁 ${filename}\n\n`;
            caption += `📲 *Import:* Open the .vcf file to add to contacts\n\n${FOOTER}`;
            
            await sock.sendMessage(from, {
                document: fs.readFileSync(filePath),
                mimetype: 'text/vcard',
                fileName: filename,
                caption: caption
            }, { quoted: msg });
            
            setTimeout(() => fs.unlink(filePath).catch(() => {}), 60000);
            await react('✅');
            
        } catch (error) {
            console.error('VCF error:', error);
            await react('❌');
            await reply(`❌ *Error:* ${error.message}\n\n${FOOTER}`);
        }
    }
});

commands.push({
    name: 'vcfme',
    description: 'Export yourself as VCF contact card',
    aliases: ['mycontact', 'mycard', 'contactme'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        await react('📇');
        
        try {
            const phone = extractPhoneNumber(sender);
            const name = await resolveName(sock, sender, 1);
            
            const contacts = [{ name, phone, jid: sender }];
            const vcfContent = generateVCF(contacts, 'Personal');
            
            const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_contact.vcf`;
            const filePath = path.join(TEMP_DIR, filename);
            fs.writeFileSync(filePath, vcfContent, 'utf8');
            
            let caption = `📇 *Your Contact Card*\n\n👤 ${name}`;
            if (phone) caption += `\n📞 +${phone}`;
            caption += `\n\n📲 Share this with others!\n\n${FOOTER}`;
            
            await sock.sendMessage(from, {
                document: fs.readFileSync(filePath),
                mimetype: 'text/vcard',
                fileName: filename,
                caption: caption
            }, { quoted: msg });
            
            setTimeout(() => fs.unlink(filePath).catch(() => {}), 60000);
            await react('✅');
            
        } catch (error) {
            await react('❌');
            await reply(`❌ *Error:* ${error.message}\n\n${FOOTER}`);
        }
    }
});

commands.push({
    name: 'vcfmenu',
    description: 'Show VCF export commands',
    aliases: ['vcfhelp', 'contacthelp'],
    async execute({ msg, from, sender, args, bot, sock, react, reply }) {
        const menu = `📇 *VCF CONTACT EXPORTER*

*📋 GROUP*
${config.PREFIX}vcf - Export ALL group members to VCF
  → Works in groups only
  → Resolves LIDs to real phone numbers
  → Only exports valid phone numbers
  → Fallback name: MeganTech001+

*👤 PERSONAL*
${config.PREFIX}vcfme - Create your VCF card
  → Works anywhere (DM or group)

*📲 HOW TO IMPORT*
1. Download the .vcf file
2. Open it on your phone
3. All contacts import automatically

> Megan-Prime | VCF Exporter | TrackerWanga`;

        await reply(menu);
        await react('📇');
    }
});

module.exports = { commands };
