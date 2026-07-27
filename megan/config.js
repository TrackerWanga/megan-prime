// Megan-Prime Configuration
// Loads config.env (settings) + .env (secrets)

const path = require('path');
const fs = require('fs');

// Parse env file manually (dotenv only loads one file)
function parseEnvFile(filepath) {
    if (!fs.existsSync(filepath)) return {};
    const content = fs.readFileSync(filepath, 'utf8');
    const result = {};
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.substring(0, eq).trim();
        let value = trimmed.substring(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        result[key] = value;
    }
    return result;
}

// Load settings from config.env
const settings = parseEnvFile(path.join(__dirname, '..', 'config.env'));

// Load secrets from .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const config = {
    // Bot Identity
    BOT_NAME: settings.BOT_NAME || process.env.BOT_NAME || 'Megan-Prime',
    OWNER_NAME: settings.OWNER_NAME || process.env.OWNER_NAME || 'TrackerWanga',
    OWNER_NUMBER: settings.OWNER_NUMBER || process.env.OWNER_NUMBER || '',
    PREFIX: settings.PREFIX || process.env.PREFIX || '.',
    MODE: settings.MODE || process.env.MODE || 'public',
    TIMEZONE: settings.TIMEZONE || process.env.TIMEZONE || 'Africa/Nairobi',

    // Session
    SESSION: process.env.SESSION || '',

    // Megan Auth
    MEGAN_EMAIL: process.env.MEGAN_EMAIL || '',
    MEGAN_PASSWORD: process.env.MEGAN_PASSWORD || '',

    // Features
    FEATURES: {
        ANTI_DELETE: settings.ANTI_DELETE || process.env.ANTI_DELETE || 'on',
        ANTI_CALL: settings.ANTI_CALL || process.env.ANTI_CALL || 'off',
        AUTO_READ: settings.AUTO_READ || process.env.AUTO_READ || 'off',
        AUTO_REACT: settings.AUTO_REACT || process.env.AUTO_REACT || 'off',
        CHATBOT: settings.CHATBOT || process.env.CHATBOT || 'off',
        AWAY_MODE: settings.AWAY_MODE || process.env.AWAY_MODE || 'off',
        AWAY_MESSAGE: settings.AWAY_MESSAGE || process.env.AWAY_MESSAGE || 'I am currently away.',
    },

    // Database
    DATABASE: {
        ENABLED: (settings.DATABASE_ENABLED || process.env.DATABASE_ENABLED || 'true') !== 'false',
        STORAGE: settings.DATABASE_PATH || process.env.DATABASE_PATH || './database.sqlite',
    },

    // Dashboard
    DASHBOARD_PORT: parseInt(settings.DASHBOARD_PORT || process.env.DASHBOARD_PORT || '3000'),

    // Footer
    LOG_LEVEL: process.env.LOG_LEVEL || 'silent',
    FOOTER: '© Megan-Prime | TrackerWanga',

    // Status
    CACHE: {
        MESSAGES: true,
        STORE_MESSAGES: true,
        MAX_STORE: 200,
        CLEANUP_INTERVAL: 30000
    },

    STATUS: {
        AUTO_VIEW: true,
        AUTO_REACT: true,
        AUTO_DOWNLOAD: false,
        REACT_EMOJIS: '💛,❤️,💜,🤍,💙,👍,🔥',
    },
};

config.getOwnerJid = function() {
    return this.OWNER_NUMBER.includes('@') ? this.OWNER_NUMBER : `${this.OWNER_NUMBER}@s.whatsapp.net`;
};

module.exports = config;
