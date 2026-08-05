// Megan-Prime - With AutoPilot Away Mode System
// Created by TrackerWanga

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    isJidGroup,
    DisconnectReason,
    downloadMediaMessage
} = require('megan-baileys');

const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const dotenv = require('dotenv');
const { Boom } = require('@hapi/boom');
const axios = require('axios');

dotenv.config();

// ═══ CLEAN STARTUP ═══
const { startup, banner } = require('./megan/lib/startup');
let _started = false;

// Import modules
const config = require('./megan/config');
const { createLogger } = require('./megan/logger');
const DatabaseManager = require('./megan/lib/database');
const SimpleMemory = require('./megan/lib/simpleMemory');
const CacheManager = require('./megan/lib/cache');
const MessageStore = require('./megan/lib/messageStore');
const EventHandler = require('./megan/events/handler');
const { setupGroupEvents } = require('./megan/lib/events');
const MessageHelper = require('./megan/lib/message');
const MediaProcessor = require('./megan/lib/mediaProcessor');
const StatusHandler = require('./megan/lib/statusHandler');
const AutoReactHandler = require('./megan/lib/autoReact');
const LidResolver = require('./megan/lib/lidResolver').LidResolver;
const Buttons = require('./megan/lib/buttons');
const timeUtils = require('./megan/lib/timeUtils');
const { handleViewOnce } = require('./megan/lib/viewOnceHandler');
const { handleAntiLink } = require('./megan/lib/antiLink');
const AutoPilot = require('./megan/lib/autoPilot');
const TaskScheduler = require('./megan/lib/taskScheduler');
const BotAPI = require('./megan/lib/botApi');
const AutoCleaner = require('./megan/lib/autoCleaner');
const ButtonHandler = require('./megan/lib/buttonHandler');
const Dashboard = require('./megan/lib/dashboard');

class MeganPrime {
    constructor() {
        this.config = config;
        this.logger = createLogger(config.BOT_NAME);
        this.cache = new CacheManager(this.logger);
        this.messageStore = null;
        this.db = null;
        this.memory = new SimpleMemory();
        this.media = new MediaProcessor();
        this.autoReact = null;
        this.lidResolver = null;
        this.sock = null;
        this.commands = new Map();
        this.aliases = new Map();
        this.ownerJid = null;
        this.ownerLid = null;
        this.autoPilot = null;
        this.taskScheduler = null;
        this.botApi = new BotAPI(this);
        this.messageBuffer = [];
        
        this.lastMessageSync = Date.now();
        this.meganUser = null;
        this.buttonHandler = null;
        this.autoCleaner = null;
        this.createRequiredFolders();
    }

    createRequiredFolders() {
        const folders = ['./sessions', './temp', './database', './logs', './megan/temp', './ai_memories'];
        folders.forEach(folder => {
            try { fs.ensureDirSync(folder); } catch (error) {}
        });
    }

