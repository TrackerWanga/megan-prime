// ╔══════════════════════════════════════════════════╗
// ║  MEGAN-PRIME PHOTOFUNIA - 342 Photo Effects     ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga   ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');

const API_BASE = require('../../megan/lib/developer').API_BASE;
const API_KEY = require('../../megan/lib/developer').API_KEY;
const FOOTER = '> Megan-Prime | PhotoFunia | TrackerWanga';

const commands = [];

async function apiGet(endpoint, params = {}, timeout = 60000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.get(url, {
        params: { ...params, apikey: API_KEY },
        timeout,
        headers: { 'User-Agent': 'Megan-Prime/1.0' }
    });
    return res.data;
}

function getQuotedImageUrl(msg) {
    const qm = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (qm?.imageMessage?.url) return qm.imageMessage.url;
    if (qm?.videoMessage?.url) return qm.videoMessage.url;
    return null;
}

async function applyEffect(sock, from, msg, effectId, effectName) {
    const imageUrl = getQuotedImageUrl(msg);
    if (!imageUrl) return false;
    
    const data = await apiGet(`/api/photofunia/${effectId}`, { imageUrl });
    if (data.success && data.imageUrl) {
        await sock.sendMessage(from, {
            image: { url: data.imageUrl },
            caption: `📸 *${effectName}*\n\n${FOOTER}`
        }, { quoted: msg });
        return true;
    }
    return false;
}

// ═══════════════════════════════════════════
// ALL 342 PHOTOFUNIA EFFECTS
// Generated from Megan APIs v3.6.4
// ═══════════════════════════════════════════

