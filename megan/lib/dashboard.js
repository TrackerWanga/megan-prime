// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME DASHBOARD v2                        ║
// ║  Glassy UI | Logs | Shell | Stats | FontAwesome  ║
// ╚══════════════════════════════════════════════════╝

const express = require('express');
const { exec } = require('child_process');

class Dashboard {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.port = process.env.DASHBOARD_PORT || 3000;
        this.password = process.env.DASHBOARD_PASSWORD || 'megan2024';
        this.startTime = Date.now();
        this.logs = [];
        this.maxLogs = 80;

        this.setupMiddleware();
        this.setupRoutes();
        this.hookConsole();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    checkAuth(req, res, next) {
        const pass = req.query.pass || req.headers['x-pass'] || '';
        if (pass === this.password) return next();
        return res.send(this.loginPage());
    }

    hookConsole() {
        const self = this;
        const orig = console.log;
        console.log = (...a) => {
            const m = a.join(' ');
            if (!m.includes('Bad MAC') && !m.includes('Session error')) {
                self.logs.unshift({
                    t: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    type: m.includes('❌') ? 'error' : m.includes('✅') ? 'success' : m.includes('⚠️') ? 'warn' : 'info',
                    msg: m.substring(0, 200)
                });
                if (self.logs.length > self.maxLogs) self.logs.pop();
            }
            orig(...a);
        };
    }

    setupRoutes() {
        // HOME
        this.app.get('/', (req, res) => this.checkAuth(req, res, () => res.send(this.homePage())));

        // LOGS (JSON for fetch)
        this.app.get('/api/logs', (req, res) => this.checkAuth(req, res, () => res.json({ logs: this.logs })));

        // SHELL
        this.app.post('/api/shell', (req, res) => this.checkAuth(req, res, () => {
            const { cmd } = req.body || {};
            if (!cmd) return res.json({ out: 'No command' });
            if (/rm\s+-rf|sudo|su\b|shutdown|reboot|mkfs|:\(\)/.test(cmd)) return res.json({ out: '🚫 Blocked' });
            exec(cmd, { timeout: 8000 }, (e, stdout, stderr) => {
                res.json({ out: (stdout + stderr + (e ? '\\n' + e.message : '')).substring(0, 5000) || '(no output)' });
            });
        }));

        // RESTART
        this.app.get('/restart', (req, res) => this.checkAuth(req, res, () => {
            res.send(this.restartPage());
            setTimeout(async () => {
                if (this.bot?.sock) try { await this.bot.sock.end(); } catch (e) { }
                process.exit(0);
            }, 800);
        }));
    }

    // ═══ PAGES ═══