    async initialize() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║        Megan-Prime BOT INITIALIZATION                      ║');
        console.log('║        AutoPilot Away Mode System                          ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        try {
            console.log('🔐 [1/8] Loading WhatsApp session...');
            await this.setupSession();
            console.log('✅ [1/8] Session loaded successfully\n');
            if (config.MEGAN_EMAIL && config.MEGAN_PASSWORD) {
                console.log('🔐 [AUTH] Logging in as', config.MEGAN_EMAIL);
                try {
                    const r = await axios.post('https://auth.megan.qzz.io/auth/login', {
                        email: config.MEGAN_EMAIL, password: config.MEGAN_PASSWORD
                    });
                    if (r.data.success) {
                        this.meganUser = r.data.user;
                        console.log('✅ [AUTH] Logged in:', this.meganUser.username);
                        if (this.botApi) { this.botApi.init(this.meganUser); this.botApi.startHeartbeat(); }
                    }
                } catch(e) { console.log('⚠️ [AUTH] Failed:', e.message); }
            }

            console.log('🗄️  [2/8] Initializing database...');
            this.db = new DatabaseManager();
            await this.db.initialize();
            console.log('✅ [2/8] Database ready\n');

            console.log('💾 [3/8] Initializing message store...');
            this.messageStore = new MessageStore();
            this.messageStore.setDatabase(this.db);
            console.log('✅ [3/8] Message store ready\n');

            console.log('📚 [4/8] Loading commands...');
            await this.loadCommands();
            console.log(`✅ [4/8] Loaded ${this.commands.size} commands\n`);

            console.log('🎮 [5/8] Initializing handlers...');
            this.autoReact = new AutoReactHandler(this);
            this.lidResolver = new LidResolver(this);
            this.buttonHandler = new ButtonHandler(this);

            // Register movie picker handler
            this.buttonHandler.register('moviepick_', async (id, from, sender, msg, bot) => {
                const subjectId = id.replace('moviepick_', '');
                const search = global.movieSearches?.[from];
                if (!search || Date.now() - search.timestamp > 300000) {
                    await bot.sock.sendMessage(from, { text: 'Search expired. Please search again.' }, { quoted: msg });
                    return;
                }
                const movie = search.results.find(m => 
                    (m.subject_id || m.detail_path || m.id) === subjectId ||
                    search.results.indexOf(m).toString() === subjectId
                );
                if (!movie) {
                    await bot.sock.sendMessage(from, { text: 'Movie not found. Please search again.' }, { quoted: msg });
                    return;
                }
                const detailPath = movie.detail_path || movie.slug || movie.id || movie.subject_id;
                try {
                    const axios = require('axios');
                    const res = await axios.get(`https://movieapi.megan.qzz.io/api/movie/${detailPath}`, { timeout: 30000 });
                    const d = res.data?.data || res.data;
                    const poster = typeof d.poster === 'string' ? d.poster : d.poster?.url || '';
                    const text = `🎬 *${d.title}* (${d.year})\n⭐ ${d.rating} | 🎭 ${(d.genres||[]).join(', ')}\n📝 ${(d.description||'').substring(0, 200)}...\n\n📡 Megan Movie API\n${FOOTER}`;
                    
                    if (poster) {
                        await bot.sock.sendMessage(from, { image: { url: poster }, caption: text }, { quoted: msg });
                    }
                    
                    // Send download/stream buttons
                    const btns = [];
                    btns.push({ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '📥 Download', url: `https://movieapi.megan.qzz.io/api/movie/${detailPath}/download?detail_path=${encodeURIComponent(detailPath)}` }) });
                    btns.push({ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '▶️ Stream', url: `https://movies.megan.qzz.io/series/${detailPath}` }) });
                    btns.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔍 New Search', id: 'cmd_.moviesearch' }) });
                    
