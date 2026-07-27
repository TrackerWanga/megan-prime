// Megan-Prime Newsletter Handler
// Send messages, react, follow, unfollow newsletters

class NewsletterHandler {
    constructor(sock) {
        this.sock = sock;
    }

    async follow(jid) {
        return await this.sock.newsletterFollow(jid);
    }

    async unfollow(jid) {
        // Query to unfollow
        return await this.sock.query({
            tag: 'iq',
            attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { query_id: '7238632346214362' },
                content: Buffer.from(JSON.stringify({ variables: { newsletter_id: jid } }))
            }]
        });
    }

    async react(jid, messageId, emoji) {
        return await this.sock.sendMessage(jid, {
            react: { key: { remoteJid: jid, id: messageId, fromMe: false }, text: emoji }
        });
    }

    async sendText(jid, text) {
        const { proto, generateMessageTag } = require('@whiskeysockets/baileys');
        return await this.sock.query({
            tag: 'message',
            attrs: { to: jid, type: 'text' },
            content: [{
                tag: 'plaintext',
                attrs: {},
                content: proto.Message.encode(proto.Message.fromObject({ conversation: text })).finish()
            }]
        });
    }

    async sendMedia(jid, media, caption = '') {
        const { proto, generateWAMessageContent } = require('@whiskeysockets/baileys');
        const msg = await generateWAMessageContent(media, { upload: this.sock.waUploadToServer });
        return await this.sock.query({
            tag: 'message',
            attrs: { to: jid, type: 'media' },
            content: [{
                tag: 'plaintext',
                attrs: { mediatype: Object.keys(media).find(k => ['image','video','audio','sticker'].includes(k)) || null },
                content: proto.Message.encode(msg).finish()
            }]
        });
    }

    async getInfo(jid) {
        const { proto } = require('@whiskeysockets/baileys');
        const result = await this.sock.query({
            tag: 'iq',
            attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { query_id: '6563316087068696' },
                content: Buffer.from(JSON.stringify({
                    variables: {
                        fetch_creation_time: true,
                        fetch_full_image: true,
                        fetch_viewer_metadata: false,
                        input: { key: jid, type: 'JID' }
                    }
                }))
            }]
        });
        try {
            return JSON.parse(result.content[0].content)?.data?.xwa2_newsletter;
        } catch { return null; }
    }

    async create(name, description = '', picture = null) {
        const { proto } = require('@whiskeysockets/baileys');
        const result = await this.sock.query({
            tag: 'iq',
            attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { query_id: '6234210096708695' },
                content: Buffer.from(JSON.stringify({
                    variables: { newsletter_input: { name, description, picture } }
                }))
            }]
        });
        try {
            return JSON.parse(result.content[0].content)?.data?.xwa2_newsletter_create;
        } catch { return null; }
    }
}

module.exports = NewsletterHandler;
