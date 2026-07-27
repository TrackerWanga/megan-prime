// Megan-Prime Connection Manager
const { DisconnectReason } = require('megan-baileys');
const { Boom } = require('@hapi/boom');
const config = require('../config');

class ConnectionManager {
    constructor(bot, logger) {
        this.bot = bot;
        this.logger = logger;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.startTime = Date.now();
        this.maxReconnectAttempts = 10;
        this.reconnectInterval = 1000;
        this.reconnectBackoff = true;
    }

    handleUpdate(update, sock) {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'connecting') {
            this.logger.connection('Connecting to WhatsApp...');
        }
        
        if (connection === 'open') {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.logger.success('Connected successfully!');
            return;
        }
        
        if (connection === 'close') {
            this.isConnected = false;
            let statusCode = 500;
            if (lastDisconnect?.error instanceof Boom) {
                statusCode = lastDisconnect.error.output?.statusCode;
            }
            
            console.log(`   📴 Connection closed (status: ${statusCode})`);
            
            if (statusCode === DisconnectReason.loggedOut) {
                this.logger.error('Session expired! Get a new session from MEGAN MD.');
                process.exit(1);
            }
            
            // Don't reconnect for certain status codes
            if (statusCode === 401) {
                this.logger.error('Auth failed (401). Session may be invalid.');
                process.exit(1);
            }
            
            if (statusCode === 403) {
                this.logger.error('Access denied (403). Bot may be banned.');
                process.exit(1);
            }
            
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        let delay = this.reconnectInterval;
        if (this.reconnectBackoff) {
            delay = Math.min(
                this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
                30000
            );
        }
        
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Max reconnection attempts reached. Exiting...');
            process.exit(1);
        }
        
        console.log(`   🔄 Reconnecting in ${delay/1000}s (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.bot.connect(), delay);
    }

    getStatus() {
        return {
            connected: this.isConnected,
            uptime: this.getUptime(),
            reconnectAttempts: this.reconnectAttempts
        };
    }

    getUptime() {
        const uptime = (Date.now() - this.startTime) / 1000;
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
}

module.exports = ConnectionManager;
