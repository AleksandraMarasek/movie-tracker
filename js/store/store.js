const FAVORITES_KEY = 'favorites';
const WATCHLIST_KEY = 'movie_tracker_watchlist';

function safeParse(json, fallback) {
    try {
        const v = JSON.parse(json);
        return v ?? fallback;
    } catch {
        return fallback;
    }
}

function readFavorites() {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const arr = safeParse(raw, []);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
        (x) => x && typeof x === 'object' && 'id' in x && 'title' in x
    );
}

function writeFavorites(favs) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function readWatchlist() {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    const obj = safeParse(raw, { pending: [], watched: [] });

    const pending = Array.isArray(obj?.pending) ? obj.pending : [];
    const watched = Array.isArray(obj?.watched) ? obj.watched : [];

    return {
        pending: pending.filter((x) => x && typeof x === 'object' && 'id' in x),
        watched: watched.filter((x) => x && typeof x === 'object' && 'id' in x),
    };
}

function writeWatchlist(w) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(w));
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

let state = {
    favorites: readFavorites(),
    watchlist: readWatchlist(),
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
    state = {
        favorites: readFavorites(),
        watchlist: readWatchlist(),
    };
    emit({ type: 'HYDRATE' });
}

export function getFavorites() {
    return getState().favorites;
}

export function isFavorite(id) {
    const favs = state.favorites;
    return favs.some((m) => String(m.id) === String(id));
}

export function toggleFavorite(movie) {
    if (!movie || typeof movie !== 'object') return getFavorites();
    const id = String(movie.id ?? '');
    const title = String(movie.title ?? '');
    if (!id || !title) return getFavorites();

    const exists = state.favorites.some((m) => String(m.id) === id);
    const updated = exists
        ? state.favorites.filter((m) => String(m.id) !== id)
        : [...state.favorites, { ...movie, id, title }];

    state = { ...state, favorites: updated };
    writeFavorites(updated);
    emit({ type: 'FAVORITES/TOGGLE', payload: { id } });

    return getFavorites();
}

export function getWatchlist() {
    return getState().watchlist;
}

export function addToWatchlist(movie) {
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
    writeWatchlist(next);
    emit({ type: 'WATCHLIST/ADD', payload: { id } });

    return getWatchlist();
}

export function moveToWatched(movieId) {
    const id = String(movieId ?? '');
    if (!id) return getWatchlist();

    const { pending, watched } = state.watchlist;
    const idx = pending.findIndex((m) => String(m.id) === id);
    if (idx === -1) return getWatchlist();

    const movie = pending[idx];
    const nextPending = pending.filter((m) => String(m.id) !== id);

    const next = {
        pending: nextPending,
        watched: [...watched, movie],
    };

    state = { ...state, watchlist: next };
    writeWatchlist(next);
    emit({ type: 'WATCHLIST/MOVE_TO_WATCHED', payload: { id } });

    return getWatchlist();
}

export function removeFromWatchlist(movieId, listType) {
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
    writeWatchlist(next);
    emit({ type: 'WATCHLIST/REMOVE', payload: { id, listType: type } });

    return getWatchlist();
}

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