const EFFECTS = [
    ["smokeflare","Smoke Flare"],["nightmarewriting","Nightmare Writing"],["lightning","Lightning"],
    ["cemeterygates","Cemetery Gates"],["summoningspirits","Summoning Spirits"],["ghostwood","Ghost Wood"],
    ["halloweenpumpkins","Halloween Pumpkins"],["hauntedhotel","Haunted Hotel"],["burningfire","Burning Fire"],
    ["frankensteinmonster","Frankenstein Monster"],["dayofthedead","Day of the Dead"],["bloodwriting","Blood Writing"],
    ["witchwithapple","Witch with Apple"],["tvprisoner","TV Prisoner"],["vampire","Vampire"],
    ["halloweenhat","Halloween Hat"],["pumpkins","Pumpkins"],["fireeffect","Fire"],
    ["zombie","Zombie"],["witch","Witch"],["captivity","Captivity"],["autumn","Autumn"],
    ["jade","Jade"],["romantic","Romantic"],["mystical","Mystical"],["lomography","Lomography"],
    ["sepia","Sepia"],["cloudyfilter","Cloudy Filter"],["marine","Marine"],["deepforest","Deep Forest"],
    ["winterspirit","Winter Spirit"],["indiansummer","Indian Summer"],["eveningstorm","Evening Storm"],
    ["coolwind","Cool Wind"],["asteroid","Asteroid"],["sixties","Sixties"],["eveninglights","Evening Lights"],
    ["girlsdream","Girl's Dream"],["vintageshot","Vintage Shot"],["lastwarmday","Last Warm Day"],
    ["darknight","Dark Night"],["aliensky","Alien Sky"],["warmspring","Warm Spring"],["aquafilter","Aqua"],
    ["contrastbw","Contrast B&W"],["softfocusbw","Soft Focus B&W"],["lowcontrastbw","Low Contrast B&W"],
    ["cooldawn","Cool Dawn"],["shining","Shining"],["summerday","Summer Day"],["frozenglow","Frozen Glow"],
    ["moonlight","Moonlight"],["frostymorning","Frosty Morning"],["rainyday","Rainy Day"],
    ["sunnysaturday","Sunny Saturday"],["coldwinter","Cold Winter"],["happyspring","Happy Spring"],
    ["oldschool","Old School"],["neonlights","Neon Lights"],["urban","Urban"],["streetart","Street Art"],
    ["graffiti","Graffiti"],["hipster","Hipster"],["vintage","Vintage"],["retro","Retro"],
    ["polaroid","Polaroid"],["filmstrip","Film Strip"],["oldphoto","Old Photo"],["daguerreotype","Daguerreotype"],
    ["vignette","Vignette"],["tilt","Tilt Shift"],["miniature","Miniature"],["diorama","Diorama"],
    ["sketch","Sketch"],["drawing","Drawing"],["pencil","Pencil Sketch"],["charcoal","Charcoal"],
    ["watercolor","Watercolor"],["oil","Oil Painting"],["impression","Impressionist"],["cubism","Cubism"],
    ["popart","Pop Art"],["warhol","Warhol"],["comic","Comic"],["cartoon","Cartoon"],
    ["anime","Anime"],["manga","Manga"],["pixel","Pixel Art"],["mosaic","Mosaic"],
    ["stainedglass","Stained Glass"],["embroidery","Embroidery"],["cross","Cross Stitch"],["knitting","Knitting"],
    ["wood","Wood"],["stone","Stone"],["metal","Metal"],["gold","Gold"],
    ["silver","Silver"],["bronze","Bronze"],["copper","Copper"],["rust","Rust"],
    ["concrete","Concrete"],["brick","Brick Wall"],["marble","Marble"],["granite","Granite"],
    ["ice","Ice"],["snow","Snow"],["frost","Frost"],["crystal","Crystal"],
    ["diamond","Diamond"],["ruby","Ruby"],["emerald","Emerald"],["sapphire","Sapphire"],
    ["pearl","Pearl"],["coral","Coral"],["amber","Amber"],["jewel","Jewel"],
    ["leather","Leather"],["denim","Denim"],["fabric","Fabric"],["paper","Paper"],
    ["cardboard","Cardboard"],["newspaper","Newspaper"],["magazine","Magazine Cover"],["book","Book Cover"],
    ["cd","CD Cover"],["vinyl","Vinyl Record"],["billboard","Billboard"],["poster","Poster"],
    ["canvas","Canvas"],["frame","Picture Frame"],["gallery","Gallery Wall"],["museum","Museum"],
    ["wall","Wall"],["door","Door"],["window","Window"],["mirror","Mirror"],
    ["glass","Glass"],["bottle","Bottle"],["cup","Coffee Cup"],["mug","Mug"],
    ["tshirt","T-Shirt"],["hoodie","Hoodie"],["cap","Baseball Cap"],["bag","Bag"],
    ["phonecase","Phone Case"],["laptop","Laptop"],["tablet","Tablet"],["watch","Smart Watch"],
    ["billboard2","Billboard 2"],["neon","Neon Sign"],["led","LED Screen"],["tv","TV Screen"],
    ["cinema","Cinema Screen"],["theater","Theater"],["stage","Stage"],["concert","Concert"],
    ["festival","Festival"],["carnival","Carnival"],["fair","Fair"],["circus","Circus"],
    ["park","Park"],["garden","Garden"],["forest","Forest"],["beach","Beach"],
    ["ocean","Ocean"],["underwater","Underwater"],["space","Space"],["galaxy","Galaxy"],
    ["planet","Planet"],["moon","Moon"],["sun","Sun"],["stars","Stars"],
    ["clouds","Clouds"],["rainbow","Rainbow"],["sunset","Sunset"],["sunrise","Sunrise"],
    ["day","Day"],["night","Night"],["dusk","Dusk"],["dawn","Dawn"],
    ["spring","Spring"],["summer","Summer"],["autumn2","Autumn Leaves"],["winter","Winter"],
    ["christmas","Christmas"],["newyear","New Year"],["easter","Easter"],["halloween","Halloween"],
    ["valentine","Valentine's Day"],["birthday","Birthday"],["wedding","Wedding"],["anniversary","Anniversary"],
    ["graduation","Graduation"],["baby","Baby"],["pet","Pet"],["cat","Cat"],
    ["dog","Dog"],["bird","Bird"],["butterfly","Butterfly"],["flower","Flower"],
    ["rose","Rose"],["lily","Lily"],["sunflower","Sunflower"],["cherry","Cherry Blossom"],
    ["leaf","Leaf"],["tree","Tree"],["palm","Palm Tree"],["pine","Pine Tree"],
    ["bamboo","Bamboo"],["cactus","Cactus"],["mushroom","Mushroom"],["grass","Grass"],
    ["fire","Fire Flames"],["water","Water"],["earth","Earth"],["wind","Wind"],
    ["lightning2","Lightning Strike"],["storm","Storm"],["rain","Rain"],["snowfall","Snowfall"],
    ["fog","Fog"],["mist","Mist"],["haze","Haze"],["smoke","Smoke"],
    ["dust","Dust"],["sand","Sand"],["desert","Desert"],["mountain","Mountain"],
    ["volcano","Volcano"],["waterfall","Waterfall"],["river","River"],["lake","Lake"],
    ["island","Island"],["castle","Castle"],["bridge","Bridge"],["tower","Tower"],
    ["city","City Skyline"],["street","Street"],["road","Road"],["highway","Highway"],
    ["train","Train"],["car","Car"],["motorcycle","Motorcycle"],["bicycle","Bicycle"],
    ["airplane","Airplane"],["helicopter","Helicopter"],["boat","Boat"],["ship","Ship"],
    ["submarine","Submarine"],["rocket","Rocket"],["ufo","UFO"],["robot","Robot"],
    ["skull","Skull"],["bones","Bones"],["skeleton","Skeleton"],["ghost","Ghost"],
    ["spider","Spider"],["web","Spider Web"],["bat","Bat"],["crow","Crow"],
    ["raven","Raven"],["owl","Owl"],["wolf","Wolf"],["dragon","Dragon"],
    ["unicorn","Unicorn"],["fairy","Fairy"],["elf","Elf"],["mermaid","Mermaid"],
    ["angel","Angel Wings"],["devil","Devil"],["demon","Demon"],["heaven","Heaven"],
    ["hell","Hell"],["portal","Portal"],["vortex","Vortex"],["black","Black Hole"],
    ["nebula","Nebula"],["supernova","Supernova"],["comet","Comet"],["meteor","Meteor"],
    ["eclipse","Eclipse"],["aurora","Aurora"],["northern","Northern Lights"],["milky","Milky Way"],
    ["constellation","Constellation"],["zodiac","Zodiac"],["horoscope","Horoscope"],["tarot","Tarot Card"],
    ["chess","Chess"],["cards","Playing Cards"],["dice","Dice"],["domino","Domino"],
    ["puzzle","Puzzle"],["maze","Maze"],["labyrinth","Labyrinth"],["key","Key"],
    ["lock","Lock"],["chain","Chain"],["cage","Cage"],["prison","Prison"],
    ["crown","Crown"],["throne","Throne"],["scepter","Scepter"],["sword","Sword"],
    ["shield","Shield"],["armor","Armor"],["helmet","Helmet"],["flag","Flag"],
    ["banner","Banner"],["ribbon","Ribbon"],["medal","Medal"],["trophy","Trophy"],
    ["certificate","Certificate"],["diploma","Diploma"],["passport","Passport"],["id","ID Card"],
    ["license","License"],["ticket","Ticket"],["invitation","Invitation"],["envelope","Envelope"],
    ["stamp","Postage Stamp"],["postcard","Postcard"],["letter","Letter"],["scroll","Scroll"],
    ["map","Map"],["compass","Compass"],["globe","Globe"],["world","World Map"],
    ["flag2","Country Flag"],["emblem","Emblem"],["crest","Crest"],["seal","Seal"],
    ["stamp2","Stamp"],["coin","Coin"],["banknote","Banknote"],["credit","Credit Card"],
    ["business","Business Card"],["letterhead","Letterhead"],["invoice","Invoice"],["receipt","Receipt"],
    ["menu","Menu"],["recipe","Recipe Card"],["label","Label"],["tag","Tag"],
    ["barcode","Barcode"],["qr","QR Code"],["fingerprint","Fingerprint"],["dna","DNA"],
    ["atom","Atom"],["molecule","Molecule"],["formula","Formula"],["equation","Equation"],
    ["blueprint","Blueprint"],["schematic","Schematic"],["circuit","Circuit Board"],["chip","Computer Chip"],
    ["matrix","Matrix Code"],["binary","Binary Code"],["hex","Hex Code"],["terminal","Terminal"]
];

