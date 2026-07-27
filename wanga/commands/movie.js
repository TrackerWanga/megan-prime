// ╔══════════════════════════════════════════════════╗
// ║   MEGAN-PRIME MOVIE DB - TMDB Full Integration ║
// ║  Powered by Megan APIs v3.6.4 | Tracker Wanga   ║
// ╚══════════════════════════════════════════════════╝

const axios = require('axios');
const config = require('../../megan/config');

const API_BASE = require('../../megan/lib/developer').API_BASE;
const API_KEY = require('../../megan/lib/developer').API_KEY;
const FOOTER = '> Megan-Prime | TMDB | TrackerWanga';

const commands = [];

async function apiGet(endpoint, params = {}, timeout = 30000) {
    const url = `${API_BASE}${endpoint}`;
    const res = await axios.get(url, {
        params: { ...params, apikey: API_KEY },
        timeout,
        headers: { 'User-Agent': 'Megan-Prime/1.0' }
    });
    return res.data;
}

function getPoster(m) { return m.poster || m.posterPath || null; }
function getBackdrop(m) { return m.backdrop || m.backdropPath || null; }
function safeRating(m) { const r = m.rating || m.voteAverage; return r ? (typeof r === 'number' ? r.toFixed(1) : r) : 'N/A'; }

function movieToText(m) {
    let t = '';
    t += `🎬 *${m.title || m.name}*`;
    if (m.tagline) t += `\n_"${m.tagline}"_`;
    t += `\n⭐ ${safeRating(m)}/10`;
    if (m.runtime) t += ` | ⏱️ ${m.runtime}min`;
    if (m.releaseDate) t += `\n📅 ${m.releaseDate}`;
    if (m.genres?.length) t += `\n🎭 ${m.genres.join(', ')}`;
    if (m.overview) t += `\n\n📝 ${m.overview.substring(0, 400)}`;
    if (m.budget) t += `\n💰 Budget: $${(m.budget/1000000).toFixed(0)}M`;
    if (m.revenue) t += `\n📊 Revenue: $${(m.revenue/1000000).toFixed(0)}M`;
    if (m.homepage) t += `\n🔗 ${m.homepage}`;
    if (m.imdbId) t += `\n🎯 IMDb: https://imdb.com/title/${m.imdbId}`;
    return t;
}

function tvToText(s) {
    let t = `📺 *${s.name || s.title}*`;
    if (s.tagline) t += `\n_"${s.tagline}"_`;
    t += `\n⭐ ${safeRating(s)}/10`;
    if (s.episodeRunTime?.length) t += ` | ⏱️ ${s.episodeRunTime[0]}min/ep`;
    if (s.firstAirDate) t += `\n📅 First aired: ${s.firstAirDate}`;
    if (s.lastAirDate) t += ` | Last: ${s.lastAirDate}`;
    if (s.genres?.length) t += `\n🎭 ${s.genres.join(', ')}`;
    if (s.numberOfSeasons) t += `\n📂 ${s.numberOfSeasons} seasons | ${s.numberOfEpisodes || '?'} episodes`;
    if (s.overview) t += `\n\n📝 ${s.overview.substring(0, 400)}`;
    if (s.status) t += `\n📊 Status: ${s.status}`;
    if (s.networks?.length) t += `\n📡 ${s.networks.map(n=>n.name||n).join(', ')}`;
    if (s.homepage) t += `\n🔗 ${s.homepage}`;
    return t;
}