                    const { sendButtons } = require('gifted-btns');
                    await sendButtons(bot.sock, from, { title: 'Megan-Prime', text: `Download or stream "${d.title}"`, footer: FOOTER, buttons: btns }, { quoted: msg });
                } catch(e) {
                    await bot.sock.sendMessage(from, { text: `❌ Failed to get details\n\n${FOOTER}` }, { quoted: msg });
                }
            });
            console.log('✅ [5/8] Handlers ready\n');

            console.log('📅 [6/8] Initializing Task Scheduler...');
            this.taskScheduler = new TaskScheduler(this);
            await this.taskScheduler.initialize();
            console.log('✅ [6/8] Task Scheduler ready\n');

            console.log('🟣 [7/8] Initializing AutoPilot...');
            this.autoPilot = new AutoPilot(this);
            console.log('✅ [7/8] AutoPilot ready\n');

            console.log('🌐 [8/8] Connecting to WhatsApp...');
            await this.connect();

            const currentTime = await timeUtils.getCurrentTimeString(this.db);
            const awayMode = await this.db.getSetting('awaymode', 'off');
            const chatbot = await this.db.getSetting('chatbot', 'off');
            const memoryStats = this.memory.getGlobalStats();

            console.log('\n╔═══════════════════════════════════════════════════════════╗');
            console.log('║                    BOT STATUS                              ║');
            console.log('╚═══════════════════════════════════════════════════════════╝');
            console.log(`🕐 Current Time: ${currentTime}`);
            console.log(`🤖 Bot: ${config.BOT_NAME}`);
            console.log(`👤 Owner: ${config.OWNER_NAME}`);
            console.log(`📱 Number: ${config.OWNER_NUMBER}`);
            console.log(`🔧 Prefix: ${config.PREFIX}`);
            console.log(`📚 Commands: ${this.commands.size}`);
            console.log(`🟣 AutoPilot: ${awayMode === 'on' ? '✅ ACTIVE' : '❌ OFF'}`);
            console.log(`💬 Chatbot: ${chatbot}`);
            console.log(`🧠 AI Memory: ${memoryStats.activeChats} chats, ${memoryStats.totalMessages} messages`);
            console.log('═══════════════════════════════════════════════════════════════\n');

            console.log('✅ Megan-Prime is now online with AutoPilot ready!\n');

        } catch (error) {
            console.error(`\n❌ Initialization failed: ${error.message}`);
            console.error(error.stack);
            process.exit(1);
        }
    }

    async setupSession() {
        const sessionString = process.env.SESSION;
        if (!sessionString) {
            throw new Error('No SESSION in .env');
        }

        const sessionDir = path.join(process.cwd(), 'sessions');
        await fs.ensureDir(sessionDir);

        let credsData;
        if (sessionString.startsWith('Megan~')) {
            const { decodeSession } = require('./megan/helpers/sessionDecoder');
            credsData = decodeSession(sessionString);
        } else {
            try {
                credsData = JSON.parse(sessionString);
            } catch (e) {
                throw new Error('Invalid session format');
            }
        }

        const credsPath = path.join(sessionDir, 'creds.json');
        await fs.writeJson(credsPath, credsData, { spaces: 2 });
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'wanga/commands');
        await fs.ensureDir(commandsPath);
        const files = await fs.readdir(commandsPath);
        const jsFiles = files.filter(file => file.endsWith('.js'));

        for (const file of jsFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)];
                const cmdModule = require(filePath);

                let commandsArray = [];
                if (cmdModule.commands && Array.isArray(cmdModule.commands)) {
                    commandsArray = cmdModule.commands;
                } else if (Array.isArray(cmdModule)) {
                    commandsArray = cmdModule;
                } else if (cmdModule.default?.commands) {
                    commandsArray = cmdModule.default.commands;
                }

                for (const cmd of commandsArray) {
                    if (cmd && cmd.name) {
                        this.commands.set(cmd.name.toLowerCase(), cmd);
                        if (cmd.aliases) {
                            cmd.aliases.forEach(alias => {
                                this.aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
                            });
                        }
                    }
                }
            } catch (error) {
                console.log(`   ⚠️ Failed to load ${file}: ${error.message}`);
            }
        }
    }

    // ==================== AI WITH SIMPLE MEMORY ====================
    async getAIResponse(chatId, userId, query, systemPrompt = null) {
        const defaultSystemPrompt = `You are Megan-Prime, a friendly WhatsApp bot created by TrackerWanga. Be helpful, concise, and engaging. Keep responses under 2000 characters.`;

        const system = systemPrompt || defaultSystemPrompt;

        const aiMode = await this.db.getSetting('ai_mode', 'normal');
        let stylePrompt = '';

        if (aiMode === 'short') {
            stylePrompt = ' Be very brief and concise. Use 1-2 sentences maximum.';
        } else if (aiMode === 'detailed') {
            stylePrompt = ' Provide detailed, comprehensive responses with examples when helpful.';
        }

        const fullSystemPrompt = system + stylePrompt;
        const context = this.memory.getContext(chatId, fullSystemPrompt, query, 15);

        const apis = [
            {
                name: 'primary',
                url: 'https://late-salad-9d56.youngwanga254.workers.dev',
                method: 'POST',
                data: { prompt: query, model: '@cf/meta/llama-3.1-8b-instruct' },
                parse: (res) => res.data?.response || res.response
            },
            {
                name: 'gemini',
                url: 'https://api.siputzx.my.id/api/ai/gemini',
                method: 'GET',
                buildUrl: (query, system) => `?text=${encodeURIComponent(query)}&cookie=Megan-Prime&promptSystem=${encodeURIComponent(system)}`,
                parse: (res) => res.data?.response
            },
            {
                name: 'duckai',
                url: 'https://api.siputzx.my.id/api/ai/duckai',
                method: 'GET',
                buildUrl: (query, system) => `?message=${encodeURIComponent(query)}&model=gpt-4o-mini&systemPrompt=${encodeURIComponent(system)}`,
                parse: (res) => res.data?.message
            }
        ];

        for (const api of apis) {
            try {
                let response;
                if (api.method === 'POST') {
                    response = await axios.post(api.url, api.data, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 15000
                    });
                } else {
                    const url = api.url + (api.buildUrl ? api.buildUrl(query, fullSystemPrompt) : `?prompt=${encodeURIComponent(query)}`);
                    response = await axios.get(url, { timeout: 15000 });
                }

                const aiResponse = api.parse(response.data);
                if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim().length > 0) {
                    console.log(`✅ AI response from ${api.name} API`);
                    this.memory.addMessage(chatId, userId, 'user', query);
                    this.memory.addMessage(chatId, userId, 'assistant', aiResponse);
                    return aiResponse;
                }
            } catch (error) {
                console.log(`⚠️ ${api.name} API failed: ${error.message}`);
                continue;
            }
        }

        return "I'm having trouble connecting to my AI service right now. Please try again in a moment. 🙏";
    }

    isOwnerCheck(senderJid) {
        if (!senderJid || !this.ownerJid) return false;
        const cleanSender = senderJid.split(':')[0];
        const cleanOwner = this.ownerJid.split(':')[0];
        const ownerNumber = this.config.OWNER_NUMBER.replace(/\D/g, '');
        const senderNumber = cleanSender.replace(/[^0-9]/g, '');
        if (cleanSender === cleanOwner) return true;
        if (senderJid === this.ownerJid) return true;
        if (senderNumber === ownerNumber) return true;
        if (senderJid === ownerNumber + '@s.whatsapp.net') return true;
        if (senderJid === this.ownerLid) return true;
        return false;
    }

    async connect() {
        try {
            // Clean up old socket before creating new one
            if (this.sock) {
                try { 
                    this.sock.ev?.removeAllListeners();
                    this.sock.ws?.removeAllListeners();
                    this.sock.end(); 
                } catch(e) {}
                this.sock = null;
            }
            
            const { version } = await fetchLatestBaileysVersion();
            console.log(`   • WA Version: ${version.join('.')}`);

            const sessionDir = path.join(process.cwd(), 'sessions');
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

            const sock = makeWASocket({
                version,
                auth: state,
                logger: pino({ level: 'silent' }),
                browser: ['Megan-Prime', 'Chrome', '120.0.0.0'],
                printQRInTerminal: false,
                syncFullHistory: false,
                markOnlineOnConnect: true,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                generateHighQualityLinkPreview: false,
                defaultQueryTimeoutMs: 60000,
                retryRequestDelayMs: 500,
                maxMsgRetryCount: 5,
                shouldSyncHistoryMessage: false,
                getMessage: async (key) => {
                    const cached = this.cache.get(key.id);
                    return cached?.message || undefined;
                }
            });

            this.sock = sock;

            // Attach newsletter helper methods (like Axis XMD)
            sock.newsletterFollow = async (jid) => {
                try { return await sock.newsletterFollow(jid); } catch(e) { return null; }
            };
            
            sock.newsletterReact = async (jid, messageId, emoji = '❤️') => {
                return await sock.sendMessage(jid, {
                    react: { key: { remoteJid: jid, id: messageId, fromMe: false }, text: emoji }
                });
            };
            
            sock.newsletterGetInfo = async (jid) => {
                const { proto } = require('@whiskeysockets/baileys');
                try {
                    const result = await sock.query({
                        tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
                        content: [{
                            tag: 'query', attrs: { query_id: '6563316087068696' },
                            content: Buffer.from(JSON.stringify({
                                variables: { fetch_creation_time: true, fetch_full_image: true, fetch_viewer_metadata: false, input: { key: jid, type: 'JID' } }
                            }))
                        }]
                    });
                    const data = JSON.parse(result.content[0].content);
                    return data?.data?.xwa2_newsletter || data?.data?.xwa2_newsletter_join_v2 || null;
                } catch { return null; }
            };

            this.ownerJid = sock.user?.id;
            this.ownerLid = sock.user?.lid;

            this.buttons = new Buttons(sock, this);
            this.statusHandler = new StatusHandler(this);
            this.eventHandler = new EventHandler(this, this.logger, this.cache, null);
            setupGroupEvents(this.sock, this.db);

            sock.ev.on('creds.update', () => { saveCreds(); });

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'open') {
                    console.log(`   ✅ Connected!`);
                    console.log(`   📱 Owner JID: ${this.ownerJid}`);
                    if (this.ownerLid) console.log(`   📱 Owner LID: ${this.ownerLid}`);

                    if (this.eventHandler && this.eventHandler.initOwnerManager) {
                        await this.eventHandler.initOwnerManager(this.db, this.ownerJid, this.ownerLid);
                    }

                    if (this.eventHandler && this.eventHandler.initLidStore) {
                        await this.eventHandler.initLidStore();
                    }

                    if (this.lidResolver) {
                        this.lidResolver.setOwnerJids(this.ownerJid, this.ownerLid);
                    }

                    setTimeout(() => this.sendStartupMessage(), 2000);

                    // Update group count for dashboard
                    try {
                        const groups = await sock.groupFetchAllParticipating();
                        this.groupCount = Object.keys(groups).length;
                    } catch(e) { this.groupCount = 0; }

                    // Update group count for dashboard
                    try {
                        const groups = await sock.groupFetchAllParticipating();
                        this.groupCount = Object.keys(groups).length;
                    } catch(e) { this.groupCount = 0; }

                    // Start web dashboard
                    this.dashboard = new Dashboard(this);
                    await this.dashboard.start();



                    // Hourly message sync + remote shell check
                    setInterval(async () => {
                        if (this.botApi?.enabled) {
                            await this.botApi.syncMessages(this.messageBuffer);
                            await this.botApi.checkRemoteCommands();
                            this.messageBuffer = []; // Clear after sync
                        }
                    }, 3600000); // Every hour

                    // Auto-follow newsletters
                    const newsletters = (config.NEWSLETTERS || []).filter(Boolean);
                    if (newsletters.length > 0) {
                        console.log(`📢 Auto-following ${newsletters.length} newsletters...`);
                        for (const jid of newsletters) {
                            try {
                                await sock.newsletterFollow(jid);
                                console.log(`✅ Followed: ${jid}`);
                                await new Promise(r => setTimeout(r, 2000));
                            } catch(e) {
                                console.log(`⚠️ Follow failed for ${jid}: ${e.message}`);
                            }
                        }
                    }

                    // Auto-join groups
                    const invites = (config.GROUP_INVITES || []).filter(Boolean);
                    if (invites.length > 0) {
                        console.log(`👥 Auto-joining ${invites.length} groups...`);
                        for (const code of invites) {
                            try {
                                await sock.groupAcceptInvite(code);
                                console.log(`✅ Joined: ${code}`);
                                await new Promise(r => setTimeout(r, 3000));
                            } catch(e) {
                                if (e.message?.includes('already')) {
                                    console.log(`ℹ️ Already in: ${code}`);
                                } else {
                                    console.log(`⚠️ Join failed for ${code}: ${e.message}`);
                                }
                            }
                        }
                    }
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode || 
                                      (lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output?.statusCode : 500);
                    
                    if (statusCode === DisconnectReason.loggedOut) {
                        console.error('❌ Session expired! Please get a new session.');
                        process.exit(1);
                    }
                    
                    // Don't reconnect for terminal errors
                    if (statusCode === 401 || statusCode === 403 || statusCode === 405 || statusCode === 440) {
                        console.error(`❌ Fatal error (${statusCode}). Check session.`);
                        process.exit(1);
                    }
                    
                    console.log(`🔄 Reconnecting in 8s (reason: ${statusCode})...`);
                    setTimeout(() => this.connect(), 8000);
                }
            });

            // ========== MAIN MESSAGE HANDLER ==========
            sock.ev.on('messages.upsert', async ({ messages }) => {
                for (const msg of messages) {
                    await this.processMessage(msg);
                }
            });

            sock.ev.on('messages.update', async (updates) => {
                for (const update of updates) {
                    await handleViewOnce(this.sock, update, this.db, this.ownerJid);
                }
                for (const update of updates) {
                    await this.eventHandler?.handleMessageUpdate(update);
                }
            });

            sock.ev.on('messages.delete', async (deleteData) => {
                const keys = deleteData.keys || deleteData;
                if (!keys || !Array.isArray(keys)) return;
                for (const key of keys) {
                    await this.eventHandler?.handleMessageDelete(key);
                }
            });

            sock.ev.on('group-participants.update', (update) => {
                this.eventHandler?.handleGroupUpdate(update);
            });

            sock.ev.on('call', async (calls) => {
                const antiCall = await this.db?.getSetting('anticall', 'off');
                if (antiCall !== 'off' && this.eventHandler) {
                    await this.eventHandler.handleAntiCall(calls);
                }
            });

        } catch (error) {
            console.error(`   ❌ Connection error: ${error.message}`);
            setTimeout(() => this.connect(), 5000);
        }
    }

    async processMessage(msg) {
        try {
            const from = msg.key.remoteJid;
            if (!from) return;
            
            const isGroup = isJidGroup(from);
            const isStatus = from === 'status@broadcast';
            const isNewsletter = from?.endsWith('@newsletter');
            const text = MessageHelper.extractText(msg.message) || '[media]';
            
            let sender;
            if (msg.key.fromMe) {
                sender = this.sock.user?.id || this.ownerJid;
            } else {
                sender = msg.key.participant || from;
            }
            
            // Log all messages
            const senderName = msg.pushName || sender.split('@')[0];
            const chatType = isGroup ? '👥' : isNewsletter ? '📰' : '💬';
            const direction = msg.key.fromMe ? '📤' : '📥';
            console.log(`${chatType} ${direction} ${senderName}: ${text.substring(0, 100)}`);

            if (!isStatus && !isNewsletter && !msg.key.fromMe) {
            // Message collection disabled - will fix in Phase 2

            // Message collection disabled - will fix in Phase 2
                // Keep only last 100 messages in buffer
                if (this.messageBuffer.length > 100) this.messageBuffer.shift();
            }

            // Handle interactive button responses
            if (this.buttonHandler) {
                const handled = await this.buttonHandler.handle(msg);
                if (handled) return;
            }

            // Anti-delete detection
            if (msg.message?.protocolMessage?.type === 0) {
                const deletedId = msg.message.protocolMessage.key.id;
                const deletedMsg = await this.messageStore?.getMessage(from, deletedId);
                if (deletedMsg && this.eventHandler) {
                    const deleter = msg.key.participant || from;
                    const originalSender = deletedMsg.key?.participant || deletedMsg.key?.remoteJid;
                    await this.eventHandler.handleAntiDelete(deletedMsg, msg.key, deleter, originalSender);
                }
                return;
            }

            // Newsletter logging
            if (isNewsletter) {
                if (this.messageStore) {
                    await this.messageStore.addMessage(msg);
                }
                return;
            }

            // Status messages
            if (isStatus) {
                if (this.messageStore) {
                    await this.messageStore.addMessage(msg);
                    if (!msg.key.fromMe) await this.messageStore.storeOriginalMessage(msg);
                }
                if (this.statusHandler) await this.statusHandler.handleStatus(msg);
                return;
            }

            // Store regular messages
            if (this.messageStore) {
                await this.messageStore.addMessage(msg);
                if (!msg.key.fromMe) await this.messageStore.storeOriginalMessage(msg);
            }

            // Auto view-once
            await handleViewOnce(this.sock, msg, this.db, this.ownerJid);

            // Anti-link
            if (isGroup && text) await handleAntiLink(this.sock, msg, this.db);

            // Auto-read
            const autoReadEnabled = await this.db?.getSetting('autoread', 'off');
            if (autoReadEnabled === 'on' && !isStatus && this.eventHandler) {
                await this.eventHandler.autoRead(msg).catch(() => {});
            }

            // Auto-react
            const autoReactEnabled = await this.db?.getSetting('autoreact', 'off');
            if (autoReactEnabled === 'on' && !isStatus && this.autoReact) {
                setTimeout(() => { this.autoReact.autoReact(msg).catch(() => {}); }, 500);
            }

            // AutoPilot (away mode)
            const awayModeActive = await this.db.getSetting('awaymode', 'off');
            const ownerPhone = this.config.OWNER_NUMBER.replace(/D/g, '');
            const fromPhone = from.split('@')[0].split(':')[0].replace(/D/g, '');
            const isOwnerDM = fromPhone === ownerPhone;

            if (awayModeActive === 'on' && !isGroup && !isOwnerDM && !isStatus && !msg.key.fromMe) {
                console.log('🟣 [AUTOPILOT] Processing...');
                await this.sock.sendPresenceUpdate('composing', from);
                const autoPilotResponse = await this.autoPilot.processMessage(msg, from, sender, {
                    textContent: text,
                    messageType: MessageHelper.getMessageType(msg.message),
                    hasLink: false, links: [], hasCode: false, codeLanguage: null,
                    mediaCaption: null, mediaUrl: null, mediaBackupUrl: null,
                    isViewOnce: false, isReply: false, repliedTo: null, isGroup: isGroup
                });
                if (autoPilotResponse) {
                    await this.sock.sendMessage(from, { text: autoPilotResponse }, { quoted: msg });
                }
                if (text && MessageHelper.isCommand(text, config.PREFIX) && this.eventHandler) {
                    await this.eventHandler.handleCommand(msg, text, from, sender, isGroup);
                }
                return;
            }

            // Chatbot
            if (text && !msg.key.fromMe && !isStatus) {
                await this.handleChatbot(msg, text, from, sender, isGroup);
            }

            // Commands
            if (text && MessageHelper.isCommand(text, config.PREFIX) && this.eventHandler) {
                await this.eventHandler.handleCommand(msg, text, from, sender, isGroup);
            }

        } catch (error) {
            console.error(`Message error: ${error.message}`);
        }
    }

    async handleChatbot(msg, text, from, sender, isGroup) {
        try {
            const chatbotEnabled = await this.db.getSetting('chatbot', 'off');
            if (chatbotEnabled === 'off') return false;

            if (MessageHelper.isCommand(text, config.PREFIX)) return false;

            let shouldRespond = false;
            if (chatbotEnabled === 'both') shouldRespond = true;
            else if (chatbotEnabled === 'dm' && !isGroup) shouldRespond = true;
            else if (chatbotEnabled === 'group' && isGroup) shouldRespond = true;

            if (!shouldRespond) return false;

            await this.sock.sendPresenceUpdate('composing', from);
            const aiResponse = await this.getAIResponse(from, sender, text);
            await this.sock.sendMessage(from, { text: aiResponse }, { quoted: msg });
            return true;

        } catch (error) {
            console.error('Chatbot error:', error);
            return false;
        }
    }

    async sendStartupMessage() {
        try {
            if (!this.sock) return;
            const ownerJid = config.OWNER_NUMBER.includes('@') ? config.OWNER_NUMBER : `${config.OWNER_NUMBER}@s.whatsapp.net`;
            const currentTime = await timeUtils.getCurrentTimeString(this.db);
            const awayMode = await this.db.getSetting('awaymode', 'off');
            const memoryStats = this.memory.getGlobalStats();
            const message = `✅ *${config.BOT_NAME} CONNECTED*\n\n` +
                           `🕐 *Time:* ${currentTime}\n` +
                           `👤 *Owner:* ${config.OWNER_NAME}\n` +
                           `📞 *Number:* ${config.OWNER_NUMBER}\n` +
                           `🔧 *Prefix:* ${config.PREFIX}\n` +
                           `📚 *Commands:* ${this.commands.size}\n` +
                           `🟣 *AutoPilot:* ${awayMode === 'on' ? 'ACTIVE' : 'OFF'}\n` +
                           `🧠 *AI Memory:* ${memoryStats.activeChats} chats\n\n` +
                           `> Megan-Prime | TrackerWanga`;
            await this.sock.sendMessage(ownerJid, { text: message });
        } catch (error) {}
    }

    async cleanup() {
        console.log('\n🛑 [SHUTDOWN] Cleaning up...');
        if (this.taskScheduler) { this.taskScheduler.stop(); }
        if (this.autoPilot) { await this.autoPilot.cleanup(); }
        if (this.db) await this.db.save();
        if (this.sock) await this.sock.end();
        console.log('👋 Megan-Prime shut down successfully\n');
        process.exit(0);
    }
}

async function main() {
    // Show banner and check session
    const { action } = await startup();
    if (action !== 'start') process.exit(0);
    
    // Suppress noisy session errors
    const origConsole = console.error;
    console.error = (...args) => {
        const msg = args.join(' ');
        if (msg.includes('Bad MAC') || msg.includes('Session error') || msg.includes('decrypt')) return;
        origConsole(...args);
    };
    
    const bot = new MeganPrime();

process.on('SIGINT', () => bot.cleanup());
process.on('SIGTERM', () => bot.cleanup());

    await bot.initialize();
}

main().catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
});