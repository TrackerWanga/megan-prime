// Uses megan-baileys for the socket connection
const { default: makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } = require('megan-baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

async function createGiftedCompatibleSocket(credsData, extraConfig = {}) {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`   • WA Version (megan-baileys): ${version.join('.')}`);

    const sessionDir = path.join(process.cwd(), 'sessions');
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(credsData));

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        ...extraConfig,
    });

    sock.ev.on('creds.update', saveCreds);
    return sock;
}

module.exports = { createGiftedCompatibleSocket };