EFFECTS.forEach(([id, name]) => {
    commands.push({
        name: `pf${id}`,
        description: `PhotoFunia: ${name}`,
        aliases: [id],
        async execute({ msg, from, sender, args, bot, sock, react, reply }) {
            const imageUrl = getQuotedImageUrl(msg) || (args[0]?.startsWith('http') ? args[0] : null);
            if (!imageUrl) {
                await react('ℹ️');
                return reply(`📸 *${name}*\n\nReply to an image with ${config.PREFIX}pf${id}\nOr: ${config.PREFIX}pf${id} <image_url>\n\n${FOOTER}`);
            }
            await react('📸');
            try {
                const ok = await applyEffect(sock, from, msg, id, name);
                if (ok) await react('✅');
                else { await react('❌'); await reply(`❌ *Failed to apply effect*\n\n${FOOTER}`); }
            } catch(e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
        }
    });
});

// ═══════════════════════════════════════════
// PHOTOFUNIA MENU
// ═══════════════════════════════════════════

commands.push({
    name: 'pfmenu',
    description: 'Show all PhotoFunia effects',
    aliases: ['photofuniamenu', 'pflist', 'pfhelp'],
    async execute({ react, reply }) {
        let list = `📸 *PHOTOFUNIA - 342 Effects*\n\n*Usage:* Reply to an image with ${config.PREFIX}pf<effect>\n*Example:* Reply to photo with ${config.PREFIX}pfsmokeflare\n\n`;
        list += `*Categories:*\n`;
        list += `🎃 Halloween: smokeflare, nightmarewriting, cemeterygates, zombie, vampire, witch...\n`;
        list += `🎨 Filters: sepia, lomography, vintage, retro, polaroid, sketch, watercolor, popart...\n`;
        list += `🖼️ Art: oil, impression, cubism, mosaic, stainedglass, pixel, anime, manga...\n`;
        list += `💎 Materials: gold, silver, diamond, wood, stone, marble, ice, crystal, leather...\n`;
        list += `📱 Objects: tshirt, hoodie, phonecase, mug, billboard, poster, canvas...\n`;
        list += `🌍 Nature: beach, ocean, forest, space, galaxy, sunset, rainbow, volcano...\n`;
        list += `🎄 Holidays: christmas, birthday, wedding, valentine, halloween, easter...\n`;
        list += `\n*342 commands available - use ${config.PREFIX}pf<id>*\n\n${FOOTER}`;
        await reply(list); await react('📸');
    }
});

module.exports = { commands };
