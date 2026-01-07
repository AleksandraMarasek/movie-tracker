import { tvmazeGet } from '../api/tvmaze.js';

function stripHtml(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function toYear(premiered) {
    if (!premiered) return null;
    const y = Number(String(premiered).slice(0, 4));
    return Number.isFinite(y) ? y : null;
}

function toCardModel(show) {
    const poster = show?.image?.medium || show?.image?.original || 'N/A';
    const rating = show?.rating?.average ?? '—';
    const description = stripHtml(show?.summary) || 'Brak opisu.';

    return {
        id: String(show.id),
        title: show.name,
        poster,
        rating: String(rating),
        description:
            description.length > 140
                ? description.slice(0, 140) + '…'
                : description,

        genres: Array.isArray(show?.genres) ? show.genres : [],
        year: toYear(show?.premiered),
    };
}

export async function getHomeShows(limit = 50) {
    const PAGES_TO_SAMPLE = 3;
    const MAX_PAGE = 200;

    const pages = new Set();
    while (pages.size < PAGES_TO_SAMPLE)
        pages.add(Math.floor(Math.random() * MAX_PAGE));

    const all = [];
    for (const p of pages) {
        const pageShows = await tvmazeGet(`/shows?page=${p}`);
        if (Array.isArray(pageShows)) all.push(...pageShows);
    }

    all.sort((a, b) => {
        const aw = a.weight ?? 0;
        const bw = b.weight ?? 0;
        if (bw !== aw) return bw - aw;
        const ar = a.rating?.average ?? 0;
        const br = b.rating?.average ?? 0;
        return br - ar;
    });

    const picked = [];
    const seen = new Set();

    for (const s of all) {
        if (!s?.id || seen.has(s.id)) continue;
        if (!s?.image?.medium && !s?.image?.original) continue;

        seen.add(s.id);
        picked.push(toCardModel(s));
        if (picked.length >= limit) break;
    }

    return picked;
}

export async function searchShows(query) {
    const q = query.trim();
    if (!q) return [];

    const data = await tvmazeGet(`/search/shows?q=${encodeURIComponent(q)}`);
    if (!Array.isArray(data)) return [];

    return data
        .map((x) => x.show)
        .filter(Boolean)
        .filter((s) => s?.image?.medium || s?.image?.original)
        .map(toCardModel);
}

export async function getShowDetails(id) {
    return tvmazeGet(`/shows/${id}`);
}
export async function getShowEpisodes(id) {
    return tvmazeGet(`/shows/${id}/episodes`);
}
export async function getShowCast(id) {
    return tvmazeGet(`/shows/${id}/cast`);
}