    loginPage() {
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Megan-Prime | Login</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 100%);color:#fff;font-family:-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}.glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:48px;width:400px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.5)}.logo{font-size:48px;margin-bottom:16px}h1{font-size:22px;font-weight:800;background:linear-gradient(135deg,#00ff88,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}.sub{color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:32px}input{width:100%;padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;outline:none;text-align:center;letter-spacing:4px}input:focus{border-color:#00ff88;box-shadow:0 0 20px rgba(0,255,136,0.1)}button{width:100%;padding:14px;background:linear-gradient(135deg,#00ff88,#00d4ff);color:#000;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;margin-top:16px;transition:all .2s}button:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,255,136,0.3)}.err{color:#ff4444;font-size:12px;margin-top:8px;display:none}</style></head><body><div class="glass"><div class="logo">🤖</div><h1>Megan-Prime</h1><div class="sub">Enter dashboard password</div><form onsubmit="login();return false"><input type="password" id="p" placeholder="••••••••"><button><i class="fa fa-lock-open"></i> Unlock</button></form><div class="err" id="err">Wrong password</div></div><script>function login(){window.location='/?pass='+encodeURIComponent(document.getElementById('p').value)}</script></body></html>`;
    }

    homePage() {
        const mem = process.memoryUsage();
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const d = Math.floor(uptime / 86400), h = Math.floor((uptime % 86400) / 3600), m = Math.floor((uptime % 3600) / 60);
        const online = !!this.bot.sock?.user;

        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Megan-Prime Dashboard</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"><meta http-equiv="refresh" content="5"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#e0e0e0;font-family:-apple-system,sans-serif;min-height:100vh;padding:20px}.topbar{background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:16px 24px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}.topbar h1{font-size:20px;font-weight:800;background:linear-gradient(135deg,#00ff88,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.topbar .status{font-size:12px;padding:6px 14px;border-radius:20px;font-weight:600}.online{background:rgba(0,255,136,0.1);color:#00ff88;border:1px solid rgba(0,255,136,0.2)}.offline{background:rgba(255,68,68,0.1);color:#ff4444;border:1px solid rgba(255,68,68,0.2)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px}.card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;transition:all .2s}.card:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1)}.card i{font-size:24px;color:#00ff88;margin-bottom:8px}.card .val{font-size:26px;font-weight:700;color:#fff}.card .lbl{color:rgba(255,255,255,0.35);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-top:4px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}.btn{padding:10px 20px;border-radius:10px;font-weight:600;font-size:13px;border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .2s}.btn:hover{transform:translateY(-2px)}.btn-log{background:rgba(0,212,255,0.1);color:#00d4ff;border:1px solid rgba(0,212,255,0.2)}.btn-shell{background:rgba(162,0,255,0.1);color:#a200ff;border:1px solid rgba(162,0,255,0.2)}.btn-danger{background:rgba(255,68,68,0.1);color:#ff4444;border:1px solid rgba(255,68,68,0.2)}.logs-section{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:16px}.logs-section h3{color:#fff;font-size:14px;margin-bottom:12px;display:flex;align-items:center;gap:8px}.log-list{max-height:300px;overflow-y:auto}.log-entry{display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:11px;font-family:'SF Mono',monospace}.log-entry .ltime{color:rgba(255,255,255,0.2);min-width:70px}.log-entry .linfo{color:#aaa}.log-entry .lsuccess{color:#00ff88}.log-entry .lerror{color:#ff4444}.log-entry .lwarn{color:#ffaa00}.log-shell{border:1px solid rgba(162,0,255,0.2);background:rgba(162,0,255,0.05);padding:4px 8px;border-radius:4px;margin-top:8px;color:#a200ff;font-size:11px}.footer{text-align:center;color:rgba(255,255,255,0.15);font-size:10px;margin-top:20px}</style></head><body><div class="topbar"><h1><i class="fa fa-robot"></i> Megan-Prime</h1><div class="status ${online?'online':'offline'}">${online?'● ONLINE':'○ OFFLINE'}</div></div><div class="grid"><div class="card"><i class="fa fa-clock"></i><div class="val">${d}d ${h}h ${m}m</div><div class="lbl">Uptime</div></div><div class="card"><i class="fa fa-microchip"></i><div class="val">${Math.round(mem.heapUsed/1048576)}</div><div class="lbl">Memory MB</div></div><div class="card"><i class="fa fa-terminal"></i><div class="val">${this.bot.commands?.size||0}</div><div class="lbl">Commands</div></div><div class="card"><i class="fa fa-users"></i><div class="val">${this.bot.groupCount||0}</div><div class="lbl">Groups</div></div><div class="card"><i class="fa fa-code"></i><div class="val" style="font-size:16px">${process.version}</div><div class="lbl">Node.js</div></div><div class="card"><i class="fa fa-fingerprint"></i><div class="val" style="font-size:16px">${process.pid}</div><div class="lbl">PID</div></div></div><div class="actions"><a href="/?pass=${this.password}" class="btn btn-log"><i class="fa fa-refresh"></i> Refresh</a><a href="/restart?pass=${this.password}" class="btn btn-danger" onclick="return confirm('Restart bot?')"><i class="fa fa-power-off"></i> Restart</a></div><div class="logs-section"><h3><i class="fa fa-terminal"></i> Live Console</h3><div class="log-list" id="logList">${this.logs.slice(0,30).map(l=>'<div class="log-entry"><span class="ltime">'+l.t+'</span><span class="l'+l.type+'">'+l.msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</span></div>').join('')||'<div class="log-entry"><span class="ltime">--:--</span>Waiting for logs...</div>'}</div></div><div class="footer">Megan-Prime v3.6.4 &copy; TrackerWanga | Auto-refresh 5s</div></body></html>`;
    }

    restartPage() {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restarting</title><meta http-equiv="refresh" content="8;url=/?pass=${this.password}"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#fff;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}.glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:48px}.glass i{font-size:64px;color:#00ff88;margin-bottom:16px;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:22px;margin-bottom:8px}p{color:rgba(255,255,255,0.4);font-size:13px}</style></head><body><div class="glass"><i class="fa fa-spinner"></i><h1>Restarting...</h1><p>Bot will reconnect in a few seconds</p></div></body></html>`;
    }

    async start() {
        return new Promise((resolve) => {
            const tryPort = (p) => {
                this.app.listen(p, () => {
                    console.log(`📊 Dashboard: http://localhost:${p}?pass=${this.password}`);
                    resolve(p);
                }).on('error', (e) => {
                    if (e.code === 'EADDRINUSE') tryPort(p + 1);
                    else { console.log('⚠️ Dashboard:', e.message); resolve(null); }
                });
            };
            tryPort(this.port);
        });
    }
}

module.exports = Dashboard;