// ═══════════════════════════════════════════
// 1. MOVIE SEARCH
// ═══════════════════════════════════════════
commands.push({ name: 'movie', description: 'Search for a movie on TMDB', aliases: ['moviesearch', 'findmovie', 'tmdb'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length) return reply(`🎬 *MOVIE SEARCH*\n\n*Usage:* ${config.PREFIX}movie <title>\n*Example:* ${config.PREFIX}movie Inception\n\n${FOOTER}`);
        await react('🎬');
        try {
            const data = await apiGet('/api/tmdb/search/movies', { q: args.join(' ') });
            if (data.success && data.results?.length) {
                const m = data.results[0];
                const poster = getPoster(m);
                const caption = movieToText(m) + `\n\n${FOOTER}`;
                if (poster) await sock.sendMessage(from, { image: { url: poster }, caption }, { quoted: msg });
                else await reply(caption);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 2. TV SEARCH
// ═══════════════════════════════════════════
commands.push({ name: 'tv', description: 'Search for a TV show on TMDB', aliases: ['tvshow', 'series', 'findtv'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length) return reply(`📺 *TV SEARCH*\n\n*Usage:* ${config.PREFIX}tv <show>\n*Example:* ${config.PREFIX}tv Breaking Bad\n\n${FOOTER}`);
        await react('📺');
        try {
            const data = await apiGet('/api/tmdb/search/tv', { q: args.join(' ') });
            if (data.success && data.results?.length) {
                const s = data.results[0];
                const poster = getPoster(s);
                const caption = tvToText(s) + `\n\n${FOOTER}`;
                if (poster) await sock.sendMessage(from, { image: { url: poster }, caption }, { quoted: msg });
                else await reply(caption);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 3. PEOPLE SEARCH
// ═══════════════════════════════════════════
commands.push({ name: 'actor', description: 'Search for a person on TMDB', aliases: ['person', 'people', 'celebrity', 'star'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length) return reply(`🌟 *PEOPLE SEARCH*\n\n*Usage:* ${config.PREFIX}actor <name>\n*Example:* ${config.PREFIX}actor Tom Hanks\n\n${FOOTER}`);
        await react('🌟');
        try {
            const data = await apiGet('/api/tmdb/search/people', { q: args.join(' ') });
            if (data.success && data.results?.length) {
                const p = data.results[0];
                const img = p.profile || p.profilePath || p.image || getPoster(p);
                let cap = `🌟 *${p.name}*`;
                if (p.knownFor) cap += `\n🎭 Known for: ${p.knownFor}`;
                if (p.knownForDepartment) cap += `\n📂 Department: ${p.knownForDepartment}`;
                if (p.popularity) cap += `\n🔥 Popularity: ${p.popularity}`;
                cap += `\n\n🔗 https://www.themoviedb.org/person/${p.id}\n\n${FOOTER}`;
                if (img) await sock.sendMessage(from, { image: { url: img }, caption: cap }, { quoted: msg });
                else await reply(cap);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 4. MOVIE DETAIL (by ID)
// ═══════════════════════════════════════════
commands.push({ name: 'movieid', description: 'Get movie details by TMDB ID', aliases: ['mdetail', 'movieinfo', 'moviebyid'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🎬 *MOVIE DETAILS*\n\n*Usage:* ${config.PREFIX}movieid <id>\n*Example:* ${config.PREFIX}movieid 27205\n\n${FOOTER}`);
        await react('🎬');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}`);
            if (data.success) {
                const poster = getPoster(data);
                const caption = movieToText(data) + `\n\n${FOOTER}`;
                if (poster) await sock.sendMessage(from, { image: { url: poster }, caption }, { quoted: msg });
                else await reply(caption);
                await react('✅');
            } else { await reply(`❌ *Not found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 5. TV DETAIL (by ID)
// ═══════════════════════════════════════════
commands.push({ name: 'tvid', description: 'Get TV show details by TMDB ID', aliases: ['tvdetail', 'tvinfo', 'tvbyid'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`📺 *TV DETAILS*\n\n*Usage:* ${config.PREFIX}tvid <id>\n*Example:* ${config.PREFIX}tvid 1396\n\n${FOOTER}`);
        await react('📺');
        try {
            const data = await apiGet(`/api/tmdb/tv/${args[0]}`);
            if (data.success) {
                const poster = getPoster(data);
                const caption = tvToText(data) + `\n\n${FOOTER}`;
                if (poster) await sock.sendMessage(from, { image: { url: poster }, caption }, { quoted: msg });
                else await reply(caption);
                await react('✅');
            } else { await reply(`❌ *Not found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 6. MOVIE CREDITS (Cast & Crew)
// ═══════════════════════════════════════════
commands.push({ name: 'cast', description: 'Get movie cast and crew', aliases: ['credits', 'moviecast', 'actors'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🎭 *MOVIE CAST*\n\n*Usage:* ${config.PREFIX}cast <movie_id>\n*Example:* ${config.PREFIX}cast 27205\n\n${FOOTER}`);
        await react('🎭');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/credits`);
            if (data.success) {
                let list = `🎭 *CAST & CREW - Movie #${args[0]}*\n\n`;
                if (data.cast?.length) {
                    list += `*👥 CAST (${Math.min(data.cast.length, 15)} shown)*\n`;
                    data.cast.slice(0, 15).forEach((c, i) => list += `${i+1}. ${c.name} as _${c.character || c.role || 'N/A'}_\n`);
                }
                if (data.crew?.length) {
                    list += `\n*🎬 CREW*\n`;
                    const dirs = data.crew.filter(c => c.job === 'Director');
                    if (dirs.length) list += `Director: ${dirs.map(d=>d.name).join(', ')}\n`;
                    const writers = data.crew.filter(c => c.department === 'Writing');
                    if (writers.length) list += `Writers: ${writers.slice(0,5).map(w=>w.name).join(', ')}\n`;
                }
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No credits found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 7. MOVIE VIDEOS (Trailers)
// ═══════════════════════════════════════════
commands.push({ name: 'trailer', description: 'Get movie trailers and videos', aliases: ['trailers', 'movievideos', 'videos'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🎥 *MOVIE TRAILERS*\n\n*Usage:* ${config.PREFIX}trailer <movie_id>\n*Example:* ${config.PREFIX}trailer 27205\n\n${FOOTER}`);
        await react('🎥');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/videos`);
            if (data.success && data.videos?.length) {
                let list = `🎥 *TRAILERS - Movie #${args[0]}*\n\n`;
                const trailers = data.videos.filter(v => v.type === 'Trailer');
                (trailers.length ? trailers : data.videos).slice(0, 10).forEach((v, i) => {
                    const url = v.site === 'YouTube' ? `https://youtube.com/watch?v=${v.key}` : v.url || '';
                    list += `${i+1}. *${v.name}* (${v.type})\n   ${url}\n\n`;
                });
                list += FOOTER;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No videos found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 8. STREAMING PROVIDERS
// ═══════════════════════════════════════════
commands.push({ name: 'providers', description: 'See where to watch a movie', aliases: ['watch', 'streaming', 'wheretowatch', 'providersmovie'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`📡 *STREAMING PROVIDERS*\n\n*Usage:* ${config.PREFIX}providers <movie_id>\n*Example:* ${config.PREFIX}providers 27205\n\n${FOOTER}`);
        await react('📡');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/providers`);
            if (data.success && data.providers) {
                let list = `📡 *WHERE TO WATCH - Movie #${args[0]}*\n\n`;
                const p = data.providers;
                if (p.flatrate?.length) { list += `*Stream:* ${p.flatrate.map(x=>x.name||x).join(', ')}\n`; }
                if (p.rent?.length) { list += `*Rent:* ${p.rent.map(x=>x.name||x).join(', ')}\n`; }
                if (p.buy?.length) { list += `*Buy:* ${p.buy.map(x=>x.name||x).join(', ')}\n`; }
                if (p.ads?.length) { list += `*Free (ads):* ${p.ads.map(x=>x.name||x).join(', ')}\n`; }
                if (!p.flatrate?.length && !p.rent?.length && !p.buy?.length) list += `No streaming info available for this region.\n`;
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No provider info*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 9. SIMILAR MOVIES
// ═══════════════════════════════════════════
commands.push({ name: 'similar', description: 'Get similar movies', aliases: ['similarmovies', 'relatedmovies', 'likemovie'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🔄 *SIMILAR MOVIES*\n\n*Usage:* ${config.PREFIX}similar <movie_id>\n*Example:* ${config.PREFIX}similar 27205\n\n${FOOTER}`);
        await react('🔄');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/similar`);
            if (data.success && data.results?.length) {
                let list = `🔄 *SIMILAR TO #${args[0]}*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => {
                    list += `${i+1}. *${m.title}* ⭐${safeRating(m)} (${m.releaseDate?.substring(0,4) || 'N/A'})\n`;
                });
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *None found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 10. MOVIE RECOMMENDATIONS
// ═══════════════════════════════════════════
commands.push({ name: 'recommend', description: 'Get movie recommendations', aliases: ['recommendations', 'suggested', 'formoviefans'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`💡 *RECOMMENDATIONS*\n\n*Usage:* ${config.PREFIX}recommend <movie_id>\n*Example:* ${config.PREFIX}recommend 27205\n\n${FOOTER}`);
        await react('💡');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/recommendations`);
            if (data.success && data.results?.length) {
                let list = `💡 *RECOMMENDED IF YOU LIKED #${args[0]}*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => {
                    list += `${i+1}. *${m.title}* ⭐${safeRating(m)} (${m.releaseDate?.substring(0,4) || 'N/A'})\n`;
                });
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *None found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 11. MOVIE IMAGES
// ═══════════════════════════════════════════
commands.push({ name: 'movieimages', description: 'Get movie posters and backdrops', aliases: ['moviepics', 'movieposters', 'moviebackdrops', 'filmpics'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🖼️ *MOVIE IMAGES*\n\n*Usage:* ${config.PREFIX}movieimages <id>\n*Example:* ${config.PREFIX}movieimages 27205\n\n${FOOTER}`);
        await react('🖼️');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/images`);
            if (data.success && data.backdrops?.length) {
                await sock.sendMessage(from, { image: { url: data.backdrops[0] }, caption: `🖼️ *Backdrop #1/${data.backdrops.length}*\nMovie #${args[0]}\n\n${FOOTER}` }, { quoted: msg });
                if (data.posters?.length) {
                    await sock.sendMessage(from, { image: { url: data.posters[0] }, caption: `🖼️ *Poster #1/${data.posters.length}*\nMovie #${args[0]}\n\n${FOOTER}` }, { quoted: msg });
                }
                await react('✅');
            } else { await reply(`❌ *No images*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 12. MOVIE REVIEWS
// ═══════════════════════════════════════════
commands.push({ name: 'reviews', description: 'Get movie reviews', aliases: ['moviereviews', 'critics', 'review'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`📝 *MOVIE REVIEWS*\n\n*Usage:* ${config.PREFIX}reviews <movie_id>\n*Example:* ${config.PREFIX}reviews 27205\n\n${FOOTER}`);
        await react('📝');
        try {
            const data = await apiGet(`/api/tmdb/movie/${args[0]}/reviews`);
            if (data.success && data.reviews?.length) {
                let list = `📝 *REVIEWS - Movie #${args[0]}*\n\n`;
                data.reviews.slice(0, 5).forEach((r, i) => {
                    list += `*${i+1}. ${r.author || 'Anonymous'}*\n${(r.content||'').substring(0,200)}...\n\n`;
                });
                list += FOOTER;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No reviews found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 13. PERSON DETAIL
// ═══════════════════════════════════════════
commands.push({ name: 'person', description: 'Get person/actor details', aliases: ['persondetail', 'actorinfo', 'biography'],
    async execute({ msg, from, args, sock, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🌟 *PERSON DETAILS*\n\n*Usage:* ${config.PREFIX}person <id>\n*Example:* ${config.PREFIX}person 31\n\n${FOOTER}`);
        await react('🌟');
        try {
            const data = await apiGet(`/api/tmdb/person/${args[0]}`);
            if (data.success) {
                const p = data;
                const img = p.profile || p.image || p.photo || getPoster(p);
                let cap = `🌟 *${p.name}*`;
                if (p.birthday) cap += `\n🎂 ${p.birthday}` + (p.deathday ? ` - ${p.deathday}` : p.age ? ` (age ${p.age})` : '');
                if (p.placeOfBirth) cap += `\n📍 ${p.placeOfBirth}`;
                if (p.knownForDepartment) cap += `\n📂 ${p.knownForDepartment}`;
                if (p.biography) cap += `\n\n📝 ${p.biography.substring(0, 400)}`;
                if (p.imdbId) cap += `\n🎯 IMDb: https://imdb.com/name/${p.imdbId}`;
                cap += `\n\n${FOOTER}`;
                if (img) await sock.sendMessage(from, { image: { url: img }, caption: cap }, { quoted: msg });
                else await reply(cap);
                await react('✅');
            } else { await reply(`❌ *Not found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 14. PERSON MOVIES
// ═══════════════════════════════════════════
commands.push({ name: 'filmos', description: "Get person's movie credits", aliases: ['personmovies', 'actorfilms', 'filmography'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🎬 *FILMOGRAPHY*\n\n*Usage:* ${config.PREFIX}filmos <person_id>\n*Example:* ${config.PREFIX}filmos 31\n\n${FOOTER}`);
        await react('🎬');
        try {
            const data = await apiGet(`/api/tmdb/person/${args[0]}/movies`);
            if (data.success && data.movies?.length) {
                let list = `🎬 *FILMOGRAPHY - Person #${args[0]}*\n\n`;
                data.movies.slice(0, 15).forEach((m, i) => {
                    list += `${i+1}. *${m.title}* ${m.releaseDate ? '('+m.releaseDate.substring(0,4)+')' : ''} ⭐${safeRating(m)}\n   as ${m.character || 'N/A'}\n`;
                });
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No credits found*\n\n${FOOTER}`); await react('❌'); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 15-19: DISCOVER & LISTS
// ═══════════════════════════════════════════

// Trending (movies & TV)
commands.push({ name: 'trending', description: 'Get trending movies this week', aliases: ['trendingmovies', 'hottmovies', 'trend'],
    async execute({ msg, from, args, react, reply }) {
        await react('🔥');
        try {
            const type = args[0] === 'tv' ? 'tv' : 'movie';
            const time = args[1] === 'day' ? 'day' : 'week';
            const data = await apiGet(`/api/tmdb/trending/${type}/${time}`);
            if (data.success && data.results?.length) {
                let list = `🔥 *TRENDING ${type.toUpperCase()} (${time})*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => {
                    list += `${i+1}. *${m.title || m.name}* ⭐${safeRating(m)}\n   ${(m.overview||'').substring(0,70)}...\n\n`;
                });
                list += FOOTER;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// Popular movies & TV
commands.push({ name: 'popular', description: 'Get popular movies or TV', aliases: ['popularmovies', 'popmovies', 'poptv'],
    async execute({ msg, from, args, react, reply }) {
        const type = args[0] === 'tv' ? 'tv' : 'movies';
        await react('🌟');
        try {
            const data = await apiGet(`/api/tmdb/popular/${type}`);
            if (data.success && data.results?.length) {
                let list = `🌟 *POPULAR ${type.toUpperCase()}*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => {
                    list += `${i+1}. *${m.title || m.name}* ⭐${safeRating(m)}\n`;
                });
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// Now Playing
commands.push({ name: 'nowplaying', description: 'Movies now in theaters', aliases: ['nowshowing', 'cinema', 'theaters'],
    async execute({ react, reply }) {
        await react('🍿');
        try {
            const data = await apiGet('/api/tmdb/now-playing');
            if (data.success && data.results?.length) {
                let list = `🍿 *NOW PLAYING*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => list += `${i+1}. *${m.title}* ⭐${safeRating(m)}\n`);
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); }
    }
});

// TV On Air
commands.push({ name: 'onair', description: 'TV shows currently on air', aliases: ['tvonair', 'currenttv', 'airing'],
    async execute({ react, reply }) {
        await react('📺');
        try {
            const data = await apiGet('/api/tmdb/on-air');
            if (data.success && data.results?.length) {
                let list = `📺 *TV ON AIR NOW*\n\n`;
                data.results.slice(0, 10).forEach((s, i) => list += `${i+1}. *${s.name}* ⭐${safeRating(s)}\n`);
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); }
    }
});

// Top Rated
commands.push({ name: 'toprated', description: 'Top rated movies of all time', aliases: ['bestmovies', 'topmovies'],
    async execute({ react, reply }) {
        await react('🏆');
        try {
            const data = await apiGet('/api/tmdb/top-rated');
            if (data.success && data.results?.length) {
                let list = `🏆 *TOP RATED MOVIES*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => list += `${i+1}. *${m.title}* ⭐${safeRating(m)}\n`);
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); }
    }
});

// Upcoming
commands.push({ name: 'upcoming', description: 'Upcoming movies', aliases: ['soon', 'comingsoon'],
    async execute({ react, reply }) {
        await react('📅');
        try {
            const data = await apiGet('/api/tmdb/upcoming');
            if (data.success && data.results?.length) {
                let list = `📅 *UPCOMING MOVIES*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => list += `${i+1}. *${m.title}* ${m.releaseDate||''}\n`);
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// 20-21: GENRES
// ═══════════════════════════════════════════

commands.push({ name: 'genres', description: 'Get all movie genres', aliases: ['moviegenres', 'categories', 'genrelist'],
    async execute({ msg, from, args, react, reply }) {
        const type = args[0] === 'tv' ? 'tv' : 'movies';
        await react('🎭');
        try {
            const data = await apiGet(`/api/tmdb/genres/${type}`);
            if (data.success && data.genres?.length) {
                let list = `🎭 *${type.toUpperCase()} GENRES*\n\n`;
                data.genres.forEach(g => list += `• ${g.name} (ID: ${g.id})\n`);
                list += `\nUse ${config.PREFIX}genre <id> to browse\n\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No genres*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); }
    }
});

// Genre Browse
commands.push({ name: 'genre', description: 'Get movies by genre', aliases: ['genrelist', 'bygenre', 'genremovies'],
    async execute({ msg, from, args, react, reply }) {
        if (!args.length || isNaN(args[0])) return reply(`🎭 *MOVIES BY GENRE*\n\n*Usage:* ${config.PREFIX}genre <id>\n*Example:* ${config.PREFIX}genre 28 (Action)\n\nUse ${config.PREFIX}genres to see all IDs\n\n${FOOTER}`);
        await react('🎭');
        try {
            const data = await apiGet(`/api/tmdb/genre/${args[0]}/movies`);
            if (data.success && data.results?.length) {
                let list = `🎭 *GENRE #${args[0]} MOVIES*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => list += `${i+1}. *${m.title}* ⭐${safeRating(m)}\n`);
                list += `\n${FOOTER}`;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No movies found*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); }
    }
});

// ═══════════════════════════════════════════
// 22: TV SEASON
// ═══════════════════════════════════════════
commands.push({ name: 'season', description: 'Get TV season episodes', aliases: ['episodes', 'tvseason', 'seasoninfo'],
    async execute({ msg, from, args, react, reply }) {
        if (args.length < 2 || isNaN(args[0]) || isNaN(args[1])) return reply(`📂 *TV SEASON*\n\n*Usage:* ${config.PREFIX}season <tv_id> <season_num>\n*Example:* ${config.PREFIX}season 1396 1\n\n${FOOTER}`);
        await react('📂');
        try {
            const data = await apiGet(`/api/tmdb/tv/${args[0]}/season/${args[1]}`);
            if (data.success && data.episodes?.length) {
                let list = `📂 *SEASON ${args[1]} - TV #${args[0]}*\n\n`;
                data.episodes.forEach(ep => {
                    list += `📺 *E${ep.episodeNumber}.* ${ep.name}\n   ⭐${safeRating(ep)} | 📅 ${ep.airDate||'TBA'}\n   ${(ep.overview||'').substring(0,80)}...\n\n`;
                });
                list += FOOTER;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No episodes found*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// 23-24: DISCOVER
// ═══════════════════════════════════════════
commands.push({ name: 'discover', description: 'Discover movies with filters', aliases: ['explore', 'findmovies', 'discovermovies'],
    async execute({ msg, from, args, react, reply }) {
        const type = args[0] === 'tv' ? 'tv' : 'movie';
        await react('🔍');
        try {
            const params = {};
            // Support: .discover movie genre=28 year=2024
            args.slice(type === 'movie' ? 0 : 1).forEach(a => {
                const [k, v] = a.split('=');
                if (k && v) params[k] = v;
            });
            const data = await apiGet(`/api/tmdb/discover/${type}`, params);
            if (data.success && data.results?.length) {
                let list = `🔍 *DISCOVER ${type.toUpperCase()}*\n\n`;
                data.results.slice(0, 10).forEach((m, i) => {
                    list += `${i+1}. *${m.title || m.name}* ⭐${safeRating(m)}\n   ${(m.overview||'').substring(0,70)}...\n\n`;
                });
                list += FOOTER;
                await reply(list);
                await react('✅');
            } else { await reply(`❌ *No results*\n\n${FOOTER}`); }
        } catch (e) { await react('❌'); await reply(`❌ ${e.message}\n\n${FOOTER}`); }
    }
});

// ═══════════════════════════════════════════
// MOVIE MENU
// ═══════════════════════════════════════════
commands.push({ name: 'moviemenu', description: 'Show all TMDB movie commands', aliases: ['movies', 'moviehelp', 'cinemamenu'],
    async execute({ react, reply }) {
        const menu = `🎬 *MOVIE DB - Full TMDB Commands*

*🔍 SEARCH*
${config.PREFIX}movie <title> - Search movies
${config.PREFIX}tv <show> - Search TV shows
${config.PREFIX}actor <name> - Search people

*📋 DETAILS*
${config.PREFIX}movieid <id> - Movie details
${config.PREFIX}tvid <id> - TV show details
${config.PREFIX}person <id> - Person details
${config.PREFIX}cast <id> - Movie cast & crew
${config.PREFIX}season <tv_id> <num> - TV episodes

*🎥 MEDIA*
${config.PREFIX}trailer <id> - Movie trailers
${config.PREFIX}movieimages <id> - Posters & backdrops
${config.PREFIX}reviews <id> - User reviews
${config.PREFIX}providers <id> - Where to watch

*🔄 DISCOVER*
${config.PREFIX}similar <id> - Similar movies
${config.PREFIX}recommend <id> - Recommendations
${config.PREFIX}filmos <id> - Actor filmography

*🔥 LISTS*
${config.PREFIX}trending [tv] [day/week] - Trending
${config.PREFIX}popular [tv] - Popular
${config.PREFIX}nowplaying - In theaters
${config.PREFIX}onair - TV on air
${config.PREFIX}toprated - Best rated
${config.PREFIX}upcoming - Coming soon

*🎭 GENRES*
${config.PREFIX}genres [tv] - List genres
${config.PREFIX}genre <id> - Browse by genre
${config.PREFIX}discover [tv] key=val - Filter

> Megan-Prime | TMDB Full | TrackerWanga`;
        await reply(menu);
        await react('🎬');
    }
});

module.exports = { commands };
