const LEGACY_FAVORITES_KEY = 'favorites';
const LEGACY_WATCHLIST_KEY = 'movie_tracker_watchlist';

const FAV_PREFIX = 'mt_favorites:';
const W_PREFIX = 'mt_watchlist:';

const CURRENT_USER_KEY = 'app_current_user';

function safeParse(json, fallback) {
    try {
        const v = JSON.parse(json);
        return v ?? fallback;
    } catch {
        return fallback;
    }
}

function getCookie(name) {
    const key = encodeURIComponent(name) + '=';
    const parts = document.cookie.split(';').map((s) => s.trim());
    for (const p of parts) {
        if (p.startsWith(key)) return decodeURIComponent(p.slice(key.length));
    }
    return null;
}

function currentUserEmail() {
    const s = safeParse(sessionStorage.getItem(CURRENT_USER_KEY), null);
    if (s?.email) return String(s.email).toLowerCase();

    const remember = getCookie('mt_remember');
    if (remember === '0') return null;

    const l = safeParse(localStorage.getItem(CURRENT_USER_KEY), null);
    if (l?.email) return String(l.email).toLowerCase();

    return null;
}

function favoritesKey(email) {
    return email ? `${FAV_PREFIX}${email}` : null;
}

function watchlistKey(email) {
    return email ? `${W_PREFIX}${email}` : null;
}

function readFavorites(email) {
    if (!email) return [];

    const key = favoritesKey(email);
    const raw = localStorage.getItem(key);
    if (raw) {
        const arr = safeParse(raw, []);
        return Array.isArray(arr)
            ? arr.filter(
                  (x) => x && typeof x === 'object' && 'id' in x && 'title' in x
              )
            : [];
    }

    const legacyRaw = localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (legacyRaw) {
        const legacyArr = safeParse(legacyRaw, []);
        const cleaned = Array.isArray(legacyArr)
            ? legacyArr.filter(
                  (x) => x && typeof x === 'object' && 'id' in x && 'title' in x
              )
            : [];
        localStorage.setItem(key, JSON.stringify(cleaned));
        localStorage.removeItem(LEGACY_FAVORITES_KEY);
        return cleaned;
    }

    return [];
}

function writeFavorites(email, favs) {
    if (!email) return;
    localStorage.setItem(favoritesKey(email), JSON.stringify(favs));
}

function normalizeWatchlist(obj) {
    const pending = Array.isArray(obj?.pending) ? obj.pending : [];
    const watched = Array.isArray(obj?.watched) ? obj.watched : [];
    return {
        pending: pending.filter((x) => x && typeof x === 'object' && 'id' in x),
        watched: watched.filter((x) => x && typeof x === 'object' && 'id' in x),
    };
}

function readWatchlist(email) {
    if (!email) return { pending: [], watched: [] };

    const key = watchlistKey(email);
    const raw = localStorage.getItem(key);
    if (raw)
        return normalizeWatchlist(safeParse(raw, { pending: [], watched: [] }));

    const legacyRaw = localStorage.getItem(LEGACY_WATCHLIST_KEY);
    if (legacyRaw) {
        const legacyObj = normalizeWatchlist(
            safeParse(legacyRaw, { pending: [], watched: [] })
        );
        localStorage.setItem(key, JSON.stringify(legacyObj));
        localStorage.removeItem(LEGACY_WATCHLIST_KEY);
        return legacyObj;
    }

    return { pending: [], watched: [] };
}

function writeWatchlist(email, w) {
    if (!email) return;
    localStorage.setItem(watchlistKey(email), JSON.stringify(w));
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

let state = {
    favorites: [],
    watchlist: { pending: [], watched: [] },
};

const listeners = new Set();

function emit(action) {
    const snapshot = getState();
    for (const fn of listeners) {
        try {
            fn({ action, state: snapshot });
        } catch (e) {
            console.error('Store subscriber error:', e);
        }
    }
}

export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function getState() {
    return clone(state);
}

export function hydrate() {
    const email = currentUserEmail();
    state = {
        favorites: readFavorites(email),
        watchlist: readWatchlist(email),
    };
    emit({ type: 'HYDRATE', payload: { email: email || null } });
}

export function getFavorites() {
    return getState().favorites;
}

export function isFavorite(id) {
    return state.favorites.some((m) => String(m.id) === String(id));
}

export function toggleFavorite(movie) {
    const email = currentUserEmail();
    if (!email) return getFavorites();

    if (!movie || typeof movie !== 'object') return getFavorites();
    const id = String(movie.id ?? '');
    const title = String(movie.title ?? '');
    if (!id || !title) return getFavorites();

    const exists = state.favorites.some((m) => String(m.id) === id);
    const updated = exists
        ? state.favorites.filter((m) => String(m.id) !== id)
        : [...state.favorites, { ...movie, id, title }];

    state = { ...state, favorites: updated };
    writeFavorites(email, updated);
    emit({ type: 'FAVORITES/TOGGLE', payload: { id, email } });

    return getFavorites();
}

export function getWatchlist() {
    return getState().watchlist;
}

export function addToWatchlist(movie) {
    const email = currentUserEmail();
    if (!email) return getWatchlist();

    if (!movie || typeof movie !== 'object') return getWatchlist();
    const id = String(movie.id ?? '');
    if (!id) return getWatchlist();

    const { pending, watched } = state.watchlist;
    const exists = [...pending, ...watched].some((m) => String(m.id) === id);
    if (exists) return getWatchlist();

    const next = {
        pending: [...pending, { ...movie, id }],
        watched: [...watched],
    };

    state = { ...state, watchlist: next };
    writeWatchlist(email, next);
    emit({ type: 'WATCHLIST/ADD', payload: { id, email } });

    return getWatchlist();
}

export function moveToWatched(movieId) {
    const email = currentUserEmail();
    if (!email) return getWatchlist();

    const id = String(movieId ?? '');
    if (!id) return getWatchlist();

    const { pending, watched } = state.watchlist;
    const idx = pending.findIndex((m) => String(m.id) === id);
    if (idx === -1) return getWatchlist();

    const movie = pending[idx];
    const next = {
        pending: pending.filter((m) => String(m.id) !== id),
        watched: [...watched, movie],
    };

    state = { ...state, watchlist: next };
    writeWatchlist(email, next);
    emit({ type: 'WATCHLIST/MOVE_TO_WATCHED', payload: { id, email } });

    return getWatchlist();
}

export function removeFromWatchlist(movieId, listType) {
    const email = currentUserEmail();
    if (!email) return getWatchlist();

    const id = String(movieId ?? '');
    const type = listType === 'watched' ? 'watched' : 'pending';
    if (!id) return getWatchlist();

    const { pending, watched } = state.watchlist;

    const next = {
        pending:
            type === 'pending'
                ? pending.filter((m) => String(m.id) !== id)
                : [...pending],
        watched:
            type === 'watched'
                ? watched.filter((m) => String(m.id) !== id)
                : [...watched],
    };

    state = { ...state, watchlist: next };
    writeWatchlist(email, next);
    emit({ type: 'WATCHLIST/REMOVE', payload: { id, listType: type, email } });

    return getWatchlist();
}

hydrate();

if (typeof window !== 'undefined') {
    window.AppStore = {
        subscribe,
        getState,
        hydrate,
        getFavorites,
        isFavorite,
        toggleFavorite,
        getWatchlist,
        addToWatchlist,
        moveToWatched,
        removeFromWatchlist,
    };
}
