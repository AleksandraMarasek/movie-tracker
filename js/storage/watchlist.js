const STORAGE_KEY = 'movie_tracker_watchlist';

export function getWatchlist() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { pending: [], watched: [] };
}

export function addToWatchlist(movie) {
    const watchlist = getWatchlist();
    const exists = [...watchlist.pending, ...watchlist.watched].some(
        (m) => m.id === movie.id
    );

    if (!exists) {
        watchlist.pending.push(movie);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
}

export function moveToWatched(movieId) {
    const watchlist = getWatchlist();
    const movieIndex = watchlist.pending.findIndex((m) => m.id === movieId);

    if (movieIndex !== -1) {
        const [movie] = watchlist.pending.splice(movieIndex, 1);
        watchlist.watched.push(movie);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
}

export function removeFromWatchlist(movieId, listType) {
    const watchlist = getWatchlist();
    watchlist[listType] = watchlist[listType].filter((m) => m.id !== movieId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
}
