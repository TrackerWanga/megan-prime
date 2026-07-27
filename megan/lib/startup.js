// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME STARTUP WIZARD                      ║
// ║  Interactive CLI with chalk styling               ║
// ╚══════════════════════════════════════════════════╝

const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(q) { return new Promise(r => rl.question(q, r)); }

function banner() {
    console.clear();
    console.log(chalk.cyan.bold('╔══════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║       ') + chalk.white.bold('𝐌𝐄𝐆𝐀𝐍 𝐏𝐑𝐈𝐌𝐄') + chalk.cyan.bold('                       ║'));
    console.log(chalk.cyan.bold('║       ') + chalk.gray('WhatsApp Bot v3.6.4') + chalk.cyan.bold('                ║'));
    console.log(chalk.cyan.bold('║       ') + chalk.gray('by TrackerWanga') + chalk.cyan.bold('                   ║'));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════════╝'));
    console.log('');
}

async function startup() {
    banner();
    
    const hasSession = process.env.SESSION && process.env.SESSION.length > 10;
    
    if (hasSession) {
        console.log(chalk.green('✅ Session found! Starting bot...\n'));
        rl.close();
        return { action: 'start' };
    }
    
    console.log(chalk.yellow('⚠️  No session found!\n'));
    console.log(chalk.white('Choose an option:'));
    console.log(chalk.cyan('  [1] ') + chalk.white('I have a session ID'));
    console.log(chalk.cyan('  [2] ') + chalk.white('Pair new device (get code)'));
    console.log(chalk.cyan('  [3] ') + chalk.white('QR Code login'));
    console.log('');
    
    const choice = await ask(chalk.green('👉 Enter choice (1/2/3): '));
    
    switch(choice.trim()) {
        case '1':
            console.log('');
            const sessionId = await ask(chalk.green('📋 Paste your session ID: '));
            if (sessionId.trim().length > 10) {
                // Save to .env
                const envPath = path.join(process.cwd(), '.env');
                let envContent = '';
                try { envContent = fs.readFileSync(envPath, 'utf8'); } catch(e) {}
                
                if (envContent.includes('SESSION=')) {
                    envContent = envContent.replace(/SESSION=.*/g, `SESSION=${sessionId.trim()}`);
                } else {
                    envContent += `\nSESSION=${sessionId.trim()}\n`;
                }
                fs.writeFileSync(envPath, envContent);
                console.log(chalk.green('\n✅ Session saved! Starting bot...\n'));
                rl.close();
                return { action: 'start' };
            } else {
                console.log(chalk.red('\n❌ Invalid session ID\n'));
                rl.close();
                process.exit(1);
            }
            break;
            
        case '2':
            console.log('');
            const phone = await ask(chalk.green('📱 Enter phone number (with country code): '));
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            
            if (cleanPhone.length < 10) {
                console.log(chalk.red('\n❌ Invalid phone number\n'));
                rl.close();
                process.exit(1);
            }
            
            console.log(chalk.yellow(`\n🔄 Connecting to pair.megan.qzz.io...`));
            console.log(chalk.gray('   This may take up to 60 seconds...\n'));
            
            try {
                const res = await axios.get(`https://pair.megan.qzz.io/pair?number=${cleanPhone}`, { timeout: 120000 });
                const code = res.data?.code || res.data?.pairCode;
                
                if (code) {
                    console.log(chalk.green.bold('\n╔══════════════════════════════╗'));
                    console.log(chalk.green.bold('║     PAIRING CODE READY       ║'));
                    console.log(chalk.green.bold('╚══════════════════════════════╝'));
                    console.log('');
                    console.log(chalk.white('📱 Phone: ') + chalk.cyan(`+${cleanPhone}`));
                    console.log(chalk.white('🔢 Code:  ') + chalk.yellow.bold(code));
                    console.log('');
                    console.log(chalk.gray('1. Open WhatsApp on your phone'));
                    console.log(chalk.gray('2. Tap ⋮ → Linked Devices'));
                    console.log(chalk.gray('3. Tap "Link a Device"'));
                    console.log(chalk.gray('4. Enter the code above'));
                    console.log('');
                    console.log(chalk.red('⚠️  Code expires in 60 seconds!'));
                    console.log('');
                    
                    // After pairing, the session is sent to the bot via WhatsApp
                    // We need to wait for it. For now, restart with the session.
                    console.log(chalk.yellow('After linking, your session will appear in WhatsApp.'));
                    console.log(chalk.yellow('Copy it and restart the bot with option 1.'));
                } else {
                    console.log(chalk.red('\n❌ Failed to generate code. Try again.\n'));
                }
            } catch(e) {
                console.log(chalk.red(`\n❌ Server error: ${e.message}`));
                console.log(chalk.yellow('Try: https://pair.megan.qzz.io/pair\n'));
            }
            
            rl.close();
            process.exit(0);
            break;
            
        case '3':
            console.log(chalk.cyan('\n📷 QR Code: https://pair.megan.qzz.io/qr\n'));
            console.log(chalk.gray('Scan with WhatsApp → Linked Devices\n'));
            rl.close();
            process.exit(0);
            break;
            
        default:
            console.log(chalk.red('\n❌ Invalid choice\n'));
            rl.close();
            process.exit(1);
    }
}

module.exports = { startup, banner };
